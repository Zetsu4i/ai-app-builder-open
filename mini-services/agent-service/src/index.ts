// agent-service — main entry: HTTP server (:3031) + socket.io + REST routes + turn lifecycle.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { Server } from "socket.io";
import {
  SERVICE_PORT,
  ensureDirs,
  ensureSeedPlugins,
  projectWorkspaceDir,
} from "./config";
import { db } from "./db";
import { handleBridge, bridgeHealthy, bridgeText } from "./bridge";
import { initRuntime, getRuntime, writeProviderConfig, setSandboxBridge } from "./runtime";
import {
  bootSandbox,
  stopSandbox,
  sandboxInfo,
  e2bConfigured,
  isE2BActive,
  getRelayUrl,
  syncUp,
  syncDown,
  sandboxDevServerAction,
} from "./sandbox";
import { resolveMode, seedWorkspaceIfNeeded, generateTitle, nextWorklogTaskId, appendWorklogRunHeader } from "./workspace";
import {
  buildFileTree,
  readFileContent,
  writeFileContent,
  createEntry,
  deleteEntry,
  searchFiles,
  fileStats,
  gitStatus,
  gitLog,
  gitDiff,
  gitCommitAll,
  gitCheckpoint,
  gitRestore,
  githubImport,
  githubPublish,
  scanArtifacts,
  devServerAction,
  devServerInfo,
  runTerminal,
  exportChatMarkdown,
  exportZipPath,
} from "./services";
import { startSwarm, stopSwarm, currentRun } from "./swarm";
import * as mgr from "./managers";
import { emitProjectEvent, persistUserMessage, nextMessageSeq } from "./turns";
import { BUILTIN_MODES } from "./modes";

ensureDirs();
ensureSeedPlugins();

// ---------------- socket.io ----------------
const httpServer = http.createServer((req, res) => {
  void route(req, res).catch((e) => {
    console.error("[route error]", e);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: (e as Error).message }));
    }
  });
});

const io = new Server(httpServer, {
  path: "/socket.io",
  cors: { origin: "*", methods: ["GET", "POST"] },
  maxHttpBufferSize: 5e6,
});

(globalThis as unknown as { __forgeIO: unknown }).__forgeIO = {
  to: (room: string) => ({ emit: (ev: string, payload: unknown) => io.to(room).emit(ev, payload) }),
};

io.on("connection", (socket) => {
  socket.on("project:join", ({ projectId }: { projectId: string }) => {
    void socket.join(`project:${projectId}`);
    socket.emit("hydrated", { projectId });
  });
  socket.on("project:leave", ({ projectId }: { projectId: string }) => {
    void socket.leave(`project:${projectId}`);
  });
});

// ---------------- runtime ----------------
initRuntime({
  io: { to: (room: string) => ({ emit: (ev: string, payload: unknown) => io.to(room).emit(ev, payload) }) },
  emitEvent: (projectId, kind, payload) => emitProjectEvent(projectId, kind, payload),
  modePolicyFor: (projectId) => {
    const cached = policyCache.get(projectId);
    return cached ? cached.policy : "ask";
  },
});
setSandboxBridge({ isE2B: (projectId) => isE2BActive(projectId), getRelayUrl: (projectId) => getRelayUrl(projectId) });

const policyCache = new Map<string, { policy: "yolo" | "auto" | "ask"; at: number }>();
async function policyFor(projectId: string): Promise<"yolo" | "auto" | "ask"> {
  const cached = policyCache.get(projectId);
  if (cached && Date.now() - cached.at < 15000) return cached.policy;
  const proj = await db.project.findUnique({ where: { id: projectId }, select: { agentMode: true } });
  const policy = (proj?.agentMode === "yolo" ? "yolo" : proj?.agentMode === "auto" ? "auto" : "ask") as "yolo" | "auto" | "ask";
  policyCache.set(projectId, { policy, at: Date.now() });
  return policy;
}

// ---------------- helpers ----------------
function json(res: http.ServerResponse, code: number, data: unknown) {
  res.writeHead(code, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify(data));
}

async function readBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}") as Record<string, unknown>);
      } catch {
        resolve({});
      }
    });
  });
}

function streamFile(res: http.ServerResponse, filePath: string, mime: string) {
  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    "Content-Type": mime,
    "Content-Length": stat.size,
    "Access-Control-Allow-Origin": "*",
    "Content-Security-Policy": "frame-ancestors *",
  });
  fs.createReadStream(filePath).pipe(res);
}

