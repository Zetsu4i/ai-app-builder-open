"use client";

// Forge workspace — computer-use panel. Real data: browser/computer sessions are
// derived from agent events (kind "status", payload.type === "computer"). With no
// sessions recorded it shows the honest empty state. Playback (play/pause/speed,
// click ripples) runs over whatever steps were recorded — nothing is persisted.

import { useEffect, useRef, useState } from "react";
import {
  Play, Pause, SkipForward, RotateCcw, MousePointerClick, Keyboard, History, ChevronDown,
  Camera, MoveVertical, Navigation, Loader2, Check, Circle, Globe, ScanEye, X,
} from "lucide-react";
import { useForge } from "@/lib/store";
import { getSocket } from "@/lib/socket";
import { cn, clockTime } from "./forge-utils";

type StepKind = "navigate" | "click" | "type" | "scroll" | "wait" | "screenshot" | "extract" | "assert";

const STEP_ICON: Record<StepKind, typeof Navigation> = {
  navigate: Navigation,
  click: MousePointerClick,
  type: Keyboard,
  scroll: MoveVertical,
  wait: Loader2,
  screenshot: Camera,
  extract: ScanEye,
  assert: Check,
};

interface Step {
  id: string;
  kind: StepKind;
  label: string;
  x?: number;
  y?: number;
  durationMs: number;
  status: "pending" | "running" | "done";
}

interface Session {
  id: string;
  name: string;
  url: string;
  when: string;
  status: "running" | "done" | "failed";
  steps: Step[];
}

const PSEUDO_COORDS: [number, number][] = [[32, 26], [58, 38], [45, 62], [70, 22], [36, 72], [50, 48]];

function kindFromLabel(label: string): StepKind {
  const l = label.toLowerCase();
  if (l.includes("click") || l.includes("tap")) return "click";
  if (l.includes("type") || l.includes("enter") || l.includes("fill")) return "type";
  if (l.includes("scroll")) return "scroll";
  if (l.includes("wait") || l.includes("load")) return "wait";
  if (l.includes("screenshot") || l.includes("capture")) return "screenshot";
  if (l.includes("extract") || l.includes("read")) return "extract";
  if (l.includes("assert") || l.includes("verify") || l.includes("check")) return "assert";
  if (l.includes("navigate") || l.includes("open") || l.includes("go to")) return "navigate";
  return "click";
}

function stepsFromPayload(steps: unknown, sessionId: string): Step[] {
  if (!Array.isArray(steps) || steps.length === 0) return [];
  return steps.slice(0, 24).map((raw, i) => {
    const label = typeof raw === "string" ? raw : String((raw as { label?: string })?.label ?? "step");
    const [x, y] = PSEUDO_COORDS[i % PSEUDO_COORDS.length];
    return {
      id: `${sessionId}-s${i}`,
      kind: kindFromLabel(label),
      label,
      x,
      y,
      durationMs: 750,
      status: "pending" as const,
    };
  });
}

