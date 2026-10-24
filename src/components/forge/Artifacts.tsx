"use client";

// ZCode Builder — chat artifact / handoff / swarm / checkpoint cards.
// Ported from Forge Artifacts.tsx and wired to the real store + API.

import { useState } from "react";
import {
  Camera, Globe, FileCode2, FileText, Table2, Image as ImageIcon,
  QrCode as QrIcon, Link2, Check, ArrowRightLeft, Loader2,
  Users, Cpu, Bookmark, RotateCcw, ChevronRight, ChevronDown,
  FilePenLine, Bot, CircleDot, Package, FileSearch, Terminal, Search,
  SquareArrowOutUpRight, PackageOpen, FileSpreadsheet, FileType, FileArchive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as api from "@/lib/api";
import type { ArtifactDTO, DelegationPart, SwarmRunDTO } from "@/lib/types";
import { ScreenshotVisual, type ShotVariant } from "./ScreenshotVisual";
import { ArtifactPreview } from "./ArtifactPreview";

/* ------------------------------------------------------------------ */
/*  shared step icons                                                  */
/* ------------------------------------------------------------------ */

export type StepVerb = "read" | "edit" | "create" | "webfetch" | "bash" | "search" | "browser" | "task";

export const STEP_ICON: Record<StepVerb, typeof FileSearch> = {
  read: FileSearch,
  edit: FilePenLine,
  create: FileCode2,
  webfetch: Globe,
  bash: Terminal,
  search: Search,
  browser: Camera,
  task: CircleDot,
};

/* ------------------------------------------------------------------ */
/*  QR — real QR image with CSS fallback (kept 1:1 from Forge)         */
/* ------------------------------------------------------------------ */

export function QrBox({ value, size = 150, className }: { value: string; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodeURIComponent(value)}&color=1c1917&bgcolor=faf8f4&qzone=1&margin=0`;
  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-xl border border-line bg-cream p-1.5", className)}
      style={{ width: size + 12, height: size + 12 }}
    >
      {!failed ? (
        <img src={src} alt="QR code" width={size} height={size} onError={() => setFailed(true)} className="h-full w-full rounded-lg" />
      ) : (
        <div className="grid h-full w-full grid-cols-7 grid-rows-7 gap-[2px] rounded-lg bg-cream p-0.5">
          {Array.from({ length: 49 }).map((_, i) => (
            <span key={i} className={cn("rounded-[1px]", (i * 7 + (i % 5)) % 3 === 0 ? "bg-ink" : "bg-transparent")} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  artifact card — wired to real ArtifactDTO files                    */
/* ------------------------------------------------------------------ */

const IMAGE_MIME = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];

const ICON_BY_MIME: Record<string, typeof FileCode2> = {
  "image/png": ImageIcon, "image/jpeg": ImageIcon, "image/webp": ImageIcon,
  "image/svg+xml": ImageIcon, "image/gif": ImageIcon,
  "application/pdf": FileText, "application/zip": FileArchive,
  "text/csv": Table2, "text/markdown": FileType, "text/plain": FileType,
};
const ICON_BY_EXT: Record<string, typeof FileCode2> = {
  png: ImageIcon, jpg: ImageIcon, jpeg: ImageIcon, webp: ImageIcon, svg: ImageIcon, gif: ImageIcon,
  zip: FileArchive,
  csv: Table2, xls: FileSpreadsheet, xlsx: FileSpreadsheet,
  pdf: FileText, md: FileType, txt: FileType,
};

export function artifactIcon(a: ArtifactDTO) {
  const ext = a.name.split(".").pop()?.toLowerCase() ?? "";
  return ICON_BY_MIME[a.mime] ?? ICON_BY_EXT[ext] ?? FileCode2;
}

function fmtSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export function ArtifactCard({ a, projectId, onOpenFile }: {
  a: ArtifactDTO;
  projectId: string;
  onOpenFile?: (p: string) => void;
}) {
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const aExt = a.name.split(".").pop()?.toLowerCase() ?? "";
  const Icon = ICON_BY_MIME[a.mime] ?? ICON_BY_EXT[aExt] ?? FileCode2;
  const isImage = a.mime.startsWith("image/") || IMAGE_MIME.includes(a.mime);
  const variant: ShotVariant = a.mime === "text/csv" ? "chart" : a.path?.endsWith(".md") ? "cards" : "hero";

  const download = () => {
    try {
      const link = document.createElement("a");
      link.href = api.artifactRawUrl(projectId, a.path);
      link.download = a.name;
      link.rel = "noopener";
      link.click();
    } catch {
      window.open(api.artifactRawUrl(projectId, a.path), "_blank");
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  return (
    <>
      <div
        className="anim-fade-up mt-2.5 overflow-hidden rounded-xl border border-line bg-card transition hover:border-ink/25"
        onClick={() => setPreview(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") setPreview(true); }}
      >
        <div className="flex items-center gap-2 border-b border-line-soft px-3 py-2">
          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", isImage ? "bg-[#7c3aed]/10 text-[#7c3aed]" : "bg-[#2f6bff]/10 text-[#2f6bff]")}>
            <Icon size={13} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-semibold text-ink">{a.name}</span>
            <span className="block truncate font-mono text-[10px] text-muted">{a.mime} · {fmtSize(a.size)}</span>
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); download(); }}
            className="flex h-6 shrink-0 items-center gap-1 rounded-md border border-line bg-cream px-1.5 text-[10.5px] font-bold text-ink-soft transition hover:border-ink/25 hover:text-ink"
            title={`Download ${a.name}`}
          >
            {saved ? <Check size={10} className="text-moss" /> : <PackageOpen size={10} />}
            {saved ? "Saved" : "Download"}
          </button>
        </div>

        {isImage ? (
          <div className="h-[132px] overflow-hidden">
            <ScreenshotVisual projectId={projectId} path={a.path} variant="hero" alt={a.name} />
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-cream px-3 py-2">
            <FileSearch size={12} className="shrink-0 text-muted" />
            <span className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-muted">{a.path}</span>
            <span className="flex shrink-0 items-center gap-1 text-[9.5px] font-bold text-ink">
              Preview <ChevronRight size={10} />
            </span>
          </div>
        )}
      </div>

      <ArtifactPreview
        open={preview}
        onClose={() => setPreview(false)}
        projectId={projectId}
        artifact={a}
        onOpenFile={onOpenFile}
      />
    </>
  );
}

/** Link artifact row (URLs surfaced by the agent). */
export function LinkCard({ url, title }: { url: string; title?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="anim-fade-up mt-2.5 flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2.5 transition hover:border-ink/25"
    >
      <Link2 size={13} className="shrink-0 text-[#2f6bff]" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-semibold">{title ?? "Link"}</span>
        <span className="block truncate font-mono text-[10px] text-muted">{url}</span>
      </span>
      <SquareArrowOutUpRight size={12} className="shrink-0 text-faint" />
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Handoff — rendered from DelegationPart                             */
/* ------------------------------------------------------------------ */

export function HandoffCard({ part }: { part: DelegationPart }) {
  const [open, setOpen] = useState(false);
  const done = part.phase === "stopped";
  return (
    <div className="anim-fade-up mt-2.5 overflow-hidden rounded-xl border border-line bg-card">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 p-3 text-left">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-clay/10 text-clay">
          <ArrowRightLeft size={14} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold">Agent handoff</span>
          <span className="block truncate text-[10.5px] text-muted">orchestrator → {part.agent}</span>
        </span>
        <span className={cn("shrink-0 text-[9.5px] font-bold uppercase", done ? "text-moss" : "text-clay")}>
          {done ? "done" : "running"}
        </span>
        {open ? <ChevronDown size={13} className="shrink-0 text-muted" /> : <ChevronRight size={13} className="shrink-0 text-muted" />}
      </button>
      <div className="flex items-center gap-2 border-t border-line-soft bg-cream px-3 py-2 font-mono text-[10px]">
        <span className="rounded bg-black/[0.05] px-2 py-1">orchestrator</span>
        <ArrowRightLeft size={11} className="text-faint" />
        <span className="rounded bg-sage-bg px-2 py-1 text-moss">{part.agent}</span>
        {part.taskId && <span className="ml-auto truncate text-faint">{part.taskId}</span>}
      </div>
      {open && (
        <div className="anim-fade-in border-t border-line-soft">
          <p className="px-3 py-2 text-[11.5px] leading-relaxed text-ink-soft">
            {part.text || part.status || (done ? "Sub-agent finished its lane." : "Sub-agent is working in its lane…")}
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Swarm — rendered from SwarmRunDTO (lanes / workers / tasks)        */
/* ------------------------------------------------------------------ */

function taskDone(t: SwarmRunDTO["tasks"][number]) {
  return t.status === "complete" || t.status === "done" || t.status === "completed";
}
function taskFailed(t: SwarmRunDTO["tasks"][number]) {
  return t.status === "failed" || t.status === "error";
}
function taskActive(t: SwarmRunDTO["tasks"][number]) {
  return t.status === "running" || t.status === "claimed" || t.status === "in_progress";
}

export function SwarmCard({ run }: { run: SwarmRunDTO }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const tasks = run.tasks ?? [];
  const workers = run.workers ?? [];
  const lanes = Array.from(new Set(tasks.map((t) => t.lane || t.nodeKey))).filter(Boolean);
  const done = tasks.filter(taskDone).length;
  const failed = tasks.filter(taskFailed).length;
  const running = tasks.filter(taskActive).length;
  const active = run.status === "running" || run.status === "active" || run.status === "planning";

  return (
    <div className="anim-fade-up mt-2.5 overflow-hidden rounded-xl border border-line bg-card">
      <div className="flex items-center gap-2 border-b border-line-soft bg-cream px-3 py-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-clay/10 text-clay">
          <Cpu size={12} />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Swarm · {lanes.length || 1} lanes</span>
        {active ? (
          <span className="ml-auto flex items-center gap-1 text-[10.5px] font-semibold text-clay">
            <Loader2 size={11} className="animate-spin" /> {run.status}
          </span>
        ) : (
          <span className={cn("ml-auto text-[10.5px] font-semibold", failed > 0 ? "text-clay" : "text-moss")}>
            {failed > 0 ? `${failed} failed` : run.status}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 border-b border-line-soft px-3 py-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-ink text-white">
          <Bot size={11} />
        </span>
        <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink-soft">{run.goal}</span>
        <span className="shrink-0 text-[10.5px] font-semibold tabular-nums text-ink-soft">{done}/{tasks.length} tasks</span>
      </div>

      {lanes.length > 0 && (
        <div className="space-y-1.5 border-b border-line-soft px-3 py-2.5">
          {lanes.map((lane) => {
            const lt = tasks.filter((t) => (t.lane || t.nodeKey) === lane);
            const ldone = lt.filter(taskDone).length;
            return (
              <div key={lane}>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                  <span className="min-w-0 flex-1 truncate text-[10.5px] font-semibold text-ink-soft">{lane}</span>
                  <span className="shrink-0 font-mono text-[9.5px] text-muted">{ldone}/{lt.length}</span>
                </div>
                <div className="ml-3.5 mt-1 h-1 overflow-hidden rounded-full bg-black/[0.08]">
                  <div
                    className="h-full rounded-full bg-clay transition-all duration-500"
                    style={{ width: `${lt.length ? Math.round((ldone / lt.length) * 100) : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {workers.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-line-soft bg-cream/60 px-3 py-2">
          {workers.map((w) => (
            <span key={w.id} className="flex items-center gap-1 rounded-md border border-line bg-card px-1.5 py-0.5 text-[9.5px] font-semibold text-ink-soft">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  w.status === "running" ? "working-dot bg-clay" : w.status === "idle" || w.status === "done" ? "bg-moss" : "bg-faint",
                )}
              />
              {w.slug}
            </span>
          ))}
          {running > 0 && <span className="ml-auto text-[9.5px] font-bold uppercase text-clay">{running} active</span>}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="space-y-1 p-2">
          {tasks.slice(0, 12).map((t) => {
            const open = openId === t.id;
            return (
              <div key={t.id} className={cn("overflow-hidden rounded-lg border", open ? "border-ink/25 bg-card" : "border-line-soft bg-cream/60")}>
                <button onClick={() => setOpenId(open ? null : t.id)} className="flex w-full items-center gap-2 px-2.5 py-2 text-left">
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      taskDone(t) ? "bg-moss" : taskFailed(t) ? "bg-clay" : taskActive(t) ? "working-dot bg-honey" : "bg-line",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11.5px] font-semibold text-ink">{t.subject}</span>
                    <span className="block truncate text-[10px] text-muted">{t.role}{t.owner ? ` · ${t.owner}` : ""}</span>
                  </span>
                  <span className="shrink-0 rounded bg-black/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                    {t.lane || t.nodeKey}
                  </span>
                  {taskActive(t) && <Loader2 size={11} className="shrink-0 animate-spin text-clay" />}
                  {taskDone(t) && <Check size={11} className="shrink-0 text-moss" />}
                  {taskFailed(t) && <CircleDot size={11} className="shrink-0 text-clay" />}
                </button>
                {open && (
                  <div className="anim-fade-in space-y-1 border-t border-line-soft px-2.5 py-2">
                    <p className="text-[11px] leading-relaxed text-ink-soft">{t.description}</p>
                    {t.filePaths.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {t.filePaths.slice(0, 6).map((f) => (
                          <span key={f} className="rounded border border-line bg-card px-1.5 py-0.5 font-mono text-[9.5px] text-ink-soft">{f}</span>
                        ))}
                      </div>
                    )}
                    {t.error && <p className="rounded bg-clay/[0.08] px-2 py-1 font-mono text-[10px] text-clay">{t.error}</p>}
                    <p className="font-mono text-[9.5px] text-faint">
                      status {t.status} · attempts {t.attempts}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          {tasks.length > 12 && (
            <p className="px-2 py-1 text-[10.5px] text-muted">+{tasks.length - 12} more tasks in the run</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  User edit notice (kept from Forge; used when user edits are acked) */
/* ------------------------------------------------------------------ */

export interface UserEditEventLite {
  id: string;
  path: string;
  added: number;
  removed: number;
  time: string;
}

export function UserEditCard({ edits, acked, onOpenFile }: {
  edits: UserEditEventLite[];
  acked?: boolean;
  onOpenFile?: (p: string) => void;
}) {
  if (edits.length === 0) return null;
  return (
    <>
      {edits.map((e) => (
        <div key={e.id} className="anim-fade-up mt-2.5 rounded-xl border border-honey/30 bg-honey/[0.06] p-3 text-left">
          <div className="flex items-center gap-2 text-[12px] font-semibold">
            <FilePenLine size={14} className="shrink-0 text-honey" />
            <span className="min-w-0 flex-1 truncate">You edited {e.path.split("/").pop()}</span>
            <span className="ml-auto shrink-0 font-mono text-[10px] font-bold">
              <span className="text-moss">+{e.added}</span> <span className="text-clay">−{e.removed}</span>
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                acked ? "bg-moss/15 text-moss" : "bg-honey/20 text-honey",
              )}
            >
              {acked ? "In context" : "Manual edit"}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              onClick={() => onOpenFile?.(e.path)}
              className="rounded-md border border-line bg-card px-1.5 py-1 font-mono text-[9.5px] text-ink-soft transition hover:border-ink/25 hover:text-ink"
            >
              {e.path}
            </button>
            <span className="rounded-md bg-black/[0.05] px-1.5 py-1 font-mono text-[9.5px] text-muted">{e.time}</span>
          </div>
        </div>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Checkpoint — restore wired to api.gitRestore                       */
/* ------------------------------------------------------------------ */

export interface CheckpointLike {
  id: string;
  label: string;
  commitHash?: string | null;
  createdAt?: string;
}

export function CheckpointCard({ cp, onRestore, restoring, compact }: {
  cp: CheckpointLike;
  onRestore: (cp: CheckpointLike) => void;
  restoring?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="anim-fade-up mt-2.5 overflow-hidden rounded-xl border border-line bg-card">
      <div className="flex items-center gap-2 border-b border-line-soft bg-cream px-3 py-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-black/[0.06] text-ink-soft">
          <Bookmark size={12} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold text-ink">{cp.label}</span>
          {cp.commitHash && <span className="block truncate font-mono text-[10px] text-muted">{cp.commitHash.slice(0, 10)}</span>}
        </span>
        {cp.createdAt && <span className="shrink-0 text-[10.5px] text-faint">{new Date(cp.createdAt).toLocaleTimeString()}</span>}
      </div>
      <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-2">
        {!compact && <Package size={11} className="shrink-0 text-muted" />}
        <span className="min-w-0 flex-1 truncate text-[10.5px] text-muted">
          {compact ? "Checkpoint saved after this run" : "Full snapshot of project files at this point"}
        </span>
        <button
          onClick={() => onRestore(cp)}
          disabled={restoring}
          className="flex h-7 shrink-0 items-center gap-1.5 rounded-lg bg-ink px-2.5 text-[11px] font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {restoring ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
          {restoring ? "Restoring…" : "Restore"}
        </button>
      </div>
    </div>
  );
}

