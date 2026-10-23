"use client";

// ZCode Builder — the chat panel. Ported from Forge ChatPanel.tsx and rewired
// from prop-drilling to the zustand store: real messages stream in over the
// socket, permissions/questions go through the BFF, artifacts are real files.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUp, Bot, Check, ChevronDown, ChevronRight, Copy, FilePenLine,
  History, Lightbulb, ListChecks, Loader2, MessageSquarePlus, Mic, Paperclip,
  Plus, RotateCcw, Settings2, Square, ThumbsDown, ThumbsUp, X, Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as api from "@/lib/api";
import { useForge } from "@/lib/store";
import type {
  ApprovalPart, ChatMessage, CheckpointPart, TextPart, ToolInvocationPart,
} from "@/lib/types";
import { renderMarkdown } from "./render-markdown";
import { ToolRow } from "./ToolCards";
import { TerminalReadCard, WebViewErrorCard, type WebViewError } from "./AgentEventCards";
import { QuestionCard } from "./QuestionCard";
import { ArtifactCard, CheckpointCard, HandoffCard, SwarmCard, type CheckpointLike } from "./Artifacts";
import { ConfigSummary, ContextPanel, SwarmToggle } from "./ComposerSettings";

/* ------------------------------------------------------------------ */
/*  per-mode sample prompts (static defaults)                          */
/* ------------------------------------------------------------------ */

const SAMPLE_PROMPTS: Record<string, string[]> = {
  web: [
    "Build a warm landing page for a bakery with hero, menu and testimonials",
    "Add a pricing table with three tiers and a monthly/yearly toggle",
    "Create an analytics dashboard with a sidebar and 4 KPI cards",
    "Review my page sections and tighten the copy",
  ],
  mobile: [
    "Scaffold an Expo app with tab navigation and a profile screen",
    "Build a grocery list screen with swipe-to-delete",
    "Add push-notification settings with toggles",
    "Wire the login screen to a form with validation",
  ],
  design: [
    "Design a token set for a warm editorial brand",
    "Create a component sheet: buttons, inputs, cards, badges",
    "Draft three hero directions for a coffee subscription",
    "Turn this moodboard into CSS variables",
  ],
  app: [
    "Build a habit tracker — pick the best stack yourself",
    "Make a recipe box with search and tags",
    "Create a personal wiki with markdown notes",
    "Plan and build a small invoicing tool",
  ],
  presentation: [
    "Create a 6-slide pitch deck for a spice subscription",
    "Build a quarterly review deck with charts",
    "Make a workshop deck with speaker notes",
    "Turn this outline into a titled, styled deck",
  ],
  document: [
    "Write a product requirements doc for a checkout flow",
    "Draft release notes from this git log",
    "Create a structured onboarding guide",
    "Summarize this dataset into a one-page brief",
  ],
  computer: [
    "Open the preview and verify the signup form works end to end",
    "Check the site on a mobile viewport and report issues",
    "Take a screenshot of the pricing page and flag broken styles",
    "Fill the contact form with test data and submit it",
  ],
  data: [
    "Analyze sales.csv and chart revenue by product",
    "Clean this dataset and profile every column",
    "Build a cohort retention table from events.csv",
    "Find the top growth segments and visualize them",
  ],
};

const FILE_TOOLS = ["Read", "Write", "Edit", "NotebookEdit", "ApplyPatch"];

/* ------------------------------------------------------------------ */
/*  approval card — Allow / Deny via api.respondPermission             */
/* ------------------------------------------------------------------ */

