#!/usr/bin/env bash
# ─── ZCode Builder: build all per-mode E2B templates ─────────────────────────
# Usage:
#   export E2B_ACCESS_TOKEN=...        # from e2b.dev dashboard
#   ./build.sh            [web mobile reverse data design presentation anything]
#
# After building, copy each printed template id into the agent-service env:
#   E2B_TEMPLATE_WEB=E2B_TEMPLATE_MOBILE=... (see README.md)
set -euo pipefail

MODES=("${@:-web mobile reverse data design presentation anything}")

command -v e2b >/dev/null 2>&1 || { echo "error: e2b CLI not found — npm i -g e2b"; exit 1; }
[ -n "${E2B_ACCESS_TOKEN:-}" ] || { echo "error: E2B_ACCESS_TOKEN not set"; exit 1; }
docker info >/dev/null 2>&1 || { echo "error: Docker daemon not running"; exit 1; }

echo "==> Building ${#MODES[@]} ZCode templates: ${MODES[*]}"
declare -A IDS
for m in "${MODES[@]}"; do
  d="$(cd "$(dirname "$0")/$m" && pwd)"
  [ -f "$d/Dockerfile" ] || { echo "skip: no Dockerfile for '$m'"; continue; }
  echo "--- [$m] e2b template build (this can take minutes on first run)"
  (cd "$d" && e2b template build)
  IDS[$m]=$(
    cd "$d" && e2b template list 2>/dev/null | awk -v n="zcode-$m" '$0 ~ n {print $NF; exit}'
  )
  echo "--- [$m] done${IDS[$m]:+ → ${IDS[$m]}}"
done

echo
echo "==> Done. Add to agent-service .env:"
for m in "${MODES[@]}"; do
  key=$(echo "E2B_TEMPLATE_${m}" | tr '[:lower:]' '[:upper:]')
  echo "  ${key}=${IDS[$m]:-<template-id>}"
done
