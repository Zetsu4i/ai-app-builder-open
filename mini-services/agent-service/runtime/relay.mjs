// relay.mjs — runs INSIDE an E2B sandbox. Bridges the zcode core's stdio to HTTP.
// Endpoints:
//   GET  /health              → {ok:true}
//   POST /rpc  {id,method,params} → forwards to core stdin, waits for matching response
//   POST /notify {method,params}
//   POST /respond {id,result|error}   (answers core server-requests)
//   GET  /poll?cursor=N&timeout=ms    → {cursor, lines:[...]} long-poll (notifications + server-requests)
//   POST /shutdown
//   POST /llm/v1/chat/completions     → z-ai LLM bridge (OpenAI wire format; stream + non-stream)
//   GET  /llm/v1/models               → model list for the bridge
import http from "node:http";
import fs from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const CORE = process.env.RELAY_CORE || "/home/user/.zc/extracted/zcode.cjs";
const PORT = Number(process.env.RELAY_PORT || 4777);
const Z_AI_CONFIG_PATH = process.env.Z_AI_CONFIG_FILE || "/home/user/.zc/.z-ai-config";
// bumped whenever relay.mjs behaviour changes — the host checks this on reuse
// and re-provisions an outdated relay
export const RELAY_VERSION = 2;

// The relay must never die — it is the sandbox's only route to the LLM and the host.
process.on("uncaughtException", (e) => console.error("[relay] uncaught:", e?.message || e));
process.on("unhandledRejection", (e) => console.error("[relay] unhandled:", e?.message || e));

let child = spawnCore();

function spawnCore() {
  const c = spawn(process.execPath, [CORE, "app-server", "--stdio"], {
    cwd: "/home/user/workspace",
    env: {
      ...process.env,
      ZCODE_BUILTIN_PROVIDER_CONFIG_FILE: "/home/user/.zc/extracted/config/zcode-builtin.json",
      ZCODE_PERSONAL_PROVIDER_CONFIG_FILE: "/home/user/.zc/provider_config.json",
      ZCODE_DATA_BASE_DIR: "/home/user/.zc/data",
    },
    stdio: ["pipe", "pipe", "pipe"],
  });
  let restarts = 0;
  c.stdout.setEncoding("utf8");
  c.stdout.on("data", (chunk) => {
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
  c.stderr.setEncoding("utf8");
  c.stderr.on("data", (d) => console.error("[core]", String(d).slice(0, 400)));
  c.on("exit", (code) => {
    eventSeq += 1;
    eventLines.push({ seq: eventSeq, obj: { __exit: true, code } });
    flushPolls();
    // auto-respawn with capped backoff so a core crash never bricks the sandbox
    if (restarts < 5) {
      restarts += 1;
      console.error(`[relay] core exited (${code}) — respawning in ${restarts * 2}s`);
      setTimeout(() => {
        try {
          const fresh = spawnCore();
          child = fresh;
        } catch (e) {
          console.error("[relay] respawn failed:", e?.message || e);
        }
      }, restarts * 2000);
    }
  });
  return c;
}

let pending = new Map(); // id -> {resolve, timer}
let eventLines = []; // {seq, obj}
let eventSeq = 0;
let pollWaiters = []; // {resolve, timer}

let buf = "";

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

// ---------------- z-ai LLM bridge (the sandbox has no direct provider access) ----------------
// Strategy: 1) try the configured upstream directly (short probe — internal endpoints hang);
// 2) fall back to the HOST TUNNEL: the request rides the /poll channel to the host, which
//    executes it against its own bridge (builtin + BYOK) and posts the result to /tunnel-response.

let directUpstreamUsable = true; // circuit breaker — flips off after the first failure

function readZaiConfig() {
  const candidates = [Z_AI_CONFIG_PATH, "/etc/.z-ai-config"];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf8"));
    } catch {
      /* try next */
    }
  }
  return null;
}

