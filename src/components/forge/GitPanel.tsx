"use client";

// Forge workspace — Git panel wired to the real git service:
// branch/status from api.gitStatus, history from store.gitLog, commit via
// api.gitCommit, per-file diffs via api.gitDiff, checkpoints via
// api.gitCheckpoint / api.gitRestore. Push/Pull/Fetch are honest stubs for now.

import { useMemo, useState } from "react";
import {
  GitBranch, GitCommitHorizontal, GitMerge, GitPullRequest, GitCompare, FileDiff,
  Upload, Download, RotateCw, Undo2, Check, Search, CircleDot, Lock,
  Loader2, BookmarkPlus, History, X,
} from "lucide-react";
import * as api from "@/lib/api";
import { useForge } from "@/lib/store";
import { cn, relTime } from "./forge-utils";

const BRANCH_COLORS = ["#b4532a", "#5b6b4c", "#2f6bff", "#c98a2d", "#7c3aed"];

function statusColor(s: string) {
  if (s === "A" || s === "??") return "text-moss";
  if (s === "D") return "text-clay";
  if (s === "R" || s === "U") return "text-[#2f6bff]";
  return "text-honey";
}

function statusLabel(s: string) {
  return s === "??" ? "U" : s;
}

type DiffRow = { t: "add" | "del" | "ctx" | "meta" | "hunk"; s: string };

function parseDiff(diff: string): DiffRow[] {
  const rows = diff.split("\n");
  if (rows.length && rows[rows.length - 1] === "") rows.pop();
  return rows.map((l): DiffRow => {
    if (l.startsWith("+++") || l.startsWith("---") || l.startsWith("diff ") || l.startsWith("index ") || l.startsWith("new file") || l.startsWith("deleted file")) return { t: "meta", s: l };
    if (l.startsWith("@@")) return { t: "hunk", s: l };
    if (l.startsWith("+")) return { t: "add", s: l.slice(1) };
    if (l.startsWith("-")) return { t: "del", s: l.slice(1) };
    return { t: "ctx", s: l.replace(/^ /, "") };
  });
}

