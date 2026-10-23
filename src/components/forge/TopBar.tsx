"use client";

// Ported from ai-agent-chat-interface-23 TopBar — project chrome: branch pill,
// save/agent status, version history (checkpoints), GitHub connect/publish, share & publish.

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  Cloud,
  FolderGit2,
  GitBranch,
  Globe,
  History,
  Link2,
  Loader2,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Share,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as api from "@/lib/api";
import { useForge } from "@/lib/store";
import type { CheckpointDTO, ComposerConfig } from "@/lib/types";

const AGENT_MODES: { id: ComposerConfig["agentMode"]; label: string; hint: string }[] = [
  { id: "plan", label: "Plan", hint: "Research and propose — no writes" },
  { id: "build", label: "Build", hint: "Full build with approval gates" },
  { id: "edit", label: "Edit", hint: "Targeted edits only" },
  { id: "auto", label: "Auto", hint: "Agent picks plan or build" },
  { id: "yolo", label: "Yolo", hint: "Auto-approve every action" },
];

function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const s = Math.max(1, Math.round((Date.now() - d) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export default function TopBar() {
  const activeProject = useForge((s) => s.activeProject);
  const gitStatus = useForge((s) => s.gitStatus);
  const checkpoints = useForge((s) => s.checkpoints);
  const isWorking = useForge((s) => s.isWorking);
  const setSidebarCollapsed = useForge((s) => s.setSidebarCollapsed);
  const setOverlay = useForge((s) => s.setOverlay);
  const setComposer = useForge((s) => s.setComposer);
  const composer = useForge((s) => s.composer);
  const patchProject = useForge((s) => s.patchProject);
  const refreshGit = useForge((s) => s.refreshGit);
  const refreshFileTree = useForge((s) => s.refreshFileTree);
  const bumpPreview = useForge((s) => s.bumpPreview);
  const toast = useForge((s) => s.toast);

  const [ghOpen, setGhOpen] = useState(false);
  const [ghForm, setGhForm] = useState(false);
  const [ghRepo, setGhRepo] = useState("");
  const [ghBranch, setGhBranch] = useState("main");
  const [ghToken, setGhToken] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [starred, setStarred] = useState(true);
  const [vOpen, setVOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);

  // prefill the publish form with whatever repo is already connected
  useEffect(() => {
    if (ghOpen && activeProject?.githubRepo && !ghRepo) {
      setGhRepo(activeProject.githubRepo);
      setGhBranch(activeProject.githubBranch || "main");
      setGhForm(true);
    }
  }, [ghOpen]);

  const current = checkpoints[0];
  const mode = AGENT_MODES.find((m) => m.id === composer.agentMode) ?? AGENT_MODES[1];

  const restore = async (cp: CheckpointDTO) => {
    const p = activeProject;
    if (!p) return;
    setVOpen(false);
    try {
      await api.gitRestore(p.id, cp.id);
      toast({ title: `Restored ${cp.label}`, description: "Workspace rolled back to this checkpoint", variant: "success" });
      void refreshGit();
      void refreshFileTree();
      bumpPreview();
    } catch (e) {
      toast({ title: "Restore failed", description: String(e), variant: "error" });
    }
  };

  const publishToGithub = async () => {
    const p = activeProject;
    if (!p || !ghRepo.trim()) return;
    setPublishing(true);
    try {
      const res = await api.githubPublish(p.id, {
        repo: ghRepo.trim(),
        branch: ghBranch.trim() || undefined,
        token: ghToken.trim() || undefined, // blank → saved settings token
      });
      toast({ title: "Pushed to GitHub", description: res.url ?? ghRepo.trim(), variant: "success" });
      setGhToken("");
      setGhOpen(false);
      void patchProject({ githubRepo: ghRepo.trim(), githubBranch: ghBranch.trim() || "main" });
    } catch (e) {
      toast({ title: "GitHub publish failed", description: String(e), variant: "error" });
    } finally {
      setPublishing(false);
    }
  };

  const pickAgentMode = (m: ComposerConfig["agentMode"]) => {
    setComposer({ agentMode: m });
    setModeOpen(false);
    if (activeProject) void patchProject({ agentMode: m });
  };

  return (
    <header className="relative z-30 flex h-[52px] shrink-0 items-center gap-2 border-b border-line bg-paper px-3">
      <button
        onClick={() => setSidebarCollapsed(!useForge.getState().sidebarCollapsed)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-black/5 hover:text-ink"
        title="Toggle sidebar (⌘B)"
      >
        <PanelLeft size={16} />
      </button>
      <button
        onClick={() => setStarred(!starred)}
        className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-black/5"
        title="Star project"
      >
        <Star size={15} className={starred ? "fill-honey text-honey" : "text-muted"} />
      </button>
      <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13.5px] font-semibold transition hover:bg-black/5">
        {activeProject?.title ?? "ZCode Builder"} <ChevronDown size={14} className="text-muted" />
      </button>
      <span className="hidden items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 text-[11px] font-medium text-muted md:flex">
        <GitBranch size={11} /> {gitStatus?.branch ?? "main"}
      </span>

      {/* agent mode switch */}
      <div className="relative">
        <button
          onClick={() => setModeOpen(!modeOpen)}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-[11.5px] font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink"
          title="Agent mode"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-clay" />
          {mode.label}
          <ChevronDown size={12} className="text-muted" />
        </button>
        {modeOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setModeOpen(false)} />
            <div className="anim-fade-up absolute left-0 z-50 mt-1.5 w-[240px] overflow-hidden rounded-xl border border-line bg-card p-1.5 shadow-xl">
              {AGENT_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => pickAgentMode(m.id)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-black/[0.04]",
                    m.id === composer.agentMode && "bg-black/[0.05]",
                  )}
                >
                  <Check
                    size={13}
                    className={cn("mt-0.5 shrink-0", m.id === composer.agentMode ? "text-moss" : "text-transparent")}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-semibold text-ink">{m.label}</span>
                    <span className="block text-[10.5px] leading-snug text-muted">{m.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <span className="hidden items-center gap-1.5 text-[11.5px] text-muted lg:flex">
        {isWorking ? (
          <>
            <span className="working-dot h-1.5 w-1.5 rounded-full bg-clay" /> Agent working…
          </>
        ) : (
          <>
            <Check size={12} className="text-moss" /> Saved
          </>
        )}
      </span>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          className="hidden h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium text-ink-soft transition hover:bg-black/5 hover:text-ink md:flex"
          title="Sync status"
        >
          <Cloud size={14} /> Synced
        </button>

        {/* version history */}
        <div className="relative">
          <button
            onClick={() => setVOpen(!vOpen)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-[12.5px] font-medium transition hover:border-ink/20"
          >
            <History size={14} className="text-muted" />
            {current?.label ?? "Latest"}
            <ChevronDown size={13} className="text-muted" />
          </button>
          {vOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setVOpen(false)} />
              <div className="anim-fade-up absolute right-0 z-50 mt-1.5 w-[300px] overflow-hidden rounded-xl border border-line bg-card shadow-xl">
                <p className="border-b border-line-soft px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Version history
                </p>
                <div className="max-h-[280px] overflow-y-auto p-1.5">
                  {checkpoints.length === 0 && (
                    <p className="px-2.5 py-6 text-center text-[12px] text-muted">
                      No checkpoints yet — one is saved after each run.
                    </p>
                  )}
                  {checkpoints.map((cp, i) => (
                    <button
                      key={cp.id}
                      onClick={() => void restore(cp)}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-black/[0.04]",
                        i === 0 && "bg-black/[0.05]",
                      )}
                    >
                      <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", i === 0 ? "bg-moss" : "bg-line")} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-[12.5px] font-semibold">
                          {cp.label}
                          {i === 0 && <span className="rounded bg-sage-bg px-1.5 py-0.5 text-[10px] font-bold text-moss">CURRENT</span>}
                        </span>
                        <span className="block truncate font-mono text-[10.5px] text-muted">
                          {cp.commitHash ?? cp.id}
                        </span>
                        <span className="text-[10.5px] text-faint">{relativeTime(cp.createdAt)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* github connect / publish */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setGhOpen(!ghOpen)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-[12px] font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink"
            title="Connect a GitHub repository"
          >
            <FolderGit2 size={13} /> <span className="hidden lg:inline">Connect</span>
          </button>
          {ghOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setGhOpen(false)} />
              <div className="anim-fade-up absolute right-0 z-50 mt-1.5 w-[292px] overflow-hidden rounded-xl border border-line bg-card shadow-2xl">
                <p className="border-b border-line-soft px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted">
                  GitHub
                </p>
                <div className="p-1.5">
                  <button
                    onClick={() => setGhForm(true)}
                    className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-black/[0.04]"
                  >
                    <Plus size={14} className="mt-0.5 shrink-0 text-clay" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold">Create new repository</span>
                      <span className="block text-[10.5px] leading-snug text-muted">
                        ZCode creates the repo, makes the first commit, and pushes there
                      </span>
                    </span>
                  </button>
                  <div className="my-1.5 border-t border-line-soft" />
                  <button
                    onClick={() => {
                      setGhOpen(false);
                      setOverlay("githubImportOpen", true);
                    }}
                    className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-black/[0.04]"
                  >
                    <Link2 size={14} className="mt-0.5 shrink-0 text-info" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold">Connect existing repo</span>
                      <span className="block text-[10.5px] leading-snug text-muted">
                        Import a repo URL and pick a branch to push to
                      </span>
                    </span>
                  </button>
                  {ghForm && (
                    <div className="mt-1 space-y-1.5 border-t border-line-soft px-1.5 pb-1 pt-2.5">
                      <input
                        value={ghRepo}
                        onChange={(e) => setGhRepo(e.target.value)}
                        placeholder="owner/repo"
                        className="h-8 w-full rounded-lg border border-line bg-cream px-2.5 font-mono text-[11.5px] outline-none focus:border-ink/30"
                      />
                      <input
                        value={ghBranch}
                        onChange={(e) => setGhBranch(e.target.value)}
                        placeholder="branch"
                        className="h-8 w-full rounded-lg border border-line bg-cream px-2.5 font-mono text-[11.5px] outline-none focus:border-ink/30"
                      />
                      <input
                        value={ghToken}
                        onChange={(e) => setGhToken(e.target.value)}
                        type="password"
                        placeholder="ghp_… (blank = saved token)"
                        className="h-8 w-full rounded-lg border border-line bg-cream px-2.5 font-mono text-[11.5px] outline-none focus:border-ink/30"
                      />
                      <button
                        onClick={() => void publishToGithub()}
                        disabled={publishing || !ghRepo.trim()}
                        className={cn(
                          "flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-[12px] font-semibold text-white transition",
                          publishing || !ghRepo.trim() ? "bg-black/[0.07] text-faint" : "bg-ink hover:bg-stone-800",
                        )}
                      >
                        {publishing ? (
                          <>
                            <Loader2 size={12} className="animate-spin" /> Pushing…
                          </>
                        ) : (
                          <>
                            <Globe size={12} /> Publish
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 border-t border-line-soft bg-cream px-3 py-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-clay text-[8px] font-bold text-white">
                    Z
                  </span>
                  <span className="truncate font-mono text-[10.5px] font-medium text-ink-soft">
                    {activeProject?.githubRepo ?? "not connected"}
                  </span>
                  {activeProject?.githubRepo && (
                    <span className="ml-auto flex items-center gap-1 text-[9.5px] font-bold text-moss">
                      <Check size={9} /> connected
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setOverlay("commandOpen", true)}
          className="hidden h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-black/5 hover:text-ink sm:flex"
          title="Command menu (⌘K)"
        >
          <MoreHorizontal size={16} />
        </button>
        <button
          onClick={() => setOverlay("shareOpen", true)}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-[12.5px] font-semibold transition hover:border-ink/20"
        >
          <Share size={13} /> Share
        </button>
        <button
          onClick={() => setOverlay("githubImportOpen", true)}
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-line bg-card transition hover:border-ink/20"
          title="Repository"
        >
          <FolderGit2 size={14} />
        </button>
        <button
          onClick={() => setOverlay("publishOpen", true)}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-stone-800"
        >
          <Globe size={13} /> Publish
        </button>
      </div>
    </header>
  );
}
