# ZCode Builder — Mode A: Reverse Engineering template
# Build:  cd e2b-templates/reverse && e2b template build
# Set:    E2B_TEMPLATE_REVERSE=<template-id> in agent-service env
FROM e2bdev/code-interpreter:latest

USER root

ENV GHIDRA_VERSION=11.1.2
ENV GHIDRA_HOME=/opt/ghidra
ENV PATH="${GHIDRA_HOME}:${PATH}"

# RE toolbelt: radare2 (disassembler), binwalk (firmware carving), file/strings,
# build tools, X11 runtime for Ghidra GUI via display stream, JDK for Ghidra itself
RUN apt-get update && apt-get install -y --no-install-recommends \
      radare2 binwalk file strace ltrace xxd \
      build-essential gdb \
      openjdk-21-jdk-headless \
      xvfb x11-utils x11-xserver-utils \
      python3.11 python3.11-venv python3-pip \
      git curl wget jq \
    && rm -rf /var/lib/apt/lists/*

# Ghidra headless + GUI support scripts at /opt/ghidra/support (brief requirement)
RUN wget -q https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_${GHIDRA_VERSION}_build/ghidra_${GHIDRA_VERSION}_PUBLIC_20240709.zip -O /tmp/ghidra.zip \
    && unzip -q /tmp/ghidra.zip -d /opt \
    && mv /opt/ghidra_${GHIDRA_VERSION}_PUBLIC ${GHIDRA_HOME} \
    && rm /tmp/ghidra.zip

# Python RE helpers
RUN pip3 install --break-system-packages --no-cache-dir \
      capstone pycryptodome lief pyelftools

# REA agents space + workspace output contract
RUN mkdir -p /home/user/workspace/output /opt/rea-agents \
    && chown -R user:user /home/user/workspace /opt/rea-agents

USER user
WORKDIR /home/user/workspace

# Sanity: headless analyzer on PATH
RUN ${GHIDRA_HOME}/support/analyzeHeadless --help 2>&1 | head -1 || true
