"use client";

// Forge workspace — the right pane. Owns the surface tab bar (Preview / Code /
// Git / Database / Terminal / Computer / Console / Stream + Jobs + Artifacts),
// the collapse rails, the agent activity pill, the bottom TERMINAL/PROBLEMS
// panel, the dev-server gate and the swarm (Jobs) + Artifacts surfaces.

import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Eye, Code2, TerminalSquare, X, ChevronUp, CheckCircle2, CircleAlert, Lightbulb,
  Loader2, GitBranch, Database, Terminal, Globe, Bug, PanelRightClose, PanelRightOpen,
  MonitorPlay, Waypoints, Package, Play, Square, RefreshCw, FileCode2, FileText,
  Image as ImageIcon, Users, ListTree, Clock, Download, Server,
} from "lucide-react";
import dynamic from "next/dynamic";
import * as api from "@/lib/api";
import { useForge, type ConsoleEntry, type WorkspaceMode } from "@/lib/store";
import type { ArtifactDTO, SwarmTaskDTO } from "@/lib/types";
import { cn, relTime, formatBytes } from "./forge-utils";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";
import PreviewPane from "./PreviewPane";
import GitPanel from "./GitPanel";
import DatabasePanel from "./DatabasePanel";
import CmdPanel from "./CmdPanel";
import ConsolePanel from "./ConsolePanel";
import ComputerPanel from "./ComputerPanel";
import X11Stream from "./X11Stream";
import ServerStopped from "./ServerStopped";

// ArtifactPreview is owned by another agent (chat-side artifacts). Loaded lazily
// to avoid circular imports; wrapped in an error boundary so a signature drift
// degrades to a fallback card instead of breaking the workspace.
const ArtifactPreview = dynamic(
  () => import("./ArtifactPreview").then((m) => m.ArtifactPreview),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <span className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-3 text-[12.5px] font-semibold text-ink shadow-xl">
          <Loader2 size={14} className="animate-spin text-clay" /> Opening preview…
        </span>
      </div>
    ),
  },
);

class PreviewBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-line bg-card p-4 text-center text-[12px] text-muted">
          Preview could not be opened. The file is available via the download link on its card.
        </div>
      );
    }
    return this.props.children;
  }
}

const TABS: { id: WorkspaceMode; label: string; icon: typeof Eye; hint: string; compact?: boolean }[] = [
  { id: "preview", label: "Preview", icon: Eye, hint: "Preview — your running app, updates on every edit" },
  { id: "code", label: "Code", icon: Code2, hint: "Code — file explorer plus editor, every file editable" },
  { id: "git", label: "Git", icon: GitBranch, hint: "Git — commits, branches, diffs and checkpoints" },
  { id: "database", label: "Database", icon: Database, hint: "Database — sqlite files in the workspace with a SQL runner" },
  { id: "terminal", label: "Terminal", icon: Terminal, hint: "Terminal — run commands yourself in the sandbox", compact: true },
  { id: "browser", label: "Computer", icon: Globe, hint: "Computer — watch the agent drive a real browser", compact: true },
  { id: "console", label: "Console", icon: Bug, hint: "Console — runtime errors from the sandbox, fixable by the agent", compact: true },
  { id: "stream", label: "Stream", icon: MonitorPlay, hint: "Stream — attach to a live X11 display", compact: true },
  { id: "jobs", label: "Jobs", icon: Waypoints, hint: "Jobs — swarm runs: lanes, workers and the event feed" },
  { id: "artifacts", label: "Artifacts", icon: Package, hint: "Artifacts — files the agent produced" },
];

/* ------------------------------------------------------------------ */
/*  Jobs (swarm) — lanes × workers × event feed over store.swarmRun    */
/* ------------------------------------------------------------------ */

function taskTone(status: string) {
  const s = status.toLowerCase();
  if (["done", "complete", "completed"].includes(s)) return "bg-moss/15 text-moss";
  if (["running", "claimed", "in_progress", "active"].includes(s)) return "bg-clay/15 text-clay";
  if (["failed", "error"].includes(s)) return "bg-clay/20 text-clay";
  if (["verify", "verifying", "review"].includes(s)) return "bg-honey/15 text-honey";
  return "bg-black/[0.07] text-ink-soft";
}

