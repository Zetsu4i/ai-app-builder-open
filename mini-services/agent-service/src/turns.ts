// agent-service — turns: route core session events → socket.io rooms + persistence + message parts.
// Parts are kept in CHRONOLOGICAL order (the UI renders them in-place with a
// collapsible "steps" group for ordinary file/shell tools).
import { db } from "./db";
import type { ZCodeRuntime } from "./runtime";
import type { Json } from "./runtime-types";

interface LiveMessage {
  id: string;
  projectId: string;
  parts: Json[];
  toolCount: number;
  failedTools: number;
  startedAt: number;
  textChars: number;
}

const live = new Map<string, LiveMessage>(); // core session id -> live message
const nextSeq = new Map<string, number>();

export async function nextEventSeq(projectId: string): Promise<number> {
  // in-memory counter resets on service restart — floor it with the DB max
  // (AgentEvent has a unique (projectId, seq) constraint)
  const cur = (nextSeq.get(projectId) ?? 0) + 1;
  nextSeq.set(projectId, cur);
  return cur;
}

/** Re-seed the in-memory counter from the DB (called at boot / first use). */
export async function syncEventSeq(projectId: string): Promise<void> {
  try {
    const last = await db.agentEvent.findFirst({ where: { projectId }, orderBy: { seq: "desc" }, select: { seq: true } });
    if (last && (nextSeq.get(projectId) ?? 0) < last.seq) nextSeq.set(projectId, last.seq);
  } catch {
    /* noop */
  }
}

export function getLive(sessionId: string): LiveMessage | undefined {
  return live.get(sessionId);
}

/** Live turn state for a project — used by /hydrate so a reload re-attaches to a running turn. */
export function liveStateForProject(runtime: ZCodeRuntime, projectId: string): {
  active: boolean;
  liveId: string | null;
  parts: Json[];
  startedAt: number | null;
} {
  const coreSessionId = runtime.getSessionId(projectId);
  const lm = coreSessionId ? live.get(coreSessionId) : undefined;
  if (!lm) return { active: false, liveId: null, parts: [], startedAt: null };
  return { active: true, liveId: lm.id, parts: lm.parts, startedAt: lm.startedAt };
}

function textFromPayloadContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((c) => (typeof c === "string" ? c : (c as { text?: string })?.text ?? "")).join("");
  return "";
}

function ioFor() {
  return (globalThis as unknown as { __forgeIO?: { to(room: string): { emit(ev: string, payload: unknown): void } } }).__forgeIO;
}

