# ZCode Builder — Data Analysis template
# Build:  cd e2b-templates/data && e2b template build
# Set:    E2B_TEMPLATE_DATA=<template-id> in agent-service env
FROM e2bdev/code-interpreter:latest

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
      git curl jq python3.11 python3.11-venv python3-pip \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /usr/bin/python3.11 /usr/bin/python3

# Data stack: pandas/numpy/matplotlib/plotly + openpyxl for spreadsheets + scipy
RUN pip3 install --break-system-packages --no-cache-dir \
      pandas numpy matplotlib plotly scipy openpyxl tabulate

# Node 20 for JS-based charting pipelines
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/user/workspace/output /home/user/workspace/datasets \
    && chown -R user:user /home/user/workspace

USER user
WORKDIR /home/user/workspace
