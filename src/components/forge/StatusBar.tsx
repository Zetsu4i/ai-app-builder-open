"use client";

// Ported from ai-agent-chat-interface-23 StatusBar — branch, problems, tokens, preview + agent state.

import { CheckCircle2, CircleAlert, GitBranch, Radio, RefreshCw, Zap } from "lucide-react";
import { useForge } from "@/lib/store";

function fmtTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function StatusBar() {
  const gitStatus = useForge((s) => s.gitStatus);
  const isWorking = useForge((s) => s.isWorking);
  const consoleEntries = useForge((s) => s.consoleEntries);
  const devServer = useForge((s) => s.devServer);
  const contextUsed = useForge((s) => s.contextUsed);
  const contextWindow = useForge((s) => s.contextWindow);
  const totalTokens = useForge((s) => s.totalTokens);
  const setWsMode = useForge((s) => s.setWsMode);

  const problems = consoleEntries.filter((e) => e.level === "error").length;
  const previewState: "live" | "rebuilding" | "stale" =
    devServer.status === "ready" ? "live" : devServer.status === "installing" || devServer.status === "starting" ? "rebuilding" : "stale";
  const ctxPct = contextWindow > 0 ? Math.min(100, Math.round((contextUsed / contextWindow) * 100)) : 0;
  const tokens = `${fmtTokens(totalTokens)} tok · ${ctxPct}% ctx`;

  return (
    <footer className="flex h-[28px] shrink-0 items-center gap-3 border-t border-line bg-paper px-3 text-[11px] font-medium text-muted">
      <button className="flex items-center gap-1.5 rounded px-1.5 py-0.5 transition hover:bg-black/5 hover:text-ink" title="Branch">
        <GitBranch size={12} /> {gitStatus?.branch ?? "main"}
      </button>
      <button className="flex items-center gap-1.5 rounded px-1.5 py-0.5 transition hover:bg-black/5 hover:text-ink" title="Sync">
        <RefreshCw size={11} /> {gitStatus?.behind ?? 0}↓ {gitStatus?.ahead ?? 0}↑
      </button>
      <button
        onClick={() => setWsMode("console")}
        className="flex items-center gap-1.5 rounded px-1.5 py-0.5 transition hover:bg-black/5 hover:text-ink"
        title="Problems — open console"
      >
        {problems === 0 ? <CheckCircle2 size={12} className="text-moss" /> : <CircleAlert size={12} className="text-clay" />}
        {problems} problems
      </button>
      <span className="hidden items-center gap-1.5 sm:flex">
        <span className="text-faint">UTF-8</span>
        <span className="text-faint">·</span>
        <span className="text-faint">TypeScript React</span>
      </span>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden items-center gap-1.5 md:flex" title={`Context ${contextUsed} / ${contextWindow}`}>
          <Zap size={11} className="text-honey" /> {tokens}
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-line bg-card px-2 py-0.5">
          {previewState === "live" && (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-moss" /> Preview live
            </>
          )}
          {previewState === "rebuilding" && (
            <>
              <span className="working-dot h-1.5 w-1.5 rounded-full bg-honey" /> Rebuilding…
            </>
          )}
          {previewState === "stale" && (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-clay" /> Preview stale
            </>
          )}
        </span>
        <span className="flex items-center gap-1.5">
          {isWorking ? (
            <>
              <Radio size={11} className="text-clay" />
              <span className="text-ink">Agent working</span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-moss" /> Ready
            </>
          )}
        </span>
      </div>
    </footer>
  );
}
