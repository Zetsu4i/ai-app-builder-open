"use client";

// Ported from ai-agent-chat-interface-23 Overlays — ⌘K command palette, publish/share/new-file
// modals and the toast stack. Prop-drilled state is replaced by the zustand store + real BFF api.
// Modal bodies mount fresh on open, so no reset-in-effect is needed.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Blocks,
  Bookmark,
  Bug,
  Check,
  Code2,
  Component,
  Copy,
  Database,
  Eye,
  FilePlus2,
  FileText,
  FolderPlus,
  Gauge,
  GitBranch,
  Globe,
  LayoutGrid,
  Library,
  Link2,
  Loader2,
  Lock,
  MonitorPlay,
  PanelLeft,
  Play,
  Rocket,
  Search,
  Settings,
  Share2,
  Square,
  TerminalSquare,
  Users,
  X,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as api from "@/lib/api";
import { useForge, type Toast } from "@/lib/store";
import type { FileNode } from "@/lib/types";
import { AGENT_MODES } from "./ComposerSettings";

/* ---------------- Command palette ---------------- */

export interface CmdAction {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: React.ReactNode;
  run: () => void;
}

function flattenFiles(nodes: FileNode[], out: FileNode[] = []): FileNode[] {
  for (const n of nodes) {
    if (n.type === "file") out.push(n);
    if (n.children?.length) flattenFiles(n.children, out);
  }
  return out;
}

