# ZCode Builder — Design Mode template (static HTML/CSS/JS craft)
# Build:  cd e2b-templates/design && e2b template build
# Set:    E2B_TEMPLATE_DESIGN=<template-id> in agent-service env
FROM e2bdev/code-interpreter:latest

USER root

# Minimal static-serving footprint: node for tooling, imagemagick for asset ops
RUN apt-get update && apt-get install -y --no-install-recommends \
      git curl jq imagemagick nodejs npm \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g --silent serve \
    && npm cache clean --force

EXPOSE 3000 5173

RUN mkdir -p /home/user/workspace/output \
    && chown -R user:user /home/user/workspace

USER user
WORKDIR /home/user/workspace
