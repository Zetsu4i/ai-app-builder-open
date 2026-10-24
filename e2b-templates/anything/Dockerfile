# ZCode Builder — Anything Mode template (general-purpose polyglot)
# Build:  cd e2b-templates/anything && e2b template build
# Set:    E2B_TEMPLATE_ANYTHING=<template-id> in agent-service env
FROM e2bdev/code-interpreter:latest

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
      git curl wget jq unzip build-essential \
      python3.11 python3.11-venv python3-pip \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /usr/bin/python3.11 /usr/bin/python3

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g --silent typescript tsx \
    && npm cache clean --force

RUN pip3 install --break-system-packages --no-cache-dir requests httpx

EXPOSE 3000 5173 8000

RUN mkdir -p /home/user/workspace/output \
    && chown -R user:user /home/user/workspace

USER user
WORKDIR /home/user/workspace
