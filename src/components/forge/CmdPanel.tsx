"use client";

// Forge workspace — terminal tab. Real execution: every command goes to the
// sandbox through api.runTerminal(projectId, cmd); output is streamed back over
// socket "agent:event" kind "terminal" and rendered with the ANSI SGR renderer
// (256/24-bit color). History persists to localStorage (last 50).

import { useEffect, useRef, useState } from "react";
import { Trash2, ChevronDown, Terminal, SquareTerminal, CircleDot, Loader2 } from "lucide-react";
import * as api from "@/lib/api";
import { useForge } from "@/lib/store";
import { getSocket } from "@/lib/socket";
import { cn } from "./forge-utils";
import { renderAnsi } from "./ansi";

interface Line {
  id: number;
  kind: "in" | "out";
  text: string;
  err?: boolean;
}

const HISTORY_KEY = "forge-terminal-history";
const MAX_LINES = 800;

const QUICK_CHIPS = ["ls -la", "git status", "cat package.json", "npm run build", "node -v"];

export default function CmdPanel() {
  const project = useForge((s) => s.activeProject);
  const toast = useForge((s) => s.toast);

  const [lines, setLines] = useState<Line[]>([
    { id: 0, kind: "out", text: "◈ forge shell — sandbox terminal" },
    { id: 1, kind: "out", text: "Commands run inside the project sandbox. Type `clear` to clear the screen." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as string[];
      return Array.isArray(saved) ? saved.slice(0, 50) : [];
    } catch {
      return [];
    }
  });
  const [histIdx, setHistIdx] = useState(-1);

  const idRef = useRef(2);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastEventAt = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines, busy]);

  const push = (text: string, kind: Line["kind"], err?: boolean) => {
    idRef.current += 1;
    const line: Line = { id: idRef.current, kind, text, err };
    setLines((prev) => [...prev.slice(-(MAX_LINES - 1)), line]);
  };

  // stream terminal output for this project room
  useEffect(() => {
    if (!project) return;
    const s = getSocket();
    const handler = (e: { kind: string; payload: Record<string, unknown> }) => {
      if (e.kind !== "terminal") return;
      const data = (e.payload as { data?: string; stream?: string }).data;
      if (data === undefined || data === null) return;
      lastEventAt.current = Date.now();
      const stream = (e.payload as { stream?: string }).stream;
      const parts = String(data).replace(/\r/g, "").split("\n");
      if (parts.length && parts[parts.length - 1] === "") parts.pop();
      for (const p of parts) push(p, "out", stream === "stderr");
    };
    s.on("agent:event", handler);
    return () => { s.off("agent:event", handler); };
  }, [project]);

  // busy until output goes quiet (there is no explicit completion event)
  useEffect(() => {
    const t = window.setInterval(() => {
      if (busyRef.current && lastEventAt.current > 0 && Date.now() - lastEventAt.current > 1400) setBusy(false);
    }, 300);
    return () => window.clearInterval(t);
  }, []);

  const run = async (raw: string) => {
    const cmdline = raw.trim();
    if (!cmdline || busy) return;
    if (!project) {
      push("no project open", "out", true);
      return;
    }
    if (cmdline === "clear") {
      setLines([]);
      return;
    }
    push(cmdline, "in");
    setInput("");
    const nextHistory = [cmdline, ...history.filter((h) => h !== cmdline)].slice(0, 50);
    setHistory(nextHistory);
    setHistIdx(-1);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory)); } catch { /* noop */ }
    setBusy(true);
    lastEventAt.current = Date.now();
    try {
      await api.runTerminal(project.id, cmdline);
    } catch (e) {
      toast({ title: "Terminal unavailable", description: String(e), variant: "error" });
      push(`forge: could not run command (${String(e)})`, "out", true);
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#211d1a]">
      {/* bar */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-white/10 px-3">
        <span className="flex h-7 items-center gap-1.5 rounded-lg bg-white/[0.07] px-2.5 text-[12px] font-semibold text-white/90">
          <Terminal size={13} /> forge shell
        </span>
        <span className="hidden items-center gap-1.5 rounded-full bg-white/[0.06] px-2 py-1 font-mono text-[10.5px] text-white/50 lg:flex">
          <CircleDot size={10} className={busy ? "text-[#e8c47a]" : "text-[#8fd6a0]"} /> {busy ? "running…" : "idle"} · sandbox
        </span>
        <span className="ml-auto flex items-center gap-0.5">
          <button onClick={() => inputRef.current?.focus()} className="flex h-7 w-7 items-center justify-center rounded-md text-white/45 transition hover:bg-white/10 hover:text-white" title="Focus input">
            <SquareTerminal size={13} />
          </button>
          <button onClick={() => setLines([])} className="flex h-7 w-7 items-center justify-center rounded-md text-white/45 transition hover:bg-white/10 hover:text-white" title="Clear">
            <Trash2 size={13} />
          </button>
        </span>
      </div>

      {/* output */}
      <div onClick={() => inputRef.current?.focus()} className="min-h-0 flex-1 cursor-text overflow-y-auto px-4 py-3 font-mono text-[12px] leading-[1.75]">
        {lines.map((l) => (
          <div key={l.id} className={cn("whitespace-pre-wrap break-words", l.err ? "text-[#ff9c8a]" : l.kind === "in" ? "text-white" : "text-white/80")}>
            {l.kind === "in" ? (
              <>
                <span className="text-[#8fd6a0]">➜ </span>
                <span className="text-[#8ab8ff]">{project?.title?.slice(0, 18).toLowerCase().replace(/\s+/g, "-") || "~"}</span>
                <span className="text-white/40"> $ </span>
                {l.text}
              </>
            ) : (
              renderAnsi(l.text) || "\u200b"
            )}
          </div>
        ))}
        {/* input row */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-[#8fd6a0]">➜</span>
          <span className="text-[#8ab8ff]">{project?.title?.slice(0, 18).toLowerCase().replace(/\s+/g, "-") || "~"}</span>
          <span className="text-white/40">$</span>
          <input
            ref={inputRef}
            value={input}
            disabled={busy}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { void run(input); }
              else if (e.key === "ArrowUp") {
                e.preventDefault();
                const next = Math.min(histIdx + 1, history.length - 1);
                if (next >= 0) { setHistIdx(next); setInput(history[next]); }
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const next = histIdx - 1;
                setHistIdx(next);
                setInput(next >= 0 ? history[next] : "");
              } else if (e.key.toLowerCase() === "l" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                setLines([]);
              }
            }}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            placeholder={busy ? "running…" : ""}
            className="min-w-0 flex-1 bg-transparent text-white caret-[#f4f1eb] outline-none placeholder:text-white/30 disabled:opacity-60"
          />
          {busy && <Loader2 size={13} className="animate-spin text-[#8fd6a0]" />}
        </div>
        <div ref={endRef} />
      </div>

      {/* hints */}
      <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-t border-white/10 px-3 py-1.5">
        {QUICK_CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => void run(c)}
            className="shrink-0 rounded-md bg-white/[0.06] px-2 py-1 font-mono text-[10.5px] text-white/60 transition hover:bg-white/15 hover:text-white"
          >
            {c}
          </button>
        ))}
        <span className="ml-auto hidden shrink-0 items-center gap-1 text-[10px] text-white/30 sm:flex">
          <ChevronDown size={11} /> ↑↓ history (50) · ⌘L clear
        </span>
      </div>
    </div>
  );
}
