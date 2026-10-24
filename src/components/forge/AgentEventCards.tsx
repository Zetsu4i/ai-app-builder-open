"use client";

// ZCode Builder — agent event cards: terminal reads, webview errors, attachments.
// Ported from Forge AgentEventCards.tsx; "Fix it" wires into the workspace mode.

import { useState } from "react";
import {
  Check, ChevronRight, Loader2, OctagonAlert, TriangleAlert, Wrench,
  SquareTerminal, Copy, Check as CheckIcon, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Terminal read card — agent tails the terminal output               */
/* ------------------------------------------------------------------ */

export function TerminalReadCard({ command, lines, cwd, status, onOpenTerminal }: {
  command: string;
  lines: string[];
  cwd?: string;
  status: "running" | "done";
  onOpenTerminal?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const running = status === "running";

  return (
    <div
      className={cn(
        "anim-fade-up mt-2.5 overflow-hidden rounded-xl border transition",
        running ? "border-clay/25 bg-clay/[0.04]" : "border-line bg-card",
      )}
    >
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left">
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            running ? "bg-clay/15 text-clay" : "bg-[#211d1a] text-white/80",
          )}
        >
          {running ? <Loader2 size={12} className="animate-spin" /> : <SquareTerminal size={12} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold text-ink">
            {running ? "Reading terminal output" : "Read terminal output"}
          </span>
          <code className="block truncate font-mono text-[10.5px] text-muted">
            <span className="text-moss">$ </span>
            {command}
          </code>
        </span>
        {lines.length > 0 && (
          <span className="shrink-0 rounded bg-black/[0.06] px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-ink-soft">
            {lines.length} lines
          </span>
        )}
        {!running && <Check size={13} className="shrink-0 text-moss" />}
        {expanded ? <ChevronRight size={13} className="shrink-0 rotate-90 text-muted" /> : <ChevronRight size={13} className="shrink-0 text-muted" />}
      </button>

      {expanded && (
        <div className="anim-fade-in border-t border-line-soft">
          <div className="flex items-center gap-1.5 border-b border-line-soft bg-cream px-3 py-1.5 font-mono text-[9.5px] text-muted">
            <span className="text-faint">{cwd ?? "terminal"}</span>
            {onOpenTerminal && (
              <button onClick={onOpenTerminal} className="ml-auto font-sans font-semibold text-ink transition hover:text-clay">
                Open terminal →
              </button>
            )}
          </div>
          <div className="max-h-[180px] space-y-0.5 overflow-y-auto bg-[#211d1a] px-3 py-2">
            {lines.map((l, i) => (
              <div
                key={i}
                className={cn(
                  "whitespace-pre-wrap break-words font-mono text-[10.5px] leading-relaxed",
                  l.startsWith("✓") ? "text-[#8fd6a0]"
                    : l.startsWith("✗") || l.toLowerCase().includes("error") ? "text-[#ff9c8a]"
                    : l.startsWith("▲") || l.startsWith("○") ? "text-white/40"
                    : "text-white/75",
                )}
              >
                {l}
              </div>
            ))}
            {lines.length === 0 && <p className="py-2 font-mono text-[10.5px] text-white/30">No output captured yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WebView error card — surfaced in chat when the preview throws      */
/* ------------------------------------------------------------------ */

export interface WebViewError {
  id: string;
  level: "error" | "warn";
  text: string;
  source: string;
  detail?: string;
  count: number;
}

export function WebViewErrorCard({ errors, onFix, onOpenConsole, fixing }: {
  errors: WebViewError[];
  onFix?: (errors: WebViewError[]) => void;
  onOpenConsole?: () => void;
  fixing?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState<string | null>(errors[0]?.id ?? null);
  if (errors.length === 0) return null;

  const errs = errors.filter((e) => e.level === "error");
  const warns = errors.filter((e) => e.level === "warn");

  const copyAll = async () => {
    const body = errors.map((e) => `${e.text}\n    at ${e.source}`).join("\n\n");
    try {
      await navigator.clipboard.writeText(body);
    } catch {
      /* noop */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="anim-fade-up mt-2.5 overflow-hidden rounded-xl border border-clay/25 bg-clay/[0.04]">
      <div className="flex items-center gap-2 border-b border-clay/15 px-3 py-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-clay/15 text-clay">
          <OctagonAlert size={13} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold text-ink">
            {errs.length} error{errs.length !== 1 ? "s" : ""}
            {warns.length > 0 && ` · ${warns.length} warning${warns.length !== 1 ? "s" : ""}`} in the preview
          </span>
          <span className="block truncate text-[10.5px] text-muted">The running webview threw during render</span>
        </span>
        <button
          onClick={copyAll}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink"
          title="Copy all"
        >
          {copied ? <CheckIcon size={11} className="text-moss" /> : <Copy size={11} />}
        </button>
        <button
          onClick={onOpenConsole}
          className="flex h-6 shrink-0 items-center gap-1 rounded-md border border-line px-1.5 text-[9.5px] font-bold text-ink-soft transition hover:text-ink"
          title="Open console"
        >
          Console
        </button>
      </div>

      <div className="divide-y divide-line-soft">
        {errors.map((e) => {
          const isErrorRow = e.level === "error";
          const isOpen = open === e.id;
          return (
            <div key={e.id}>
              <button
                onClick={() => setOpen(isOpen ? null : e.id)}
                className="flex w-full items-start gap-2.5 px-3 py-2 text-left transition hover:bg-clay/[0.03]"
              >
                <span
                  className={cn(
                    "mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded",
                    isErrorRow ? "bg-clay/12 text-clay" : "bg-honey/12 text-honey",
                  )}
                >
                  {isErrorRow ? <OctagonAlert size={11} /> : <TriangleAlert size={11} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[11.5px] leading-snug", isErrorRow ? "text-ink" : "text-ink-soft")}>
                    {e.text}
                    {e.count > 1 && <span className="ml-2 rounded bg-black/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-muted">×{e.count}</span>}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[9.5px] text-muted">{e.source}</span>
                </span>
                {isOpen ? <ChevronRight size={12} className="mt-1 shrink-0 rotate-90 text-muted" /> : <ChevronRight size={12} className="mt-1 shrink-0 text-muted" />}
              </button>
              {isOpen && e.detail && (
                <div className="anim-fade-in px-3 pb-2.5 pl-[46px]">
                  <p className="rounded-lg bg-[#211d1a] px-3 py-2 font-mono text-[10.5px] leading-relaxed text-white/65">{e.detail}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 border-t border-clay/15 bg-clay/[0.03] px-3 py-2">
        <button
          onClick={() => onFix?.(errors)}
          disabled={fixing}
          className={cn(
            "flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition",
            fixing ? "bg-black/[0.06] text-faint" : "bg-ink text-white hover:bg-stone-800",
          )}
        >
          {fixing ? (
            <>
              <Loader2 size={11} className="animate-spin" /> Opening console…
            </>
          ) : (
            <>
              <Wrench size={11} /> Fix it
            </>
          )}
        </button>
        <span className="text-[10px] text-muted">jump to the console with the full stack</span>
        <button
          onClick={() => setOpen(null)}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-ink"
          title="Dismiss"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Attachment previews (files + images) in chat                       */
/* ------------------------------------------------------------------ */

export function AttachmentChips({ files }: { files: { name: string; kind: "image" | "file"; url?: string; sizeKb?: number }[] }) {
  if (files.length === 0) return null;
  const images = files.filter((f) => f.kind === "image");
  const docs = files.filter((f) => f.kind === "file");
  return (
    <>
      {images.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {images.map((f) => (
            <a
              key={f.name}
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="group relative block overflow-hidden rounded-lg border border-line bg-cream"
            >
              <span className="flex h-16 w-20 items-center justify-center bg-gradient-to-br from-[#f3e3c8] to-[#e7d5b8]">
                <span className="font-display text-[11px] text-ink/40">{f.name.split(".").pop()?.toUpperCase()}</span>
              </span>
              <span className="absolute inset-x-0 bottom-0 truncate bg-ink/70 px-1.5 py-0.5 font-mono text-[8px] text-white">{f.name}</span>
            </a>
          ))}
        </div>
      )}
      {docs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {docs.map((f) => (
            <span key={f.name} className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-2 py-1.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-black/[0.06] text-[8px] font-bold text-ink-soft">
                {f.name.split(".").pop()?.slice(0, 4).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block max-w-[140px] truncate text-[11px] font-medium text-ink">{f.name}</span>
                {f.sizeKb !== undefined && <span className="block font-mono text-[9px] text-faint">{f.sizeKb} KB</span>}
              </span>
            </span>
          ))}
        </div>
      )}
    </>
  );
}
