# OpenCTI Track Change

## Flow
![alt text](image.png)

- Wait until OpenCTI get commit
- Copy file and push to gitlab (with out files in whitelist)
- Build Docker image and push to Dockerhub
- Run docker-compose in cloud server

## Include file:
- config.json
- track_change.py
- .gitlab-ci.yml
- docker-compose.yml

## Run
- Clone OpenCTI on github
- Clone gitlab repository (in gitlab add .gitlab-ci.yml file)
- Change config file with:
  - dir.repo_dir = /path/to/github_opencti/location
  - dir.target_dir = /path/to/gitlab_repo/location
  - gitlab_config: config gitlab url, username, token
  - whitelist: list files/folder which do not copy to gitlab repository
  - last_commit: save last commit of github repository, if emty it will copy and push to gitlab 
- Add docker-compose to /opt/opencti (install if server don't have docker/docker-compose [Guide](https://medium.com/@piyushkashyap045/comprehensive-guide-installing-docker-and-docker-compose-on-windows-linux-and-macos-a022cf82ac0b)), change port to expose in server
- Run python file track_change.py

## .gitlab-ci.yml
```
image: ubuntu:latest  # Using Ubuntu for apt support

stages:
  - build
  - deploy

variables:
  IMAGE_NAME: "$CI_REGISTRY_USER/opencti"
  TAG: "latest"

before_script:
  - echo "Updating and installing dependencies..."
  - apt update && apt install -y docker.io openssh-client
  - systemctl start docker || true  # Ensure Docker is running

build:
  stage: build
  script:
    - echo "Logging in to Docker Hub..."
    - echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
    - echo "Building Docker image..."
    - docker build -t $IMAGE_NAME:$TAG ./opencti-platform
    - echo "Pushing Docker image..."
    - docker push $IMAGE_NAME:$TAG
  only:
    - main

deploy:
  stage: deploy
  before_script:
  - mkdir -p ~/.ssh
  - echo "$SSH_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_rsa
  - chmod 600 ~/.ssh/id_rsa
  - ssh-keyscan -p 234 -H "$SERVER_HOST" >> ~/.ssh/known_hosts
  - echo "Host $SERVER_HOST" >> ~/.ssh/config
  - echo "    StrictHostKeyChecking no" >> ~/.ssh/config
  - echo "    UserKnownHostsFile=/dev/null" >> ~/.ssh/config
  script:
  - echo "Deploying to server..."
  - ssh -i ~/.ssh/id_rsa -p 234 "$SERVER_USER@$SERVER_HOST" "set -e; cd /opt/opencti && docker-compose pull && docker-compose down && docker-compose up -d"

  only:
    - main
```

## docker-compose.yml
```version: '3'
services:
  opencti:
    image: capenci1808/opencti:latest
    restart: always
    ports:
      - "8888:8080"
    environment:
      - OPENCTI_ADMIN_EMAIL=admin@example.com
      - OPENCTI_ADMIN_PASSWORD=StrongPassword
      - OPENCTI_GRAPHQL_URI=http://localhost:8080
      - OPENCTI_LOG_LEVEL=info
    depends_on:
      - elasticsearch
      - redis
      - rabbitmq
      - minio

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.0
    restart: always
    environment:
      - discovery.type=single-node
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"

  redis:
    image: redis:6
    restart: always

  rabbitmq:
    image: rabbitmq:3
    restart: always

  minio:
    image: minio/minio
    restart: always
    command: server /data
    environment:
      - MINIO_ACCESS_KEY=opencti-access-key
      - MINIO_SECRET_KEY=opencti-secret-key
    ports:
      - "9999:9000"
```
