"use client";

// AccountScreen — plan card + usage bars (from /usage), stats, recent activity.
// Ported from the Forge reference; decorative sparkbars kept as-is.

import { useEffect, useState } from "react";
import {
  Gauge, TrendingUp, Coins, Zap, Activity, Check, ChevronRight,
  CircleDollarSign, Clock, Bot, MessagesSquare, Database, Blocks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useForge } from "@/lib/store";
import * as api from "@/lib/api";
import type { UsageDTO } from "@/lib/types";

const BARS = [42, 58, 35, 74, 91, 66, 88];

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AccountScreen() {
  const projects = useForge((s) => s.projects);

  const [usage, setUsage] = useState<UsageDTO | null>(null);
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .getUsage()
      .then((u) => {
        if (alive) setUsage(u);
      })
      .catch((e) => {
        if (alive) setError(String(e));
      });
    return () => {
      alive = false;
    };
  }, []);

  const u: UsageDTO =
    usage ?? { totalTokens: 0, inputTokens: 0, outputTokens: 0, modelRequestCount: 0, modelErrorCount: 0, projects: projects.length, messages: 0 };

  const USAGE_BARS = [
    { label: "Agent runs", used: u.modelRequestCount, cap: 500, tone: "bg-clay" },
    { label: "Messages", used: u.messages, cap: 1_000, tone: "bg-[#2f6bff]" },
    { label: "Tokens", used: u.totalTokens, cap: 2_000_000, tone: "bg-moss" },
    { label: "Projects", used: Math.max(u.projects, projects.length), cap: 25, tone: "bg-honey" },
  ];

  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "running").length;
  const STATS = [
    { label: "Projects", value: String(projects.length), sub: `${activeProjects} active`, icon: Bot },
    { label: "Messages", value: fmt(u.messages), sub: `${fmt(u.inputTokens)} in · ${fmt(u.outputTokens)} out`, icon: MessagesSquare },
    { label: "Model requests", value: fmt(u.modelRequestCount), sub: `${String(u.modelErrorCount)} errored`, icon: Zap, up: u.modelErrorCount === 0 },
    { label: "Integrations", value: "—", sub: "skills · MCPs · plugins", icon: Blocks },
  ];

  const recent = [...projects].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 5);

  return (
    <div className="flex h-full flex-1 flex-col bg-paper">
      <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-line px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-clay text-[11px] font-bold text-white">Z</span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-bold leading-tight">zcode-builder</span>
          <span className="block text-[10.5px] leading-tight text-muted">local workspace · agent-service on :3031</span>
        </span>
        <span className="ml-2 rounded-full border border-moss/40 bg-moss/10 px-2 py-0.5 text-[10px] font-bold text-moss">FREE</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[900px] px-4 py-5">
          {/* plan */}
          <div className="overflow-hidden rounded-2xl border border-line bg-card">
            <div className="flex flex-wrap items-center gap-3 border-b border-line-soft bg-cream px-5 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white">
                <CircleDollarSign size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold">Z.ai built-in plan</span>
                <span className="block text-[11.5px] text-muted">Free · GLM models via the local bridge · no billing required</span>
              </span>
              <span className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-[12px] font-semibold text-ink-soft">
                <Check size={12} className="text-moss" /> Active
              </span>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {USAGE_BARS.map((bar) => {
                const pct = bar.cap > 0 ? Math.min(100, Math.round((bar.used / bar.cap) * 100)) : 0;
                return (
                  <div key={bar.label}>
                    <div className="flex items-baseline gap-2">
                      <p className="text-[12px] font-semibold">{bar.label}</p>
                      <p className="ml-auto font-mono text-[11px] text-muted">
                        <span className="font-bold text-ink">{fmt(bar.used)}</span> / {fmt(bar.cap)}
                      </p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.08]">
                      <div className={cn("h-full rounded-full transition-all duration-500", bar.tone)} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-[10px] text-faint">{pct}% of plan allowance</p>
                  </div>
                );
              })}
            </div>
            {error && <p className="border-t border-line-soft bg-clay/[0.04] px-5 py-2 text-[10.5px] text-clay">Usage unavailable — {error}</p>}
          </div>

          {/* stats */}
          <p className="mt-6 flex items-center gap-1.5 text-[13px] font-bold">
            <Activity size={14} className="text-muted" /> Usage stats
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-card p-3.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/[0.05] text-ink-soft">
                  <s.icon size={13} />
                </span>
                <p className="mt-2.5 font-display text-[26px] leading-none">{s.value}</p>
                <p className="mt-1.5 text-[11.5px] font-semibold text-ink-soft">{s.label}</p>
                <p className={cn("mt-0.5 flex items-center gap-1 text-[10px]", s.up ? "text-moss" : "text-muted")}>{s.up && <TrendingUp size={9} />} {s.sub}</p>
              </div>
            ))}
          </div>

          {/* activity chart — decorative */}
          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-card">
            <div className="flex items-center gap-2 border-b border-line-soft px-4 py-3">
              <Gauge size={13} className="text-muted" />
              <span className="text-[12px] font-bold">Agent activity</span>
              <div className="ml-auto flex gap-0.5 rounded-lg border border-line bg-cream p-0.5">
                {(["week", "month", "all"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "h-6 rounded-md px-2 text-[10.5px] font-bold capitalize transition",
                      period === p ? "bg-ink text-white" : "text-muted hover:text-ink",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4">
              <div className="flex h-[120px] items-end gap-2">
                {BARS.map((h, i) => (
                  <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
                    <span className="w-full rounded-t-sm bg-clay/25 transition group-hover:bg-clay/45" style={{ height: `${h}%` }} />
                    <span className="text-[9px] text-faint">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-4 border-t border-line-soft pt-3 text-[10.5px] text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-clay" /> Runs per day
                </span>
                <span className="ml-auto">Peak 91 runs · Fri</span>
                <span className="flex items-center gap-1">
                  <Clock size={9} /> {fmt(u.totalTokens)} tokens total
                </span>
              </div>
            </div>
          </div>

          {/* recent activity — real projects, newest first */}
          <p className="mt-6 flex items-center gap-1.5 text-[13px] font-bold">
            <Coins size={14} className="text-muted" /> Recent activity
          </p>
          <div className="mt-3 overflow-hidden rounded-xl border border-line bg-card">
            {recent.length === 0 && (
              <div className="px-4 py-4 text-[12.5px] text-muted">No activity yet — create a project to get started.</div>
            )}
            {recent.map((p, i) => (
              <div key={p.id} className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-line-soft")}>
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                    p.status === "error" ? "bg-clay/12 text-clay" : "bg-moss/12 text-moss",
                  )}
                >
                  {p.status === "error" ? <span className="text-[11px] font-bold">!</span> : <Check size={12} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-ink">{p.title}</span>
                  <span className="block truncate text-[10.5px] capitalize text-muted">
                    {p.mode} · {p.framework} · {p.status}
                  </span>
                </span>
                <span className="hidden shrink-0 font-mono text-[10px] text-muted sm:block">{p.swarmEnabled ? "swarm" : p.agentMode}</span>
                <span className="w-[90px] shrink-0 text-right text-[10px] text-faint">{timeAgo(p.updatedAt)}</span>
                <ChevronRight size={14} className="shrink-0 text-faint" />
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-cream px-4 py-3 text-[11px] text-muted">
            <Database size={13} className="shrink-0 text-muted" />
            Token counts come from the agent-service ledger — {fmt(u.inputTokens)} input · {fmt(u.outputTokens)} output.
          </div>

          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