// ---------------- routes ----------------
async function route(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const url = new URL(req.url || "/", `http://127.0.0.1:${SERVICE_PORT}`);
  const p = url.pathname;
  const method = req.method || "GET";
  const body = method === "POST" || method === "PUT" || method === "PATCH" ? await readBody(req) : {};

  // CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "*",
    });
    res.end();
    return;
  }

  // ---------- socket.io fallback (Next rewrites may strip the trailing slash) ----------
  if (p === "/socket.io" || p.startsWith("/socket.io")) {
    if (!p.startsWith("/socket.io/")) {
      req.url = `/socket.io/${url.search}`;
    }
    (io.engine as unknown as { handleRequest: (r: http.IncomingMessage, s: http.ServerResponse) => void }).handleRequest(req, res);
    return;
  }

  // ---------- health & bridge ----------
  if (p === "/health" && method === "GET") {
    const runtime = getRuntime();
    const health = await runtime.health();
    return json(res, 200, { ok: true, ...health, e2b: e2bConfigured() });
  }
  if (p === "/llm/v1/chat/completions" && method === "POST") {
    // `body` was already parsed at the top of route()
    const bridgeReq = new Request("http://bridge/llm/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const bridgeRes = await handleBridge(bridgeReq);
    const headers: Record<string, string> = {};
    bridgeRes.headers.forEach((v, k) => (headers[k] = v));
    res.writeHead(bridgeRes.status, headers);
    res.end(Buffer.from(await bridgeRes.arrayBuffer()));
    return;
  }

  // ---------- projects ----------
  if (p === "/api/projects" && method === "GET") {
    const rows = await db.project.findMany({ orderBy: { updatedAt: "desc" } });
    return json(res, 200, rows.map((r) => projectDto(r)));
  }
  if (p === "/api/projects" && method === "POST") {
    const mode = String(body.mode || "web");
    const modeDef = await resolveMode(mode);
    const framework = String(body.framework || modeDef.defaultFramework);
    const mc = (body.config as Record<string, unknown>) || {};
    const project = await db.project.create({
      data: {
        title: String(body.title || "Untitled Project"),
        mode,
        framework,
        modeConfig: JSON.stringify({
          designSystem: mc.designSystem ?? null,
          style: mc.style ?? null,
          tone: mc.tone ?? null,
          docType: mc.docType ?? null,
        }),
        swarmEnabled: modeDef.swarmAllowed ? !!body.swarm : false,
        agentMode: String(body.agentMode || "build"),
        instructions: (mc.instructions as string) || null,
        initialPrompt: body.initialPrompt ? String(body.initialPrompt) : null,
        hue: Math.floor(Math.random() * 360),
      },
    });
    await seedWorkspaceIfNeeded(project.id, mode, framework, mc);
    // install design system into workspace if selected
    if (mc.designSystem) {
      const { installDesignSystemToWorkspace } = await import("./managers");
      installDesignSystemToWorkspace(project.id, String(mc.designSystem));
    }
    return json(res, 200, projectDto(project));
  }

  let m = p.match(/^\/api\/projects\/([^/]+)$/);
  if (m) {
    const id = m[1];
    if (method === "GET") {
      const row = await db.project.findUnique({ where: { id } });
      return row ? json(res, 200, projectDto(row)) : json(res, 404, { error: "not found" });
    }
    if (method === "PATCH") {
      const data: Record<string, unknown> = {};
      for (const k of ["title", "mode", "framework", "agentMode", "swarmEnabled", "instructions", "sandboxRuntime", "githubRepo", "githubBranch"]) {
        if (body[k] !== undefined) data[k] = body[k];
      }
      if (body.modeConfig) data.modeConfig = JSON.stringify(body.modeConfig);
      const row = await db.project.update({ where: { id }, data });
      return json(res, 200, projectDto(row));
    }
    if (method === "DELETE") {
      await stopSandbox(id).catch(() => undefined);
      await db.project.delete({ where: { id } }).catch(() => undefined);
      try {
        fs.rmSync(projectWorkspaceDir(id), { recursive: true, force: true });
      } catch {
        /* noop */
      }
      res.writeHead(204);
      res.end();
      return;
    }
  }

  m = p.match(/^\/api\/projects\/([^/]+)\/hydrate$/);
  if (m && method === "GET") {
    const id = m[1];
    const row = await db.project.findUnique({ where: { id } });
    if (!row) return json(res, 404, { error: "not found" });
    const [messages, events, artifacts, checkpoints, usage, devserver, swarmRun] = await Promise.all([
      db.agentMessage.findMany({ where: { projectId: id }, orderBy: { seq: "asc" } }),
      db.agentEvent.findMany({ where: { projectId: id }, orderBy: { seq: "desc" }, take: 200 }),
      db.artifact.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" } }),
      db.checkpoint.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" }, take: 30 }),
      getRuntime().usage(id).catch(() => null),
      Promise.resolve(devServerInfo(id)),
      currentRun(id).catch(() => null),
    ]);
    return json(res, 200, {
      project: projectDto(row),
      messages: messages.map((msg) => ({ id: msg.id, role: msg.role, parts: JSON.parse(msg.parts || "[]"), createdAt: msg.createdAt.toISOString() })),
      events: events.reverse().map((e) => ({ id: e.id, kind: e.kind, payload: JSON.parse(e.payload || "{}"), seq: e.seq, createdAt: e.createdAt.toISOString() })),
      artifacts,
      checkpoints,
      fileTree: buildFileTree(id),
      sandbox: sandboxInfo(id),
      devServer: { status: devserver.status, port: devserver.port },
      swarmRun: swarmRun
        ? {
            id: swarmRun.id,
            goal: swarmRun.goal,
            status: swarmRun.status,
            planMd: swarmRun.planMd,
            summary: swarmRun.summary,
            error: swarmRun.error,
            tasks: swarmRun.tasks.map((t) => ({ ...t, filePaths: JSON.parse(t.filePaths || "[]"), dependsOn: JSON.parse(t.dependsOn || "[]"), acceptance: JSON.parse(t.acceptance || "[]") })),
            workers: swarmRun.workers,
            events: swarmRun.events.map((e) => ({ id: e.id, type: e.type, payload: JSON.parse(e.payload || "{}"), createdAt: e.createdAt.toISOString() })).reverse(),
          }
        : null,
      usage: usage
        ? { contextUsed: (usage as { contextUsed?: number }).contextUsed ?? 0, contextWindow: (usage as { contextWindow?: number }).contextWindow ?? 200000, totalTokens: (usage as { totalTokens?: number }).totalTokens ?? 0 }
        : null,
    });
  }

  // ---------- chat / turn lifecycle ----------
  m = p.match(/^\/api\/projects\/([^/]+)\/chat$/);
  if (m && method === "POST") {
    const id = m[1];
    const content = String(body.content || "").trim();
    if (!content) return json(res, 400, { error: "empty content" });
    const row = await db.project.findUnique({ where: { id } });
    if (!row) return json(res, 404, { error: "not found" });

    void (async () => {
      try {
        const modeDef = await resolveMode(row.mode);
        const modeConfig = JSON.parse(row.modeConfig || "{}") as Record<string, unknown>;
        // 1. seed + sandbox
        await seedWorkspaceIfNeeded(id, row.mode, row.framework, modeConfig);
        await emitProjectEvent(id, "status", { activity: "Preparing workspace…" });

        if (e2bConfigured() && !isE2BActive(id) && row.sandboxRuntime !== "local") {
          await emitProjectEvent(id, "sandbox", { status: "provisioning", runtime: "e2b" });
          const boot = await bootSandbox(id, row.mode);
          if (boot.runtime === "e2b") {
            await db.project.update({ where: { id }, data: { sandboxRuntime: "e2b", sandboxId: boot.sandboxId } });
            await emitProjectEvent(id, "sandbox", { status: "running", runtime: "e2b", sandboxId: boot.sandboxId });
          } else {
            await db.project.update({ where: { id }, data: { sandboxRuntime: "local" } });
            await emitProjectEvent(id, "sandbox", { status: "fallback-local", runtime: "local", error: boot.error });
          }
        }

        const isE2B = isE2BActive(id);
        if (isE2B) await syncUp(id).catch(() => undefined);

        // 2. worklog
        const dir = projectWorkspaceDir(id);
        const taskId = nextWorklogTaskId(dir);
        appendWorklogRunHeader(dir, taskId, content);

        // 3. title
        const msgCount = await db.agentMessage.count({ where: { projectId: id } });
        if (msgCount === 0 && row.title === "Untitled Project") {
          const title = await generateTitle(content);
          if (title) {
            await db.project.update({ where: { id }, data: { title } });
            io.to(`project:${id}`).emit("title", { projectId: id, title });
          }
        }

        // 4. persist user message + start turn
        await persistUserMessage(id, content);
        const runtime = getRuntime();
        const modelPref = await mgr.getRawSetting("defaultModel");
        const defaultModel = typeof modelPref === "object" && modelPref ? (modelPref as { defaultModel?: string }).defaultModel : undefined;
        const mcps = await mgr.mcpsForSession((modeConfig.mcpServers as string[]) || undefined);
        await runtime.ensureForProject(id, dir, defaultModel, mcps);
        // update policy cache before turn
        await policyFor(id);
        const ok = await runtime.send(id, content);
        if (!ok) throw new Error("no active session for project");
        await mgr.bumpUsage({ modelRequestCount: 1 });
      } catch (e) {
        console.error("[chat] turn failed:", (e as Error).message);
        await emitProjectEvent(id, "error", { message: (e as Error).message, kind: "turn" });
        io.to(`project:${id}`).emit("error", { message: (e as Error).message });
      }
    })();

    return json(res, 200, { accepted: true });
  }

  m = p.match(/^\/api\/projects\/([^/]+)\/stop$/);
  if (m && method === "POST") {
    const ok = await getRuntime().stop(m[1]);
    return json(res, 200, { stopped: ok });
  }

  m = p.match(/^\/api\/projects\/([^/]+)\/compact$/);
  if (m && method === "POST") {
    const ok = await getRuntime().compact(m[1], body.instructions ? String(body.instructions) : undefined);
    return json(res, 200, { ok });
  }

  m = p.match(/^\/api\/projects\/([^/]+)\/usage$/);
  if (m && method === "GET") {
    const usage = await getRuntime().usage(m[1]).catch(() => null);
    return json(res, 200, { usage: usage ?? {} });
  }

  // ---------- interactions ----------
  if (p === "/api/interaction/permission" && method === "POST") {
    const ok = getRuntime().resolveInteraction(String(body.requestId), {
      decision: body.decision === "deny" ? "deny" : "allow",
      reason: body.decision === "deny" ? "denied by user" : "approved by user",
      ...(body.modifiedInput ? { modifiedInput: body.modifiedInput } : {}),
    });
    return json(res, 200, { ok });
  }
  if (p === "/api/interaction/question" && method === "POST") {
    const ok = getRuntime().resolveInteraction(String(body.requestId), {
      action: (body.action as string) || "accept",
      content: (body.content as Record<string, string>) || {},
      reason: "user response",
    });
    return json(res, 200, { ok });
  }

  // ---------- enhance (prompt enhancer) ----------
  if (p === "/api/enhance" && method === "POST") {
    try {
      const text = await bridgeText(
        `Rewrite this rough idea into a concrete, specific build brief (3-6 sentences, imperative, mention stack/screens/features). Keep it under 120 words.\n\nIDEA: ${String(body.prompt || "")}`,
        "You are a product-minded staff engineer. Output only the brief.",
        400,
      );
      return json(res, 200, { text: text.trim() });
    } catch (e) {
      return json(res, 500, { error: (e as Error).message });
    }
  }

  // ---------- files ----------
  m = p.match(/^\/api\/projects\/([^/]+)\/files\/tree$/);
  if (m && method === "GET") return json(res, 200, { tree: buildFileTree(m[1]) });

  m = p.match(/^\/api\/projects\/([^/]+)\/files\/content$/);
  if (m) {
    const id = m[1];
    if (method === "GET") {
      const rel = url.searchParams.get("path") || "";
      try {
        const { content, size } = readFileContent(id, rel);
        return json(res, 200, { path: rel, content, size });
      } catch {
        return json(res, 404, { error: "file not found" });
      }
    }
    if (method === "PUT") {
      writeFileContent(id, String(body.path), String(body.content ?? ""));
      await gitCommitAll(id, `edit ${body.path}`).catch(() => undefined);
      return json(res, 200, { ok: true });
    }
  }

  m = p.match(/^\/api\/projects\/([^/]+)\/files\/entry$/);
  if (m) {
    const id = m[1];
    if (method === "POST") {
      createEntry(id, String(body.path), body.type === "dir" ? "dir" : "file");
      return json(res, 200, { ok: true });
    }
    if (method === "DELETE") {
      deleteEntry(id, url.searchParams.get("path") || "");
      return json(res, 200, { ok: true });
    }
  }

  m = p.match(/^\/api\/projects\/([^/]+)\/files\/search$/);
  if (m && method === "GET") return json(res, 200, { matches: searchFiles(m[1], url.searchParams.get("query") || "") });

  m = p.match(/^\/api\/projects\/([^/]+)\/files\/stats$/);
  if (m && method === "GET") return json(res, 200, fileStats(m[1]));

  // ---------- git ----------
  m = p.match(/^\/api\/projects\/([^/]+)\/git\/status$/);
  if (m && method === "GET") return json(res, 200, await gitStatus(m[1]));
  m = p.match(/^\/api\/projects\/([^/]+)\/git\/log$/);
  if (m && method === "GET") return json(res, 200, { log: await gitLog(m[1]) });
  m = p.match(/^\/api\/projects\/([^/]+)\/git\/diff$/);
  if (m && method === "GET") return json(res, 200, { diff: await gitDiff(m[1], url.searchParams.get("path") || undefined) });
  m = p.match(/^\/api\/projects\/([^/]+)\/git\/commit$/);
  if (m && method === "POST") {
    const hash = await gitCommitAll(m[1], String(body.message || "manual commit"));
    return json(res, 200, { ok: !!hash, hash });
  }
  m = p.match(/^\/api\/projects\/([^/]+)\/git\/checkpoint$/);
  if (m && method === "POST") return json(res, 200, await gitCheckpoint(m[1], body.label ? String(body.label) : undefined));
  m = p.match(/^\/api\/projects\/([^/]+)\/git\/restore$/);
  if (m && method === "POST") {
    const ok = await gitRestore(m[1], String(body.checkpointId));
    return json(res, 200, { ok });
  }
  m = p.match(/^\/api\/projects\/([^/]+)\/checkpoints$/);
  if (m && method === "GET") {
    const checkpoints = await db.checkpoint.findMany({ where: { projectId: m[1] }, orderBy: { createdAt: "desc" }, take: 30 });
    return json(res, 200, { checkpoints });
  }

  // ---------- github ----------
  m = p.match(/^\/api\/projects\/([^/]+)\/github\/import$/);
  if (m && method === "POST") {
    let token = body.token ? String(body.token) : "";
    if (!token) {
      const gh = await mgr.getRawSetting("github");
      if (gh && typeof gh === "object") token = (gh as { token?: string }).token || "";
    }
    const ok = await githubImport(m[1], String(body.repo), body.branch ? String(body.branch) : undefined, token || undefined);
    if (ok) await gitCommitAll(m[1], "import from github").catch(() => undefined);
    return json(res, 200, { ok });
  }
  m = p.match(/^\/api\/projects\/([^/]+)\/github\/publish$/);
  if (m && method === "POST") {
    let token = body.token ? String(body.token) : "";
    if (!token) {
      const gh = await mgr.getRawSetting("github");
      if (gh && typeof gh === "object") token = (gh as { token?: string }).token || "";
    }
    const result = await githubPublish(m[1], String(body.repo), body.branch ? String(body.branch) : undefined, token || undefined);
    return json(res, result.ok ? 200 : 400, result);
  }

  // ---------- artifacts ----------
  m = p.match(/^\/api\/projects\/([^/]+)\/artifacts$/);
  if (m && method === "GET") {
    const artifacts = await db.artifact.findMany({ where: { projectId: m[1] }, orderBy: { createdAt: "desc" } });
    return json(res, 200, { artifacts });
  }
  m = p.match(/^\/api\/projects\/([^/]+)\/artifacts\/raw$/);
  if (m && method === "GET") {
    const rel = url.searchParams.get("path") || "";
    const full = path.join(projectWorkspaceDir(m[1]), rel);
    try {
      const mime = mimeFor(rel);
      if (mime.startsWith("text/") || mime === "application/json") {
        const content = fs.readFileSync(full, "utf8");
        return json(res, 200, { path: rel, content });
      }
      streamFile(res, full, mime);
      return;
    } catch {
      return json(res, 404, { error: "not found" });
    }
  }

  // ---------- devserver ----------
  m = p.match(/^\/api\/projects\/([^/]+)\/devserver$/);
  if (m) {
    const id = m[1];
    if (method === "GET") return json(res, 200, devServerInfo(id));
    if (method === "POST") {
      const row = await db.project.findUnique({ where: { id } });
      const isE2B = isE2BActive(id);
      if (isE2B) {
        const result = await sandboxDevServerAction(id, body.action === "stop" ? "stop" : "start", row?.framework || "react-vite");
        await emitProjectEvent(id, "devserver", { status: result.status, cloudUrl: result.url });
        return json(res, 200, { status: result.status, cloudUrl: result.url, error: result.error });
      }
      const result = await devServerAction(id, (body.action as "start" | "stop" | "restart") || "start", row?.framework || "react-vite", row?.mode || "web");
      return json(res, 200, result);
    }
  }

  // ---------- sandbox ----------
  m = p.match(/^\/api\/projects\/([^/]+)\/sandbox$/);
  if (m) {
    const id = m[1];
    if (method === "GET") return json(res, 200, sandboxInfo(id));
    if (method === "POST") {
      const action = String(body.action || "start");
      if (action === "stop") {
        await stopSandbox(id);
        await db.project.update({ where: { id }, data: { sandboxRuntime: "local", sandboxId: null } });
        await emitProjectEvent(id, "sandbox", { status: "stopped", runtime: "local" });
        return json(res, 200, { ok: true });
      }
      if (action === "sync" && isE2BActive(id)) {
        await syncUp(id);
        await syncDown(id);
        return json(res, 200, { ok: true });
      }
      const row = await db.project.findUnique({ where: { id } });
      const boot = await bootSandbox(id, row?.mode || "web");
      if (boot.runtime === "e2b") {
        await db.project.update({ where: { id }, data: { sandboxRuntime: "e2b", sandboxId: boot.sandboxId } });
      }
      await emitProjectEvent(id, "sandbox", { status: boot.runtime === "e2b" ? "running" : "fallback-local", runtime: boot.runtime, sandboxId: boot.sandboxId, error: boot.error });
      return json(res, 200, boot);
    }
  }

  // ---------- terminal ----------
  m = p.match(/^\/api\/projects\/([^/]+)\/terminal$/);
  if (m && method === "POST") {
    runTerminal(m[1], String(body.command || ""));
    return json(res, 200, { ok: true });
  }

  // ---------- export ----------
  m = p.match(/^\/api\/projects\/([^/]+)\/export\/chat$/);
  if (m && method === "GET") return json(res, 200, { markdown: await exportChatMarkdown(m[1]) });
  m = p.match(/^\/api\/projects\/([^/]+)\/export\/zip$/);
  if (m && method === "GET") {
    const zip = exportZipPath(m[1]);
    if (!fs.existsSync(zip)) {
      res.writeHead(500);
      res.end("zip failed");
      return;
    }
    res.writeHead(200, {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="project-${m[1].slice(0, 8)}.zip"`,
    });
    fs.createReadStream(zip).pipe(res);
    fs.unlinkSync(zip);
    return;
  }

  // ---------- swarm ----------
  m = p.match(/^\/api\/projects\/([^/]+)\/swarm\/start$/);
  if (m && method === "POST") {
    const row = await db.project.findUnique({ where: { id: m[1] } });
    if (row?.mode === "design") return json(res, 400, { error: "swarm is disabled in design mode" });
    const { runId } = await startSwarm(m[1], String(body.goal || ""));
    return json(res, 200, { runId });
  }
  m = p.match(/^\/api\/projects\/([^/]+)\/swarm\/stop$/);
  if (m && method === "POST") {
    await stopSwarm(m[1]);
    return json(res, 200, { ok: true });
  }
  m = p.match(/^\/api\/projects\/([^/]+)\/swarm\/current$/);
  if (m && method === "GET") {
    const run = await currentRun(m[1]);
    return json(
      res,
      200,
      run
        ? {
            id: run.id,
            goal: run.goal,
            status: run.status,
            planMd: run.planMd,
            summary: run.summary,
            error: run.error,
            tasks: run.tasks.map((t) => ({ ...t, filePaths: JSON.parse(t.filePaths || "[]"), dependsOn: JSON.parse(t.dependsOn || "[]"), acceptance: JSON.parse(t.acceptance || "[]") })),
            workers: run.workers,
            events: run.events.map((e) => ({ id: e.id, type: e.type, payload: JSON.parse(e.payload || "{}"), createdAt: e.createdAt.toISOString() })).reverse(),
          }
        : null,
    );
  }

  // ---------- modes ----------
  if (p === "/api/modes" && method === "GET") {
    const custom = await db.modeTemplate.findMany({ orderBy: { createdAt: "asc" } });
    const modes = [
      ...BUILTIN_MODES.map((md) => ({ slug: md.slug, name: md.name, icon: md.icon, color: md.color, description: md.description, frameworks: md.frameworks, samplePrompts: md.samplePrompts, swarmAllowed: md.swarmAllowed, isBuiltin: true })),
      ...custom.map((c) => ({
        slug: `custom:${c.slug}`,
        name: c.name,
        icon: c.icon,
        color: c.color,
        description: c.directive.slice(0, 100),
        frameworks: [c.framework],
        samplePrompts: safeArr(c.samplePrompts) as string[],
        swarmAllowed: c.swarmAllowed,
        isBuiltin: false,
      })),
    ];
    return json(res, 200, { modes });
  }
  if (p === "/api/modes" && method === "POST") {
    const slug = String(body.slug || `mode-${Date.now().toString(36)}`).replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const row = await db.modeTemplate.upsert({
      where: { slug },
      create: {
        slug,
        name: String(body.name || slug),
        icon: String(body.icon || "Sparkles"),
        color: String(body.color || "#b4532a"),
        directive: String(body.directive || ""),
        framework: String(body.framework || "react-vite"),
        skills: JSON.stringify(body.skills || []),
        tools: JSON.stringify(body.tools || []),
        mcps: JSON.stringify(body.mcps || []),
        startingFiles: JSON.stringify(body.startingFiles || []),
        samplePrompts: JSON.stringify(body.samplePrompts || []),
        swarmAllowed: body.swarmAllowed === undefined ? true : !!body.swarmAllowed,
      },
      update: {},
    });
    return json(res, 200, { slug: `custom:${row.slug}` });
  }
  m = p.match(/^\/api\/modes\/(.+)$/);
  if (m) {
    const slug = decodeURIComponent(m[1]).replace(/^custom:/, "");
    if (method === "PUT") {
      const data: Record<string, unknown> = {};
      for (const k of ["name", "icon", "color", "directive", "framework", "swarmAllowed"]) if (body[k] !== undefined) data[k] = body[k];
      for (const k of ["skills", "tools", "mcps", "startingFiles", "samplePrompts"]) if (body[k] !== undefined) data[k] = JSON.stringify(body[k]);
      await db.modeTemplate.update({ where: { slug }, data });
      return json(res, 200, { ok: true });
    }
    if (method === "DELETE") {
      await db.modeTemplate.delete({ where: { slug } }).catch(() => undefined);
      res.writeHead(204);
      res.end();
      return;
    }
  }

  // ---------- skills / mcp / plugins / design systems / agents / settings / providers / models / usage ----------
  if (p === "/api/skills" && method === "GET") {
    const projectId = url.searchParams.get("projectId") || undefined;
    return json(res, 200, await mgr.listSkills(projectId));
  }
  if (p === "/api/skills/install" && method === "POST") {
    return json(res, 200, await mgr.installSkill(body as never));
  }
  m = p.match(/^\/api\/skills\/([^/]+)$/);
  if (m) {
    const slug = decodeURIComponent(m[1]);
    if (method === "PUT") {
      await mgr.toggleSkill(slug, !!body.enabled);
      return json(res, 200, { ok: true });
    }
    if (method === "DELETE") {
      await mgr.deleteSkill(slug);
      res.writeHead(204);
      res.end();
      return;
    }
  }

  if (p === "/api/mcp" && method === "GET") return json(res, 200, { servers: await mgr.listMcp() });
  if (p === "/api/mcp" && method === "POST") {
    await mgr.upsertMcp(body as never);
    return json(res, 200, { servers: await mgr.listMcp() });
  }
  m = p.match(/^\/api\/mcp\/([^/]+)\/test$/);
  if (m && method === "POST") return json(res, 200, await mgr.testMcp(decodeURIComponent(m[1])));
  m = p.match(/^\/api\/mcp\/([^/]+)$/);
  if (m && method === "DELETE") {
    await mgr.deleteMcp(decodeURIComponent(m[1]));
    res.writeHead(204);
    res.end();
    return;
  }

  if (p === "/api/plugins" && method === "GET") return json(res, 200, { plugins: await mgr.listPlugins() });
  m = p.match(/^\/api\/plugins\/([^/]+)$/);
  if (m && method === "PUT") {
    await mgr.togglePlugin(decodeURIComponent(m[1]), !!body.enabled);
    return json(res, 200, { ok: true });
  }

  if (p === "/api/design-systems" && method === "GET") return json(res, 200, { systems: await mgr.listDesignSystems() });
  m = p.match(/^\/api\/design-systems\/([^/]+)\/files$/);
  if (m && method === "GET") {
    const slug = decodeURIComponent(m[1]);
    return json(res, 200, await import("./managers").then((x) => x.designSystemFiles(slug)));
  }

  if (p === "/api/agents" && method === "GET") return json(res, 200, { agents: await mgr.listAgentProfiles() });
  if (p === "/api/agents" && method === "POST") return json(res, 200, { agents: await mgr.upsertAgentProfile(body) });
  m = p.match(/^\/api\/agents\/([^/]+)$/);
  if (m && method === "DELETE") {
    await mgr.deleteAgentProfile(decodeURIComponent(m[1]));
    res.writeHead(204);
    res.end();
    return;
  }

  if (p === "/api/settings" && method === "GET") return json(res, 200, await mgr.getSettings());
  if (p === "/api/settings" && method === "PUT") {
    await mgr.putSettings(body);
    // re-generate provider config in case defaultModel changed
    await writeProviderConfig().catch(() => undefined);
    return json(res, 200, await mgr.getSettings());
  }

  if (p === "/api/providers" && method === "GET") return json(res, 200, { providers: await mgr.listProviders() });
  if (p === "/api/providers" && method === "POST") return json(res, 200, { providers: await mgr.upsertProvider(body as never) });
  m = p.match(/^\/api\/providers\/([^/]+)\/test$/);
  if (m && method === "POST") return json(res, 200, await mgr.testProvider(decodeURIComponent(m[1])));
  m = p.match(/^\/api\/providers\/([^/]+)$/);
  if (m && method === "DELETE") {
    await mgr.deleteProvider(decodeURIComponent(m[1]));
    res.writeHead(204);
    res.end();
    return;
  }

  if (p === "/api/models" && method === "GET") return json(res, 200, { models: await mgr.listModels() });
  if (p === "/api/usage" && method === "GET") return json(res, 200, await mgr.usageStats());

  // ---------- preview (static + devserver proxy) ----------
  m = p.match(/^\/preview\/([^/]+)(\/.*)?$/);
  if (m && (method === "GET" || method === "POST")) {
    await servePreview(m[1], m[2] || "/", req, res);
    return;
  }

  json(res, 404, { error: `no route: ${method} ${p}` });
}

// ---------------- preview serving ----------------
const INDEX_CANDIDATES = ["", "index.html", "design/index.html", "dist/index.html", "build/index.html", "public/index.html", "out/index.html", "slides/index.html"];

async function servePreview(projectId: string, rel: string, req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const dev = devServerInfo(projectId);
  const row = await db.project.findUnique({ where: { id: projectId } });
  const isE2B = isE2BActive(projectId);

  // e2b → workspace was synced; serve static (live dev server URLs are used directly by the UI)

  // local dev server proxy.
  // vite runs with --base /preview/<id>/ → forward the FULL path so vite's base stripping works.
  // flask doesn't know the prefix → strip it and inject <base href>.
  if (dev.status === "ready" && dev.port) {
    const stripPrefix = row?.framework === "flask";
    const forwardPath = stripPrefix ? rel : `/preview/${projectId}${rel}`;
    const target = `http://127.0.0.1:${dev.port}${forwardPath}${url_suffix(req)}`;
    try {
      const headers: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string" && !["host", "connection"].includes(k)) headers[k] = v;
      const proxyReq = fetch(target, {
        method: req.method,
        headers,
        body: req.method === "GET" || req.method === "HEAD" ? undefined : new Uint8Array(await readRaw(req)),
        redirect: "manual",
      });
      const proxyRes = await proxyReq;
      const respHeaders: Record<string, string> = { "Access-Control-Allow-Origin": "*", "Content-Security-Policy": "frame-ancestors *" };
      proxyRes.headers.forEach((v, k) => {
        if (!["content-encoding", "transfer-encoding", "connection", "content-length"].includes(k)) respHeaders[k] = v;
      });
      res.writeHead(proxyRes.status, respHeaders);
      const buf = Buffer.from(await proxyRes.arrayBuffer());
      // flask-ish servers: inject <base> when html and no base handled
      const ct = respHeaders["content-type"] || "";
      if (ct.includes("text/html") && row?.framework === "flask" && rel !== "/") {
        let html = buf.toString("utf8");
        if (!html.includes("<base ")) html = html.replace(/<head([^>]*)>/i, `<head$1><base href="/preview/${projectId}/">`);
        res.end(html);
        return;
      }
      res.end(buf);
      return;
    } catch {
      /* fall through to static */
    }
  }

  // static from workspace
  const dir = projectWorkspaceDir(projectId);
  const relClean = rel.replace(/^\//, "").split("?")[0];
  const isIndexRequest = !relClean || relClean === "index.html";
  if (isIndexRequest) {
    for (const cand of INDEX_CANDIDATES) {
      if (!cand) continue;
      const full = path.join(dir, cand);
      if (fs.existsSync(full) && fs.statSync(full).isFile()) {
        streamFile(res, full, "text/html");
        return;
      }
    }
  }
  const full = path.join(dir, relClean);
  if (fs.existsSync(full) && fs.statSync(full).isFile()) {
    streamFile(res, full, mimeFor(relClean));
    return;
  }
  // SPA fallback to any index.html
  for (const cand of INDEX_CANDIDATES) {
    const fp = path.join(dir, cand);
    if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
      streamFile(res, fp, "text/html");
      return;
    }
  }
  res.writeHead(200, { "Content-Type": "text/html", "Content-Security-Policy": "frame-ancestors *" });
  res.end(`<!doctype html><html><head><meta charset="utf-8"><title>Preview</title></head><body style="font-family:system-ui;padding:48px;background:#f4f1eb;color:#1c1917"><h2>No preview yet</h2><p>Ask the agent to build something, or start the dev server.</p></body></html>`);
}

function url_suffix(req: http.IncomingMessage): string {
  const u = req.url || "";
  const qi = u.indexOf("?");
  return qi >= 0 ? u.slice(qi) : "";
}

async function readRaw(req: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c as Buffer));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

function mimeFor(rel: string): string {
  const ext = path.extname(rel).toLowerCase();
  const map: Record<string, string> = {
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".csv": "text/csv",
    ".md": "text/markdown",
    ".txt": "text/plain",
    ".wasm": "application/wasm",
    ".ico": "image/x-icon",
  };
  return map[ext] || "application/octet-stream";
}

// ---------------- DTO ----------------
function projectDto(row: {
  id: string;
  title: string;
  mode: string;
  framework: string;
  modeConfig: string;
  status: string;
  sandboxId: string | null;
  sandboxStatus: string;
  sandboxRuntime: string;
  agentMode: string;
  swarmEnabled: boolean;
  instructions: string | null;
  githubRepo: string | null;
  githubBranch: string | null;
  hue: number;
  coreSessionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  let modeConfig: Record<string, unknown> = {};
  try {
    modeConfig = JSON.parse(row.modeConfig || "{}");
  } catch {
    /* noop */
  }
  return {
    ...row,
    modeConfig,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function safeArr(s: string | null | undefined): unknown[] {
  try {
    const v = JSON.parse(s || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// ---------------- boot ----------------
async function main() {
  await writeProviderConfig().catch(() => undefined);
  // warm the runtime in background (boot core + bridge check)
  setTimeout(() => {
    getRuntime()
      .health()
      .then((h) => console.log(`[agent-service] runtime warm: core=${h.core} bridge=${h.bridge}`))
      .catch(() => undefined);
  }, 800);
  httpServer.listen(SERVICE_PORT, () => {
    console.log(`[agent-service] listening on :${SERVICE_PORT}`);
  });
}

void main();
