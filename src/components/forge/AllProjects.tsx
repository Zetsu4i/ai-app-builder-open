"use client";

// AllProjects — grid/list of every project with mode filters, search, delete.
// Ported from the Forge reference; reads store.projects and calls the real API.

import { useMemo, useState } from "react";
import {
  Search, LayoutGrid, List, ChevronRight, Clock, Plus, FolderKanban,
  Filter, Trash2, MoreHorizontal, Loader2, Globe, Smartphone, Palette,
  Sparkles, Presentation, FileText, MousePointerClick, BarChart3, Boxes,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForge } from "@/lib/store";
import * as api from "@/lib/api";
import type { ProjectDTO } from "@/lib/types";

const MODE_ICON: Record<string, LucideIcon> = {
  web: Globe,
  mobile: Smartphone,
  design: Palette,
  app: Sparkles,
  presentation: Presentation,
  document: FileText,
  computer: MousePointerClick,
  data: BarChart3,
};

function modeIcon(mode: string): LucideIcon {
  return MODE_ICON[mode] ?? Boxes;
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

function hueGradient(hue: number) {
  return `linear-gradient(135deg, hsl(${hue} 46% 62%), hsl(${(hue + 48) % 360} 44% 44%))`;
}

function statusBadge(p: ProjectDTO) {
  if (p.status === "error") {
    return <span className="shrink-0 rounded bg-clay/10 px-1.5 py-0.5 text-[9px] font-bold text-clay">ERROR</span>;
  }
  if (p.status === "active" || p.status === "running") {
    return <span className="shrink-0 rounded bg-sage-bg px-1.5 py-0.5 text-[9px] font-bold text-moss">LIVE</span>;
  }
  return null;
}

function runtimeBadge(p: ProjectDTO) {
  const e2b = p.sandboxRuntime === "e2b";
  return (
    <span
      className={cn(
        "shrink-0 rounded px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wide",
        e2b ? "bg-[#2f6bff]/10 text-[#2f6bff]" : "bg-black/[0.06] text-muted",
      )}
      title={e2b ? "Runs in an E2B cloud sandbox" : "Runs in the local sandbox"}
    >
      {e2b ? "e2b" : "local"}
    </span>
  );
}

export default function AllProjects() {
  const projects = useForge((s) => s.projects);
  const openProject = useForge((s) => s.openProject);
  const setView = useForge((s) => s.setView);
  const loadProjects = useForge((s) => s.loadProjects);
  const toast = useForge((s) => s.toast);

  const [q, setQ] = useState("");
  const [grid, setGrid] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const kinds = useMemo(() => {
    const present = Array.from(new Set(projects.map((p) => p.mode)));
    const order = ["web", "mobile", "design", "app", "presentation", "document", "computer", "data"];
    const sorted = [...present].sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    return ["all", ...sorted];
  }, [projects]);

  const shown = projects.filter((p) => {
    const hitQ =
      !q.trim() ||
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.framework.toLowerCase().includes(q.toLowerCase()) ||
      p.mode.toLowerCase().includes(q.toLowerCase());
    return (filter === "all" || p.mode === filter) && hitQ;
  });

  const remove = async (p: ProjectDTO) => {
    setMenuFor(null);
    setDeleting(p.id);
    try {
      await api.deleteProject(p.id);
      await loadProjects();
      toast({ title: "Project deleted", description: p.title, variant: "success" });
    } catch (e) {
      toast({ title: "Failed to delete project", description: String(e), variant: "error" });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col bg-paper">
      <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-line px-4">
        <button
          onClick={() => setView("home")}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-semibold transition hover:bg-black/5"
        >
          <LayoutGrid size={14} className="text-muted" /> All projects
        </button>
        <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-bold text-ink-soft">{projects.length}</span>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex h-8 w-[220px] items-center gap-2 rounded-lg border border-line bg-card px-2.5">
            <Search size={13} className="shrink-0 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects…"
              className="w-full bg-transparent text-[12px] outline-none placeholder:text-faint"
            />
          </div>
          <div className="flex items-center gap-0.5 rounded-lg border border-line bg-card p-0.5">
            <button
              onClick={() => setGrid(true)}
              title="Grid view"
              className={cn("flex h-6 w-7 items-center justify-center rounded-md", grid ? "bg-ink text-white" : "text-muted hover:text-ink")}
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setGrid(false)}
              title="List view"
              className={cn("flex h-6 w-7 items-center justify-center rounded-md", !grid ? "bg-ink text-white" : "text-muted hover:text-ink")}
            >
              <List size={13} />
            </button>
          </div>
          <button
            onClick={() => setView("home")}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-[12px] font-semibold text-white transition hover:bg-stone-800"
          >
            <Plus size={13} /> New project
          </button>
        </div>
      </div>

      {/* mode filter */}
      <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-line-soft px-4 py-2">
        <Filter size={12} className="shrink-0 text-muted" />
        {kinds.map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={cn(
              "h-7 shrink-0 rounded-lg px-2.5 text-[11.5px] font-semibold capitalize transition",
              filter === k ? "bg-ink text-white" : "text-ink-soft hover:bg-black/5 hover:text-ink",
            )}
          >
            {k === "all" ? "All" : k}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {grid ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {shown.map((p, i) => {
              const Icon = modeIcon(p.mode);
              const isBusy = deleting === p.id;
              return (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => void openProject(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void openProject(p.id);
                  }}
                  className={cn(
                    "anim-fade-up group relative flex cursor-pointer flex-col overflow-visible rounded-xl border border-line bg-card text-left transition hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-md",
                    `stagger-${(i % 5) + 1}`,
                  )}
                >
                  <span className="relative flex h-[76px] items-center justify-center border-b border-line-soft">
                    <span className="absolute inset-0 opacity-90" style={{ background: hueGradient(p.hue) }} />
                    <Icon size={24} className="relative text-white/90 drop-shadow-sm" strokeWidth={1.6} />
                  </span>

                  {/* per-card menu */}
                  <div className="absolute right-1.5 top-1.5 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuFor(menuFor === p.id ? null : p.id);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-black/20 text-white/85 backdrop-blur-sm transition hover:bg-black/35 hover:text-white"
                      title="Project actions"
                    >
                      {isBusy ? <Loader2 size={12} className="animate-spin" /> : <MoreHorizontal size={14} />}
                    </button>
                    {menuFor === p.id && (
                      <div className="anim-fade-up absolute right-0 top-8 w-[148px] overflow-hidden rounded-lg border border-line bg-card py-1 shadow-xl">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void remove(p);
                          }}
                          className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] font-medium text-clay transition hover:bg-clay/10"
                        >
                          <Trash2 size={12} /> Delete project
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="flex flex-1 flex-col p-3.5">
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{p.title}</span>
                      {statusBadge(p)}
                    </span>
                    <span className="mt-1 line-clamp-2 flex-1 text-[11.5px] leading-relaxed capitalize text-muted">
                      {p.mode} project · {p.framework}
                    </span>
                    <span className="mt-3 flex items-center gap-2 text-[10px] text-faint">
                      <span className="font-mono">{p.framework}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={9} /> {timeAgo(p.updatedAt)}
                      </span>
                    </span>
                    <span className="mt-2 flex items-center gap-2 border-t border-line-soft pt-2 text-[10px] text-muted">
                      <span className="capitalize">{p.agentMode}</span>
                      {p.swarmEnabled && <span className="font-bold text-clay">swarm</span>}
                      <span className="ml-auto">{runtimeBadge(p)}</span>
                      <ChevronRight size={13} className="text-faint transition group-hover:text-ink" />
                    </span>
                  </span>
                </div>
              );
            })}
            <button
              onClick={() => setView("home")}
              className="flex min-h-[196px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 bg-card/50 text-muted transition hover:border-ink/40 hover:text-ink"
            >
              <FolderKanban size={22} />
              <span className="text-[12.5px] font-medium">Start a new project</span>
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            {shown.map((p, i) => {
              const Icon = modeIcon(p.mode);
              const isBusy = deleting === p.id;
              return (
                <div
                  key={p.id}
                  className={cn("flex w-full items-center gap-3 px-4 py-3 transition hover:bg-black/[0.03]", i > 0 && "border-t border-line-soft")}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white"
                    style={{ background: hueGradient(p.hue) }}
                    onClick={() => void openProject(p.id)}
                  >
                    <Icon size={16} />
                  </span>
                  <span
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => void openProject(p.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void openProject(p.id);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-semibold">{p.title}</span>
                      {statusBadge(p)}
                      {p.swarmEnabled && <span className="shrink-0 rounded bg-clay/10 px-1.5 py-0.5 text-[9px] font-bold text-clay">SWARM</span>}
                    </span>
                    <span className="block truncate text-[11.5px] capitalize text-muted">
                      {p.mode} · {p.framework}
                    </span>
                  </span>
                  <span className="hidden w-[110px] shrink-0 font-mono text-[10px] text-faint sm:block">{p.framework}</span>
                  <span className="hidden w-[90px] shrink-0 text-[10px] capitalize text-muted md:block">{p.agentMode}</span>
                  <span className="hidden w-[70px] shrink-0 lg:block">{runtimeBadge(p)}</span>
                  <span className="w-[90px] shrink-0 text-right text-[10px] text-faint">{timeAgo(p.updatedAt)}</span>
                  <button
                    onClick={() => void remove(p)}
                    disabled={isBusy}
                    title="Delete project"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-faint transition hover:bg-clay/10 hover:text-clay"
                  >
                    {isBusy ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                  <ChevronRight size={15} className="shrink-0 text-faint" />
                </div>
              );
            })}
          </div>
        )}
        {shown.length === 0 && (
          <p className="py-16 text-center text-[13px] text-muted">
            {projects.length === 0 ? "No projects yet — create your first one." : `No projects match “${q}”.`}
          </p>
        )}
      </div>
    </div>
  );
}
