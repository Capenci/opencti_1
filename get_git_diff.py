import git

def get_git_diff(repo_path, file_path):
    try:
        repo = git.Repo(repo_path)
        diff = repo.git.diff(file_path)
        return diff
    except Exception as e:
        return f"Error: {e}"

# Example usage
repo_path = "."  
file_path = "."  

diff_output = get_git_diff(repo_path, file_path)
print(diff_output)
