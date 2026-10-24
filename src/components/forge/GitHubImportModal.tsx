"use client";

// Ported from ai-agent-chat-interface-23 GitHubImportModal — two-step import:
// pick the source (public URL or private owner/repo + optional token), then confirm the branch.

import { useState } from "react";
import {
  Check,
  ChevronRight,
  FolderGit2,
  GitBranch,
  Globe,
  Link2,
  Loader2,
  Lock,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as api from "@/lib/api";
import { useForge } from "@/lib/store";

type Tab = "public" | "private";

export default function GitHubImportModal() {
  const open = useForge((s) => s.githubImportOpen);
  if (!open) return null;
  return <ImportBody />;
}

function ImportBody() {
  const setOverlay = useForge((s) => s.setOverlay);
  const activeProject = useForge((s) => s.activeProject);
  const refreshGit = useForge((s) => s.refreshGit);
  const refreshFileTree = useForge((s) => s.refreshFileTree);
  const toast = useForge((s) => s.toast);

  const [tab, setTab] = useState<Tab>("public");
  const [url, setUrl] = useState("");
  const [repoInput, setRepoInput] = useState(activeProject?.githubRepo ?? "");
  const [token, setToken] = useState("");
  const [branch, setBranch] = useState("forge/agent");
  const [newBranch, setNewBranch] = useState(true);
  const [loading, setLoading] = useState(false);

  const onClose = () => setOverlay("githubImportOpen", false);

  const repoName =
    tab === "public"
      ? url.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").trim()
      : repoInput.trim();

  const canConfirm = tab === "public" ? !!repoName : /^[^/\s]+\/[^/\s]+$/.test(repoName);

  const confirm = async () => {
    const p = activeProject;
    if (!p || !canConfirm || loading) return;
    setLoading(true);
    try {
      await api.githubImport(p.id, {
        repo: repoName,
        branch: newBranch ? branch.trim() || undefined : undefined,
        token: token.trim() || undefined, // blank → saved settings token
      });
      toast({ title: "Import queued", description: `${repoName} is cloning into the workspace`, variant: "success" });
      void refreshGit();
      void refreshFileTree();
      onClose();
    } catch (e) {
      toast({ title: "Import failed", description: String(e), variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-ink/35 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div className="anim-fade-up flex max-h-[86vh] w-[min(520px,94vw)] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="flex shrink-0 items-center gap-2.5 border-b border-line-soft px-5 py-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
            <FolderGit2 size={15} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-bold">Import from GitHub</span>
            <span className="block text-[11px] text-muted">Bring an existing repo into ZCode</span>
          </span>
          <button onClick={onClose} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-black/5 hover:text-ink">
            <X size={15} />
          </button>
        </div>

        {/* tabs */}
        <div className="flex shrink-0 gap-1 border-b border-line-soft px-4 pt-3">
          {([["public", Globe, "Public repo"], ["private", Lock, "Private repo"]] as [Tab, typeof Globe, string][]).map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-t-lg border-b-2 px-3 text-[12px] font-semibold transition",
                tab === id ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
              )}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5">
          {tab === "public" ? (
            <div className="space-y-2.5">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Repository URL</label>
              <div className="flex items-center gap-2 rounded-xl border border-line bg-cream px-3 py-2.5 focus-within:border-ink/30">
                <Link2 size={13} className="shrink-0 text-muted" />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void confirm();
                  }}
                  placeholder="https://github.com/owner/repo"
                  className="w-full bg-transparent font-mono text-[12px] outline-none placeholder:text-faint"
                />
              </div>
              <p className="text-[11px] leading-relaxed text-muted">
                Any public repository works — paste the URL and ZCode clones the default branch. You can switch branches after import.
              </p>
              {url.trim() && (
                <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2.5">
                  <Globe size={13} className="shrink-0 text-moss" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[11.5px] font-semibold text-ink">{repoName || "…"}</span>
                    <span className="block text-[10.5px] text-muted">Public · will clone default branch</span>
                  </span>
                  <Check size={14} className="shrink-0 text-moss" />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Repository (owner/name)</label>
              <div className="flex items-center gap-2 rounded-xl border border-line bg-cream px-3 py-2.5 focus-within:border-ink/30">
                <Link2 size={13} className="shrink-0 text-muted" />
                <input
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void confirm();
                  }}
                  placeholder="owner/repo"
                  className="w-full bg-transparent font-mono text-[12px] outline-none placeholder:text-faint"
                />
              </div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Access token (optional)</label>
              <div className="flex items-center gap-2 rounded-xl border border-line bg-cream px-3 py-2.5 focus-within:border-ink/30">
                <Lock size={13} className="shrink-0 text-muted" />
                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  type="password"
                  placeholder="ghp_… — uses your saved token if blank"
                  className="w-full bg-transparent font-mono text-[12px] outline-none placeholder:text-faint"
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-sage-bg px-2.5 py-1.5">
                <ShieldCheck size={12} className="shrink-0 text-moss" />
                <span className="text-[10.5px] font-medium text-moss">
                  Leave the token blank to use the GitHub token saved in Settings
                </span>
              </div>
            </div>
          )}

          {/* branch */}
          {(tab === "public" ? !!url.trim() : !!repoInput.trim()) && (
            <div className="mt-4 border-t border-line-soft pt-3.5">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Branch to push to</p>
              <div className="mt-2 space-y-1.5">
                <button
                  onClick={() => setNewBranch(true)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition",
                    newBranch ? "border-ink bg-ink/[0.05]" : "border-line bg-card hover:border-ink/20",
                  )}
                >
                  <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", newBranch ? "border-ink bg-ink" : "border-line")}>
                    {newBranch && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold text-ink">Create a new branch</span>
                    <span className="block text-[10.5px] text-muted">The agent commits here and opens a PR when done</span>
                  </span>
                  <GitBranch size={13} className="shrink-0 text-muted" />
                </button>
                {newBranch && (
                  <div className="ml-6 flex items-center gap-2 rounded-lg border border-line bg-cream px-2.5 py-1.5 focus-within:border-ink/25">
                    <GitBranch size={11} className="shrink-0 text-muted" />
                    <input
                      value={branch}
                      onChange={(e) => setBranch(e.target.value.replace(/[^a-zA-Z0-9/_-]/g, ""))}
                      className="w-full bg-transparent font-mono text-[11.5px] outline-none"
                    />
                  </div>
                )}
                <button
                  onClick={() => setNewBranch(false)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition",
                    !newBranch ? "border-ink bg-ink/[0.05]" : "border-line bg-card hover:border-ink/20",
                  )}
                >
                  <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", !newBranch ? "border-ink bg-ink" : "border-line")}>
                    {!newBranch && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold text-ink">Push to the default branch</span>
                    <span className="block text-[10.5px] text-muted">Commits land directly on the remote default branch</span>
                  </span>
                  <GitBranch size={13} className="shrink-0 text-muted" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex shrink-0 items-center gap-2 border-t border-line-soft bg-cream px-4 py-3">
          <span className="text-[10.5px] text-muted">
            {tab === "public" ? "Public clone · no token needed" : "Uses your GitHub token"}
          </span>
          <button onClick={onClose} className="ml-auto h-8 rounded-lg border border-line bg-card px-3 text-[12px] font-semibold">
            Cancel
          </button>
          <button
            onClick={() => void confirm()}
            disabled={loading || !canConfirm}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-[12px] font-semibold transition",
              loading || !canConfirm ? "bg-black/[0.07] text-faint" : "bg-ink text-white hover:bg-stone-800",
            )}
          >
            {loading ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Importing…
              </>
            ) : (
              <>
                Import <ChevronRight size={12} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
