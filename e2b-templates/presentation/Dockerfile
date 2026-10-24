# ZCode Builder — Presentation Mode template (self-contained HTML decks)
# Build:  cd e2b-templates/presentation && e2b template build
# Set:    E2B_TEMPLATE_PRESENTATION=<template-id> in agent-service env
FROM e2bdev/code-interpreter:latest

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
      git curl jq imagemagick nodejs npm \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g --silent serve \
    && npm cache clean --force

EXPOSE 3000

RUN mkdir -p /home/user/workspace/output \
    && chown -R user:user /home/user/workspace

USER user
WORKDIR /home/user/workspace