function TaskCard({ t }: { t: SwarmTaskDTO }) {
  return (
    <div className="rounded-lg border border-line bg-card p-2 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className={cn("rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide", taskTone(t.status))}>{t.status}</span>
        {t.attempts > 1 && <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[8.5px] font-bold text-ink-soft">×{t.attempts}</span>}
        {t.dependsOn.length > 0 && <span className="ml-auto font-mono text-[8.5px] text-faint">← {t.dependsOn.length} dep{t.dependsOn.length > 1 ? "s" : ""}</span>}
      </div>
      <p className="mt-1.5 line-clamp-2 text-[11.5px] font-semibold leading-snug text-ink">{t.subject}</p>
      {t.description && <p className="mt-0.5 line-clamp-2 text-[9.5px] leading-relaxed text-muted">{t.description}</p>}
      <div className="mt-1.5 flex items-center gap-1.5">
        {t.role && <span className="rounded bg-honey/10 px-1.5 py-0.5 text-[8.5px] font-bold text-honey">{t.role}</span>}
        {t.filePaths.length > 0 && <span className="truncate font-mono text-[8.5px] text-faint">{t.filePaths[0]}{t.filePaths.length > 1 ? ` +${t.filePaths.length - 1}` : ""}</span>}
      </div>
      {t.error && <p className="mt-1 line-clamp-2 rounded bg-clay/[0.07] px-1.5 py-1 text-[9px] text-clay">{t.error}</p>}
    </div>
  );
}

function JobsPanel() {
  const project = useForge((s) => s.activeProject);
  const swarmRun = useForge((s) => s.swarmRun);
  const isWorking = useForge((s) => s.isWorking);
  const patchProject = useForge((s) => s.patchProject);
  const refreshSwarm = useForge((s) => s.refreshSwarm);
  const toast = useForge((s) => s.toast);

  const [goal, setGoal] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => { void refreshSwarm(); }, [refreshSwarm]);
  useEffect(() => { if (swarmRun?.goal && !goal) setGoal(swarmRun.goal); }, [swarmRun?.goal, goal]);

  const run = swarmRun;
  const tasks = run?.tasks ?? [];
  const lanes = useMemo(() => {
    const map = new Map<string, SwarmTaskDTO[]>();
    for (const t of tasks) {
      const key = t.lane || "default";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries());
  }, [tasks]);
  const doneCount = tasks.filter((t) => ["done", "complete", "completed"].includes(t.status.toLowerCase())).length;
  const running = run ? ["running", "planning", "executing", "verifying"].includes(run.status.toLowerCase()) : false;

  if (!project) return null;

  const start = async () => {
    if (!goal.trim() || starting || isWorking) return;
    setStarting(true);
    try {
      await api.swarmStart(project.id, goal.trim());
      toast({ title: "Swarm started", description: goal.trim() });
      await refreshSwarm();
    } catch (e) {
      toast({ title: "Could not start swarm", description: String(e), variant: "error" });
    } finally {
      setStarting(false);
    }
  };

  const stop = async () => {
    try {
      await api.swarmStop(project.id);
      toast({ title: "Swarm stopping…" });
      await refreshSwarm();
    } catch (e) {
      toast({ title: "Could not stop swarm", description: String(e), variant: "error" });
    }
  };

  if (!project.swarmEnabled) {
    return (
      <div className="flex h-full min-w-0 flex-1 items-center justify-center bg-cream">
        <div className="max-w-sm rounded-2xl border border-line bg-card p-6 text-center shadow-sm">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-cream text-muted">
            <Waypoints size={19} />
          </span>
          <h3 className="mt-4 text-[14px] font-semibold">Swarm is off for this project</h3>
          <p className="mx-auto mt-1.5 max-w-[300px] text-[11px] leading-relaxed text-muted">
            Jobs lets the agent fan work out to a swarm of workers — planning lanes, parallel task cards and an
            evidence-gated verify phase. Enable it to unlock the Jobs tab.
          </p>
          <button
            onClick={() => { void patchProject({ swarmEnabled: true }); toast({ title: "Swarm enabled", description: "Jobs are live for this project" }); }}
            className="mx-auto mt-4 flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-[10.5px] font-semibold text-white transition hover:bg-stone-800"
          >
            <Play size={11} className="fill-current" /> Enable swarm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-cream">
      {/* run bar */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line px-3">
        <span className="flex h-7 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-[12px] font-semibold">
          <Waypoints size={13} className="text-clay" /> Swarm
        </span>
        {run ? (
          <span className={cn("flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[10.5px] font-bold", taskTone(run.status))}>
            {running && <span className="working-dot h-1.5 w-1.5 rounded-full bg-current" />} run {run.status}
          </span>
        ) : (
          <span className="hidden items-center gap-1.5 rounded-full border border-line bg-card px-2 py-1 text-[11px] text-muted lg:flex">
            <Server size={10} /> no active run
          </span>
        )}
        {run && tasks.length > 0 && (
          <span className="hidden items-center gap-2 lg:flex">
            <span className="h-1.5 w-24 overflow-hidden rounded-full bg-black/10">
              <span className="block h-full rounded-full bg-moss transition-all" style={{ width: `${(doneCount / tasks.length) * 100}%` }} />
            </span>
            <span className="font-mono text-[10px] text-muted">{doneCount}/{tasks.length} tasks</span>
          </span>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void start(); }}
            disabled={running || isWorking}
            placeholder={run?.goal || "Goal for the swarm, e.g. “build the settings page”…"}
            className="h-8 w-[280px] rounded-lg border border-line bg-card px-2.5 text-[11.5px] outline-none transition focus:border-ink/30 placeholder:text-faint disabled:opacity-50"
          />
          {running ? (
            <button onClick={() => void stop()} className="flex h-8 items-center gap-1.5 rounded-lg bg-clay px-2.5 text-[11.5px] font-semibold text-white transition hover:opacity-90">
              <Square size={11} /> Stop
            </button>
          ) : (
            <button
              onClick={() => void start()}
              disabled={!goal.trim() || starting || isWorking}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-ink px-2.5 text-[11.5px] font-semibold text-white transition hover:bg-stone-800 disabled:opacity-40"
            >
              {starting ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} className="fill-current" />} Start run
            </button>
          )}
        </div>
      </div>

      {!run ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="max-w-sm text-center">
            <ListTree size={22} className="mx-auto text-faint" />
            <p className="mt-3 text-[13px] font-medium text-ink-soft">No swarm run yet</p>
            <p className="mx-auto mt-1 max-w-[300px] text-[11px] leading-relaxed text-muted">
              Give the swarm a goal above. Workers get planned into lanes, execute in parallel and land evidence-gated
              completions.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1">
          {/* lanes */}
          <div className="min-h-0 flex-1 overflow-auto p-3">
            {lanes.length === 0 ? (
              <p className="py-8 text-center text-[12px] text-muted">Planning tasks…</p>
            ) : (
              <div className="flex gap-3">
                {lanes.map(([lane, laneTasks]) => (
                  <div key={lane} className="w-[228px] shrink-0">
                    <div className="mb-1.5 flex items-center gap-1.5 px-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-clay" />
                      <span className="truncate text-[10.5px] font-bold uppercase tracking-wider text-ink-soft">{lane}</span>
                      <span className="ml-auto rounded-full bg-black/[0.07] px-1.5 text-[9.5px] font-bold text-ink-soft">{laneTasks.length}</span>
                    </div>
                    <div className="space-y-2 rounded-xl border border-line-soft bg-paper/60 p-1.5">
                      {laneTasks.map((t) => <TaskCard key={t.id} t={t} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* workers + events */}
          <div className="flex w-[300px] shrink-0 flex-col border-l border-line bg-paper/60">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="flex items-center gap-1.5 border-b border-line-soft px-3 py-2">
                <Users size={11} className="text-muted" />
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Workers · {run.workers.length}</span>
              </div>
              {run.workers.length === 0 && <p className="px-3 py-2 text-[10.5px] text-faint">No workers spawned yet.</p>}
              {run.workers.map((w) => (
                <div key={w.id} className="flex items-start gap-2 border-b border-line-soft px-3 py-2">
                  <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", taskTone(w.status).includes("moss") ? "bg-moss" : taskTone(w.status).includes("clay") ? "bg-clay working-dot" : "bg-faint")} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-semibold text-ink">{w.slug}</p>
                    <p className="truncate text-[9.5px] text-muted">{w.role} · {w.status}</p>
                    {w.currentTask && <p className="mt-0.5 truncate text-[9.5px] text-honey">→ {w.currentTask}</p>}
                  </div>
                </div>
              ))}

              <div className="mt-2 flex items-center gap-1.5 border-y border-line-soft px-3 py-2">
                <Clock size={11} className="text-muted" />
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Event feed</span>
              </div>
              {run.events.length === 0 && <p className="px-3 py-2 text-[10.5px] text-faint">No events yet.</p>}
              {[...run.events].slice(-40).reverse().map((ev) => (
                <div key={ev.id} className="flex items-baseline gap-2 border-b border-line-soft px-3 py-1.5">
                  <span className="shrink-0 rounded bg-black/[0.06] px-1 py-0.5 font-mono text-[8.5px] font-bold text-ink-soft">{ev.type}</span>
                  <span className="ml-auto shrink-0 text-[9px] text-faint">{relTime(ev.createdAt)}</span>
                </div>
              ))}
            </div>
            {run.summary && (
              <div className="border-t border-line px-3 py-2">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Summary</p>
                <p className="mt-1 line-clamp-4 text-[11px] leading-relaxed text-ink-soft">{run.summary}</p>
              </div>
            )}
            {run.error && (
              <div className="border-t border-clay/25 bg-clay/[0.06] px-3 py-2">
                <p className="text-[10.5px] font-bold text-clay">Run error</p>
                <p className="mt-0.5 line-clamp-3 text-[10.5px] text-clay">{run.error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Artifacts — grid of ArtifactCards over store.artifacts             */
/* ------------------------------------------------------------------ */

function artifactIcon(a: ArtifactDTO) {
  const m = `${a.mime} ${a.type}`.toLowerCase();
  if (m.includes("image") || m.includes("png") || m.includes("jpeg") || m.includes("svg")) return ImageIcon;
  if (m.includes("zip") || m.includes("tar") || m.includes("gzip") || m.includes("archive")) return Package;
  if (m.includes("json") || m.includes("javascript") || m.includes("typescript") || m.includes("html") || m.includes("css")) return FileCode2;
  if (m.includes("video") || m.includes("stream")) return MonitorPlay;
  return FileText;
}

function ArtifactsGrid() {
  const project = useForge((s) => s.activeProject);
  const artifacts = useForge((s) => s.artifacts);
  const refreshArtifacts = useForge((s) => s.refreshArtifacts);
  const [open, setOpen] = useState<ArtifactDTO | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { void refreshArtifacts(); }, [refreshArtifacts]);

  if (!project) return null;

  const doRefresh = async () => {
    setRefreshing(true);
    await refreshArtifacts();
    setRefreshing(false);
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-cream">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line px-3">
        <span className="flex h-7 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-[12px] font-semibold">
          <Package size={13} className="text-honey" /> Artifacts
        </span>
        <span className="hidden items-center gap-1.5 rounded-full border border-line bg-card px-2 py-1 text-[11px] text-muted lg:flex">
          {artifacts.length} file{artifacts.length === 1 ? "" : "s"} produced by the agent
        </span>
        <button onClick={() => void doRefresh()} className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink" title="Rescan artifacts">
          {refreshing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {artifacts.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm text-center">
              <Package size={22} className="mx-auto text-faint" />
              <p className="mt-3 text-[13px] font-medium text-ink-soft">No artifacts yet</p>
              <p className="mx-auto mt-1 max-w-[300px] text-[11px] leading-relaxed text-muted">
                Screenshots, generated files, bundles and reports the agent produces during runs are collected here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-2.5">
            {artifacts.map((a) => {
              const Icon = artifactIcon(a);
              return (
                <div key={a.id} className="anim-fade-up overflow-hidden rounded-xl border border-line bg-card transition hover:border-ink/25 hover:shadow-md">
                  <button onClick={() => setOpen(a)} className="flex w-full items-center gap-2 border-b border-line-soft px-3 py-2 text-left">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-honey/10 text-honey">
                      <Icon size={13} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold text-ink">{a.name}</span>
                      <span className="block truncate font-mono text-[9.5px] text-muted">{a.path}</span>
                    </span>
                  </button>
                  <div className="flex items-center gap-1.5 px-3 py-1.5">
                    <span className="truncate rounded bg-black/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-soft">{a.type}</span>
                    <span className="font-mono text-[9.5px] text-faint">{formatBytes(a.size)}</span>
                    <span className="ml-auto shrink-0 text-[9px] text-faint">{relTime(a.createdAt)}</span>
                    <a
                      href={api.artifactRawUrl(project.id, a.path)}
                      download={a.name}
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink"
                      title="Download"
                    >
                      <Download size={11} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {open && (
        <PreviewBoundary>
          <ArtifactPreview artifact={open} projectId={project.id} open onClose={() => setOpen(null)} />
        </PreviewBoundary>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Workspace shell                                                    */
/* ------------------------------------------------------------------ */

function termTone(e: ConsoleEntry) {
  if (e.level === "error") return "text-[#ff9c8a]";
  if (e.level === "warn") return "text-[#e8c47a]";
  if (e.text.startsWith("✓") || e.text.startsWith("✔")) return "text-[#7fc98a]";
  if (e.text.startsWith("$") || e.text.startsWith("➜") || e.text.startsWith("❯")) return "text-[#e8c47a]";
  if (e.text.startsWith("▲") || e.text.startsWith("○")) return "text-white/40";
  return "text-white/80";
}

export default function Workspace() {
  const project = useForge((s) => s.activeProject);
  const wsMode = useForge((s) => s.wsMode);
  const wsCollapsed = useForge((s) => s.wsCollapsed);
  const setWsMode = useForge((s) => s.setWsMode);
  const setWsCollapsed = useForge((s) => s.setWsCollapsed);
  const isWorking = useForge((s) => s.isWorking);
  const agentActivity = useForge((s) => s.agentActivity);
  const devServer = useForge((s) => s.devServer);
  const consoleEntries = useForge((s) => s.consoleEntries);
  const send = useForge((s) => s.send);
  const toast = useForge((s) => s.toast);

  const [hidden, setHidden] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [termTab, setTermTab] = useState<"terminal" | "problems">("terminal");
  const [fixedIds, setFixedIds] = useState<Set<string>>(new Set());
  const [starting, setStarting] = useState(false);

  const errorCount = useMemo(
    () => consoleEntries.filter((e) => e.level === "error" && !fixedIds.has(e.id) && !e.fixed).length,
    [consoleEntries, fixedIds],
  );

  const startDevServer = async () => {
    if (!project || starting) return;
    setStarting(true);
    try {
      await api.devServerAction(project.id, "start");
      toast({ title: "Starting dev server…", description: "The preview goes live automatically when it is ready." });
    } catch (e) {
      toast({ title: "Could not start dev server", description: String(e), variant: "error" });
    } finally {
      setStarting(false);
    }
  };

  const handleFix = async (entries: ConsoleEntry[]) => {
    if (entries.length === 0 || isWorking) {
      if (isWorking) toast({ title: "Agent is busy", description: "Wait for the current run to finish, then try again." });
      return;
    }
    setFixedIds((prev) => new Set([...prev, ...entries.map((e) => e.id)]));
    const text = entries.length === 1
      ? `Fix this error: ${entries[0].text}`
      : `Fix these errors:\n${entries.map((e) => `- ${e.text}`).join("\n")}`;
    await send(text);
    toast({ title: "Sent to agent", description: entries.length === 1 ? "The chat is on this error" : `${entries.length} errors sent` });
  };

  const gated = devServer.status === "stopped" && wsMode === "preview" && project?.mode !== "design";
  const activeTab = TABS.find((t) => t.id === wsMode);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-card">
      {/* hidden: thin rail that re-expands the workspace */}
      {hidden ? (
        <button
          onClick={() => setHidden(false)}
          className="flex w-11 shrink-0 flex-col items-center gap-2 border-l border-line bg-cream pt-4 text-muted transition hover:text-ink"
          title="Expand workspace"
        >
          <PanelRightOpen size={16} />
          <span className="text-[9.5px] font-bold [writing-mode:vertical-lr]">WORKSPACE</span>
        </button>
      ) : wsCollapsed ? (
        <div className="flex h-full w-[46px] shrink-0 flex-col items-center border-r border-line bg-paper py-2">
          <button
            onClick={() => setWsCollapsed(false)}
            title="Expand panel"
            className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-black/5 hover:text-ink"
          >
            <PanelRightOpen size={15} />
          </button>
          <div className="flex flex-1 flex-col items-center gap-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = wsMode === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setWsMode(t.id); setWsCollapsed(false); }}
                  title={t.hint}
                  className={cn("relative flex h-8 w-8 items-center justify-center rounded-lg transition",
                    active ? "bg-ink text-white" : "text-ink-soft hover:bg-black/5 hover:text-ink")}
                >
                  <Icon size={15} />
                  {t.id === "console" && errorCount > 0 && (
                    <span className={cn("absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1 text-[8px] font-bold",
                      active ? "bg-white text-ink" : "bg-clay text-white")}>{errorCount}</span>
                  )}
                </button>
              );
            })}
          </div>
          <span className="text-[9.5px] font-bold text-faint [writing-mode:vertical-lr]">{activeTab?.label}</span>
        </div>
      ) : (
        <>
          {/* workspace header */}
          <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-line bg-paper px-3">
            <div className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-xl border border-line bg-card p-1" role="tablist" aria-label="Workspace surface">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = wsMode === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setWsMode(t.id)}
                    title={t.hint}
                    className={cn("flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-semibold transition sm:px-3",
                      active ? "bg-ink text-white shadow-sm" : "text-ink-soft hover:bg-black/5 hover:text-ink")}
                  >
                    <Icon size={14} />
                    <span className={cn(t.compact && "hidden lg:inline")}>{t.label}</span>
                    {t.id === "console" && errorCount > 0 && (
                      <span className={cn("rounded-full px-1.5 text-[10px] font-bold", active ? "bg-white/20 text-white" : "bg-black/[0.07] text-ink-soft")}>
                        {errorCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <span className="hidden shrink-0 text-[11.5px] text-faint 2xl:block">{activeTab?.hint}</span>

            <button
              onClick={() => setHidden(true)}
              title="Hide workspace panel"
              className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-black/5 hover:text-ink"
            >
              <PanelRightClose size={15} />
            </button>

            {/* agent activity */}
            <div className="ml-auto flex min-w-0 items-center gap-2">
              {isWorking && agentActivity && (
                <div className="anim-fade-in hidden min-w-0 items-center gap-2 rounded-full border border-line bg-cream px-3 py-1.5 lg:flex">
                  <Loader2 size={12} className="shrink-0 animate-spin text-clay" />
                  <span className="truncate text-[11.5px] font-medium text-ink-soft">{agentActivity}</span>
                </div>
              )}
              <button
                onClick={() => setTermOpen(!termOpen)}
                title="Toggle terminal"
                className={cn("flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-semibold transition",
                  termOpen ? "border-ink/30 bg-ink/[0.06] text-ink" : "border-line bg-card text-ink-soft hover:text-ink")}
              >
                <TerminalSquare size={14} />
                <span className="hidden sm:inline">Terminal</span>
              </button>
            </div>
          </div>

          {/* one-time explainer */}
          {!hintDismissed && (
            <div className="anim-fade-in flex shrink-0 items-center gap-2.5 border-b border-line-soft bg-[#faf6ec] px-4 py-2">
              <Lightbulb size={14} className="shrink-0 text-honey" />
              <p className="min-w-0 flex-1 truncate text-[12px] text-ink-soft">
                <strong className="font-semibold text-ink">Preview</strong> is your running app ·
                <strong className="font-semibold text-ink"> Code</strong> is files + editor ·
                <strong className="font-semibold text-ink"> Git</strong>, <strong className="font-semibold text-ink">Database</strong>,{" "}
                <strong className="font-semibold text-ink">Terminal</strong> and <strong className="font-semibold text-ink">Computer</strong> are the project&apos;s real tooling ·
                <strong className="font-semibold text-ink"> Jobs</strong> runs the swarm · <strong className="font-semibold text-ink">Artifacts</strong> collects what it made.
              </p>
              <button onClick={() => setHintDismissed(true)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted hover:bg-black/5 hover:text-ink">
                <X size={13} />
              </button>
            </div>
          )}

          {/* body */}
          <div className="flex min-h-0 flex-1">
            {gated ? (
              <ServerStopped
                port={devServer.port}
                starting={starting || devServer.status === "starting"}
                error={devServer.error}
                runtime={project?.sandboxRuntime}
                onStart={() => void startDevServer()}
              />
            ) : (
              <>
                {wsMode === "preview" && <PreviewPane />}
                {wsMode === "code" && (
                  <div className="flex min-h-0 min-w-0 flex-1">
                    <FileExplorer />
                    <CodeEditor />
                  </div>
                )}
                {wsMode === "git" && <GitPanel />}
                {wsMode === "database" && <DatabasePanel />}
                {wsMode === "terminal" && <CmdPanel />}
                {wsMode === "browser" && <ComputerPanel />}
                {wsMode === "console" && <ConsolePanel fixedIds={fixedIds} fixing={isWorking} onFix={(entries) => void handleFix(entries)} />}
                {wsMode === "stream" && <X11Stream />}
                {wsMode === "jobs" && <JobsPanel />}
                {wsMode === "artifacts" && <ArtifactsGrid />}
              </>
            )}
          </div>

          {/* bottom panel: terminal / problems */}
          {termOpen && (
            <div className="anim-fade-in flex h-[168px] shrink-0 flex-col border-t border-line bg-[#211d1a] text-[12px]">
              <div className="flex h-9 items-center gap-1 border-b border-white/10 px-3">
                <button
                  onClick={() => setTermTab("terminal")}
                  className={cn("flex h-7 items-center gap-1.5 rounded-md px-2.5 font-mono text-[11px] font-semibold transition",
                    termTab === "terminal" ? "bg-white/10 text-white" : "text-white/50 hover:text-white")}
                >
                  <TerminalSquare size={12} /> TERMINAL
                </button>
                <button
                  onClick={() => setTermTab("problems")}
                  className={cn("flex h-7 items-center gap-1.5 rounded-md px-2.5 font-mono text-[11px] font-semibold transition",
                    termTab === "problems" ? "bg-white/10 text-white" : "text-white/50 hover:text-white")}
                >
                  <CircleAlert size={12} /> PROBLEMS
                  <span className="rounded bg-white/10 px-1.5 text-[10px]">{errorCount}</span>
                </button>
                <span className="ml-2 hidden font-mono text-[10.5px] text-white/35 sm:block">
                  sandbox — {project?.title?.toLowerCase().replace(/\s+/g, "-").slice(0, 24) ?? "workspace"}
                </span>
                <button onClick={() => setTermOpen(false)} className="ml-auto flex h-6 w-6 items-center justify-center rounded text-white/50 hover:bg-white/10 hover:text-white">
                  <ChevronUp size={14} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2.5 font-mono text-[11.5px] leading-[1.75]">
                {termTab === "terminal" ? (
                  <>
                    {consoleEntries.slice(-60).map((e) => (
                      <div key={e.id} className={cn("whitespace-pre-wrap", termTone(e))}>{e.text}</div>
                    ))}
                    {consoleEntries.length === 0 && (
                      <div className="flex items-center gap-2 text-white/50">
                        <Server size={13} /> Dev-server and command output will stream here.
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-white/80">
                      <span className="text-[#7fc98a]">➜</span>
                      <span className="text-[#8ab8ff]">sandbox</span>
                      <span className="stream-caret" />
                    </div>
                  </>
                ) : errorCount === 0 ? (
                  <div className="flex h-full items-center gap-2.5 text-white/60">
                    <CheckCircle2 size={15} className="text-[#7fc98a]" />
                    No problems detected. Runtime errors from the sandbox will show up here.
                  </div>
                ) : (
                  consoleEntries
                    .filter((e) => e.level === "error" && !fixedIds.has(e.id) && !e.fixed)
                    .map((e) => (
                      <div key={e.id} className="flex items-start gap-2 border-b border-white/[0.06] py-1.5">
                        <CircleAlert size={12} className="mt-[3px] shrink-0 text-[#ff9c8a]" />
                        <span className="min-w-0 flex-1 whitespace-pre-wrap text-[#ffc9bd]">{e.text}</span>
                        <button
                          onClick={() => void handleFix([e])}
                          className="shrink-0 rounded-md bg-[#faf7f0] px-2 py-0.5 text-[10px] font-bold text-[#211d1a] transition hover:bg-white"
                        >
                          Fix
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
