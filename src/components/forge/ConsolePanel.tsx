"use client";

// Forge workspace — console panel over store.consoleEntries (runtime + terminal
// errors streamed from the sandbox). "Fix with agent" hands the entry to the chat
// via store.send; fixed entries are tracked by the Workspace (fixedIds) so the
// tab badge stays in sync.

import { useState } from "react";
import {
  TriangleAlert, OctagonAlert, Bug, Info, Terminal, Wrench,
  ChevronDown, ChevronRight, Copy, Check, Loader2, Sparkles,
} from "lucide-react";
import { useForge, type ConsoleEntry } from "@/lib/store";
import { cn, clockTime } from "./forge-utils";

const LEVEL = {
  error: { icon: OctagonAlert, cls: "text-[#ff9c8a]", bg: "bg-[#ff9c8a]/10", label: "Error" },
  warn: { icon: TriangleAlert, cls: "text-[#e8c47a]", bg: "bg-[#e8c47a]/10", label: "Warning" },
  log: { icon: Terminal, cls: "text-white/70", bg: "bg-white/5", label: "Log" },
  info: { icon: Info, cls: "text-[#8ab8ff]", bg: "bg-[#8ab8ff]/10", label: "Info" },
};

export default function ConsolePanel({ fixedIds, fixing, onFix }: {
  fixedIds: Set<string>;
  fixing: boolean;
  onFix: (entries: ConsoleEntry[]) => void;
}) {
  const entries = useForge((s) => s.consoleEntries);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "error" | "warn">("all");

  const shown = entries.filter((e) => (filter === "all" ? true : filter === "error" ? e.level === "error" : e.level === "warn" || e.level === "error"));
  const problems = entries.filter((e) => e.level === "error" && !fixedIds.has(e.id) && !e.fixed);

  const copyEntry = async (e: ConsoleEntry) => {
    try { await navigator.clipboard.writeText(e.detail ? `${e.text}\n${e.detail}` : e.text); } catch { /* noop */ }
    setCopied(e.id);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#211d1a]">
      {/* bar */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-white/10 px-3">
        <span className="flex h-7 items-center gap-1.5 rounded-lg bg-white/[0.07] px-2.5 text-[12px] font-semibold text-white/90">
          <Bug size={13} /> Console
        </span>
        <div className="flex items-center gap-0.5 rounded-lg bg-white/[0.06] p-0.5">
          {(["all", "error", "warn"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn("h-6 rounded-md px-2 text-[11px] font-bold uppercase transition", filter === f ? "bg-white/15 text-white" : "text-white/45 hover:text-white")}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="hidden items-center gap-1.5 rounded-full bg-white/[0.06] px-2 py-1 text-[10.5px] text-white/50 lg:flex">
          <span className={cn("h-1.5 w-1.5 rounded-full", problems.length > 0 ? "bg-[#ff9c8a]" : "bg-[#8fd6a0]")} /> {problems.length} unresolved
        </span>
      </div>

      {/* fix banner */}
      {problems.length > 0 && (
        <div className="flex shrink-0 items-center gap-3 border-b border-[#ff9c8a]/25 bg-[#ff9c8a]/[0.08] px-4 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ff9c8a]/15 text-[#ff9c8a]">
            <Bug size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold text-white">
              {problems.length} runtime error{problems.length > 1 ? "s" : ""} detected
            </p>
            <p className="truncate text-[11px] text-white/50">Sending these to the agent opens a fresh chat focused on the fix.</p>
          </div>
          <button
            onClick={() => onFix(problems)}
            disabled={fixing}
            className={cn("flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-[12.5px] font-semibold transition", fixing ? "bg-white/10 text-white/50" : "bg-[#faf7f0] text-[#211d1a] hover:bg-white")}
          >
            {fixing ? <><Loader2 size={13} className="animate-spin" /> Opening chat…</> : <><Wrench size={13} /> Fix it</>}
          </button>
        </div>
      )}

      {/* entries */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {shown.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <Check size={22} className="text-[#8fd6a0]" />
            <p className="text-[13px] font-semibold text-white/80">Console is clean</p>
            <p className="text-[11.5px] text-white/40">No errors or warnings in this build.</p>
          </div>
        )}
        {shown.map((e) => {
          const L = LEVEL[e.level];
          const Icon = L.icon;
          const open = expanded === e.id;
          const fixed = !!e.fixed || fixedIds.has(e.id);
          return (
            <div key={e.id} className={cn("border-b border-white/[0.07]", fixed && "opacity-45")}>
              <button
                onClick={() => setExpanded(open ? null : e.id)}
                className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition hover:bg-white/[0.04]"
              >
                <span className={cn("mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded", L.bg, L.cls)}>
                  <Icon size={12} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block whitespace-pre-wrap break-words text-[12px] leading-snug", e.level === "error" ? "text-[#ffc9bd]" : "text-white/80")}>
                    {e.text}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2">
                    <span className="shrink-0 font-mono text-[10px] text-white/40">{clockTime(e.createdAt)}</span>
                    {fixed && <span className="shrink-0 rounded bg-[#8fd6a0]/15 px-1.5 py-0.5 text-[9.5px] font-bold text-[#8fd6a0]">FIXED</span>}
                  </span>
                </span>
                {open ? <ChevronDown size={13} className="mt-1 shrink-0 text-white/35" /> : <ChevronRight size={13} className="mt-1 shrink-0 text-white/35" />}
              </button>
              {open && (
                <div className="anim-fade-in space-y-2 px-4 pb-3 pl-[46px]">
                  {e.detail && (
                    <p className="whitespace-pre-wrap rounded-lg bg-white/[0.05] px-3 py-2 font-mono text-[11px] leading-relaxed text-white/60">{e.detail}</p>
                  )}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => void copyEntry(e)}
                      className="flex h-7 items-center gap-1.5 rounded-md bg-white/[0.06] px-2 text-[11px] font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      {copied === e.id ? <Check size={11} className="text-[#8fd6a0]" /> : <Copy size={11} />} Copy
                    </button>
                    <button
                      onClick={() => onFix([e])}
                      disabled={fixing}
                      className="flex h-7 items-center gap-1.5 rounded-md bg-[#faf7f0] px-2 text-[11px] font-bold text-[#211d1a] transition hover:bg-white"
                    >
                      <Sparkles size={11} /> Ask agent to fix
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex h-[26px] shrink-0 items-center gap-3 border-t border-white/10 px-4 text-[10.5px] text-white/35">
        <span>{entries.length} entries</span>
        <span className="ml-auto">stdout + stderr · streamed from the sandbox</span>
      </div>
    </div>
  );
}