function upstreamHeaders(cfg) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cfg.apiKey || "Z.ai"}`,
    "X-Z-AI-From": "Z",
  };
  if (cfg.chatId) headers["X-Chat-Id"] = cfg.chatId;
  if (cfg.userId) headers["X-User-Id"] = cfg.userId;
  if (cfg.token) headers["X-Token"] = cfg.token;
  return headers;
}

function sanitizeMessages(messages) {
  return (messages || []).map((m) =>
    m && m.role === "tool" ? { role: "user", content: `[tool result] ${String(m.content ?? "")}` } : m,
  );
}

async function readRawBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
  });
}

// ---- host tunnel (reverse-RPC over the /poll channel) ----

let tunnelSeq = 0;
const llmPending = new Map(); // id -> {resolve}

async function tunnelViaHost(payload) {
  const id = `llm-${Date.now()}-${tunnelSeq++}`;
  const result = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      llmPending.delete(id);
      reject(new Error("host tunnel timeout (LLM request via host did not answer in 180s)"));
    }, 180000);
    llmPending.set(id, { resolve, timer });
    eventSeq += 1;
    eventLines.push({ seq: eventSeq, obj: { __tunnel: id, body: payload } });
    flushPolls();
  });
  return result; // {status, contentType, body}
}

async function tryDirectUpstream(payload) {
  if (!directUpstreamUsable) return null;
  const cfg = readZaiConfig();
  if (!cfg) return null;
  const base = String(cfg.baseUrl || "").replace(/\/$/, "");
  if (!base) return null;
  const url = base.endsWith("/v1") || base.includes("/paas/v4") ? `${base}/chat/completions` : `${base}/v1/chat/completions`;
  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: upstreamHeaders(cfg),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000), // short probe — internal endpoints just hang
    });
    if (!upstream.ok) {
      directUpstreamUsable = false;
      return null;
    }
    const text = await upstream.text();
    return { status: 200, contentType: upstream.headers.get("content-type") || "application/json", body: text };
  } catch {
    directUpstreamUsable = false; // unreachable → never probe again this boot
    return null;
  }
}

async function handleBridge(req, res) {
  let body;
  try {
    body = JSON.parse((await readRawBody(req)) || "{}");
  } catch {
    return jsonReply(res, 400, { error: { message: "invalid json" } });
  }
  const payload = {
    ...body,
    messages: sanitizeMessages(body.messages),
    thinking: body.thinking ?? { type: "disabled" },
  };

  // 1) direct upstream (only while known-reachable)
  let result = await tryDirectUpstream(payload);

  // 2) host tunnel — the reliable path: the host executes its own bridge
  if (!result) {
    try {
      result = await tunnelViaHost(payload);
    } catch (e) {
      return jsonReply(res, 502, { error: { message: `bridge failed: ${e?.message || e}` } });
    }
  }

  const status = Number(result.status) || 200;
  const headers = {
    "Content-Type": result.contentType || "application/json",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  };
  res.writeHead(status, headers);
  res.end(result.body ?? "");
}

function handleModels(res) {
  const cfg = readZaiConfig();
  const model = cfg?.model || "GLM-4.7";
  jsonReply(res, 200, {
    object: "list",
    data: [{ id: model, object: "model", owned_by: "zai-bridge" }],
  });
}

function jsonReply(res, code, obj) {
  if (!res.headersSent) {
    res.writeHead(code, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  }
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const json = (code, obj) => jsonReply(res, code, obj);
  try {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "*",
    });
    return res.end();
  }

  if (url.pathname === "/health") return json(200, { ok: true, pid: child.pid, exited: child.exitCode !== null, v: RELAY_VERSION });

  if (url.pathname === "/llm/v1/chat/completions" && req.method === "POST") return handleBridge(req, res);
  if (url.pathname === "/llm/v1/models" && req.method === "GET") return handleModels(res);
  if (url.pathname?.startsWith("/llm/")) return json(404, { error: { message: `unknown llm path ${url.pathname}` } });

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

  // host → relay: answer for a tunneled LLM request
  if (url.pathname === "/tunnel-response" && req.method === "POST") {
    const body = await readBody(req);
    const p = llmPending.get(body.id);
    if (p) {
      llmPending.delete(body.id);
      clearTimeout(p.timer);
      p.resolve({ status: body.status, contentType: body.contentType, body: body.body });
    }
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
  } catch (e) {
    console.error("[relay] request failed:", e?.message || e);
    try {
      jsonReply(res, 500, { error: { message: `relay error: ${e?.message || e}` } });
    } catch {
      /* socket already gone */
    }
  }
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
