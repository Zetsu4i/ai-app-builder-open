"use client";

// Forge workspace — shared helpers (cn, time formatting, language detection).
// Companion utilities for src/components/forge/* (ported from ai-agent-chat-interface-23).

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FileNode } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "just now" / "5m ago" / "3h ago" / "Yesterday" / "Jan 8" */
export function relTime(iso?: string | null): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return String(iso);
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 172800) return "Yesterday";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** "11:21 AM" style clock time from an ISO string. */
export function clockTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function languageFor(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "tsx" || ext === "jsx") return "tsx";
  if (ext === "ts") return "ts";
  if (ext === "js" || ext === "mjs" || ext === "cjs") return "js";
  if (ext === "css" || ext === "scss") return "css";
  if (ext === "json") return "json";
  if (ext === "md" || ext === "mdx") return "md";
  if (ext === "html") return "html";
  if (ext === "py") return "py";
  if (ext === "sql") return "sql";
  return ext || "txt";
}

export function formatBytes(n?: number): string {
  if (n === undefined || n === null) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Recursively count file nodes in a tree. */
export function countFiles(nodes: FileNode[]): number {
  let n = 0;
  for (const node of nodes) {
    if (node.type === "file") n += 1;
    else if (node.children) n += countFiles(node.children);
  }
  return n;
}

/** Walk the tree and collect files matching a suffix test (used for *.db detection). */
export function findFiles(nodes: FileNode[], test: (name: string) => boolean, out: FileNode[] = []): FileNode[] {
  for (const node of nodes) {
    if (node.type === "file") {
      if (test(node.name)) out.push(node);
    } else if (node.children) {
      findFiles(node.children, test, out);
    }
  }
  return out;
}
