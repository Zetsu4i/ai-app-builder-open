"use client";

// Forge workspace — code editor. Textarea-over-highlight editing (same approach as
// the source UI): a transparent textarea sits on top of a <pre> rendered with the
// local tokenizer (./code-highlight, .tok-* classes). Real wiring: tabs/dirty/
// changed-lines come from the store, ⌘S saves through api via store.saveFile.

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Copy, Check, Search, WrapText, ChevronRight, FileCode2, Plus, Loader2 } from "lucide-react";
import { useForge } from "@/lib/store";
import { cn, languageFor } from "./forge-utils";
import { tokenizeLine } from "./code-highlight";

const LINE_H = 21;

function dotColor(path: string) {
  if (path.endsWith(".css")) return "bg-[#7c3aed]";
  if (path.endsWith(".json")) return "bg-[#b4532a]";
  if (path.endsWith(".md") || path.endsWith(".mdx")) return "bg-faint";
  return "bg-[#2f6bff]";
}

export default function CodeEditor() {
  const activePath = useForge((s) => s.activePath);
  const openTabs = useForge((s) => s.openTabs);
  const editorContent = useForge((s) => s.editorContent);
  const dirtyPaths = useForge((s) => s.dirtyPaths);
  const changedLines = useForge((s) => s.changedLines);
  const agentEditing = useForge((s) => s.agentEditing);
  const openFile = useForge((s) => s.openFile);
  const closeTab = useForge((s) => s.closeTab);
  const saveFile = useForge((s) => s.saveFile);
  const setOverlay = useForge((s) => s.setOverlay);

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [localDirty, setLocalDirty] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [matchIdx, setMatchIdx] = useState(0);
  const [wrap, setWrap] = useState(false);
  const [cursor, setCursor] = useState({ ln: 1, col: 1 });
  const [saving, setSaving] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);

  const base = activePath ? editorContent[activePath] ?? "" : "";
  const content = activePath ? drafts[activePath] ?? base : "";
  const language = activePath ? languageFor(activePath) : "tsx";
  const lines = useMemo(() => content.split("\n"), [content]);
  const isDirty = activePath ? !!dirtyPaths[activePath] || !!localDirty[activePath] : false;
  const changed = useMemo(() => new Set(activePath ? changedLines[activePath] ?? [] : []), [activePath, changedLines]);

  // keep the draft in sync with store content unless the user has local edits
  useEffect(() => {
    if (!activePath) return;
    if (localDirty[activePath]) return;
    setDrafts((prev) => ({ ...prev, [activePath]: editorContent[activePath] ?? "" }));
  }, [activePath, editorContent, localDirty]);

  useEffect(() => {
    setQuery("");
    setMatchIdx(0);
    setFindOpen(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activePath]);

  const matches = useMemo(() => {
    if (!query) return [];
    const out: number[] = [];
    const q = query.toLowerCase();
    lines.forEach((l, i) => {
      let idx = l.toLowerCase().indexOf(q);
      while (idx !== -1) { out.push(i); idx = l.toLowerCase().indexOf(q, idx + 1); }
    });
    return out;
  }, [query, lines]);

  const save = async () => {
    if (!activePath) return;
    const text = drafts[activePath] ?? editorContent[activePath] ?? "";
    setSaving(true);
    try {
      await saveFile(activePath, text);
      setLocalDirty((prev) => ({ ...prev, [activePath]: false }));
    } finally {
      setSaving(false);
    }
  };

  // ⌘S / ⌘F / Esc bindings (refs avoid stale closures)
  const saveRef = useRef(save);
  const findOpenRef = useRef(findOpen);
  useEffect(() => { saveRef.current = save; }, [save]);
  useEffect(() => { findOpenRef.current = findOpen; }, [findOpen]);
  useEffect(() => {
    if (!activePath) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && findOpenRef.current) { setFindOpen(false); return; }
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === "s") { e.preventDefault(); void saveRef.current(); }
      else if (k === "f") { e.preventDefault(); setFindOpen(true); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [activePath]);

  const syncScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (gutterRef.current) gutterRef.current.style.transform = `translateY(${-el.scrollTop}px)`;
    if (minimapRef.current) {
      const h = el.clientHeight;
      const total = Math.max(1, el.scrollHeight);
      const thumb = minimapRef.current.querySelector<HTMLElement>("[data-thumb]");
      if (thumb) {
        const th = Math.max(24, (h / total) * 120);
        thumb.style.height = `${th}px`;
        thumb.style.top = `${(el.scrollTop / total) * 120}px`;
      }
    }
  };

  useEffect(() => { syncScroll(); });

  const jumpToMatch = (dir: 1 | -1) => {
    if (matches.length === 0) return;
    const next = (matchIdx + dir + matches.length) % matches.length;
    setMatchIdx(next);
    const line = matches[next];
    if (scrollRef.current) scrollRef.current.scrollTop = Math.max(0, line * LINE_H - 120);
  };

  const updateCursor = () => {
    const ta = areaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart ?? 0;
    const before = ta.value.slice(0, pos);
    const ln = before.split("\n").length;
    const col = pos - before.lastIndexOf("\n");
    setCursor({ ln, col });
  };

  const copyAll = async () => {
    try { await navigator.clipboard.writeText(content); } catch { /* noop */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const onChange = (value: string) => {
    if (!activePath) return;
    setDrafts((prev) => ({ ...prev, [activePath]: value }));
    setLocalDirty((prev) => ({ ...prev, [activePath]: true }));
  };

  const crumbs = activePath ? activePath.split("/") : [];
  const shortName = (p: string) => p.split("/").pop() ?? p;

  if (!activePath) {
    return (
      <div className="flex h-full flex-1 flex-col bg-code-bg">
        <div className="flex h-10 items-center gap-1 border-b border-line bg-cream px-2">
          <button onClick={() => setOverlay("newFileOpen", true)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink" title="New file">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <FileCode2 size={32} className="mx-auto text-faint" strokeWidth={1.4} />
            <p className="mt-3 text-[13px] font-medium text-ink-soft">No file open</p>
            <p className="mt-1 text-[12px] text-muted">Select a file from the Explorer to start editing.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-code-bg">
      {/* tabs */}
      <div className="flex h-10 shrink-0 items-stretch gap-0.5 overflow-x-auto border-b border-line bg-cream px-2 pt-1.5">
        {openTabs.map((t) => {
          const active = t === activePath;
          const tabDirty = !!dirtyPaths[t] || !!localDirty[t];
          return (
            <button
              key={t}
              onClick={() => void openFile(t)}
              className={cn(
                "group flex shrink-0 items-center gap-1.5 rounded-t-lg border border-b-0 px-2.5 text-[12px] transition",
                active ? "border-line bg-code-bg font-medium text-ink" : "border-transparent text-muted hover:bg-black/[0.04] hover:text-ink",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", dotColor(t))} />
              <span className="italic">{shortName(t)}</span>
              {tabDirty
                ? <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-honey" title="Unsaved" />
                : (
                  <span
                    onClick={(e) => { e.stopPropagation(); closeTab(t); }}
                    className="ml-0.5 rounded p-0.5 opacity-0 transition hover:bg-black/10 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </span>
                )}
            </button>
          );
        })}
        <button
          onClick={() => setOverlay("newFileOpen", true)}
          className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center self-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink"
          title="New file"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* breadcrumb + actions */}
      <div className="flex h-9 shrink-0 items-center gap-1 border-b border-line-soft px-3">
        <div className="flex min-w-0 items-center gap-0.5 text-[11.5px] text-muted">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-0.5">
              {i > 0 && <ChevronRight size={11} className="text-faint" />}
              <span className={cn("truncate", i === crumbs.length - 1 && "font-semibold text-ink")}>{c}</span>
            </span>
          ))}
          {agentEditing && (
            <span className="ml-2 flex items-center gap-1.5 rounded-full bg-clay/10 px-2 py-0.5 text-[10.5px] font-bold text-clay">
              <span className="working-dot h-1.5 w-1.5 rounded-full bg-clay" /> AGENT EDITING
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            onClick={() => setFindOpen(!findOpen)}
            className={cn("flex h-7 w-7 items-center justify-center rounded-md transition", findOpen ? "bg-ink/[0.07] text-ink" : "text-muted hover:bg-black/5 hover:text-ink")}
            title="Find in file (⌘F)"
          >
            <Search size={13} />
          </button>
          <button
            onClick={() => setWrap(!wrap)}
            className={cn("flex h-7 w-7 items-center justify-center rounded-md transition", wrap ? "bg-ink/[0.07] text-ink" : "text-muted hover:bg-black/5 hover:text-ink")}
            title="Toggle word wrap"
          >
            <WrapText size={13} />
          </button>
          <button onClick={copyAll} className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink" title="Copy file">
            {copied ? <Check size={13} className="text-moss" /> : <Copy size={13} />}
          </button>
          <button
            onClick={() => void save()}
            disabled={!isDirty || saving}
            className={cn(
              "ml-1 flex h-7 items-center gap-1.5 rounded-md border px-2 text-[10.5px] font-semibold transition",
              isDirty && !saving ? "border-line bg-card text-ink hover:border-ink/25" : "border-transparent text-faint",
            )}
            title="Save (⌘S)"
          >
            {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save
          </button>
        </div>
      </div>

      {/* find bar */}
      {findOpen && (
        <div className="anim-fade-in flex shrink-0 items-center gap-2 border-b border-line-soft bg-cream px-3 py-1.5">
          <div className="flex w-[280px] items-center gap-1.5 rounded-lg border border-line bg-card px-2 py-1">
            <Search size={12} className="text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => { setQuery(e.target.value); setMatchIdx(0); }}
              onKeyDown={(e) => { if (e.key === "Enter") jumpToMatch(e.shiftKey ? -1 : 1); if (e.key === "Escape") setFindOpen(false); }}
              placeholder="Find in file…"
              className="w-full bg-transparent text-[12px] outline-none placeholder:text-faint"
            />
            {query && <span className="shrink-0 text-[10.5px] text-muted">{matches.length === 0 ? "0 results" : `${matchIdx + 1} of ${matches.length}`}</span>}
          </div>
          <button onClick={() => jumpToMatch(-1)} className="rounded-md border border-line bg-card px-2 py-1 text-[11px] font-semibold text-ink-soft hover:text-ink">↑</button>
          <button onClick={() => jumpToMatch(1)} className="rounded-md border border-line bg-card px-2 py-1 text-[11px] font-semibold text-ink-soft hover:text-ink">↓</button>
          <button onClick={() => setFindOpen(false)} className="ml-auto text-muted hover:text-ink"><X size={14} /></button>
        </div>
      )}

      {/* editor body */}
      <div className="relative flex min-h-0 flex-1">
        {/* gutter */}
        <div className="w-[52px] shrink-0 overflow-hidden border-r border-line-soft bg-gutter">
          <div ref={gutterRef} className="pt-3">
            {lines.map((l, i) => {
              const ln = i + 1;
              const isChanged = changed.has(ln);
              const isMatch = query !== "" && l.toLowerCase().includes(query.toLowerCase());
              return (
                <div key={ln} style={{ height: LINE_H }} className="relative flex items-center justify-end pr-3 font-mono text-[11px] tabular-nums text-[#c2b9a6]">
                  {isChanged && <span className="absolute left-0 top-[3px] h-[15px] w-[3px] rounded-r bg-moss" />}
                  {isMatch && <span className="absolute left-2 h-[3px] w-[3px] rounded-full bg-honey" />}
                  {ln}
                </div>
              );
            })}
            <div className="h-10" />
          </div>
        </div>

        {/* code scroll area */}
        <div ref={scrollRef} onScroll={syncScroll} className="relative min-w-0 flex-1 overflow-auto">
          <div className={cn("relative min-h-full px-4 pb-10 pt-3", wrap ? "min-w-0 max-w-full" : "min-w-max")}>
            {/* highlight layer */}
            <pre
              aria-hidden
              className="code-editor pointer-events-none m-0"
              style={{ lineHeight: `${LINE_H}px`, whiteSpace: wrap ? "pre-wrap" : "pre", wordBreak: wrap ? "break-word" : "normal" }}
            >
              {lines.map((line, i) => {
                const ln = i + 1;
                const isChanged = changed.has(ln);
                let inner: React.ReactNode = line.length === 0 ? "\u200b" : tokenizeLine(line, language);
                if (query && line.toLowerCase().includes(query.toLowerCase())) {
                  const q = query;
                  const lower = line.toLowerCase();
                  const ql = q.toLowerCase();
                  const parts: React.ReactNode[] = [];
                  let last = 0;
                  let idx = lower.indexOf(ql);
                  let k = 0;
                  while (idx !== -1) {
                    parts.push(<span key={k++}>{line.slice(last, idx)}</span>);
                    parts.push(<span key={k++} className="rounded bg-honey/40">{line.slice(idx, idx + q.length)}</span>);
                    last = idx + q.length;
                    idx = lower.indexOf(ql, last);
                  }
                  parts.push(<span key={k++}>{line.slice(last)}</span>);
                  inner = <span className="tok-plain">{parts}</span>;
                }
                return (
                  <div key={i} style={{ height: wrap ? undefined : LINE_H, minHeight: LINE_H }} className={cn("code-line-flash -mx-4 px-4", isChanged && "bg-moss/[0.06]")}>
                    {inner}
                  </div>
                );
              })}
            </pre>
            {/* editable layer */}
            <textarea
              ref={areaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              onSelect={updateCursor}
              onKeyUp={updateCursor}
              onClick={updateCursor}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="code-editor absolute inset-0 h-full w-full resize-none bg-transparent px-4 pb-10 pt-3 outline-none"
              style={{
                lineHeight: `${LINE_H}px`,
                color: "transparent",
                caretColor: "#1c1917",
                whiteSpace: wrap ? "pre-wrap" : "pre",
                overflow: "hidden",
                wordBreak: wrap ? "break-word" : "normal",
              }}
            />
          </div>
        </div>

        {/* minimap */}
        <div className="relative hidden w-[56px] shrink-0 border-l border-line-soft bg-cream xl:block">
          <div ref={minimapRef} className="absolute inset-x-0 top-0 bottom-0 overflow-hidden py-2">
            <div className="mx-auto w-[34px]">
              {lines.filter((_, i) => i % 2 === 0).slice(0, 90).map((l, i) => (
                <div key={i} className="mb-[2px] h-[2px] rounded-full bg-ink/15" style={{ width: `${Math.min(100, 18 + (l.trim().length / 90) * 82)}%` }} />
              ))}
            </div>
            <div data-thumb className="absolute inset-x-1 rounded-md border border-ink/15 bg-ink/[0.07]" style={{ height: 40, top: 8 }} />
          </div>
        </div>
      </div>

      {/* editor status */}
      <div className="flex h-[26px] shrink-0 items-center gap-3 border-t border-line-soft bg-cream px-3 text-[10.5px] font-medium text-muted">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-moss" /> {language.toUpperCase()}</span>
        <span>UTF-8</span>
        <span>Spaces: 2</span>
        {isDirty && <span className="flex items-center gap-1 text-honey"><span className="h-1.5 w-1.5 rounded-full bg-honey" /> unsaved</span>}
        <span className="ml-auto tabular-nums">Ln {cursor.ln}, Col {cursor.col}</span>
        <span className="tabular-nums">{lines.length} lines</span>
        <span className="tabular-nums">{content.length.toLocaleString()} chars</span>
      </div>
    </div>
  );
}
