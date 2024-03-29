FROM gitpod/workspace-mongodb

USER root

RUN apt-get update && \
    apt-get install -yq tmux && \
    rm -rf /var/lib/apt/lists/*

USER gitpod

# Install custom tools, runtime, etc. using apt-get
# For example, the command below would install "bastet" - a command line tetris clone:
#
# RUN sudo apt-get -q update && #     sudo apt-get install -yq bastet && #     sudo rm -rf /var/lib/apt/lists/*
#
# More information: https://www.gitpod.io/docs/config-docker/
