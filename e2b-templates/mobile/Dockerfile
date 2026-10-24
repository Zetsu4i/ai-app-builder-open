# ZCode Builder — Mode C: Mobile Development template
# Build:  cd e2b-templates/mobile && e2b template build
# Set:    E2B_TEMPLATE_MOBILE=<template-id> in agent-service env
FROM e2bdev/code-interpreter:latest

USER root

# Base tools + watchman (file watching for Metro bundler) + JDK 17 (Android toolchain)
RUN apt-get update && apt-get install -y --no-install-recommends \
      git curl jq unzip watchman openjdk-17-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

# Node 20 LTS — required by Expo / Metro / EAS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Expo + EAS CLIs preinstalled globally — `npx create-expo-app` / `eas` resolve instantly
RUN npm install -g --silent expo-cli eas-cli typescript \
    && npm cache clean --force

# Metro bundler port + Expo dev ports
EXPOSE 8081 19000 19001 19002

# ANDROID_HOME placeholder for SDK-less tooling (no emulator in cloud; JS-only builds)
ENV ANDROID_HOME=/opt/android-sdk
RUN mkdir -p ${ANDROID_HOME} /home/user/workspace/output \
    && chown -R user:user /home/user/workspace

USER user
WORKDIR /home/user/workspace