function ApprovalCard({ part, projectId }: { part: ApprovalPart; projectId: string }) {
  const [busy, setBusy] = useState(false);
  const resolved = part.resolved;

  const respond = async (decision: "allow" | "deny") => {
    setBusy(true);
    try {
      await api.respondPermission({ projectId, requestId: part.requestId, decision });
      const { messages, toast } = useForge.getState();
      const updated = messages.map((m) => ({
        ...m,
        parts: m.parts.map((p) =>
          p.type === "approval" && p.requestId === part.requestId ? { ...p, resolved: decision } : p,
        ),
      }));
      useForge.setState({ messages: updated });
      toast({
        title: decision === "allow" ? "Allowed" : "Denied",
        description: `${part.toolName} — the agent continues.`,
        variant: decision === "allow" ? "success" : "default",
      });
    } catch (e) {
      useForge.getState().toast({ title: "Failed to respond", description: String(e), variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const inputPreview =
    part.input === undefined
      ? ""
      : typeof part.input === "string"
        ? part.input
        : JSON.stringify(part.input);

  return (
    <div
      className={cn(
        "anim-fade-up mt-2.5 overflow-hidden rounded-xl border bg-card",
        resolved ? "border-line" : "border-honey/40",
      )}
    >
      <div className="flex items-center gap-2 border-b border-line-soft bg-honey/[0.06] px-3 py-2">
        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", resolved ? "bg-black/[0.06] text-ink-soft" : "bg-honey/15 text-honey")}>
          {resolved ? <Check size={12} /> : <Lightbulb size={12} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold text-ink">
            {resolved ? `Permission ${resolved === "allow" ? "granted" : "denied"} · ${part.toolName}` : `Permission needed · ${part.toolName}`}
          </span>
          {part.riskLevel && <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">risk · {part.riskLevel}</span>}
        </span>
        {busy && <Loader2 size={12} className="shrink-0 animate-spin text-clay" />}
      </div>

      {!resolved && (
        <>
          {inputPreview ? (
            <pre className="max-h-[96px] overflow-auto whitespace-pre-wrap break-all bg-cream px-3 py-2 font-mono text-[10px] leading-relaxed text-ink-soft">
              {inputPreview.slice(0, 400)}
            </pre>
          ) : null}
          {part.reason ? <p className="px-3 pt-2 text-[11.5px] leading-relaxed text-ink-soft">{part.reason}</p> : null}
          <div className="flex items-center gap-1.5 px-3 py-2.5">
            <button
              onClick={() => void respond("allow")}
              disabled={busy}
              className="flex h-7 items-center gap-1.5 rounded-lg bg-ink px-3 text-[11.5px] font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
            >
              <Check size={11} strokeWidth={3} /> Allow
            </button>
            <button
              onClick={() => void respond("deny")}
              disabled={busy}
              className="flex h-7 items-center gap-1.5 rounded-lg border border-clay/40 px-3 text-[11.5px] font-semibold text-clay transition hover:bg-clay/[0.06] disabled:opacity-60"
            >
              <X size={11} /> Deny
            </button>
            <span className="ml-auto text-[10px] text-muted">the agent waits for your decision</span>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  agent message — full Forge composition order                       */
/* ------------------------------------------------------------------ */

function AgentMessage({ msg, isLive, isLast }: { msg: ChatMessage; isLive: boolean; isLast: boolean }) {
  const [thoughtOpen, setThoughtOpen] = useState(false);
  const [todosOpen, setTodosOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const projectId = useForge((s) => s.activeProject?.id ?? "");
  const storeTodos = useForge((s) => s.todos);
  const webviewErrors = useForge((s) => s.webviewErrors);
  const consoleEntries = useForge((s) => s.consoleEntries);
  const swarmRun = useForge((s) => s.swarmRun);
  const openFile = useForge((s) => s.openFile);
  const setWsMode = useForge((s) => s.setWsMode);

  const parts = msg.parts;
  const reasoning = parts.filter((p) => p.type === "reasoning");
  const toolParts = parts.filter((p): p is ToolInvocationPart => p.type === "tool-invocation");
  const delegations = parts.filter((p) => p.type === "delegation");
  const planPart = parts.find((p) => p.type === "plan");
  const checkpointParts = parts.filter((p): p is CheckpointPart => p.type === "checkpoint");
  const questions = parts.filter((p) => p.type === "question");
  const approvals = parts.filter((p) => p.type === "approval");
  const textParts = parts.filter((p): p is TextPart => p.type === "text");

  const thoughtMs = reasoning.reduce((s, r) => s + (r.durationMs ?? 0), 0);
  const thoughtSeconds = thoughtMs > 0 ? Math.round(thoughtMs / 1000) : reasoning.length > 0 ? reasoning.length : undefined;

  const todos = planPart?.todos ?? (isLive ? storeTodos : []);
  const doneCount = todos.filter((t) => t.status === "completed" || t.status === "done").length;
  const activeTodo = todos.find((t) => t.status === "in_progress");

  const lastBash = [...toolParts].reverse().find((t) => t.toolName === "Bash");
  const showTerminalRead =
    isLive && lastBash !== undefined && (lastBash.state === "running" || lastBash.state === "input-streaming" || lastBash.state === "input-available");

  const wvErrors: WebViewError[] = webviewErrors.map((e, i) => ({
    id: `wv-${i}`,
    level: e.level === "warn" ? "warn" : "error",
    text: e.message,
    source: "preview",
    count: e.count,
  }));
  const showWvErrors = wvErrors.length > 0 && (isLive || isLast) && !msg.streaming;

  // files touched: file chips + file paths from tool inputs
  const filePaths = new Set<string>();
  for (const p of parts) {
    if (p.type === "file-chip") filePaths.add(p.path);
    if (p.type === "tool-invocation" && FILE_TOOLS.includes(p.toolName)) {
      const input = (p.input ?? {}) as Record<string, unknown>;
      const fp = input.file_path ?? input.path ?? input.notebook_path;
      if (typeof fp === "string" && fp) filePaths.add(fp);
    }
  }

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(textParts.map((t) => t.text).join("\n\n") || "(no text)");
    } catch {
      /* noop */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const restore = async (cp: CheckpointLike) => {
    if (!projectId || restoringId) return;
    setRestoringId(cp.id);
    try {
      await api.gitRestore(projectId, cp.id);
      const s = useForge.getState();
      s.toast({ title: "Checkpoint restored", description: cp.label, variant: "success" });
      void s.refreshGit();
      void s.refreshFileTree();
      void s.refreshArtifacts();
      s.bumpPreview();
    } catch (e) {
      useForge.getState().toast({ title: "Restore failed", description: String(e), variant: "error" });
    } finally {
      setRestoringId(null);
    }
  };

  const timestamp = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const stats = msg.stats;
  const durationS = stats?.durationMs ? Math.max(1, Math.round(stats.durationMs / 1000)) : undefined;
  const hasOpenQuestion = questions.some((q) => !q.answered);

  return (
    <div className="anim-fade-up px-4 py-4">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-ink text-[12px] font-bold text-paper">F</span>
        <span className="font-display text-[16px]">forge</span>
        {msg.streaming && (
          <span className="ml-1 flex items-center gap-1.5 text-[11.5px] font-medium text-muted">
            <span className="working-dot h-1.5 w-1.5 rounded-full bg-clay" /> working
          </span>
        )}
        {msg.streaming && hasOpenQuestion && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-clay">
            <Lightbulb size={11} /> needs input
          </span>
        )}
        <span className="ml-auto text-[11px] text-faint">{timestamp}</span>
      </div>

      {/* thought for Ns */}
      {thoughtSeconds !== undefined && (
        <>
          <button
            onClick={() => setThoughtOpen(!thoughtOpen)}
            className="mt-2.5 flex items-center gap-1.5 text-[12px] text-muted transition hover:text-ink"
          >
            <ListChecks size={12} /> Thought for {thoughtSeconds}s
            {thoughtOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          {thoughtOpen && (
            <div className="anim-fade-in mt-1.5 space-y-1.5 rounded-lg border border-line-soft bg-cream px-3 py-2">
              {reasoning.map((r, i) => (
                <p key={i} className="text-[12px] italic leading-relaxed text-ink-soft">
                  {r.text.slice(0, 600)}
                  {r.text.length > 600 ? "…" : ""}
                </p>
              ))}
              {reasoning.length === 0 && <p className="text-[12px] italic text-ink-soft">Reasoning about the request…</p>}
            </div>
          )}
        </>
      )}

      {/* plan / todos card */}
      {todos.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-xl border border-line bg-card">
          <button onClick={() => setTodosOpen(!todosOpen)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left">
            {doneCount === todos.length ? (
              <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-moss text-white">
                <Check size={11} strokeWidth={3} />
              </span>
            ) : (
              <Loader2 size={15} className="shrink-0 animate-spin text-clay" />
            )}
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">
              {doneCount === todos.length
                ? todos[todos.length - 1]?.content ?? "Plan complete"
                : activeTodo?.content ?? "Working on plan…"}
            </span>
            <span className="shrink-0 text-[11px] font-medium tabular-nums text-muted">
              {doneCount}/{todos.length}
            </span>
            {todosOpen ? <ChevronDown size={13} className="shrink-0 text-muted" /> : <ChevronRight size={13} className="shrink-0 text-muted" />}
          </button>
          {todosOpen && (
            <div className="space-y-1 border-t border-line-soft px-3 py-2">
              {todos.map((t) => {
                const done = t.status === "completed" || t.status === "done";
                const active = t.status === "in_progress";
                return (
                  <div key={t.id} className="flex items-center gap-2.5 py-1 text-[12.5px]">
                    {done ? (
                      <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-moss/15 text-moss">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    ) : active ? (
                      <Loader2 size={14} className="shrink-0 animate-spin text-clay" />
                    ) : (
                      <span className="h-[16px] w-[16px] shrink-0 rounded-full border border-line" />
                    )}
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate",
                        done ? "text-muted line-through decoration-ink/20" : active ? "font-medium text-ink" : "text-muted",
                      )}
                    >
                      {t.content}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* swarm */}
      {swarmRun && (isLive || isLast) && <SwarmCard run={swarmRun} />}

      {/* handoffs */}
      {delegations.map((d, i) => (
        <HandoffCard key={`${d.agent}-${d.phase}-${i}`} part={d} />
      ))}

      {/* tool rows */}
      {toolParts.length > 0 && (
        <div className="mt-2.5 space-y-1.5">
          {toolParts.map((t) => (
            <ToolRow key={t.id} part={t} projectId={projectId} onOpenFile={(p) => void openFile(p)} onOpenBrowser={() => setWsMode("browser")} />
          ))}
        </div>
      )}

      {/* terminal read (live bash tail) */}
      {showTerminalRead && lastBash && (
        <TerminalReadCard
          command={(() => {
            const input = (lastBash.input ?? {}) as Record<string, unknown>;
            return typeof input.command === "string" ? input.command : "…";
          })()}
          lines={consoleEntries.slice(-12).map((c) => c.text.replace(/\n$/, ""))}
          status="running"
          onOpenTerminal={() => setWsMode("terminal")}
        />
      )}

      {/* webview errors */}
      {showWvErrors && (
        <WebViewErrorCard errors={wvErrors} onFix={() => setWsMode("console")} onOpenConsole={() => setWsMode("console")} />
      )}

      {/* checkpoints in the message */}
      {checkpointParts.map((cp) => (
        <CheckpointCard key={cp.id} cp={cp} onRestore={(c) => void restore(c)} restoring={restoringId === cp.id} compact />
      ))}

      {/* artifact cards (real files, most recent few on the last message) */}
      {isLast && !msg.streaming && <RecentArtifacts />}

      {/* questions */}
      {questions.map((q) => (
        <QuestionCard key={q.requestId} part={q} projectId={projectId} />
      ))}

      {/* approvals */}
      {approvals.map((a) => (
        <ApprovalCard key={a.requestId} part={a} projectId={projectId} />
      ))}

      {/* markdown text — stream caret on the last text part */}
      {textParts.map((t, i) => (
        <div
          key={i}
          className={cn(
            "chat-md mt-3 text-[13.5px] leading-[1.65] text-ink",
            msg.streaming && i === textParts.length - 1 && "stream-caret",
          )}
        >
          {renderMarkdown(t.text)}
        </div>
      ))}

      {/* files touched */}
      {filePaths.size > 0 && !msg.streaming && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Array.from(filePaths).map((f) => (
            <button
              key={f}
              onClick={() => void openFile(f)}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-2 py-1 font-mono text-[11px] text-ink-soft transition hover:border-ink/25 hover:text-ink"
            >
              <FilePenLine size={11} className="text-moss" /> {f}
            </button>
          ))}
        </div>
      )}

      {/* footer */}
      {!msg.streaming && (
        <div className="mt-3 flex items-center gap-1 border-t border-line-soft pt-2.5">
          <span className="text-[11px] text-faint">
            Worked for {durationS ?? thoughtSeconds ?? 12}s
            {stats ? ` · ${stats.toolCount} tools${stats.failedTools > 0 ? ` · ${stats.failedTools} failed` : ""}` : ""}
          </span>
          {checkpointParts[0] && (
            <button
              onClick={() => void restore(checkpointParts[0])}
              disabled={restoringId === checkpointParts[0].id}
              className="ml-2 flex items-center gap-1 rounded-md border border-line bg-card px-2 py-1 text-[9.5px] font-semibold text-ink-soft transition hover:border-ink/25 disabled:opacity-50"
            >
              <History size={10} />
              {restoringId === checkpointParts[0].id ? "Restoring…" : "Restore checkpoint"}
            </button>
          )}
          <div className="ml-auto flex items-center gap-0.5">
            <button
              onClick={() => void copyText()}
              className="flex h-7 w-7 items-center justify-center rounded-md text-faint transition hover:bg-black/5 hover:text-ink"
              title="Copy answer"
            >
              {copied ? <Check size={13} className="text-moss" /> : <Copy size={13} />}
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-md text-faint transition hover:bg-black/5 hover:text-ink" title="Good answer">
              <ThumbsUp size={13} />
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-md text-faint transition hover:bg-black/5 hover:text-ink" title="Bad answer">
              <ThumbsDown size={13} />
            </button>
            <button onClick={() => void useForge.getState().retry()} className="flex h-7 w-7 items-center justify-center rounded-md text-faint transition hover:bg-black/5 hover:text-ink" title="Retry">
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Recent real artifacts rendered under the latest finished answer. */
function RecentArtifacts() {
  const projectId = useForge((s) => s.activeProject?.id ?? "");
  const artifacts = useForge((s) => s.artifacts);
  const openFile = useForge((s) => s.openFile);
  const recent = artifacts.slice(-3);
  if (!projectId || recent.length === 0) return null;
  return (
    <>
      {recent.map((a) => (
        <ArtifactCard key={a.id} a={a} projectId={projectId} onOpenFile={(p) => void openFile(p)} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  user message                                                       */
/* ------------------------------------------------------------------ */

function UserMessage({ msg }: { msg: ChatMessage }) {
  const text = msg.parts
    .filter((p): p is TextPart => p.type === "text")
    .map((p) => p.text)
    .join("\n");
  const timestamp = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="anim-fade-up flex justify-end px-4 py-3.5">
      <div className="max-w-[92%]">
        <div className="rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap text-white shadow-sm">
          {text}
        </div>
        <p className="mt-1 text-right text-[10.5px] text-faint">{timestamp}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  chat panel                                                         */
/* ------------------------------------------------------------------ */

export default function ChatPanel() {
  const messages = useForge((s) => s.messages);
  const liveMessageId = useForge((s) => s.liveMessageId);
  const isWorking = useForge((s) => s.isWorking);
  const agentActivity = useForge((s) => s.agentActivity);
  const lastError = useForge((s) => s.lastError);
  const todos = useForge((s) => s.todos);
  const composer = useForge((s) => s.composer);
  const activeProject = useForge((s) => s.activeProject);
  const picks = useForge((s) => s.picks);
  const checkpoints = useForge((s) => s.checkpoints);
  const contextUsed = useForge((s) => s.contextUsed);
  const contextWindow = useForge((s) => s.contextWindow);
  const send = useForge((s) => s.send);
  const stop = useForge((s) => s.stop);
  const removePick = useForge((s) => s.removePick);
  const setOverlay = useForge((s) => s.setOverlay);
  const contextPanelOpen = useForge((s) => s.contextPanelOpen);

  const [draft, setDraft] = useState("");
  const [planOpen, setPlanOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const plusBtnRef = useRef<HTMLButtonElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);

  // auto-scroll to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, agentActivity, isWorking]);

  // autosize textarea
  useEffect(() => {
    const ta = areaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(140, ta.scrollHeight) + "px";
    }
  }, [draft]);

  // place the + context portal near its button
  useEffect(() => {
    if (!contextPanelOpen) return;
    const place = () => {
      const btn = plusBtnRef.current;
      const panel = attachRef.current;
      if (!btn || !panel) return;
      const r = btn.getBoundingClientRect();
      const h = panel.offsetHeight || 320;
      panel.style.visibility = "visible";
      panel.style.bottom = `${window.innerHeight - r.top + 8}px`;
      panel.style.top = "auto";
      let left = r.left;
      if (left + 286 > window.innerWidth - 8) left = window.innerWidth - 294;
      panel.style.left = `${Math.max(8, left)}px`;
      panel.style.maxHeight = `${Math.max(220, Math.min(h, r.top - 16))}px`;
    };
    place();
    const id = window.setTimeout(place, 16);
    window.addEventListener("resize", place);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", place);
    };
  }, [contextPanelOpen]);

  const doSend = () => {
    const t = draft.trim();
    if (!t || isWorking) return;
    void send(t);
    setDraft("");
  };

  const pendingQuestion = [...messages]
    .reverse()
    .find((m) => m.parts.some((p) => p.type === "question" && !p.answered));
  const hasPendingQuestion = !!pendingQuestion;
  const isEmpty = messages.length === 0 && !isWorking;
  const suggestions = SAMPLE_PROMPTS[composer.mode] ?? SAMPLE_PROMPTS.app;
  const doneTodos = todos.filter((t) => t.status === "completed" || t.status === "done").length;
  const activeTodo = todos.find((t) => t.status === "in_progress");
  const contextPct = contextWindow > 0 ? Math.min(100, Math.round((contextUsed / contextWindow) * 100)) : 0;

  return (
    <div className="flex h-full w-full flex-col bg-paper">
      {/* header — single thread per project */}
      <div className="flex h-[52px] shrink-0 items-center gap-1.5 border-b border-line px-2.5">
        <div className="relative min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5">
            <MessageSquarePlus size={14} className="shrink-0 text-clay" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold leading-tight">{activeProject?.title ?? "New task"}</span>
              <span className="block truncate text-[10.5px] leading-tight text-muted">
                <ConfigSummary /> · {messages.length} msgs
              </span>
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setDraft("");
            areaRef.current?.focus();
          }}
          title="New task"
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-[11.5px] font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink"
        >
          <Plus size={13} /> New task
        </button>

        <div className="relative shrink-0">
          <button
            onClick={() => setOverlay("versionsOpen", true)}
            title="Checkpoints"
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-black/5 hover:text-ink"
          >
            <History size={15} />
            {checkpoints.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-moss px-1 text-[8.5px] font-bold text-white">
                {checkpoints.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => setOverlay("settingsSheetOpen", true)}
          title="Task settings"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-black/5 hover:text-ink"
        >
          <Settings2 size={15} />
        </button>
      </div>

      {/* thread */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-[18px] font-bold text-paper">F</span>
            <p className="font-display text-[26px]">forge</p>
            <p className="max-w-[320px] text-[12.5px] leading-relaxed text-muted">
              {activeProject
                ? "Describe what to build or change — the agent edits files, runs builds and updates the preview."
                : "Open a project to start working with the agent."}
            </p>
            <span className="mt-1 rounded-full bg-black/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
              {composer.mode} mode
            </span>
          </div>
        ) : (
          <div className="divide-y divide-line-soft">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <UserMessage key={m.id} msg={m} />
              ) : (
                <AgentMessage key={m.id} msg={m} isLive={m.id === liveMessageId} isLast={i === messages.length - 1} />
              ),
            )}

            {/* working row before the live message exists */}
            {isWorking && !liveMessageId && (
              <div className="anim-fade-up flex items-center gap-2 px-4 py-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-ink text-[12px] font-bold text-paper">F</span>
                <span className="font-display text-[16px]">forge</span>
                <span className="ml-1 flex items-center gap-1.5 text-[11.5px] font-medium text-muted">
                  <Loader2 size={12} className="animate-spin text-clay" />
                  {agentActivity ?? "Thinking…"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* last error banner */}
        {lastError && (
          <div className="mx-4 my-3 flex items-start gap-2 rounded-xl border border-clay/30 bg-clay/[0.05] px-3 py-2.5">
            <span className="mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded bg-clay/15 text-clay">
              <X size={11} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-semibold text-ink">The agent hit an error ({lastError.kind})</p>
              <p className="mt-0.5 line-clamp-3 break-all font-mono text-[10.5px] leading-relaxed text-clay">{lastError.message}</p>
            </div>
            <button
              onClick={() => void useForge.getState().retry()}
              className="flex h-7 shrink-0 items-center gap-1 rounded-lg bg-ink px-2.5 text-[10.5px] font-semibold text-white transition hover:bg-stone-800"
            >
              <RotateCcw size={10} /> Retry
            </button>
          </div>
        )}

        <div className="h-3" />
      </div>

      {/* suggestion chips — only on an empty thread */}
      {isEmpty && (
        <div className="flex shrink-0 gap-1.5 overflow-x-auto px-3 pb-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => void send(s)}
              className="shrink-0 rounded-full border border-line bg-card px-3 py-1.5 text-[11.5px] font-medium text-ink-soft transition hover:border-ink/25 hover:text-ink"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* task plan mini-card */}
      {todos.length > 0 && (
        <div className="shrink-0 px-3 pb-2">
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <button onClick={() => setPlanOpen(!planOpen)} className="flex w-full items-center gap-2 px-3 py-2 text-left">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", doneTodos === todos.length ? "bg-moss" : "working-dot bg-clay")} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10.5px] font-semibold">Task plan</span>
                <span className="block truncate text-[9.5px] text-muted">
                  {activeTodo?.content ?? todos[todos.length - 1]?.content ?? "…"}
                </span>
              </span>
              <span className="shrink-0 text-[9.5px] text-muted">
                {doneTodos}/{todos.length}
              </span>
              {planOpen ? <ChevronDown size={12} className="shrink-0 text-muted" /> : <ListChecks size={12} className="shrink-0 text-muted" />}
            </button>
            {planOpen && (
              <div className="space-y-1 border-t border-line-soft px-3 py-2">
                {todos.map((item) => {
                  const done = item.status === "completed" || item.status === "done";
                  const active = item.status === "in_progress";
                  return (
                    <div key={item.id} className="flex items-center gap-2 text-[10.5px]">
                      {done ? (
                        <Check size={11} className="shrink-0 text-moss" />
                      ) : active ? (
                        <Loader2 size={11} className="shrink-0 animate-spin text-clay" />
                      ) : (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-line" />
                      )}
                      <span className={cn("min-w-0 flex-1 truncate", done ? "text-muted line-through" : "text-ink-soft")}>{item.content}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* composer */}
      <div className="shrink-0 px-3 pb-3">
        <div
          className={cn(
            "overflow-hidden rounded-2xl border bg-card shadow-[0_8px_28px_-12px_rgba(28,25,23,0.25)] transition",
            hasPendingQuestion ? "border-clay/40" : "border-line focus-within:border-ink/30",
          )}
        >
          {picks.length > 0 && (
            <div className="anim-fade-in border-b border-line-soft bg-cream/70 px-2.5 py-2">
              <div className="mb-1.5 flex items-center gap-1.5 px-0.5">
                <Camera size={11} className="shrink-0 text-[#2f6bff]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Picked in preview · {picks.length}</span>
              </div>
              <div className="space-y-1">
                {picks.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-2 rounded-lg border border-[#2f6bff]/25 bg-card px-2 py-1.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[10.5px] text-ink-soft">{p.selector}</span>
                      {p.instructions ? <span className="block truncate text-[10.5px] italic text-muted">“{p.instructions}”</span> : null}
                    </span>
                    <button onClick={() => removePick(i)} className="shrink-0 text-faint hover:text-clay">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {hasPendingQuestion && pendingQuestion && (
            <div className="flex items-center gap-2 border-b border-line-soft bg-clay/[0.04] px-3.5 py-2">
              <Lightbulb size={12} className="shrink-0 text-clay" />
              <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-ink">
                {pendingQuestion.parts.find((p) => p.type === "question")?.prompt ?? pendingQuestion.parts.find((p) => p.type === "question")?.questions[0]?.question ?? "Forge asked a question"}
              </span>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-clay">answer above</span>
            </div>
          )}
          <textarea
            ref={areaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                doSend();
              }
            }}
            placeholder={
              hasPendingQuestion
                ? "Or type a custom answer for Forge's question…"
                : isWorking
                  ? "Agent is working… (stop to interrupt)"
                  : "Ask Forge to build, edit, or explain…"
            }
            rows={1}
            disabled={isWorking}
            className="max-h-[140px] w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-[13.5px] leading-relaxed outline-none placeholder:text-faint disabled:opacity-60"
          />
          <div className="flex items-center gap-1 px-2.5 pb-2.5 pt-1">
            <div className="relative">
              <button
                ref={plusBtnRef}
                onClick={() => setOverlay("contextPanelOpen", !contextPanelOpen)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition",
                  contextPanelOpen ? "bg-ink text-white" : "text-muted hover:bg-black/5 hover:text-ink",
                )}
                title="Attach context — skills, MCPs and files"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={() => setOverlay("contextPanelOpen", true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-black/5 hover:text-ink"
              title="Attach files or screenshots"
            >
              <Paperclip size={15} />
            </button>
            <div className="ml-auto flex items-center gap-1">
              <SwarmToggle />
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-black/5 hover:text-ink"
                title="Voice input"
              >
                <Mic size={15} />
              </button>
              {isWorking ? (
                <button
                  onClick={() => void stop()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-clay text-white transition hover:bg-clay/90"
                  title="Stop agent"
                >
                  <Square size={13} className="fill-current" />
                </button>
              ) : (
                <button
                  onClick={doSend}
                  disabled={!draft.trim()}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition",
                    draft.trim() ? "bg-ink text-white hover:bg-stone-800" : "bg-black/[0.06] text-faint",
                  )}
                  title="Send (Enter)"
                >
                  <ArrowUp size={15} strokeWidth={2.4} />
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="mt-1.5 text-center text-[10.5px] text-faint">
          <Bot size={9} className="mr-1 inline" />
          Forge can edit files, run builds and update the preview · context {contextPct}%
        </p>
      </div>

      {/* + context portal (anchored above the composer) */}
      {contextPanelOpen &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setOverlay("contextPanelOpen", false)} />
            <div
              ref={attachRef}
              style={{ visibility: "hidden" }}
              className="anim-fade-up fixed z-[100] overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
            >
              <ContextPanel onClose={() => setOverlay("contextPanelOpen", false)} />
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
