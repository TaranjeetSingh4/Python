# UP Health dashboard

Tech Stack:

    - Gramex 1.54 (Backend)
    - D3 4.x, Vega (Charts)
    - python 3.x
    - leaflet

## Instructions for running the app

```bash
 # install npm packages
 npm install

 # run gramex
 gramex
```

# URL and repository path

```bash
 URL: `https://uphealthdashboard.in/`

 Server: `jupiter` -- `https://bmgf.gramener.com`

 repository path: `/home/gramener/bmgf-data/bmgf/up-tsu-desktop-container/up-tsu-desktop/`
```

# Deployment Using nginx

1. Client facing project is deployed on `uphealthdashboard.in` server. Deployment is manual. branch: `dev-main`.
2. Internal testing project is deployed for [Desktop](https://bmgf.gramener.com/up-tsu-desktop/) and [mobile](`https://bmgf.gramener.com/up-tsu-v2/`). branch: `dev-test`.

# Steps to deploy via nginx

```bash
 nginx load balancing

 nohup gramex --listen.port=9950 &
 nohup gramex --listen.port=9951 &
 nohup gramex --listen.port=9952 &
 nohup gramex --listen.port=9953 &

```

Reference: [nginx.conf](https://code.gramener.com/bmgf/deploy/blob/master/nginx.conf)

# Deployment Using Docker

This project is deployed on `bmgf.gramener.com server`. Deployment is automated.

branch used: `dev-test`

Docker instance has been created at this location:

Docker filepath: /home/gramener/bmgf-data/bmgf/docker-up-tsu-desktop-run/Dockerfile

## Steps to deploy via Docker

```bash
 # /home/gramener/bmgf-data/bmgf/docker-up-tsu-desktop-run
docker build -t latestuptsudesktop .

# check if image is created successfully
docker image ls

# deploy docker
docker run --detach --name uptsudesktopdocker --link some-mysql:mysql -p 9876:9876 latestuptsudesktop
```

Useful docker commands:

We need to create a docker build
`docker build --rm -t <image-name> .`

To check docker container
`docker ps //Current docker containers`

To check all docker containers
`docker ps -a`

To Delete all docker containers
`docker rm $(docker ps -a -q)`

To Delete all image containers
`docker rmi $(docker images -a -q)`

To run the docker
`docker run -d -P --name <containerName> -p <host>:<docker> <image-name>`

To run docker in interactive shell
`docker run -it -p <host>:<docker> <image-name>`

# People with access to deployment

- Anvesh Dasari <anvesh.dasari@gramener.com>
- Bhanu Kamapantula <bhanu.kamapantula@gramener.com>
- Naveen Manukonda <naveen.manukonda@gramener.com>
- Pragnya Reddy <pragnya.reddy@gramener.com>
- Sagar Yellina <it@gramener.com>
