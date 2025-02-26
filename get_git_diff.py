import os
import shutil
import requests
import schedule
import time
import git
import json
import sys

# Configuration
OWNER = ""   # Change this to your GitHub username/org
REPO = ""     # Change this to your repository name
BRANCH = ""   # Change this to the branch you want to track
GITHUB_API_URL = ""

REPO_DIR = ""  # Directory where the repo is cloned
TARGET_DIR = ""  # Directory where files will be copied
WHITELIST = {}
# Store the last commit hash
last_commit = None

GITHUB_TOKEN = ""
GITLAB_CONFIG = {}

def check_new_commit():
    global last_commit

    headers = {"Authorization": f"token {GITHUB_TOKEN}"}  # Add token to headers

    try:
        # Get latest commit SHA with authentication
        response = requests.get(GITHUB_API_URL, headers=headers)
        response.raise_for_status()
        latest_commit = response.json()["sha"]
        print(f"Latest commit: {latest_commit}")
        if last_commit and last_commit != latest_commit:
            print(f"New commit detected: {latest_commit}")
            pull_and_copy()
            push_to_destination()

        last_commit = latest_commit
        #Save to last_commit to config file
        with open("config.json", "w") as f:
            config = {
                "opencti_main_repo": {
                    "owner": OWNER,
                    "repo": REPO,
                    "branch": BRANCH
                },
                "dir": {
                    "repo_dir": REPO_DIR,
                    "target_dir": TARGET_DIR
                },
                "whitelist": list(WHITELIST),
                "last_commit": last_commit
            }
            json.dump(config, f, indent=4)

    except requests.exceptions.RequestException as e:
        print(f"Error checking commit: {e}")

def pull_and_copy():
    """Pull latest changes and copy files to target directory excluding whitelist"""
    try:
        # Pull latest changes
        repo = git.Repo(REPO_DIR)
        origin = repo.remotes.origin
        origin.pull()
        print("Pulled latest changes.")

        # Copy files excluding whitelist
        for root, dirs, files in os.walk(REPO_DIR):
            relative_root = os.path.relpath(root, REPO_DIR)
            # print(f"Copying files from {relative_root}")
            # Skip whitelisted directories
            if is_whitelisted(relative_root):
                dirs[:] = []  # Prevent walking deeper into whitelisted directories
                print(f"Skipping whitelisted directory: {relative_root}")
                continue
            
            # Copy non-whitelisted files
            for file in files:
                relative_path = os.path.join(relative_root, file)
                if is_whitelisted(relative_path):
                    print(f"Skipping whitelisted file: {relative_path}")
                    continue

                src = os.path.join(root, file)
                dest = os.path.join(TARGET_DIR, relative_path)

                os.makedirs(os.path.dirname(dest), exist_ok=True)
                shutil.copy2(src, dest)

        print("Files copied successfully.")
    except Exception as e:
        print(f"Error updating repository: {e}")


def is_whitelisted(relative_path):
    """Check if the file or directory should be skipped"""
    for whitelist_item in WHITELIST:
        if relative_path == whitelist_item or relative_path.startswith(whitelist_item.rstrip("/") + "/") or relative_path == ("./" + whitelist_item):
            return True
    return False

def push_to_destination():
    """Commit and push changes to the destination repository"""
    try:
        gitlab_repo_url = GITLAB_CONFIG['repo_url']
        gitlab_username = GITLAB_CONFIG['username']
        gitlab_token = GITLAB_CONFIG['token']
        auth_git_url = gitlab_repo_url.replace("https://", f"https://{gitlab_username}:{gitlab_token}@")
        repo = git.Repo(TARGET_DIR)
        repo.git.add("--all")
        
        if repo.is_dirty():
            repo.index.commit("Automated update from source repo")
            origin = repo.remotes.origin
            origin.set_url(auth_git_url)
            origin.push()
            print("Changes pushed to destination repository.")
        else:
            print("No new changes to push.")

    except Exception as e:
        print(f"Error pushing to destination repo: {e}")  


def load_config():
    global OWNER, REPO, BRANCH, REPO_DIR, TARGET_DIR, WHITELIST, GITHUB_API_URL, last_commit, GITLAB_CONFIG
    with open('config.json') as f:
        config = json.load(f)
        OWNER = config['opencti_main_repo']['owner']
        REPO = config['opencti_main_repo']['repo']
        BRANCH = config['opencti_main_repo']['branch']
        REPO_DIR = config['dir']['repo_dir']
        TARGET_DIR = config['dir']['target_dir']
        WHITELIST = set(config['whitelist'])
        GITHUB_API_URL = f"https://api.github.com/repos/{OWNER}/{REPO}/commits/{BRANCH}"
        last_commit = config['last_commit']
        GITLAB_CONFIG = config['gitlab_config'] 

if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) > 0:
        GITHUB_TOKEN = args[0]
    else:
        GITHUB_TOKEN = input("Enter your GitHub token: ")
        exit(1)
    load_config()
    # Schedule
    schedule.every(1).minutes.do(check_new_commit)

    print("Monitoring for new commits...")

    while True:
        schedule.run_pending()
        time.sleep(1)
    # push_to_destination()