export default function GitPanel() {
  const project = useForge((s) => s.activeProject);
  const gitStatus = useForge((s) => s.gitStatus);
  const gitLog = useForge((s) => s.gitLog);
  const checkpoints = useForge((s) => s.checkpoints);
  const toast = useForge((s) => s.toast);
  const refreshGit = useForge((s) => s.refreshGit);
  const bumpPreview = useForge((s) => s.bumpPreview);
  const setOverlay = useForge((s) => s.setOverlay);

  const [msg, setMsg] = useState("");
  const [branchOpen, setBranchOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [committing, setCommitting] = useState(false);
  const [checkpointing, setCheckpointing] = useState(false);
  const [diffPath, setDiffPath] = useState<string | null>(null);
  const [diffRows, setDiffRows] = useState<DiffRow[]>([]);
  const [diffLoading, setDiffLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);

  const projectId = project?.id ?? "";
  const branch = gitStatus?.branch ?? "main";
  const ahead = gitStatus?.ahead ?? 0;
  const behind = gitStatus?.behind ?? 0;
  const staged = gitStatus?.staged ?? [];
  const unstaged = gitStatus?.unstaged ?? [];
  const untracked = gitStatus?.untracked ?? [];
  const changeCount = staged.length + unstaged.length + untracked.length;

  const filteredCommits = useMemo(
    () => gitLog.filter((c) => c.message.toLowerCase().includes(filter.toLowerCase()) || c.hash.includes(filter)),
    [gitLog, filter],
  );

  const commit = async () => {
    if (!projectId || changeCount === 0 || committing) return;
    setCommitting(true);
    try {
      const res = await api.gitCommit(projectId, msg.trim() || "Update workspace");
      toast({ title: `Committed to ${branch}`, description: `${res.hash.slice(0, 7)} · ${changeCount} file${changeCount > 1 ? "s" : ""}`, variant: "success" });
      setMsg("");
      await refreshGit();
    } catch (e) {
      toast({ title: "Commit failed", description: String(e), variant: "error" });
    } finally {
      setCommitting(false);
    }
  };

  const checkpoint = async () => {
    if (!projectId || checkpointing) return;
    setCheckpointing(true);
    try {
      const cp = await api.gitCheckpoint(projectId, msg.trim() || undefined);
      toast({ title: "Checkpoint saved", description: cp.label, variant: "success" });
      setMsg("");
      await refreshGit();
    } catch (e) {
      toast({ title: "Checkpoint failed", description: String(e), variant: "error" });
    } finally {
      setCheckpointing(false);
    }
  };

  const restore = async (checkpointId: string) => {
    if (!projectId) return;
    try {
      await api.gitRestore(projectId, checkpointId);
      toast({ title: "Restored checkpoint", description: "Workspace rolled back", variant: "success" });
      await refreshGit();
      bumpPreview();
    } catch (e) {
      toast({ title: "Restore failed", description: String(e), variant: "error" });
    }
  };

  const openDiff = async (path: string) => {
    if (!projectId) return;
    setDiffPath(path);
    setDiffLoading(true);
    try {
      const { diff } = await api.gitDiff(projectId, path);
      setDiffRows(parseDiff(diff));
    } catch {
      setDiffRows([{ t: "meta", s: "could not load diff" }]);
    } finally {
      setDiffLoading(false);
    }
  };

  const copyHash = async (hash: string) => {
    try { await navigator.clipboard.writeText(hash); } catch { /* noop */ }
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1200);
  };

  const comingSoon = (what: string) => toast({ title: `${what} — coming soon`, description: "GitHub publish/import lands in an upcoming drop" });

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-cream">
      {/* bar */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line px-3">
        <div className="relative">
          <button
            onClick={() => setBranchOpen(!branchOpen)}
            className="flex h-7 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-[12px] font-semibold transition hover:border-ink/25"
          >
            <GitBranch size={13} className="text-clay" /> {branch}
            <span className="text-[10.5px] font-medium text-muted">↑{ahead} ↓{behind}</span>
          </button>
          {branchOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setBranchOpen(false)} />
              <div className="anim-fade-up absolute left-0 z-50 mt-1.5 w-[260px] overflow-hidden rounded-xl border border-line bg-card p-1.5 shadow-xl">
                <p className="px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-muted">Branches</p>
                <button className="flex w-full items-center gap-2 rounded-lg bg-black/[0.05] px-2.5 py-2 text-left text-[12.5px] font-semibold">
                  <GitBranch size={13} className="text-clay" /> {branch}
                  <span className="ml-auto rounded-full bg-moss/15 px-1.5 py-0.5 text-[9.5px] font-bold text-moss">current</span>
                </button>
                <p className="px-2.5 pb-1 pt-1.5 text-[10px] leading-relaxed text-faint">
                  Branch checkout is available from the Terminal tab (<span className="font-mono">git switch …</span>).
                </p>
                <div className="my-1.5 border-t border-line-soft" />
                {[
                  { icon: GitMerge, label: "Merge branch…" },
                  { icon: GitPullRequest, label: "Open pull request" },
                  { icon: GitCompare, label: "Compare revisions" },
                ].map((a) => (
                  <button
                    key={a.label}
                    onClick={() => { setBranchOpen(false); comingSoon(a.label.replace(/…$/, "")); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-ink-soft transition hover:bg-black/[0.04] hover:text-ink"
                  >
                    <a.icon size={13} className="text-muted" /> {a.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-line bg-card px-2 py-1 text-[11px] text-muted lg:flex">
          <Lock size={10} /> {gitLog.length} commits · {changeCount} change{changeCount === 1 ? "" : "s"}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => void refreshGit()}
            className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[11.5px] font-medium text-ink-soft transition hover:bg-black/5 hover:text-ink"
            title="Fetch"
          >
            <RotateCw size={12} /> Fetch
          </button>
          <button onClick={() => comingSoon("Pull")} className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[11.5px] font-medium text-ink-soft transition hover:bg-black/5 hover:text-ink">
            <Download size={12} /> Pull
          </button>
          <button onClick={() => setOverlay("publishOpen", true)} className="flex h-7 items-center gap-1.5 rounded-lg bg-ink px-2.5 text-[11.5px] font-semibold text-white transition hover:bg-stone-800">
            <Upload size={12} /> Push
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* changes */}
        <div className="flex w-[248px] shrink-0 flex-col border-r border-line bg-paper/60">
          <div className="flex items-center gap-1.5 px-3 pb-1.5 pt-2.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Changes</span>
            <span className="rounded-full bg-black/[0.07] px-1.5 text-[10px] font-bold text-ink-soft">{changeCount}</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-1.5">
            {staged.length > 0 && (
              <>
                <p className="px-2 pb-1 pt-1.5 text-[10.5px] font-bold uppercase tracking-wider text-moss">Staged · {staged.length}</p>
                {staged.map((c) => (
                  <button key={c.path} onClick={() => void openDiff(c.path)} className="flex w-full items-center gap-1.5 rounded-md px-2 py-[5px] text-left hover:bg-black/[0.05]">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[11.5px] text-ink">{c.path.split("/").pop()}</span>
                      <span className="block truncate font-mono text-[10px] text-faint">{c.path}</span>
                    </span>
                    <span className={cn("font-mono text-[10px] font-bold", statusColor(c.status))}>{statusLabel(c.status)}</span>
                  </button>
                ))}
              </>
            )}
            {unstaged.length > 0 && (
              <>
                <p className="px-2 pb-1 pt-2.5 text-[10.5px] font-bold uppercase tracking-wider text-muted">Unstaged · {unstaged.length}</p>
                {unstaged.map((c) => (
                  <button key={c.path} onClick={() => void openDiff(c.path)} className="flex w-full items-center gap-1.5 rounded-md px-2 py-[5px] text-left hover:bg-black/[0.05]">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[11.5px] text-ink">{c.path.split("/").pop()}</span>
                      <span className="block truncate font-mono text-[10px] text-faint">{c.path}</span>
                    </span>
                    <span className={cn("font-mono text-[10px] font-bold", statusColor(c.status))}>{statusLabel(c.status)}</span>
                  </button>
                ))}
              </>
            )}
            {untracked.length > 0 && (
              <>
                <p className="px-2 pb-1 pt-2.5 text-[10.5px] font-bold uppercase tracking-wider text-moss">Untracked · {untracked.length}</p>
                {untracked.map((c) => (
                  <button key={c.path} onClick={() => void openDiff(c.path)} className="flex w-full items-center gap-1.5 rounded-md px-2 py-[5px] text-left hover:bg-black/[0.05]">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[11.5px] text-ink">{c.path.split("/").pop()}</span>
                      <span className="block truncate font-mono text-[10px] text-faint">{c.path}</span>
                    </span>
                    <span className="font-mono text-[10px] font-bold text-moss">A</span>
                  </button>
                ))}
              </>
            )}
            {changeCount === 0 && (
              <div className="flex flex-col items-center gap-1.5 px-3 py-10 text-center">
                <Check size={20} className="text-moss" />
                <p className="text-[12.5px] font-medium text-ink-soft">Working tree clean</p>
                <p className="text-[11px] text-muted">No uncommitted changes</p>
              </div>
            )}
          </div>

          {/* commit box */}
          <div className="border-t border-line p-2.5">
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void commit(); } }}
              rows={2}
              placeholder={`Message (commit on ${branch})`}
              className="w-full resize-none rounded-lg border border-line bg-card px-2.5 py-2 text-[12px] outline-none transition focus:border-ink/30 placeholder:text-faint"
            />
            <div className="mt-1.5 flex gap-1.5">
              <button
                onClick={() => void commit()}
                disabled={changeCount === 0 || committing}
                className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-ink text-[12px] font-semibold text-white transition hover:bg-stone-800 disabled:opacity-40"
              >
                {committing ? <Loader2 size={13} className="animate-spin" /> : <GitCommitHorizontal size={13} />} Commit
              </button>
              <button
                onClick={() => void checkpoint()}
                disabled={checkpointing}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-[12px] font-semibold text-ink-soft transition hover:text-ink disabled:opacity-40"
                title="Save a named checkpoint (git snapshot)"
              >
                {checkpointing ? <Loader2 size={13} className="animate-spin" /> : <BookmarkPlus size={13} />} Checkpoint
              </button>
            </div>
          </div>

          {/* checkpoints */}
          <div className="max-h-[168px] shrink-0 overflow-y-auto border-t border-line px-2 py-2">
            <div className="flex items-center gap-1.5 px-1 pb-1">
              <History size={11} className="text-muted" />
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Checkpoints · {checkpoints.length}</span>
            </div>
            {checkpoints.length === 0 && (
              <p className="px-1 py-1.5 text-[10.5px] text-faint">No checkpoints yet — the agent saves them automatically.</p>
            )}
            {checkpoints.map((cp) => (
              <div key={cp.id} className="group flex items-center gap-1.5 rounded-md px-1 py-1 hover:bg-black/[0.04]">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11.5px] font-medium text-ink">{cp.label}</span>
                  <span className="block truncate font-mono text-[9.5px] text-faint">
                    {relTime(cp.createdAt)}{cp.commitHash ? ` · ${cp.commitHash.slice(0, 7)}` : ""}
                  </span>
                </span>
                <button
                  onClick={() => void restore(cp.id)}
                  className="shrink-0 rounded p-1 text-faint opacity-0 transition hover:text-ink group-hover:opacity-100"
                  title="Restore this checkpoint"
                >
                  <Undo2 size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* history */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center gap-2 border-b border-line-soft px-3">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">History</span>
            <div className="ml-auto flex w-[190px] items-center gap-1.5 rounded-lg border border-line bg-card px-2 py-1">
              <Search size={12} className="text-muted" />
              <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search commits…" className="w-full bg-transparent text-[11.5px] outline-none placeholder:text-faint" />
            </div>
          </div>

          {diffPath ? (
            <div className="min-h-0 flex-1 overflow-auto">
              <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-line-soft bg-gutter px-3 py-2">
                <FileDiff size={13} className="text-honey" />
                <span className="truncate font-mono text-[12px] font-semibold">{diffPath}</span>
                {diffLoading && <Loader2 size={12} className="animate-spin text-muted" />}
                <button onClick={() => { setDiffPath(null); setDiffRows([]); }} className="ml-auto flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-semibold text-muted transition hover:bg-black/5 hover:text-ink">
                  <X size={11} /> Close diff
                </button>
              </div>
              <div className="code-editor px-0 py-2">
                {diffRows.map((l, i) => (
                  <div key={i} className={cn("flex px-0", l.t === "add" && "bg-moss/[0.09]", l.t === "del" && "bg-clay/[0.09]", l.t === "hunk" && "bg-gutter")}>
                    <span className={cn("w-8 shrink-0 text-center", l.t === "add" ? "text-moss" : l.t === "del" ? "text-clay" : "text-transparent")}>
                      {l.t === "add" ? "+" : l.t === "del" ? "−" : l.t === "hunk" ? "@" : "·"}
                    </span>
                    <code className={cn("whitespace-pre pr-4", l.t === "meta" && "text-faint", l.t === "hunk" && "text-[#2f6bff]")}>
                      <span className={l.t === "add" ? "tok-add" : l.t === "del" ? "tok-del" : "tok-plain"}>{l.s || " "}</span>
                    </code>
                  </div>
                ))}
                {!diffLoading && diffRows.length === 0 && (
                  <p className="px-4 py-3 text-[12px] text-muted">No diff for this file.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {filteredCommits.map((c, i) => {
                const color = BRANCH_COLORS[i % BRANCH_COLORS.length];
                const selected = selectedCommit === c.hash;
                return (
                  <div key={c.hash} className="relative flex gap-3">
                    {/* rail */}
                    <div className="relative flex w-6 shrink-0 justify-center">
                      {i > 0 && <span className="absolute top-0 h-[calc(50%-9px)] w-[2px]" style={{ background: color, opacity: 0.25 }} />}
                      {i < filteredCommits.length - 1 && <span className="absolute bottom-0 top-[calc(50%+9px)] w-[2px]" style={{ background: color, opacity: 0.25 }} />}
                      <button
                        onClick={() => setSelectedCommit(selected ? null : c.hash)}
                        className={cn("relative z-10 mt-[9px] flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition", selected ? "scale-110" : "bg-card")}
                        style={{ borderColor: color, background: selected ? color : undefined }}
                      >
                        {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                      </button>
                    </div>

                    <div className="min-w-0 flex-1 pb-2.5">
                      <button
                        onClick={() => setSelectedCommit(selected ? null : c.hash)}
                        className={cn(
                          "w-full overflow-hidden rounded-lg border px-3 py-2 text-left transition",
                          selected ? "border-ink/25 bg-card shadow-sm" : "border-line bg-card/60 hover:border-ink/20 hover:bg-card",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[12.5px] font-semibold">{c.message}</span>
                          <span className="ml-auto shrink-0 font-mono text-[10.5px] text-muted">{c.short || c.hash.slice(0, 7)}</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-clay/15 text-[9px] font-bold text-clay">
                            {(c.author || "?").slice(0, 1).toUpperCase()}
                          </span>
                          <span className="truncate text-[11px] text-ink-soft">{c.author}</span>
                          <span className="shrink-0 text-[11px] text-faint">· {relTime(c.date)}</span>
                        </div>
                      </button>
                      {selected && (
                        <div className="anim-fade-in mt-1.5 overflow-hidden rounded-lg border border-line bg-card">
                          <div className="space-y-1 border-b border-line-soft bg-gutter px-3 py-2">
                            <p className="text-[11px] text-ink-soft">{c.message}</p>
                            <p className="font-mono text-[10px] text-faint">{c.hash} · {c.author} · {new Date(c.date).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-2">
                            <button
                              onClick={() => void copyHash(c.hash)}
                              className="flex h-7 items-center gap-1.5 rounded-md border border-line px-2 text-[11px] font-semibold text-ink-soft transition hover:text-ink"
                            >
                              {copiedHash === c.hash ? <Check size={11} className="text-moss" /> : <CircleDot size={11} />} Copy hash
                            </button>
                            <span className="ml-auto font-mono text-[10.5px] text-faint">{c.short || c.hash.slice(0, 7)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredCommits.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
                  <GitCommitHorizontal size={20} className="text-faint" />
                  <p className="text-[12.5px] font-medium text-ink-soft">
                    {gitLog.length === 0 ? "No commits yet" : <>No commits match “{filter}”.</>}
                  </p>
                  <p className="text-[11px] text-muted">
                    {gitLog.length === 0 ? "Commit your first change or ask the agent to." : "Try a different search."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
