#!/bin/bash
# restart-agent-service.sh — reliable restart of the agent-service mini-service
PORT=3031
for pid in $(ss -tlnp 2>/dev/null | grep ":$PORT" | grep -oP 'pid=\K[0-9]+' | sort -u); do
  kill -9 "$pid" 2>/dev/null
done
pkill -9 -f "bun --hot src/index.ts" 2>/dev/null
pkill -9 -f "zcode.cjs app-server" 2>/dev/null
sleep 2
if ss -tlnp 2>/dev/null | grep -q ":$PORT"; then
  echo "ERROR: port $PORT still in use"; exit 1
fi
cd /home/z/my-project/mini-services/agent-service
nohup env ZCODE_DEBUG_EVENTS=1 bun run dev > /home/z/my-project/agent-service.log 2>&1 &
sleep 6
for i in $(seq 1 10); do
  if curl -sf http://127.0.0.1:$PORT/health > /dev/null 2>&1; then
    echo "agent-service up:"; curl -s http://127.0.0.1:$PORT/health; echo ""
    exit 0
  fi
  sleep 2
done
echo "ERROR: service did not become healthy"; tail -20 /home/z/my-project/agent-service.log
exit 1
