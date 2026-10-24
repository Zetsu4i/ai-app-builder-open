// agent-service — ZCode core runtime.
// Connections: ONE shared local stdio app-server (all local projects) + per-project
// E2B HTTP-relay connections when the project runs in a cloud sandbox.
// Protocol: NDJSON per docs/02-zcode-protocol.md. Answers interaction/* requests.
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { db } from "./db";
import {
  BRIDGE_URL,
  CORE_BUILTIN_CONFIG,
  CORE_CJS,
  NODE_BIN,
  RUNTIME_DIR,
  ensureSeedPlugins,
  projectWorkspaceDir,
} from "./config";
import type { Json } from "./runtime-types";

export type { Json };

// ---------------- protocol connections ----------------

export interface CoreClientEvents {
  onNotification?: (method: string, params: Json) => void;
  onServerRequest?: (id: string, method: string, params: Json) => void;
  onExit?: (code: number | null) => void;
  onError?: (err: Error) => void;
}

interface CoreConnection {
  readonly kind: "local" | "e2b";
  request(method: string, params: Json, timeoutMs?: number): Promise<Json>;
  notify(method: string, params: Json): void;
  respond(id: string, result: Json | { error: Json }): void;
  close(): void;
}

const DEFAULT_PREFS = {
  nativeSearchEnhancementsEnabled: true,
  memoryEnabled: false,
  askUserQuestionAutoResolutionEnabled: true,
  modelContextBudgetStrategy: "preflight-v1",
};

class LocalConnection implements CoreConnection {
  readonly kind = "local" as const;
  private proc: ChildProcess;
  private pending = new Map<string, { resolve: (v: Json) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>();
  private buffer = "";
  private nextId = 1;

  constructor(args: string[], cwd: string, env: NodeJS.ProcessEnv, handlers: CoreClientEvents) {
    this.proc = spawn(NODE_BIN, args, { cwd, env });
    this.proc.stdout!.setEncoding("utf8");
    this.proc.stdout!.on("data", (chunk: string) => this.onData(chunk));
    this.proc.stderr!.on("data", (d: Buffer) => {
      const line = d.toString().trim();
      if (line) console.error(`[zcode] ${line.slice(0, 400)}`);
    });
    this.proc.on("exit", (code) => {
      for (const [, p] of this.pending) {
        clearTimeout(p.timer);
        p.reject(new Error("core exited"));
      }
      this.pending.clear();
      handlers.onExit?.(code);
    });
    this.proc.on("error", (err) => handlers.onError?.(err));
  }

  private onData(chunk: string) {
    this.buffer += chunk;
    let idx: number;
    while ((idx = this.buffer.indexOf("\n")) >= 0) {
      const line = this.buffer.slice(0, idx).trim();
      this.buffer = this.buffer.slice(idx + 1);
      if (!line) continue;
      let msg: Json;
      try {
        msg = JSON.parse(line) as Json;
      } catch {
        continue;
      }
      this.dispatch(msg);
    }
  }

  private dispatch(msg: Json) {
    if (typeof msg.id === "string" && this.pending.has(msg.id as string)) {
      const p = this.pending.get(msg.id as string)!;
      this.pending.delete(msg.id as string);
      clearTimeout(p.timer);
      if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
      else p.resolve((msg.result ?? {}) as Json);
      return;
    }
    if (typeof msg.method === "string") {
      if (typeof msg.id === "string" && (msg.id as string).startsWith("server-")) {
        this.serverRequestHandler?.(msg.id as string, msg.method, (msg.params ?? {}) as Json);
      } else {
        this.notificationHandler?.(msg.method, (msg.params ?? {}) as Json);
      }
    }
  }

  // handlers get attached post-construction by the runtime
  serverRequestHandler?: (id: string, method: string, params: Json) => void;
  notificationHandler?: (method: string, params: Json) => void;

  request(method: string, params: Json, timeoutMs = 120000): Promise<Json> {
    const id = `req-${this.nextId++}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`timeout: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.write({ id, method, params });
    });
  }

  notify(method: string, params: Json) {
    this.write({ method, params });
  }

  respond(id: string, result: Json | { error: Json }) {
    if ("error" in result) this.write({ id, error: (result as { error: Json }).error });
    else this.write({ id, result });
  }

  private write(obj: Json) {
    try {
      this.proc.stdin!.write(JSON.stringify(obj) + "\n");
    } catch {
      /* noop */
    }
  }

  close() {
    try {
      this.proc.stdin!.end();
    } catch {
      /* noop */
    }
    setTimeout(() => {
      try {
        this.proc.kill("SIGTERM");
      } catch {
        /* noop */
      }
    }, 250);
  }
}