async function downloadChatMarkdown(projectId: string) {
  const { markdown } = await api.exportChat(projectId);
  const blob = new Blob([markdown], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `chat-${projectId.slice(0, 8)}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function CommandPalette() {
  const open = useForge((s) => s.commandOpen);
  const setOverlay = useForge((s) => s.setOverlay);

  // ⌘K / ctrl+K toggles the palette (the only shortcut handled here — the rest live in ForgeApp)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOverlay("commandOpen", !useForge.getState().commandOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOverlay]);

  if (!open) return null;
  return <PaletteBody />;
}

function PaletteBody() {
  const setOverlay = useForge((s) => s.setOverlay);
  const setView = useForge((s) => s.setView);
  const setWsMode = useForge((s) => s.setWsMode);
  const setSidebarCollapsed = useForge((s) => s.setSidebarCollapsed);
  const setComposer = useForge((s) => s.setComposer);
  const patchProject = useForge((s) => s.patchProject);
  const composer = useForge((s) => s.composer);
  const fileTree = useForge((s) => s.fileTree);
  const openFile = useForge((s) => s.openFile);
  const devServer = useForge((s) => s.devServer);
  const toast = useForge((s) => s.toast);

  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const onClose = () => setOverlay("commandOpen", false);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, []);

  const actions: CmdAction[] = useMemo(() => {
    const p = useForge.getState().activeProject;
    const id = p?.id ?? "";
    const list: CmdAction[] = [
      { id: "preview", label: "Go to Preview", hint: "⌘1", group: "View", icon: <Eye size={15} />, run: () => setWsMode("preview") },
      { id: "code", label: "Go to Code", hint: "⌘2", group: "View", icon: <Code2 size={15} />, run: () => setWsMode("code") },
      { id: "git", label: "Go to Git", hint: "⌘3", group: "View", icon: <GitBranch size={15} />, run: () => setWsMode("git") },
      { id: "db", label: "Go to Database", hint: "⌘4", group: "View", icon: <Database size={15} />, run: () => setWsMode("database") },
      { id: "cmd", label: "Go to Terminal", hint: "⌘5", group: "View", icon: <TerminalSquare size={15} />, run: () => setWsMode("terminal") },
      { id: "browser", label: "Go to Computer (agent browser)", hint: "⌘6", group: "View", icon: <Globe size={15} />, run: () => setWsMode("browser") },
      { id: "console", label: "Go to Console", hint: "⌘7", group: "View", icon: <Bug size={15} />, run: () => setWsMode("console") },
      { id: "stream", label: "Go to Stream (X11)", hint: "⌘8", group: "View", icon: <MonitorPlay size={15} />, run: () => setWsMode("stream") },
      { id: "sidebar", label: "Toggle sidebar", hint: "⌘B", group: "View", icon: <PanelLeft size={15} />, run: () => setSidebarCollapsed(!useForge.getState().sidebarCollapsed) },
      { id: "newtask", label: "New task", hint: "⌘N", group: "Project", icon: <FilePlus2 size={15} />, run: () => setView("home") },
      { id: "projects", label: "All projects", group: "Project", icon: <LayoutGrid size={15} />, run: () => setView("projects") },
      { id: "newfile", label: "New file…", group: "File", icon: <FilePlus2 size={15} />, run: () => setOverlay("newFileOpen", true) },
      {
        id: "save",
        label: "Save all files",
        hint: "⌘S",
        group: "File",
        icon: <FilePlus2 size={15} />,
        run: () => {
          const s = useForge.getState();
          for (const [path, dirty] of Object.entries(s.dirtyPaths)) {
            if (dirty && s.editorContent[path] !== undefined) void s.saveFile(path, s.editorContent[path]);
          }
        },
      },
      {
        id: "devserver",
        label: devServer.status === "ready" ? "Stop dev server" : "Start dev server",
        group: "Run",
        icon: devServer.status === "ready" ? <Square size={15} /> : <Play size={15} />,
        run: () => {
          if (!id) return;
          const action = devServer.status === "ready" ? "stop" : "start";
          void api
            .devServerAction(id, action)
            .then(() => toast({ title: action === "start" ? "Dev server starting…" : "Dev server stopped", variant: "default" }))
            .catch((e) => toast({ title: "Dev server action failed", description: String(e), variant: "error" }));
        },
      },
      {
        id: "swarm",
        label: composer.swarm ? "Disable swarm" : "Enable swarm",
        group: "Agent",
        icon: <Users size={15} />,
        run: () => {
          const next = !composer.swarm;
          setComposer({ swarm: next });
          if (useForge.getState().activeProject) void patchProject({ swarmEnabled: next });
          toast({ title: next ? "Swarm enabled" : "Swarm disabled", variant: "default" });
        },
      },
      {
        id: "checkpoint",
        label: "Checkpoint state now",
        group: "Project",
        icon: <Bookmark size={15} />,
        run: () => {
          if (!id) return;
          void api
            .gitCheckpoint(id, "Manual checkpoint")
            .then(() => {
              toast({ title: "Checkpoint saved", description: "Manual snapshot committed", variant: "success" });
              void useForge.getState().refreshGit();
            })
            .catch((e) => toast({ title: "Checkpoint failed", description: String(e), variant: "error" }));
        },
      },
      {
        id: "export",
        label: "Export chat as markdown",
        group: "Project",
        icon: <FileText size={15} />,
        run: () => {
          if (!id) return;
          void downloadChatMarkdown(id)
            .then(() => toast({ title: "Chat exported", variant: "success" }))
            .catch((e) => toast({ title: "Export failed", description: String(e), variant: "error" }));
        },
      },
      { id: "github", label: "Import from GitHub…", group: "Project", icon: <Link2 size={15} />, run: () => setOverlay("githubImportOpen", true) },
      { id: "publish", label: "Publish project…", group: "Project", icon: <Rocket size={15} />, run: () => setOverlay("publishOpen", true) },
      { id: "share", label: "Share project…", group: "Project", icon: <Share2 size={15} />, run: () => setOverlay("shareOpen", true) },
      { id: "library", label: "Open component library", group: "Navigate", icon: <Component size={15} />, run: () => setView("library") },
      { id: "suite", label: "Open card library", group: "Navigate", icon: <Library size={15} />, run: () => setView("suite") },
      { id: "integrations", label: "Open integrations", group: "Navigate", icon: <Blocks size={15} />, run: () => setView("integrations") },
      { id: "account", label: "Open account and usage", group: "Navigate", icon: <Gauge size={15} />, run: () => setView("account") },
      { id: "settings", label: "Open settings", group: "Navigate", icon: <Settings size={15} />, run: () => setView("settings") },
    ];
    return list;
  }, [composer.swarm, devServer.status, patchProject, setComposer, setOverlay, setSidebarCollapsed, setView, setWsMode, toast]);

  const files = useMemo(() => flattenFiles(fileTree), [fileTree]);

  const items = useMemo(() => {
    const query = q.toLowerCase();
    const acts = actions.filter((a) => a.label.toLowerCase().includes(query)).map((a) => ({ type: "action" as const, a }));
    const fls = files
      .filter((f) => f.path.toLowerCase().includes(query))
      .slice(0, 6)
      .map((f) => ({ type: "file" as const, f }));
    return [...acts, ...fls];
  }, [q, actions, files]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/30 pt-[12vh] backdrop-blur-[2px]" onClick={onClose}>
      <div className="anim-fade-up w-[min(560px,92vw)] overflow-hidden rounded-2xl border border-line bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 border-b border-line-soft px-4 py-3">
          <Search size={16} className="text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIdx((i) => Math.min(i + 1, items.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setIdx((i) => Math.max(i - 1, 0));
              }
              if (e.key === "Enter" && items[idx]) {
                const it = items[idx];
                if (it.type === "action") it.a.run();
                else void openFile(it.f.path);
                onClose();
              }
              if (e.key === "Escape") onClose();
            }}
            placeholder="Type a command or search files…"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-faint"
          />
          <kbd className="rounded border border-line bg-cream px-1.5 py-0.5 text-[10px] font-bold text-muted">ESC</kbd>
        </div>
        <div className="max-h-[320px] overflow-y-auto p-2">
          {items.length === 0 && <p className="px-3 py-6 text-center text-[13px] text-muted">No results for “{q}”.</p>}
          {items.map((it, i) => (
            <button
              key={it.type === "action" ? it.a.id : it.f.path}
              onMouseEnter={() => setIdx(i)}
              onClick={() => {
                if (it.type === "action") it.a.run();
                else void openFile(it.f.path);
                onClose();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px]",
                i === idx ? "bg-ink/[0.06]" : "",
              )}
            >
              {it.type === "action" ? (
                <>
                  <span className="text-muted">{it.a.icon}</span>
                  <span className="flex-1">{it.a.label}</span>
                  {it.a.hint && <kbd className="rounded border border-line bg-cream px-1.5 py-0.5 text-[10px] font-bold text-muted">{it.a.hint}</kbd>}
                </>
              ) : (
                <>
                  <FileText size={15} className="text-muted" />
                  <span className="flex-1 font-mono text-[12px]">{it.f.path}</span>
                  <span className="text-[10.5px] text-faint">Open file</span>
                </>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-line-soft bg-cream px-4 py-2 text-[10.5px] text-muted">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span className="ml-auto">ZCode Command</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Publish (GitHub) ---------------- */

export function PublishModal() {
  const open = useForge((s) => s.publishOpen);
  if (!open) return null;
  return <PublishBody />;
}

function PublishBody() {
  const setOverlay = useForge((s) => s.setOverlay);
  const activeProject = useForge((s) => s.activeProject);
  const gitStatus = useForge((s) => s.gitStatus);
  const toast = useForge((s) => s.toast);

  const [repo, setRepo] = useState(activeProject?.githubRepo ?? "");
  const [branch, setBranch] = useState(gitStatus?.branch ?? activeProject?.githubBranch ?? "main");
  const [token, setToken] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  const onClose = () => setOverlay("publishOpen", false);

  const deploy = async () => {
    if (!activeProject || !repo.trim()) return;
    setDeploying(true);
    setProgress(8);
    setDone(false);
    const timer = setInterval(() => setProgress((p) => Math.min(p + Math.random() * 14, 92)), 320);
    try {
      const res = await api.githubPublish(activeProject.id, {
        repo: repo.trim(),
        branch: branch.trim() || undefined,
        token: token.trim() || undefined,
      });
      clearInterval(timer);
      setProgress(100);
      setDeploying(false);
      setDone(true);
      setUrl(res.url ?? null);
      toast({ title: "Published to GitHub", description: res.url ?? repo.trim(), variant: "success" });
    } catch (e) {
      clearInterval(timer);
      setDeploying(false);
      setProgress(0);
      toast({ title: "Publish failed", description: String(e), variant: "error" });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/30 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div className="anim-fade-up w-[min(480px,94vw)] overflow-hidden rounded-2xl border border-line bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 border-b border-line-soft px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white">
            <Rocket size={15} />
          </span>
          <div>
            <p className="text-[14px] font-bold">Publish your project</p>
            <p className="text-[11.5px] text-muted">Push the workspace to GitHub · update anytime</p>
          </div>
          <button onClick={onClose} className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-black/5 hover:text-ink">
            <X size={15} />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Repository</label>
            <div className="mt-1.5 flex items-center gap-1 rounded-xl border border-line bg-cream px-3 py-2.5">
              <Lock size={12} className="text-moss" />
              <input
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="owner/repo"
                className="w-full bg-transparent font-mono text-[13px] font-semibold outline-none placeholder:font-sans placeholder:text-faint"
              />
              <span className="shrink-0 text-[12px] text-muted">github.com</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Branch</label>
              <input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="mt-1.5 h-[42px] w-full rounded-xl border border-line bg-cream px-3 font-mono text-[12.5px] outline-none focus:border-ink/30"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Token (optional)</label>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                type="password"
                placeholder="saved token used if blank"
                className="mt-1.5 h-[42px] w-full rounded-xl border border-line bg-cream px-3 font-mono text-[12.5px] outline-none placeholder:text-faint focus:border-ink/30"
              />
            </div>
          </div>
          {deploying && (
            <div>
              <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
                <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 font-mono text-[11px] text-muted">
                {progress < 40 ? "○ Committing workspace…" : progress < 75 ? "○ Pushing objects…" : "○ Updating remote refs…"}
              </p>
            </div>
          )}
          {done && (
            <div className="anim-fade-in flex items-center gap-2.5 rounded-xl bg-sage-bg px-3.5 py-3 text-[12.5px] font-medium text-ink">
              <Check size={15} className="shrink-0 text-moss" />
              <span className="min-w-0 flex-1 truncate">
                Pushed <span className="font-mono font-bold">{repo || "repo"}</span>
                {url ? (
                  <>
                    {" · "}
                    <a href={url} target="_blank" rel="noreferrer" className="font-mono font-bold underline">
                      {url.replace(/^https?:\/\//, "")}
                    </a>
                  </>
                ) : null}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2 border-t border-line-soft bg-cream px-5 py-3.5">
          <button onClick={onClose} className="h-9 flex-1 rounded-lg border border-line bg-card text-[13px] font-semibold transition hover:border-ink/25">
            Close
          </button>
          <button
            onClick={() => void deploy()}
            disabled={deploying || !repo.trim()}
            className={cn(
              "flex h-9 flex-[2] items-center justify-center gap-2 rounded-lg text-[13px] font-semibold text-white transition",
              deploying || !repo.trim() ? "bg-black/[0.07] text-faint" : "bg-ink hover:bg-stone-800",
            )}
          >
            {deploying ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Publishing…
              </>
            ) : done ? (
              "Publish update"
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Share ---------------- */

export function ShareModal() {
  const open = useForge((s) => s.shareOpen);
  if (!open) return null;
  return <ShareBody />;
}

function ShareBody() {
  const setOverlay = useForge((s) => s.setOverlay);
  const activeProject = useForge((s) => s.activeProject);
  const toast = useForge((s) => s.toast);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const link = activeProject ? `${window.location.origin}${api.previewBase(activeProject.id)}` : "";

  const onClose = () => setOverlay("shareOpen", false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/30 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div className="anim-fade-up w-[min(440px,94vw)] overflow-hidden rounded-2xl border border-line bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 border-b border-line-soft px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white">
            <Share2 size={15} />
          </span>
          <p className="text-[14px] font-bold">Share this project</p>
          <button onClick={onClose} className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-black/5 hover:text-ink">
            <X size={15} />
          </button>
        </div>
        <div className="space-y-3 px-5 py-5">
          <div className="flex gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Invite by email…"
              className="h-10 w-full rounded-xl border border-line bg-cream px-3.5 text-[13px] outline-none focus:border-ink/30"
            />
            <button
              onClick={() => toast({ title: "Invite noted", description: "Email invites are not wired in this build", variant: "default" })}
              className="h-10 shrink-0 rounded-xl bg-ink px-4 text-[13px] font-semibold text-white"
            >
              Invite
            </button>
          </div>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
              } catch {
                /* noop */
              }
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-cream px-3.5 py-3 text-left transition hover:border-ink/25"
          >
            <Link2 size={14} className="shrink-0 text-muted" />
            <span className="flex-1 truncate font-mono text-[12px]">{link || "—"}</span>
            {copied ? <Check size={14} className="text-moss" /> : <Copy size={14} className="text-muted" />}
          </button>
          <div className="flex items-center justify-between rounded-xl bg-black/[0.03] px-3.5 py-2.5">
            <span className="text-[12.5px] font-medium">Live preview of the running dev server</span>
            <span className="text-[12px] font-semibold text-muted">Can view ▾</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- New file / folder ---------------- */

export function NewFileModal() {
  const open = useForge((s) => s.newFileOpen);
  if (!open) return null;
  return <NewFileBody />;
}

function NewFileBody() {
  const setOverlay = useForge((s) => s.setOverlay);
  const activeProject = useForge((s) => s.activeProject);
  const refreshFileTree = useForge((s) => s.refreshFileTree);
  const openFile = useForge((s) => s.openFile);
  const toast = useForge((s) => s.toast);
  const [name, setName] = useState("");
  const [type, setType] = useState<"file" | "dir">("file");
  const [busy, setBusy] = useState(false);

  const onClose = () => setOverlay("newFileOpen", false);

  const create = async () => {
    const p = activeProject;
    if (!p || !name.trim() || busy) return;
    setBusy(true);
    try {
      await api.createEntry(p.id, name.trim(), type);
      toast({ title: type === "dir" ? "Folder created" : "File created", description: name.trim(), variant: "success" });
      await refreshFileTree();
      if (type === "file") void openFile(name.trim());
      onClose();
    } catch (e) {
      toast({ title: "Create failed", description: String(e), variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/30 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div className="anim-fade-up w-[min(400px,94vw)] overflow-hidden rounded-2xl border border-line bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 border-b border-line-soft px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white">
            {type === "dir" ? <FolderPlus size={15} /> : <FilePlus2 size={15} />}
          </span>
          <p className="text-[14px] font-bold">{type === "dir" ? "New folder" : "New file"}</p>
          <div className="ml-auto flex items-center rounded-lg border border-line bg-cream p-0.5">
            {(["file", "dir"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-semibold transition",
                  type === t ? "bg-ink text-white shadow-sm" : "text-ink-soft hover:text-ink",
                )}
              >
                {t === "file" ? "File" : "Folder"}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-black/5 hover:text-ink">
            <X size={15} />
          </button>
        </div>
        <div className="px-5 py-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) void create();
            }}
            placeholder={type === "dir" ? "components/sections" : "components/NewSection.tsx"}
            className="h-10 w-full rounded-xl border border-line bg-cream px-3.5 font-mono text-[12.5px] outline-none focus:border-ink/30"
          />
          <p className="mt-2 text-[11.5px] text-muted">
            Tip: include a folder, e.g. <span className="font-mono">components/Hours.tsx</span>
          </p>
        </div>
        <div className="flex gap-2 border-t border-line-soft bg-cream px-5 py-3.5">
          <button onClick={onClose} className="h-9 flex-1 rounded-lg border border-line bg-card text-[13px] font-semibold">
            Cancel
          </button>
          <button
            onClick={() => void create()}
            disabled={busy || !name.trim()}
            className={cn(
              "h-9 flex-1 rounded-lg text-[13px] font-semibold text-white transition",
              busy || !name.trim() ? "bg-black/[0.07] text-faint" : "bg-ink hover:bg-stone-800",
            )}
          >
            {busy ? <Loader2 size={13} className="mx-auto animate-spin" /> : type === "dir" ? "Create folder" : "Create file"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Task settings sheet ---------------- */

/** Compact task-settings body: agent mode + swarm ONLY (applies to the next agent turn). */
function TaskSettingsSheet() {
  const composer = useForge((s) => s.composer);
  const setComposer = useForge((s) => s.setComposer);
  const swarmDisabled = composer.mode === "design";
  const swarmOn = composer.swarm && !swarmDisabled;

  return (
    <div className="space-y-4">
      {/* agent mode */}
      <section>
        <div className="mb-1.5 flex items-center gap-1.5 px-0.5">
          <Cpu size={11} className="shrink-0 text-muted" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Agent mode</span>
        </div>
        <div className="space-y-1">
          {AGENT_MODES.map((m) => {
            const on = composer.agentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setComposer({ agentMode: m.id })}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition",
                  on ? "border-ink bg-ink/[0.05] text-ink" : "border-line bg-card text-ink-soft hover:border-ink/20",
                )}
              >
                <span className="shrink-0 text-[12.5px] font-semibold">{m.label}</span>
                {m.id === "yolo" && (
                  <span
                    className={cn(
                      "shrink-0 rounded px-1 py-px text-[9px] font-bold uppercase tracking-wide",
                      on ? "bg-white/25" : "bg-black/[0.08]",
                    )}
                  >
                    default
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-right text-[10.5px] text-muted">{m.note}</span>
                {on && <Check size={12} className="ml-auto shrink-0 text-moss" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* swarm */}
      <section>
        <div className="mb-1.5 flex items-center gap-1.5 px-0.5">
          <Users size={11} className="shrink-0 text-muted" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Swarm</span>
        </div>
        <button
          onClick={() => !swarmDisabled && setComposer({ swarm: !composer.swarm })}
          disabled={swarmDisabled}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition",
            swarmOn ? "border-clay/40 bg-clay/[0.06]" : "border-line bg-card hover:border-ink/20",
            swarmDisabled && "cursor-not-allowed opacity-60",
          )}
        >
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              swarmOn ? "bg-clay text-white" : "bg-black/[0.06] text-ink-soft",
            )}
          >
            <Users size={15} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold text-ink">Parallel agents</span>
            <span className="block text-[11px] leading-snug text-muted">
              {swarmDisabled ? "Swarm is not available in design mode" : "Run sub-agents concurrently on this task."}
            </span>
          </span>
          <span className="toggle shrink-0" data-on={swarmOn} />
        </button>
        {swarmOn && (
          <div className="anim-fade-in mt-2 rounded-xl border border-line bg-cream px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold">Agents in swarm</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setComposer({ swarmAgents: Math.max(2, composer.swarmAgents - 1) })}
                  disabled={composer.swarmAgents <= 2}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-card text-[12px] font-bold text-ink-soft transition hover:text-ink disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-6 text-center font-mono text-[12px] font-bold text-ink">{composer.swarmAgents}</span>
                <button
                  onClick={() => setComposer({ swarmAgents: Math.min(6, composer.swarmAgents + 1) })}
                  disabled={composer.swarmAgents >= 6}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-card text-[12px] font-bold text-ink-soft transition hover:text-ink disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min={2}
              max={6}
              value={composer.swarmAgents}
              onChange={(e) => setComposer({ swarmAgents: Number(e.target.value) })}
              className="mt-2 w-full"
            />
          </div>
        )}
      </section>

      <p className="border-t border-line-soft pt-3 text-center text-[10.5px] text-faint">Applies to the next agent turn</p>
    </div>
  );
}

/** Right-side sheet: agent mode + swarm options for the next agent turn. */
export function SettingsSheetModal() {
  const open = useForge((s) => s.settingsSheetOpen);
  const setOverlay = useForge((s) => s.setOverlay);
  if (!open) return null;
  const onClose = () => setOverlay("settingsSheetOpen", false);
  return (
    <div className="fixed inset-0 z-[100] bg-ink/20 backdrop-blur-[1px]" onClick={onClose}>
      <div
        className="anim-slide-right absolute right-0 top-0 flex h-full w-[340px] max-w-[92vw] flex-col border-l border-line bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-2.5 border-b border-line-soft px-4 py-3.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white">
            <Settings size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold">Task settings</p>
            <p className="text-[11px] text-muted">Applies to the next agent turn</p>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-black/5 hover:text-ink">
            <X size={15} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <TaskSettingsSheet />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Toasts ---------------- */

export function ToastStack() {
  const toasts = useForge((s) => s.toasts);
  const dismissToast = useForge((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed bottom-10 right-4 z-[110] flex w-[320px] flex-col gap-2">
      {toasts.map((t: Toast) => (
        <button
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className="anim-slide-right pointer-events-auto flex items-start gap-2.5 rounded-xl border border-line bg-card p-3.5 text-left shadow-xl"
        >
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
              t.variant === "success" ? "bg-sage-bg text-moss" : t.variant === "error" ? "bg-clay/10 text-clay" : "bg-black/[0.06] text-ink",
            )}
          >
            {t.variant === "error" ? <X size={14} /> : <Check size={14} />}
          </span>
          <div className="min-w-0">
            <p className="text-[12.5px] font-bold">{t.title}</p>
            {t.description && <p className="truncate text-[11.5px] text-muted">{t.description}</p>}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ---------------- Composite (default export) ---------------- */

/** All overlays, fully store-driven — ForgeApp renders <Overlays /> once. */
export default function Overlays() {
  return (
    <>
      <CommandPalette />
      <PublishModal />
      <ShareModal />
      <NewFileModal />
      <SettingsSheetModal />
      <ToastStack />
    </>
  );
}