export default function ComputerPanel() {
  const project = useForge((s) => s.activeProject);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  const active = sessions.find((s) => s.id === activeSession) ?? sessions[0] ?? null;
  const steps = active?.steps ?? [];
  const activeIdx = steps.findIndex((s) => s.status === "running" || s.status === "pending");
  const done = steps.filter((s) => s.status === "done").length;

  // derive sessions from live agent events
  useEffect(() => {
    if (!project) return;
    const s = getSocket();
    const handler = (e: { kind: string; payload: Record<string, unknown>; createdAt?: string }) => {
      if (e.kind !== "status") return;
      const p = e.payload as { type?: string; activity?: string; label?: string; url?: string; status?: string; steps?: unknown; sessionId?: string };
      if (p.type !== "computer") return;
      const id = p.sessionId || `sess-${e.createdAt ?? Date.now()}`;
      setSessions((prev) => {
        const existing = prev.find((x) => x.id === id);
        const steps = stepsFromPayload(p.steps, id);
        if (existing) {
          return prev.map((x) =>
            x.id === id
              ? { ...x, status: p.status === "done" ? "done" : p.status === "failed" ? "failed" : "running", steps: steps.length ? steps : x.steps }
              : x,
          );
        }
        const sess: Session = {
          id,
          name: p.activity || p.label || "Browser session",
          url: p.url || "sandbox browser",
          when: e.createdAt ?? new Date().toISOString(),
          status: p.status === "done" ? "done" : "running",
          steps: steps.length ? steps : [{ id: `${id}-s0`, kind: "navigate", label: p.activity || "Session started", durationMs: 800, status: "pending" }],
        };
        setActiveSession(id);
        return [sess, ...prev].slice(0, 12);
      });
    };
    s.on("agent:event", handler);
    return () => { s.off("agent:event", handler); };
  }, [project]);

  // playback engine (ported from the source UI)
  const timer = useRef<number | null>(null);
  const rippleId = useRef(0);
  const stepsRef = useRef(steps);
  const activeIdRef = useRef(active?.id);

  useEffect(() => {
    stepsRef.current = steps;
    activeIdRef.current = active?.id;
  }, [steps, active]);

  const setStepStatus = (sessionId: string, idx: number, status: Step["status"]) => {
    setSessions((prev) => prev.map((x) => (x.id === sessionId ? { ...x, steps: x.steps.map((st, i) => (i === idx ? { ...st, status } : st)) } : x)));
  };

  useEffect(() => {
    if (!playing || !activeIdRef.current) return;
    const sessionId = activeIdRef.current;
    const list = stepsRef.current;
    const nextIdx = list.findIndex((s) => s.status === "pending" || s.status === "running");
    const st = list[nextIdx];
    if (nextIdx === -1 || !st) {
      const stop = window.setTimeout(() => setPlaying(false), 0);
      return () => window.clearTimeout(stop);
    }

    let inner = 0;
    timer.current = window.setTimeout(() => {
      setStepStatus(sessionId, nextIdx, "running");
      if (st.x !== undefined && st.y !== undefined) {
        rippleId.current += 1;
        setRipple({ x: st.x, y: st.y, id: rippleId.current });
      }
      inner = window.setTimeout(() => {
        setStepStatus(sessionId, nextIdx, "done");
        if (nextIdx === list.length - 1) setPlaying(false);
      }, (st.durationMs * 0.7) / speed);
    }, (st.durationMs * 0.5) / speed);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      if (inner) window.clearTimeout(inner);
    };
  }, [playing, speed, done]);

  const jump = (i: number) => {
    if (!active) return;
    setPlaying(false);
    setSessions((prev) => prev.map((x) => (x.id === active.id ? { ...x, steps: x.steps.map((st, idx) => ({ ...st, status: idx <= i ? "done" : "pending" })) } : x)));
    setRipple(null);
  };

  const reset = () => {
    if (!active) return;
    setPlaying(false);
    setSessions((prev) => prev.map((x) => (x.id === active.id ? { ...x, steps: x.steps.map((st) => ({ ...st, status: "pending" })) } : x)));
    setRipple(null);
  };

  if (!project) return <div className="h-full min-w-0 flex-1 bg-paper-deep/40" />;

  const current = steps[activeIdx];

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-paper-deep/40">
      {/* bar */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line bg-cream px-3">
        <span className="flex h-7 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-[12px] font-semibold">
          <Globe size={13} className="text-[#2f6bff]" /> Agent browser
        </span>
        {sessions.length > 0 && (
          <button
            onClick={() => setListOpen(!listOpen)}
            className={cn("flex h-7 shrink-0 items-center gap-1.5 rounded-lg border px-2 text-[11px] font-semibold transition",
              listOpen ? "border-ink/25 bg-ink/[0.06] text-ink" : "border-line bg-card text-ink-soft hover:text-ink")}
            title="Switch between recorded sessions"
          >
            <History size={12} />
            <span className="hidden lg:inline">{active?.name ?? "Session"}</span>
            <ChevronDown size={11} className={cn("text-muted transition", listOpen && "rotate-180")} />
          </button>
        )}
        <span className="hidden items-center gap-1.5 rounded-full border border-line bg-card px-2 py-1 text-[11px] text-muted 2xl:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-moss" /> {active ? (active.status === "running" ? "session running" : "session ended") : "no session"}
        </span>
        {active && (
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setPlaying(!playing)} className="flex h-7 items-center gap-1.5 rounded-lg bg-ink px-2.5 text-[11.5px] font-semibold text-white transition hover:bg-stone-800">
              {playing ? <><Pause size={12} /> Pause</> : <><Play size={12} className="fill-current" /> Play</>}
            </button>
            <button onClick={() => jump(Math.min(Math.max(0, activeIdx), steps.length - 1))} className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-card text-ink-soft transition hover:text-ink" title="Step forward">
              <SkipForward size={13} />
            </button>
            <button onClick={reset} className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-card text-ink-soft transition hover:text-ink" title="Restart session">
              <RotateCcw size={13} />
            </button>
            <div className="flex items-center gap-0.5 rounded-lg border border-line bg-card p-0.5">
              {[1, 2, 4].map((s) => (
                <button key={s} onClick={() => setSpeed(s)} className={cn("h-6 rounded-md px-1.5 text-[11px] font-bold transition", speed === s ? "bg-ink text-white" : "text-muted hover:text-ink")}>
                  {s}×
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="max-w-sm rounded-2xl border border-line bg-card p-6 text-center shadow-sm">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-cream text-muted">
              <Globe size={19} />
            </span>
            <h3 className="mt-4 text-[14px] font-semibold">No browser sessions yet</h3>
            <p className="mx-auto mt-1.5 max-w-[280px] text-[11px] leading-relaxed text-muted">
              Ask the agent to use computer mode — every click, scroll and screenshot it takes in the sandbox browser
              shows up here as a replayable session.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1">
          {/* viewport */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-9 shrink-0 items-center gap-2 border-b border-line bg-cream px-3">
              <span className="flex gap-1">
                {["#ff6b5c", "#ffbd2e", "#28c840"].map((c) => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}
              </span>
              <div className="flex h-7 min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-card px-2.5">
                <span className="shrink-0 text-[10px] text-moss">🔒</span>
                <span className="truncate font-mono text-[11.5px]">{active.url}</span>
                {current?.status === "running" && <Loader2 size={11} className="ml-auto shrink-0 animate-spin text-clay" />}
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
              {/* placeholder viewport — recorded sessions render as a warm surface with agent overlays */}
              <div className="absolute inset-0" style={{ background: "radial-gradient(60% 45% at 50% 0%, #f6efe0 0%, #ffffff 70%)" }} />
              {ripple && (
                <span key={ripple.id} className="anim-fade-in absolute" style={{ left: `${ripple.x}%`, top: `${ripple.y}%` }}>
                  <span className="absolute -left-3 -top-3 h-6 w-6 animate-ping rounded-full border-2 border-clay/70 bg-clay/20" />
                  <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-clay shadow-md" />
                  <span className="absolute left-2 top-2 rounded-md bg-clay px-1.5 py-0.5 text-[9.5px] font-bold text-white shadow">agent</span>
                </span>
              )}
              {playing && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="flex items-center gap-2 rounded-full border border-line bg-card/95 px-3 py-1.5 text-[11px] font-semibold text-ink-soft shadow backdrop-blur">
                    <Loader2 size={11} className="animate-spin text-clay" /> replaying session…
                  </span>
                </div>
              )}
            </div>

            {/* current action strip */}
            <div className="flex h-[30px] shrink-0 items-center gap-2 border-t border-line bg-cream px-3 text-[11.5px]">
              {current ? (
                <>
                  {current.status === "running"
                    ? <Loader2 size={12} className="animate-spin text-clay" />
                    : <Check size={12} className="text-moss" />}
                  <span className="truncate font-medium text-ink">{current.label}</span>
                </>
              ) : (
                <span className="text-muted">Session idle — press Play to replay</span>
              )}
              <span className="ml-auto shrink-0 font-mono text-[10.5px] text-muted">{done}/{steps.length} steps</span>
            </div>
          </div>

          {/* session list */}
          {listOpen && (
            <div className="flex w-[264px] shrink-0 flex-col border-l border-line bg-cream">
              <div className="flex items-center gap-2 border-b border-line-soft px-3 py-2.5">
                <History size={12} className="shrink-0 text-muted" />
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Sessions</span>
                <span className="ml-auto rounded-full bg-black/[0.07] px-1.5 text-[10px] font-bold text-ink-soft">{sessions.length}</span>
                <button onClick={() => setListOpen(false)} className="flex h-5 w-5 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-ink"><X size={11} /></button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
                {sessions.map((sess) => {
                  const on = sess.id === active?.id;
                  return (
                    <button
                      key={sess.id}
                      onClick={() => { setActiveSession(sess.id); setListOpen(false); setPlaying(false); setRipple(null); }}
                      className={cn("mb-1 flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left transition",
                        on ? "border-ink/25 bg-ink/[0.05]" : "border-line bg-card hover:border-ink/20")}
                    >
                      <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                        sess.status === "done" ? "bg-moss" : sess.status === "running" ? "bg-clay working-dot" : "bg-clay/50")} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11.5px] font-semibold text-ink">{sess.name}</span>
                        <span className="block truncate font-mono text-[9.5px] text-muted">{sess.url}</span>
                        <span className="block text-[9.5px] text-faint">{sess.steps.length} steps · {clockTime(sess.when)}</span>
                      </span>
                      {on && <Check size={12} className="shrink-0 text-moss" />}
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-line px-3 py-2">
                <div className="flex items-center gap-1.5 text-[10.5px] text-muted">
                  <Circle size={9} className={cn(done === steps.length && steps.length > 0 ? "fill-moss text-moss" : "text-honey")} />
                  {steps.length > 0 && done === steps.length ? "Session complete" : "Waiting for agent actions"}
                </div>
              </div>
            </div>
          )}

          {/* step list */}
          <div className={cn("flex w-[264px] shrink-0 flex-col border-l border-line bg-cream", listOpen && "hidden")}>
            <div className="flex items-center justify-between px-3 pb-1.5 pt-2.5">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Action trace</span>
              <div className="h-1 w-16 overflow-hidden rounded-full bg-black/10">
                <div className="h-full rounded-full bg-ink transition-all duration-300" style={{ width: `${steps.length ? (done / steps.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-3">
              {steps.map((s, i) => {
                const Icon = STEP_ICON[s.kind] ?? MousePointerClick;
                const isRunning = s.status === "running";
                const isDone = s.status === "done";
                return (
                  <button
                    key={s.id}
                    onClick={() => jump(i)}
                    className={cn("flex w-full items-start gap-2.5 rounded-lg px-2 py-[7px] text-left transition",
                      s.status === "running" ? "bg-ink/[0.07]" : "hover:bg-black/[0.04]")}
                  >
                    <span className={cn("mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                      isRunning ? "bg-clay/15 text-clay" : isDone ? "bg-moss/15 text-moss" : "bg-black/[0.05] text-faint")}>
                      {isRunning ? <Loader2 size={11} className="animate-spin" /> : isDone ? <Check size={11} strokeWidth={3} /> : <Icon size={11} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-[12px]", isDone ? "text-ink" : isRunning ? "font-semibold text-ink" : "text-muted")}>
                        {s.label}
                      </span>
                      <span className="block truncate font-mono text-[10px] text-faint">{s.kind}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-faint">{(s.durationMs / 1000).toFixed(1)}s</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