/** E2B relay connection — talks HTTP to relay.mjs inside the sandbox. */
class E2BConnection implements CoreConnection {
  readonly kind = "e2b" as const;
  private baseUrl: string;
  private nextId = 1;
  private stopped = false;
  private responseWaiters = new Map<string, { resolve: (v: Json) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>();

  constructor(
    baseUrl: string,
    private handlers: { notification(method: string, params: Json): void; serverRequest(id: string, method: string, params: Json): void; exit(): void },
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    void this.pollLoop(0);
  }

  private async pollLoop(cursor: number) {
    while (!this.stopped) {
      try {
        const res = await fetch(`${this.baseUrl}/poll?cursor=${cursor}&timeout=25000`, { signal: AbortSignal.timeout(40000) });
        if (!res.ok) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        const data = (await res.json()) as { cursor: number; lines: Json[] };
        cursor = data.cursor ?? cursor;
        for (const line of data.lines || []) {
          if ((line as { __exit?: boolean }).__exit) {
            this.handlers.exit();
            return;
          }
          this.dispatch(line);
        }
      } catch {
        if (!this.stopped) await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  private dispatch(msg: Json) {
    if (typeof msg.id === "string" && this.responseWaiters.has(msg.id as string)) {
      const p = this.responseWaiters.get(msg.id as string)!;
      this.responseWaiters.delete(msg.id as string);
      clearTimeout(p.timer);
      if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
      else p.resolve((msg.result ?? {}) as Json);
      return;
    }
    if (typeof msg.method === "string") {
      if (typeof msg.id === "string" && (msg.id as string).startsWith("server-")) {
        this.handlers.serverRequest(msg.id as string, msg.method, (msg.params ?? {}) as Json);
      } else {
        this.handlers.notification(msg.method, (msg.params ?? {}) as Json);
      }
    }
  }

  async request(method: string, params: Json, timeoutMs = 180000): Promise<Json> {
    const id = `req-${this.nextId++}`;
    const waiter = new Promise<Json>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.responseWaiters.delete(id);
        reject(new Error(`timeout: ${method}`));
      }, timeoutMs);
      this.responseWaiters.set(id, { resolve, reject, timer });
    });
    await fetch(`${this.baseUrl}/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, method, params }),
      signal: AbortSignal.timeout(20000),
    });
    return waiter;
  }

  notify(method: string, params: Json) {
    void fetch(`${this.baseUrl}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, params }),
    }).catch(() => undefined);
  }

  respond(id: string, result: Json | { error: Json }) {
    void fetch(`${this.baseUrl}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, result: "error" in result ? undefined : result, error: "error" in result ? (result as { error: Json }).error : undefined }),
    }).catch(() => undefined);
  }

  close() {
    this.stopped = true;
    void fetch(`${this.baseUrl}/shutdown`, { method: "POST" }).catch(() => undefined);
  }
}

// ---------------- provider config generation (BYOK) ----------------

export async function writeProviderConfig(runtimeDir = RUNTIME_DIR): Promise<string> {
  ensureSeedPlugins();
  fs.mkdirSync(runtimeDir, { recursive: true });
  const [providers, settings] = await Promise.all([
    db.providerConfig.findMany({ where: { enabled: true } }),
    db.setting.findUnique({ where: { key: "defaultModel" } }),
  ]);

  const providerOrder: string[] = ["zai-bridge"];
  const providerRules: Json[] = [
    {
      providerId: "zai-bridge",
      providerName: "Z.ai built-in (free)",
      enabled: true,
      config: {
        group: "standard-personal",
        access: { type: "api-key", apiKey: "builtin" },
        api: { type: "openai-chat-completions", baseUrl: `${BRIDGE_URL}` },
        personalModelIds: ["zai-glm"],
        modelOrder: ["zai-glm"],
      },
    },
  ];
  const modelRules: Json[] = [
    {
      providerId: "zai-bridge",
      modelId: "zai-glm",
      config: {
        enabled: true,
        properties: {
          contextWindow: 200000,
          inputFormat: { supportsText: true, supportsImage: false, supportsVideo: false, supportsAudio: false, supportsPdf: false },
          outputFormat: { supportsText: true },
          supportsToolCall: true,
          supportsJsonSchemaOutput: false,
          supportsNativeWebSearch: false,
          supportsMidConversationSystem: true,
          requiresMfjsToolSchema: false,
        },
        optionSpecs: {
          maxOutputTokens: { max: 32000 },
          reasoningLevel: { values: ["disabled", "enabled"], map: "{}" },
        },
      },
    },
  ];

  interface ModelEntry {
    modelId: string;
    contextWindow?: number;
    supportsImages?: boolean;
    maxOutputTokens?: number;
  }
  for (const p of providers) {
    if (p.providerId === "zai-bridge") continue;
    let models: ModelEntry[] = [];
    try {
      models = JSON.parse(p.models || "[]") as ModelEntry[];
    } catch {
      models = [];
    }
    if (!models.length) continue;
    providerOrder.push(p.providerId);
    providerRules.push({
      providerId: p.providerId,
      providerName: p.providerName || p.providerId,
      enabled: true,
      config: {
        group: "standard-personal",
        access: { type: "api-key", apiKey: p.apiKey || "" },
        api: { type: p.apiType || "openai-chat-completions", baseUrl: p.baseUrl || "" },
        personalModelIds: models.map((m) => m.modelId),
        modelOrder: models.map((m) => m.modelId),
      },
    });
    for (const m of models) {
      modelRules.push({
        providerId: p.providerId,
        modelId: m.modelId,
        config: {
          enabled: true,
          properties: {
            contextWindow: m.contextWindow || 128000,
            inputFormat: { supportsText: true, supportsImage: !!m.supportsImages, supportsVideo: false, supportsAudio: false, supportsPdf: false },
            outputFormat: { supportsText: true },
            supportsToolCall: true,
            supportsJsonSchemaOutput: false,
            supportsNativeWebSearch: false,
            supportsMidConversationSystem: false,
            requiresMfjsToolSchema: false,
          },
          optionSpecs: {
            maxOutputTokens: { max: m.maxOutputTokens || 16000 },
            reasoningLevel: { values: ["disabled", "enabled"], map: "{}" },
          },
        },
      });
    }
  }

  let defaultSelection: Json = { providerId: "zai-bridge", modelId: "zai-glm", options: { reasoningLevel: "enabled" } };
  if (settings?.value) {
    try {
      const v = JSON.parse(settings.value) as { defaultModel?: string };
      if (v.defaultModel && v.defaultModel.includes("::")) {
        const [providerId, modelId] = v.defaultModel.split("::");
        if (providerId && providerId !== "zai-bridge" && modelId) defaultSelection = { providerId, modelId, options: { reasoningLevel: "enabled" } };
      }
    } catch {
      /* keep builtin default */
    }
  }

  const config = {
    schemaVersion: 1,
    config: {
      providerOrder,
      providerConfigRules: { providerRules },
      modelConfigRules: { providerModelRules: modelRules, manualProviderModelRules: [] },
      defaultModelSelection: defaultSelection,
    },
  };
  const file = path.join(runtimeDir, "provider_config.json");
  fs.writeFileSync(file, JSON.stringify(config, null, 2));
  return file;
}

export function modelSelection(model?: string): Json {
  let providerId = "zai-bridge";
  let modelId = "zai-glm";
  if (model && model.includes("::")) {
    const [p, m] = model.split("::");
    if (p && m) {
      providerId = p;
      modelId = m;
    }
  }
  return { providerId, modelId, options: { reasoningLevel: "enabled" } };
}

// ---------------- ZCode runtime ----------------

type PendingInteraction = {
  resolve: (v: Json) => void;
  timer: ReturnType<typeof setTimeout>;
  kind: "permission" | "question";
  projectId?: string;
};

export interface RuntimeDeps {
  io: { to(room: string): { emit(ev: string, payload: unknown): void } };
  emitEvent: (projectId: string, kind: string, payload: Json) => Promise<void>;
  modePolicyFor: (projectId: string) => "yolo" | "auto" | "ask";
}

export class ZCodeRuntime {
  private conns = new Map<string, CoreConnection>();
  private bootPromise: Promise<CoreConnection> | null = null;
  private runtimePreferencesAnswered = new Set<string>();
  private pendingInteractions = new Map<string, { pending: PendingInteraction; conn: CoreConnection }>();
  private sessionIdByProject = new Map<string, string>();
  private projectIdBySession = new Map<string, string>();
  private deps: RuntimeDeps;

  constructor(deps: RuntimeDeps) {
    this.deps = deps;
  }

  // ---- connections ----

  private async ensureConn(projectId?: string): Promise<CoreConnection> {
    if (projectId && projectId !== "__local__" && sandboxBridge && sandboxBridge.isE2B(projectId)) {
      const existing = this.conns.get(projectId);
      if (existing) return existing;
      const url = await sandboxBridge.getRelayUrl(projectId);
      if (url) {
        const conn = new E2BConnection(url, {
          notification: (m, p) => this.handleNotification(m, p),
          serverRequest: (id, m, p) => void this.handleServerRequest(conn, id, m, p),
          exit: () => this.conns.delete(projectId),
        });
        this.conns.set(projectId, conn);
        return conn;
      }
    }
    if (!this.conns.has("__local__")) {
      if (!this.bootPromise) this.bootPromise = this.bootLocal();
      const conn = await this.bootPromise;
      this.conns.set("__local__", conn);
      this.bootPromise = null;
    }
    return this.conns.get("__local__")!;
  }

  private async bootLocal(): Promise<CoreConnection> {
    ensureSeedPlugins();
    const personalConfig = await writeProviderConfig();
    const conn = new LocalConnection(
      [CORE_CJS, "app-server", "--stdio"],
      RUNTIME_DIR,
      {
        ...process.env,
        ZCODE_BUILTIN_PROVIDER_CONFIG_FILE: CORE_BUILTIN_CONFIG,
        ZCODE_PERSONAL_PROVIDER_CONFIG_FILE: personalConfig,
        ZCODE_DATA_BASE_DIR: path.join(RUNTIME_DIR, "zcode-data"),
      },
      {
        onExit: () => {
          this.conns.delete("__local__");
        },
        onError: () => undefined,
      },
    );
    conn.serverRequestHandler = (id, method, params) => void this.handleServerRequest(conn, id, method, params);
    // wait ready
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 20000);
      conn.notificationHandler = (method, params) => {
        if (method === "startup/storageState" && (params as { phase?: string }).phase === "ready") {
          clearTimeout(timer);
          conn.notificationHandler = (m, p) => this.handleNotification(m, p);
          resolve();
        } else this.handleNotification(method, params);
      };
    });
    return conn;
  }

  // ---- core event routing ----

  private handleNotification(method: string, params: Json) {
    if (process.env.ZCODE_DEBUG_EVENTS) {
      console.log(`[evt] ${method} ${JSON.stringify(params).slice(0, 240)}`);
    }
    if (method === "session/event") {
      const p = params as { sessionId?: string; type?: string; payload?: Json };
      if (p.sessionId) {
        void import("./turns").then(({ routeSessionEvent }) =>
          routeSessionEvent(p.sessionId as string, p.type || "session/event", p.payload || {}, this),
        );
      }
      return;
    }
    if (method === "state.updated") {
      void import("./turns").then(async ({ emitProjectEvent }) => {
        const p = params as { workspaceKey?: string; contextUsed?: number; contextWindow?: number; totalTokenCount?: number };
        const projectId = p.workspaceKey ? this.projectIdByWorkspace.get(p.workspaceKey) : undefined;
        if (projectId && !projectId.startsWith("swarm:")) {
          await emitProjectEvent(projectId, "usage", {
            contextUsed: p.contextUsed ?? 0,
            contextWindow: p.contextWindow ?? 200000,
            totalTokens: p.totalTokenCount ?? 0,
          });
        }
      });
    }
  }

  private projectIdByWorkspace = new Map<string, string>();

  private async handleServerRequest(conn: CoreConnection, id: string, method: string, params: Json) {
    if (method === "session/requestRuntimePreferences") {
      const sessionId = (params as { sessionId?: string }).sessionId || "";
      this.runtimePreferencesAnswered.add(sessionId);
      conn.respond(id, DEFAULT_PREFS as unknown as Json);
      return;
    }
    if (method === "interaction/requestPermission") {
      await this.handlePermission(conn, id, params);
      return;
    }
    if (method === "interaction/requestUserInput") {
      await this.handleUserInput(conn, id, params);
      return;
    }
    if (method === "interaction/requestProviderRuntimeHeaders" || method === "interaction/requestOfficialMcpAuthHeaders") {
      conn.respond(id, {} as Json);
      return;
    }
    if (method === "interaction/browserList" || method === "interaction/browserExecute") {
      conn.respond(id, {} as Json);
      return;
    }
    conn.respond(id, {} as Json);
  }

  private async handlePermission(conn: CoreConnection, id: string, params: Json) {
    const p = params as { sessionId?: string; toolName?: string; riskLevel?: string; input?: Json; reason?: string };
    const projectId = await this.projectIdForSession((p.sessionId as string) || "");
    const policy = projectId ? this.deps.modePolicyFor(projectId) : "ask";
    const readOnlyTools = new Set(["Read", "Glob", "Grep", "TodoRead", "TodoWrite", "WebSearch", "WebFetch", "Skill", "EnterPlanMode", "ExitPlanMode"]);
    let decision: "allow" | "deny" | "ask";
    if (policy === "yolo") decision = "allow";
    else if (policy === "auto") decision = p.riskLevel === "high" || p.riskLevel === "critical" ? "ask" : "allow";
    else decision = readOnlyTools.has(p.toolName || "") ? "allow" : "ask";

    if (decision === "allow") {
      conn.respond(id, { decision: "allow", reason: "policy" });
      return;
    }

    if (!projectId || projectId.startsWith("swarm:")) {
      // no UI room: auto-allow low-risk in swarm, deny otherwise
      conn.respond(id, { decision: p.riskLevel === "low" ? "allow" : "deny", reason: "no interactive approver" });
      return;
    }

    const requestId = id;
    const promise = new Promise<Json>((resolve) => {
      const timer = setTimeout(() => {
        this.pendingInteractions.delete(requestId);
        resolve({ decision: "deny", reason: "approval timeout (120s)" });
      }, 120000);
      this.pendingInteractions.set(requestId, { pending: { resolve, timer, kind: "permission", projectId }, conn });
    });
    this.deps.io.to(`project:${projectId}`).emit("permission:request", {
      requestId,
      projectId,
      toolName: p.toolName,
      input: p.input,
      riskLevel: p.riskLevel,
      reason: p.reason,
    });
    await this.deps.emitEvent(projectId, "approval", { requestId, toolName: p.toolName, riskLevel: p.riskLevel, input: p.input, state: "pending" });
    const result = await promise;
    const answer: Json = { decision: (result.decision as string) || "deny", reason: (result.reason as string) || "user" };
    if (result.modifiedInput) answer.modifiedInput = result.modifiedInput;
    conn.respond(id, answer); // NOTE: no optionId — core 0.16.9 rejects it
    await this.deps.emitEvent(projectId, "approval", { requestId, toolName: p.toolName, state: answer.decision });
  }

  private async handleUserInput(conn: CoreConnection, id: string, params: Json) {
    const p = params as { sessionId?: string; prompt?: string; questions?: { id?: string; question?: string; options?: { value?: string }[] }[] };
    const projectId = await this.projectIdForSession((p.sessionId as string) || "");
    const defaultContent = (): Record<string, string> => {
      const content: Record<string, string> = {};
      for (const q of p.questions || []) if (q.id) content[q.id] = q.options?.[0]?.value || "";
      return content;
    };
    if (!projectId || projectId.startsWith("swarm:")) {
      conn.respond(id, { action: "accept", content: defaultContent(), reason: "auto-resolved" });
      return;
    }
    const requestId = id;
    const promise = new Promise<Json>((resolve) => {
      const timer = setTimeout(() => {
        this.pendingInteractions.delete(requestId);
        resolve({ action: "accept", content: defaultContent(), reason: "timeout default" });
      }, 300000);
      this.pendingInteractions.set(requestId, { pending: { resolve, timer, kind: "question", projectId }, conn });
    });
    this.deps.io.to(`project:${projectId}`).emit("question:request", {
      requestId,
      projectId,
      prompt: p.prompt,
      questions: p.questions || [],
    });
    await this.deps.emitEvent(projectId, "question", { requestId, prompt: p.prompt, questions: p.questions || [], state: "pending" });
    const result = await promise;
    conn.respond(id, result);
    await this.deps.emitEvent(projectId, "question", { requestId, state: "resolved" });
  }

  resolveInteraction(requestId: string, result: Json): boolean {
    const entry = this.pendingInteractions.get(requestId);
    if (!entry) return false;
    clearTimeout(entry.pending.timer);
    this.pendingInteractions.delete(requestId);
    entry.pending.resolve(result);
    return true;
  }

  /** Unresolved interaction waiting on the user for this project (survives reloads via /hydrate). */
  pendingForProject(projectId: string): { requestId: string; kind: "permission" | "question" } | null {
    for (const [requestId, entry] of this.pendingInteractions) {
      if (entry.pending.projectId === projectId) return { requestId, kind: entry.pending.kind };
    }
    return null;
  }

  /** Drop the in-memory session mapping (used when creating/switching chat sessions). */
  resetSession(projectId: string): void {
    const sid = this.sessionIdByProject.get(projectId);
    if (sid) {
      this.sessionIdByProject.delete(projectId);
      this.projectIdBySession.delete(sid);
    }
    this.mcpsByProject.delete(projectId);
  }

  // ---- session registry ----

  registerSession(projectId: string, sessionId: string, workspacePath?: string) {
    this.sessionIdByProject.set(projectId, sessionId);
    this.projectIdBySession.set(sessionId, projectId);
    if (workspacePath) this.projectIdByWorkspace.set(workspacePath, projectId);
  }

  getSessionId(projectId: string): string | undefined {
    return this.sessionIdByProject.get(projectId);
  }

  async projectIdForSession(sessionId: string): Promise<string | null> {
    const known = this.projectIdBySession.get(sessionId);
    if (known) return known;
    const proj = await db.project.findFirst({ where: { coreSessionId: sessionId }, select: { id: true } });
    if (proj) {
      this.projectIdBySession.set(sessionId, proj.id);
      return proj.id;
    }
    return null;
  }

  // ---- public ops ----

  async createSession(opts: {
    projectId: string;
    workspacePath: string;
    mode?: string;
    model?: string;
    toolDenylist?: string[];
    mcpServers?: Json[];
    resumeSessionId?: string | null;
  }): Promise<string> {
    const conn = await this.ensureConn(opts.projectId);
    const selection = modelSelection(opts.model);

    if (opts.resumeSessionId) {
      try {
        const res = await conn.request("session/resume", {
          sessionId: opts.resumeSessionId,
          workspace: { workspacePath: opts.workspacePath, workspaceKey: opts.workspacePath },
        });
        const sessionId = (res.session as { sessionId?: string })?.sessionId || opts.resumeSessionId;
        this.registerSession(opts.projectId, sessionId, opts.workspacePath);
        await conn.request("session/subscribe", { sessionId, deliveryKind: "desktop-continuous", includeSnapshot: true });
        return sessionId;
      } catch {
        /* fall through to create */
      }
    }

    const params: Json = {
      workspace: { workspacePath: opts.workspacePath, workspaceKey: opts.workspacePath },
      mode: opts.mode,
      persistence: "immediate",
    };
    if (selection) params.model = selection;
    if (opts.mcpServers?.length) params.mcpServers = opts.mcpServers;
    if (opts.toolDenylist?.length) params.toolDenylist = opts.toolDenylist;
    if (process.env.ZCODE_DEBUG_EVENTS) console.log(`[create] params:`, JSON.stringify(params).slice(0, 400));
    const res = await conn.request("session/create", params);
    if (process.env.ZCODE_DEBUG_EVENTS) console.log(`[create] result model:`, JSON.stringify((res.session as { model?: unknown })?.model).slice(0, 300), `settings.current:`, JSON.stringify((res.settings as { model?: { current?: unknown } })?.model?.current).slice(0, 300));
    this.modelByProject.set(opts.projectId, opts.model || "zai-bridge::zai-glm");
    const sessionId = (res.session as { sessionId?: string })?.sessionId as string;
    this.registerSession(opts.projectId, sessionId, opts.workspacePath);
    await conn.request("session/subscribe", { sessionId, deliveryKind: "desktop-continuous", includeSnapshot: true });
    return sessionId;
  }

  async ensureForProject(projectId: string, workspacePath: string, model?: string, mcpServers?: Json[]): Promise<string> {
    const existing = this.getSessionId(projectId);
    // track which MCP servers the current session was created with — if the
    // requested set changed (e.g. a new builtin MCP was seeded), recreate the
    // session so the tools are actually available to the agent
    const wanted = (mcpServers ?? []).map((m) => String((m as { name?: string }).name ?? "")).filter(Boolean).sort().join(",");
    const bound = this.mcpsByProject.get(projectId) ?? "";
    if (existing) {
      if (wanted && wanted !== bound) {
        this.resetSession(projectId);
      } else {
        return existing;
      }
    }
    const proj = await db.project.findUnique({ where: { id: projectId } });
    // a session that predates the requested MCP set can't gain the tools by
    // resuming — start a FRESH session (our UI history is DB-backed anyway)
    const forceFresh = !!wanted && wanted !== bound;
    const sessionId = await this.createSession({
      projectId,
      workspacePath,
      mode: proj?.agentMode && proj.agentMode !== "build" ? proj.agentMode : undefined,
      model,
      mcpServers,
      resumeSessionId: forceFresh ? null : proj?.coreSessionId || null,
    });
    this.mcpsByProject.set(projectId, wanted);
    await db.project.update({ where: { id: projectId }, data: { coreSessionId: sessionId } });
    return sessionId;
  }

  private modelByProject = new Map<string, string>();
  private mcpsByProject = new Map<string, string>();

  async send(projectId: string, content: string): Promise<boolean> {
    const conn = await this.ensureConn(projectId);
    const sessionId = this.getSessionId(projectId);
    if (!sessionId) return false;
    // modelSelection MUST ride on every send — the stored session.model drops options,
    // and turn-time resolution requires reasoningLevel ("Reasoning level is required").
    await conn.request("session/send", {
      sessionId,
      content,
      modelSelection: modelSelection(this.modelByProject.get(projectId)),
    });
    return true;
  }

  async stop(projectId: string): Promise<boolean> {
    try {
      const conn = await this.ensureConn(projectId);
      const sessionId = this.getSessionId(projectId);
      if (!sessionId) return false;
      await conn.request("session/stop", { sessionId });
      return true;
    } catch {
      return false;
    }
  }

  async compact(projectId: string, instructions?: string): Promise<boolean> {
    try {
      const conn = await this.ensureConn(projectId);
      const sessionId = this.getSessionId(projectId);
      if (!sessionId) return false;
      await conn.request("session/compact", { sessionId, ...(instructions ? { instructions } : {}) });
      return true;
    } catch {
      return false;
    }
  }

  async usage(projectId: string): Promise<Json | null> {
    try {
      const conn = await this.ensureConn(projectId);
      const sessionId = this.getSessionId(projectId);
      if (!sessionId) return null;
      return conn.request("session/usage", { sessionId });
    } catch {
      return null;
    }
  }

  async generateText(prompt: string, maxOutputTokens = 1024): Promise<string> {
    try {
      const conn = await this.ensureConn();
      const res = await conn.request(
        "workspace/generateText",
        {
          workspace: { workspacePath: RUNTIME_DIR, workspaceKey: RUNTIME_DIR },
          selection: modelSelection(),
          prompt,
          querySource: "title",
          maxOutputTokens,
        },
        90000,
      );
      return (res.text as string) || "";
    } catch {
      const { bridgeText } = await import("./bridge");
      return bridgeText(prompt, undefined, maxOutputTokens);
    }
  }

  async health(): Promise<{ core: boolean; bridge: boolean }> {
    const { bridgeHealthy } = await import("./bridge");
    const bridge = bridgeHealthy();
    try {
      const conn = await this.ensureConn();
      await conn.request("runtime/capabilities", {}, 10000);
      return { core: true, bridge };
    } catch {
      return { core: false, bridge };
    }
  }

  /** write project workspace → for e2b active projects sync before turn */
  workspaceDir(projectId: string): string {
    return projectWorkspaceDir(projectId);
  }
}

// sandbox bridge (set by index.ts to avoid circular import)
export let sandboxBridge: { isE2B(projectId: string): boolean; getRelayUrl(projectId: string): Promise<string | null> } | null = null;
export function setSandboxBridge(b: { isE2B(projectId: string): boolean; getRelayUrl(projectId: string): Promise<string | null> }) {
  sandboxBridge = b;
}

let runtime: ZCodeRuntime | null = null;
export function initRuntime(deps: RuntimeDeps): ZCodeRuntime {
  // bun --hot re-runs module init on file change — reuse the live runtime so the
  // previous core process is not orphaned (each core is ~250MB resident).
  const g = globalThis as unknown as { __zcodeRuntimeSingleton?: ZCodeRuntime };
  if (g.__zcodeRuntimeSingleton) {
    runtime = g.__zcodeRuntimeSingleton;
    return runtime;
  }
  runtime = new ZCodeRuntime(deps);
  g.__zcodeRuntimeSingleton = runtime;
  return runtime;
}
export function getRuntime(): ZCodeRuntime {
  if (!runtime) throw new Error("runtime not initialized");
  return runtime;
}
