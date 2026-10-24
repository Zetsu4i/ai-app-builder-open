"use client";

// ZCode Builder — artifact preview modal + inline file card.
// Wired to real project files: api.readFile for text, api.artifactRawUrl for
// images / pdf / raw downloads, basic CSV table rendering.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X, Download, Check, FileText, FileType, ImagePlus,
  FileSpreadsheet, FileArchive, PackageOpen, FileCode, Table2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as api from "@/lib/api";
import type { ArtifactDTO } from "@/lib/types";

const IMAGE_MIME = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];
const DOC_EXT = ["pdf"];
const TEXT_EXT = ["txt", "json", "md", "ts", "tsx", "js", "jsx", "css", "html", "py", "sh", "yml", "yaml", "toml", "sql", "env", "xml"];

const ICON_BY_MIME: Record<string, typeof PackageOpen> = {
  "image/png": ImagePlus, "image/jpeg": ImagePlus, "image/webp": ImagePlus,
  "image/svg+xml": ImagePlus, "image/gif": ImagePlus,
  "application/pdf": FileText, "application/zip": FileArchive,
  "text/csv": Table2, "text/markdown": FileType, "text/plain": FileType,
  "application/json": FileCode, "application/sql": FileCode,
};
const ICON_BY_EXT: Record<string, typeof PackageOpen> = {
  png: ImagePlus, jpg: ImagePlus, jpeg: ImagePlus, webp: ImagePlus, svg: ImagePlus, gif: ImagePlus,
  zip: FileArchive,
  csv: Table2, xls: FileSpreadsheet, xlsx: FileSpreadsheet,
  pdf: FileText, doc: FileText, docx: FileText,
  md: FileType, txt: FileType, rst: FileType,
  json: FileCode, ts: FileCode, tsx: FileCode, js: FileCode, jsx: FileCode,
  css: FileCode, html: FileCode, py: FileCode, sh: FileCode, sql: FileCode, yml: FileCode, yaml: FileCode,
};

export function artifactIcon(a?: ArtifactDTO) {
  const ext = a?.name.split(".").pop()?.toLowerCase() ?? "";
  return ICON_BY_MIME[a?.mime ?? ""] ?? ICON_BY_EXT[ext] ?? PackageOpen;
}

/* ------------------------------------------------------------------ */
/*  inline card                                                        */
/* ------------------------------------------------------------------ */

export function ArtifactFileCard({ artifact, projectId, onPreview }: {
  artifact: ArtifactDTO;
  projectId: string;
  onPreview: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const extCard = artifact.name.split(".").pop()?.toLowerCase() ?? "";
  const IconCard = ICON_BY_MIME[artifact.mime] ?? ICON_BY_EXT[extCard] ?? PackageOpen;
  const kb = artifact.size >= 1024 ? `${Math.round(artifact.size / 1024)} KB` : `${artifact.size} B`;

  return (
    <div className="anim-fade-up flex items-center gap-3 rounded-xl border border-line bg-card p-3">
      <button
        onClick={onPreview}
        title="Preview artifact"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-cream text-moss transition hover:border-ink/25"
      >
        <IconCard size={17} />
      </button>
      <button onClick={onPreview} className="min-w-0 flex-1 text-left">
        <p className="truncate text-[12px] font-semibold">{artifact.name}</p>
        <p className="truncate text-[10.5px] text-muted">{artifact.mime}</p>
        <p className="mt-0.5 truncate font-mono text-[9.5px] text-faint">
          {artifact.path} · {kb}
        </p>
      </button>
      <a
        href={api.artifactRawUrl(projectId, artifact.path)}
        download={artifact.name}
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1400); }}
        className={cn(
          "flex h-7 shrink-0 items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition",
          saved ? "border-moss/40 bg-moss/10 text-moss" : "border-line text-ink-soft hover:border-ink/25 hover:text-ink",
        )}
      >
        {saved ? <Check size={11} /> : <Download size={11} />} {saved ? "Saved" : "Download"}
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  preview bodies — real content                                      */
/* ------------------------------------------------------------------ */

function parseCsv(text: string): { cols: string[]; rows: string[][] } {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim() !== "");
  if (lines.length === 0) return { cols: [], rows: [] };
  const split = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === "," && !inQ) {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const cols = split(lines[0]);
  const rows = lines.slice(1).map(split);
  return { cols, rows };
}

