// relay.mjs — runs INSIDE an E2B sandbox. Bridges the zcode core's stdio to HTTP.
// Endpoints:
//   GET  /health              → {ok:true}
//   POST /rpc  {id,method,params} → forwards to core stdin, waits for matching response
//   POST /notify {method,params}
//   POST /respond {id,result|error}   (answers core server-requests)
//   GET  /poll?cursor=N&timeout=ms    → {cursor, lines:[...]} long-poll (notifications + server-requests)
//   POST /shutdown
import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";

const CORE = process.env.RELAY_CORE || "/home/user/.zc/extracted/zcode.cjs";
const PORT = Number(process.env.RELAY_PORT || 4777);

const child = spawn(process.execPath, [CORE, "app-server", "--stdio"], {
  cwd: "/home/user/workspace",
  env: {
    ...process.env,
    ZCODE_BUILTIN_PROVIDER_CONFIG_FILE: "/home/user/.zc/extracted/config/zcode-builtin.json",
    ZCODE_PERSONAL_PROVIDER_CONFIG_FILE: "/home/user/.zc/provider_config.json",
    ZCODE_DATA_BASE_DIR: "/home/user/.zc/data",
  },
  stdio: ["pipe", "pipe", "pipe"],
});

let pending = new Map(); // id -> {resolve, timer}
let eventLines = []; // {seq, obj}
let eventSeq = 0;
let pollWaiters = []; // {resolve, timer}

let buf = "";
child.stdout.setEncoding("utf8");
child.stdout.on("data", (chunk) => {
  buf += chunk;
  let idx;
  while ((idx = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    if (obj && typeof obj.id === "string" && pending.has(obj.id)) {
      const p = pending.get(obj.id);
      pending.delete(obj.id);
      clearTimeout(p.timer);
      p.resolve(obj);
    } else {
      eventSeq += 1;
      eventLines.push({ seq: eventSeq, obj });
      if (eventLines.length > 5000) eventLines = eventLines.slice(-2500);
      flushPolls();
    }
  }
});
child.stderr.setEncoding("utf8");
child.stderr.on("data", (d) => console.error("[core]", String(d).slice(0, 400)));
child.on("exit", (code) => {
  eventSeq += 1;
  eventLines.push({ seq: eventSeq, obj: { __exit: true, code } });
  flushPolls();
});

function writeLine(obj) {
  try {
    child.stdin.write(JSON.stringify(obj) + "\n");
  } catch {
    /* noop */
  }
}

function flushPolls() {
  for (const w of pollWaiters.splice(0)) {
    clearTimeout(w.timer);
    w.resolve();
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const json = (code, obj) => {
    res.writeHead(code, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    res.end(JSON.stringify(obj));
  };
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "*",
    });
    return res.end();
  }

  if (url.pathname === "/health") return json(200, { ok: true, pid: child.pid, exited: child.exitCode !== null });

  if (url.pathname === "/rpc" && req.method === "POST") {
    const body = await readBody(req);
    const { id, method, params } = body;
    const result = await new Promise((resolve) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        resolve({ id, error: { code: -32000, message: "relay timeout" } });
      }, Number(url.searchParams.get("timeout") || 150000));
      pending.set(id, { resolve, timer });
      writeLine({ id, method, params });
    });
    return json(200, result);
  }

  if (url.pathname === "/notify" && req.method === "POST") {
    const body = await readBody(req);
    writeLine(body);
    return json(200, { ok: true });
  }

  if (url.pathname === "/respond" && req.method === "POST") {
    const body = await readBody(req);
    if (body.error !== undefined) writeLine({ id: body.id, error: body.error });
    else writeLine({ id: body.id, result: body.result ?? {} });
    return json(200, { ok: true });
  }

  if (url.pathname === "/poll" && req.method === "GET") {
    const cursor = Number(url.searchParams.get("cursor") || 0);
    const timeout = Math.min(Number(url.searchParams.get("timeout") || 25000), 60000);
    const collect = () => eventLines.filter((l) => l.seq > cursor);
    let lines = collect();
    if (!lines.length) {
      await new Promise((resolve) => {
        const timer = setTimeout(() => {
          pollWaiters = pollWaiters.filter((w) => w.resolve !== resolve);
          resolve();
        }, timeout);
        pollWaiters.push({ resolve, timer });
      });
      lines = collect();
    }
    const newCursor = lines.length ? lines[lines.length - 1].seq : cursor;
    return json(200, { cursor: newCursor, lines: lines.map((l) => l.obj) });
  }

  if (url.pathname === "/shutdown" && req.method === "POST") {
    try {
      child.kill("SIGTERM");
    } catch {}
    setTimeout(() => process.exit(0), 200);
    return json(200, { ok: true });
  }

  json(404, { error: "not found" });
});

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}

server.listen(PORT, "0.0.0.0", () => console.log(`[relay] listening on ${PORT}, core pid ${child.pid}`));