/** The ACTIVE chat session row for a project (one active at a time). */
export async function activeChatSession(projectId: string) {
  return db.chatSession.findFirst({
    where: { projectId, isActive: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function routeSessionEvent(
  sessionId: string,
  type: string,
  payload: Json,
  runtime: ZCodeRuntime,
): Promise<void> {
  if (process.env.ZCODE_DEBUG_EVENTS) {
    console.log(`[route] type=${type} kind=${(payload as { kind?: string }).kind ?? "-"} sid=${sessionId.slice(-8)}`);
  }
  const projectId = await runtime.projectIdForSession(sessionId);
  if (!projectId) return;

  // swarm worker sessions: capture final reports only
  if (projectId.startsWith("swarm:")) {
    if (type === "turn.completed") {
      const { completeSwarmReport } = await import("./swarm-session");
      completeSwarmReport(sessionId, textFromPayloadContent((payload as { response?: string }).response));
    }
    return;
  }

  const io = ioFor();
  if (!io) return;
  const emit = (ev: string, data: unknown) => io.to(`project:${projectId}`).emit(ev, data);

  // ---------- turn lifecycle ----------
  if (type === "turn.started") {
    const chatSession = await activeChatSession(projectId);
    const lm: LiveMessage = {
      id: `live-${Date.now()}`,
      projectId,
      parts: [],
      toolCount: 0,
      failedTools: 0,
      startedAt: Date.now(),
      textChars: 0,
    };
    live.set(sessionId, lm);
    // the user message mirrors what persistUserMessage already stored
    emit("message:user", {
      id: (payload as { messageId?: string }).messageId || `user-${Date.now()}`,
      sessionId: chatSession?.id ?? null,
      role: "user",
      parts: [{ type: "text", text: (payload as { input?: string }).input ?? "" }],
      createdAt: new Date().toISOString(),
    });
    // CRITICAL: the client binds its live stream to this event — works after
    // reload, after answering a question, and for turns started server-side.
    emit("turn:started", { liveId: lm.id, projectId, sessionId: chatSession?.id ?? null });
    await emitProjectEvent(projectId, "status", { activity: "Working…", turn: "started" });
    return;
  }

  if (type === "turn.completed" || type === "turn.failed") {
    const lm = live.get(sessionId);
    live.delete(sessionId);
    const p = payload as { duration?: number; tokenCount?: number; toolCallCount?: number; response?: string; resultType?: string; error?: string };
    if (type === "turn.failed") {
      console.error(`[turn] failed for project ${projectId}:`, JSON.stringify(payload).slice(0, 600));
    }
    console.log(`[turn] ${type} project=${projectId} parts=${lm?.parts.length ?? "no-live"} stats=${JSON.stringify({ toolCount: p.toolCallCount, tokens: p.tokenCount }).slice(0, 100)}`);
    emit("turn:ended", { liveId: lm?.id ?? null, projectId, ok: type === "turn.completed" });
    const chatSession = await activeChatSession(projectId);
    if (lm) {
      if (type === "turn.failed") {
        lm.parts.push({ type: "text", text: `\n\n> ⚠️ Turn failed: ${textFromPayloadContent(p.response) || "unknown error"}` });
      }
      const stats = {
        toolCount: p.toolCallCount ?? lm.toolCount,
        failedTools: lm.failedTools,
        durationMs: p.duration ?? Date.now() - lm.startedAt,
        tokens: p.tokenCount ?? undefined,
      };
      const seq = await nextMessageSeq(projectId);
      const row = await db.agentMessage.create({
        data: { projectId, sessionId: chatSession?.id ?? null, role: "assistant", parts: JSON.stringify(lm.parts), seq },
      });
      emit("message:final", { id: row.id, liveId: lm.id, role: "assistant", parts: lm.parts, stats, sessionId: chatSession?.id ?? null });

      // auto version checkpoint at the end of every successful turn that did work
      if (type === "turn.completed" && lm.toolCount > 0) {
        void (async () => {
          try {
            const { gitCheckpoint } = await import("./services");
            const lastUser = [...lm.parts].reverse().find((x) => (x as { type?: string }).type === "text");
            const summary = (textFromPayloadContent([lastUser]) || "turn").slice(0, 60);
            const cp = await gitCheckpoint(projectId, summary);
            await db.checkpoint.update({ where: { id: cp.id }, data: { major: true, sessionId: chatSession?.id ?? null } }).catch(() => undefined);
          } catch (e) {
            console.warn(`[turn] auto checkpoint failed:`, (e as Error).message);
          }
        })();
      }
    }
    await emitProjectEvent(projectId, "status", { turn: type === "turn.completed" ? "completed" : "failed" });

    // after a turn finishes, make sure the dev server is up so the preview works
    void (async () => {
      try {
        const { maybeAutoStartDevServer } = await import("./devserver-autostart");
        await maybeAutoStartDevServer(projectId, "turn-end");
      } catch {
        /* noop */
      }
    })();
    return;
  }

  // ---------- message & part events ----------
  // The core delivers inner-kind events under several envelope types:
  // model.streaming (text/tool-input/tool_call), tool.updated (started/result/batch),
  // streamRecovery.updated (tool_result anchor), session/event (legacy).
  const INNER_TYPES = new Set(["session/event", "model.streaming", "tool.updated", "streamRecovery.updated", ""]);
  if (INNER_TYPES.has(type)) {
    const kind = (payload as { kind?: string }).kind;
    const lm = live.get(sessionId);
    if (!lm) return;

    switch (kind) {
      case "text_delta": {
        const delta = (payload as { delta?: string }).delta || "";
        lm.textChars += delta.length;
        const lastPart = lm.parts[lm.parts.length - 1];
        if (lastPart && lastPart.type === "text") (lastPart as { text: string }).text += delta;
        else lm.parts.push({ type: "text", text: delta });
        emit("message:delta", { messageId: lm.id, delta });
        return;
      }
      case "reasoning_delta": {
        const delta = (payload as { delta?: string }).delta || "";
        const lastPart = lm.parts[lm.parts.length - 1];
        if (lastPart && lastPart.type === "reasoning") (lastPart as { text: string }).text += delta;
        else lm.parts.push({ type: "reasoning", text: delta });
        emit("message:reasoning-delta", { messageId: lm.id, delta });
        return;
      }
      case "tool_input_start": {
        const { toolCallId, toolName } = payload as { toolCallId: string; toolName: string };
        lm.parts.push({ type: "tool-invocation", id: toolCallId, toolName, state: "input-streaming", argsText: "" });
        lm.toolCount++;
        emit("message:part", { messageId: lm.id, part: lm.parts[lm.parts.length - 1] });
        return;
      }
      case "tool_input_delta": {
        const { toolCallId, delta } = payload as { toolCallId: string; delta?: string };
        const part = lm.parts.find((x) => (x as { id?: string }).id === toolCallId) as { argsText?: string } | undefined;
        if (part) {
          part.argsText = (part.argsText || "") + (delta || "");
          emit("message:part", { messageId: lm.id, part: { ...part, type: "tool-invocation" } });
        }
        return;
      }
      case "tool_input_end": {
        const { toolCallId } = payload as { toolCallId: string };
        const part = lm.parts.find((x) => (x as { id?: string }).id === toolCallId) as Json | undefined;
        if (part) {
          try {
            part.input = JSON.parse((part as { argsText?: string }).argsText || "{}");
          } catch {
            part.input = {};
          }
          part.state = "running";
          emit("message:part", { messageId: lm.id, part });
        }
        return;
      }
      case "tool_call": {
        const { toolCallId, toolName, input } = payload as { toolCallId: string; toolName?: string; input?: Json };
        let part = lm.parts.find((x) => (x as { id?: string }).id === toolCallId) as Json | undefined;
        if (!part) {
          part = { type: "tool-invocation", id: toolCallId, toolName: toolName || "tool", state: "running" };
          lm.parts.push(part);
          lm.toolCount++;
        }
        part.input = input;
        part.toolName = toolName || part.toolName;
        part.state = "running";
        if (toolName === "TodoWrite" && input && Array.isArray((input as { todos?: unknown[] }).todos)) {
          upsertPart(lm, { type: "plan", todos: (input as { todos: unknown[] }).todos });
          emit("message:part", { messageId: lm.id, part: findPart(lm, "plan") });
        }
        if (toolName === "Agent") {
          const inp = (input ?? {}) as { description?: string; subagent_type?: string };
          const delegation = {
            type: "delegation",
            agent: inp.subagent_type || "agent",
            phase: "spawned",
            text: inp.description || "",
            color: colorForAgent(inp.subagent_type || "agent"),
          };
          lm.parts.push(delegation);
          emit("message:part", { messageId: lm.id, part: delegation });
          await emitProjectEvent(projectId, "delegation", delegation);
        }
        emit("message:part", { messageId: lm.id, part });
        return;
      }
      case "scheduled": {
        const { toolCallId, toolName, input } = payload as { toolCallId: string; toolName?: string; input?: Json };
        const exists = lm.parts.find((x) => (x as { id?: string }).id === toolCallId);
        if (!exists) {
          lm.parts.push({ type: "tool-invocation", id: toolCallId, toolName: toolName || "tool", state: "input-available", input });
          emit("message:part", { messageId: lm.id, part: lm.parts[lm.parts.length - 1] });
        }
        return;
      }
      case "started": {
        const { toolCallId } = payload as { toolCallId: string };
        const part = lm.parts.find((x) => (x as { id?: string }).id === toolCallId) as Json | undefined;
        if (part && part.state !== "output-available") {
          part.state = "running";
          emit("message:part", { messageId: lm.id, part });
        }
        return;
      }
      case "result": {
        const { toolCallId, result, duration } = payload as { toolCallId: string; result?: Json; duration?: number };
        const part = lm.parts.find((x) => (x as { id?: string }).id === toolCallId) as Json | undefined;
        if (part) {
          const success = (result as { success?: boolean })?.success !== false;
          part.state = success ? "output-available" : "error";
          part.output = shrink((result as { content?: unknown })?.content ?? result);
          part.durationMs = duration;
          part.isError = !success;
          if (!success) lm.failedTools++;
          emit("message:part", { messageId: lm.id, part });
        }
        return;
      }
      case "batch": {
        const b = payload as { toolCallIds?: string[]; successCount?: number; errorCount?: number };
        await emitProjectEvent(projectId, "status", { batch: b });
        return;
      }
      default:
        if (!kind) {
          // title update payload
          const title = (payload as { title?: string }).title;
          if (title) {
            await db.project.update({ where: { id: projectId }, data: { title } });
            emit("title", { projectId, title });
          }
        }
        return;
    }
  }

  // ---------- top-level event types ----------
  if (type === "checkpoint.created" || type === "rewind.triggered") {
    const label = (payload as { checkpointId?: string; reason?: string }).checkpointId || (payload as { reason?: string }).reason || "checkpoint";
    await emitProjectEvent(projectId, "checkpoint", { id: label, label });
    return;
  }
  if (type === "session.titleUpdated") {
    const title = (payload as { title?: string }).title;
    if (title) {
      await db.project.update({ where: { id: projectId }, data: { title } });
      emit("title", { projectId, title });
    }
    return;
  }
  if (type === "session.updated") {
    const p = payload as { providerId?: string; modelId?: string; toolCount?: number };
    await emitProjectEvent(projectId, "status", { session: p });
    return;
  }
}

// ---------- helpers ----------

/** Upsert a part by type in place (keeps its chronological position stable). */
function upsertPart(lm: LiveMessage, part: Json & { type: string }) {
  const idx = lm.parts.findIndex((x) => (x as { type?: string }).type === part.type);
  if (idx >= 0) lm.parts[idx] = { ...(lm.parts[idx] as Json), ...part };
  else lm.parts.push(part);
}
function findPart(lm: LiveMessage, type: string): Json | undefined {
  return lm.parts.find((x) => (x as { type?: string }).type === type);
}

export async function emitProjectEvent(projectId: string, kind: string, payload: Json): Promise<void> {
  const io = ioFor();
  await syncEventSeq(projectId);
  const seq = await nextEventSeq(projectId);
  try {
    const row = await db.agentEvent.create({
      data: { projectId, kind, payload: JSON.stringify(payload), seq },
    });
    io?.to(`project:${projectId}`).emit("agent:event", {
      id: row.id,
      kind,
      payload,
      seq,
      createdAt: row.createdAt.toISOString(),
    });
  } catch {
    /* ignore persistence failures for events */
  }
}

export async function nextMessageSeq(projectId: string): Promise<number> {
  const last = await db.agentMessage.findFirst({ where: { projectId }, orderBy: { seq: "desc" }, select: { seq: true } });
  return (last?.seq ?? 0) + 1;
}

function shrink(v: unknown): unknown {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  if (typeof s !== "string") return v;
  if (s.length > 20000) return s.slice(0, 20000) + "… [truncated]";
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

const AGENT_COLORS = ["#b4532a", "#5b6b4c", "#c98a2d", "#7c3aed", "#0d9488", "#2f6bff", "#57534e", "#a16207"];
export function colorForAgent(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AGENT_COLORS[h % AGENT_COLORS.length];
}

// persist a user message immediately when a turn is accepted
export async function persistUserMessage(projectId: string, content: string): Promise<void> {
  const chatSession = await activeChatSession(projectId);
  const seq = await nextMessageSeq(projectId);
  await db.agentMessage.create({
    data: { projectId, sessionId: chatSession?.id ?? null, role: "user", parts: JSON.stringify([{ type: "text", text: content }]), seq },
  });
  if (chatSession) {
    await db.chatSession.update({ where: { id: chatSession.id }, data: { updatedAt: new Date() } }).catch(() => undefined);
  }
}