function CsvBody({ cols, rows }: { cols: string[]; rows: string[][] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-line bg-card">
      <div className="flex items-center gap-2 border-b border-line bg-gutter px-4 py-2.5">
        <FileSpreadsheet size={12} className="text-[#217346]" />
        <span className="text-[11px] font-semibold">CSV preview</span>
        <span className="ml-auto font-mono text-[9.5px] text-muted">{rows.length} rows · {cols.length} cols</span>
      </div>
      <div className="max-h-[520px] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0">
            <tr className="bg-gutter">
              {cols.map((c, i) => (
                <th key={i} className="border-b border-r border-line px-3 py-2 text-left font-mono text-[10px] font-semibold text-ink last:border-r-0">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {cols.map((_, ci) => (
                  <td key={ci} className="whitespace-nowrap border-b border-r border-line-soft px-3 py-1.5 font-mono text-[10.5px] text-ink-soft last:border-r-0">
                    {r[ci] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  full-window preview                                                */
/* ------------------------------------------------------------------ */

export function ArtifactPreview({ open, onClose, projectId, artifact, onOpenFile }: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  artifact: ArtifactDTO;
  onOpenFile?: (p: string) => void;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ext = artifact.name.split(".").pop()?.toLowerCase() ?? "";
  const Icon = ICON_BY_MIME[artifact.mime] ?? ICON_BY_EXT[ext] ?? PackageOpen;
  const isImage = artifact.mime.startsWith("image/") || IMAGE_MIME.includes(artifact.mime);
  const isPdf = artifact.mime === "application/pdf" || DOC_EXT.includes(ext);
  const isCsv = ext === "csv" || artifact.mime === "text/csv";
  const isText = isCsv || artifact.mime.startsWith("text/") || TEXT_EXT.includes(ext);
  const rawUrl = api.artifactRawUrl(projectId, artifact.path);

  useEffect(() => {
    if (!open || !isText) return;
    let cancelled = false;
    api.readFile(projectId, artifact.path)
      .then(({ content }) => { if (!cancelled) setContent(content); })
      .catch((e) => { if (!cancelled) setError(String(e)); });
    return () => { cancelled = true; };
  }, [open, isText, projectId, artifact.path]);

  if (!open) return null;

  const csv = isCsv && content ? parseCsv(content) : null;
  const stale = content === null && error === null;

  const body = (
    <div className="h-full overflow-auto bg-code-bg p-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3 border-b border-line pb-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-card text-moss">
            <Icon size={22} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{artifact.name}</h2>
            <p className="truncate font-mono text-[11px] text-muted">{artifact.path} · {artifact.mime}</p>
          </div>
          {onOpenFile && (
            <button
              onClick={() => { onClose(); onOpenFile(artifact.path); }}
              className="ml-auto flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-line bg-card px-2.5 text-[10.5px] font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink"
            >
              Open in editor
            </button>
          )}
        </div>

        {isImage ? (
          <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white">
            <img src={rawUrl} alt={artifact.name} className="max-h-[70vh] w-full object-contain" />
          </div>
        ) : isPdf ? (
          <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white">
            <iframe src={rawUrl} title={artifact.name} className="h-[70vh] w-full" />
          </div>
        ) : isCsv ? (
          error ? (
            <p className="mt-6 rounded-lg bg-clay/[0.08] px-4 py-3 text-[12px] text-clay">Failed to load CSV: {error}</p>
          ) : stale ? (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-6 text-[12px] text-muted">
              <Loader2 size={13} className="animate-spin" /> Loading CSV…
            </div>
          ) : csv && csv.cols.length > 0 ? (
            <CsvBody cols={csv.cols} rows={csv.rows.slice(0, 200)} />
          ) : (
            <pre className="mt-6 whitespace-pre-wrap rounded-lg bg-[#211d1a] p-5 font-mono text-[11px] leading-relaxed text-white/70">{content}</pre>
          )
        ) : isText ? (
          error ? (
            <p className="mt-6 rounded-lg bg-clay/[0.08] px-4 py-3 text-[12px] text-clay">Failed to load file: {error}</p>
          ) : stale ? (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-6 text-[12px] text-muted">
              <Loader2 size={13} className="animate-spin" /> Loading file…
            </div>
          ) : (
            <pre className="mt-6 max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-lg bg-[#211d1a] p-5 font-mono text-[11px] leading-relaxed text-white/75">
              {content}
            </pre>
          )
        ) : (
          <div className="mt-6 rounded-xl border border-line bg-card p-6">
            <p className="text-[13px] leading-relaxed text-ink-soft">
              {artifact.name} — {artifact.mime} ({artifact.size} bytes). No inline preview for this type.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[999] flex flex-col bg-paper">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line bg-card px-4">
        <Icon size={15} className="shrink-0 text-moss" />
        <span className="shrink-0 text-[12px] font-semibold">Artifact preview</span>
        <span className="truncate font-mono text-[10px] text-muted">{artifact.path}</span>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <a
            href={rawUrl}
            download={artifact.name}
            className="flex h-7 items-center gap-1.5 rounded-md border border-line px-2.5 text-[10.5px] font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink"
          >
            <Download size={11} /> Download
          </a>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-black/5 hover:text-ink">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1">{body}</div>
    </div>,
    document.body,
  );
}
