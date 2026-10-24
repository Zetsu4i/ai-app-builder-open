# ZCode Builder — Mode B: Web Development template
# Build:  cd e2b-templates/web && e2b template build
# Set:    E2B_TEMPLATE_WEB=<template-id> in agent-service env
FROM e2bdev/code-interpreter:latest

USER root

# Core tooling: Node 20 LTS, git, curl, jq, unzip — everything a web scaffold needs
RUN apt-get update && apt-get install -y --no-install-recommends \
      git curl jq unzip ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Node 20 via NodeSource (image ships its own node — this pins LTS and npm)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Preinstalled scaffold CLIs — `npm create vite` / `npx create-next-app` resolve instantly
RUN npm install -g --silent create-vite vite create-next-app typescript \
    && npm cache clean --force

# Python 3.11 + pip for Flask/fullstack fallbacks
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3.11 python3.11-venv python3-pip \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /usr/bin/python3.11 /usr/bin/python3

# Port forwarding: Vite 5173, Next 3000, Flask 5000, generic 8080
EXPOSE 5173 3000 5000 8080

# Workspace contract dirs
RUN mkdir -p /home/user/workspace/output \
    && chown -R user:user /home/user/workspace

USER user
WORKDIR /home/user/workspace
