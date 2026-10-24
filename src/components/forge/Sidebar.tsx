"use client";

// Ported from ai-agent-chat-interface-23 Sidebar — warm-paper IDE navigation rail.
// State comes from the zustand store instead of prop drilling.

import { useEffect } from "react";
import {
  Blocks,
  ChevronDown,
  ChevronRight,
  Clock3,
  Component,
  FolderKanban,
  Gauge,
  LayoutGrid,
  Library,
  MessagesSquare,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useForge } from "@/lib/store";

export default function Sidebar() {
  const view = useForge((s) => s.view);
  const setView = useForge((s) => s.setView);
  const setOverlay = useForge((s) => s.setOverlay);
  const collapsed = useForge((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useForge((s) => s.setSidebarCollapsed);
  const projects = useForge((s) => s.projects);
  const activeProject = useForge((s) => s.activeProject);
  const loadProjects = useForge((s) => s.loadProjects);
  const openProject = useForge((s) => s.openProject);

  useEffect(() => {
    void loadProjects();
  }, []);

  if (collapsed) {
    return (
      <button
        onClick={() => setSidebarCollapsed(false)}
        className="flex w-10 shrink-0 flex-col items-center gap-2 border-r border-line bg-cream pt-4 text-muted transition hover:text-ink"
        title="Expand navigation"
      >
        <ChevronRight size={15} />
        <span className="text-[9.5px] font-bold tracking-wider [writing-mode:vertical-lr]">NAVIGATION</span>
        <span className="mb-3 mt-auto flex h-6 w-6 items-center justify-center rounded-full bg-clay text-[9px] font-bold text-white">
          Z
        </span>
      </button>
    );
  }

  const recent = [...projects]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .filter((p) => p.id !== activeProject?.id)
    .slice(0, 3);

  return (
    <aside className="flex w-[248px] shrink-0 flex-col border-r border-line bg-paper">
      {/* brand */}
      <div className="flex h-[52px] items-center gap-2.5 px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-ink text-[15px] font-bold text-paper">
          Z
        </span>
        <span className="font-display text-[21px] tracking-tight">zcode</span>
        <span className="ml-auto rounded-md border border-line bg-white/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
          0.1
        </span>
      </div>

      <div className="space-y-0.5 px-2.5">
        <button
          onClick={() => setView("home")}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-ink transition hover:bg-black/5"
        >
          <Plus size={16} strokeWidth={2} /> New task
          <kbd className="ml-auto rounded border border-line bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
            ⌘N
          </kbd>
        </button>
        <button
          onClick={() => setOverlay("commandOpen", true)}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] text-ink-soft transition hover:bg-black/5 hover:text-ink"
        >
          <Search size={16} strokeWidth={1.8} /> Search
          <kbd className="ml-auto rounded border border-line bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
            ⌘K
          </kbd>
        </button>
        <button
          onClick={() => setView("library")}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] transition",
            view === "library" ? "bg-black/6 font-medium text-ink" : "text-ink-soft hover:bg-black/5 hover:text-ink",
          )}
        >
          <Component size={16} strokeWidth={1.8} /> Component library
        </button>
        <button
          onClick={() => setView("suite")}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] transition",
            view === "suite" ? "bg-black/6 font-medium text-ink" : "text-ink-soft hover:bg-black/5 hover:text-ink",
          )}
        >
          <Library size={16} strokeWidth={1.8} /> Card library
        </button>
      </div>

      <div className="mt-5 px-2.5">
        <div className="flex items-center justify-between px-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Projects</span>
          <button
            onClick={() => setView("home")}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink"
            title="New project"
          >
            <Plus size={14} />
          </button>
        </div>
        <button
          onClick={() => setView("projects")}
          className={cn(
            "mt-1.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition",
            view === "projects" ? "bg-black/6 text-ink" : "text-ink-soft hover:bg-black/5 hover:text-ink",
          )}
        >
          <LayoutGrid size={15} strokeWidth={1.8} /> All projects
        </button>
        {projects.slice(0, 6).map((p) => {
          const active = p.id === activeProject?.id;
          return (
            <button
              key={p.id}
              onClick={() => void openProject(p.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition",
                active
                  ? "bg-ink/[0.05] font-medium text-ink"
                  : "text-ink-soft hover:bg-black/5 hover:text-ink",
              )}
            >
              <span className={cn("h-2 w-2 shrink-0 rounded-full", active ? "bg-clay" : "bg-line")} />
              <span className="truncate">{p.title}</span>
            </button>
          );
        })}
        {projects.length === 0 && (
          <p className="px-2.5 py-2 text-[11.5px] text-faint">No projects yet — start a new task.</p>
        )}
        <button
          onClick={() => setView("home")}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-soft transition hover:bg-black/5 hover:text-ink"
        >
          <FolderKanban size={15} strokeWidth={1.8} /> New project
        </button>
      </div>

      <div className="mt-4 px-2.5">
        <div className="flex items-center justify-between px-2.5">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <Clock3 size={12} /> Recent
          </span>
          <button
            onClick={() => setView("projects")}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink"
            title="All projects"
          >
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="mt-1.5 space-y-0.5">
          {recent.map((p) => (
            <button
              key={p.id}
              onClick={() => void openProject(p.id)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] text-ink-soft transition hover:bg-black/5 hover:text-ink"
            >
              <MessagesSquare size={14} className="ml-0.5 shrink-0" strokeWidth={1.8} />
              <span className="truncate">{p.title}</span>
            </button>
          ))}
          {recent.length === 0 && (
            <p className="px-2.5 py-2 text-[11.5px] text-faint">Recent tasks land here.</p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-0.5 px-2.5">
        <button
          onClick={() => setView("integrations")}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition",
            view === "integrations" ? "bg-black/6 font-medium text-ink" : "text-ink-soft hover:bg-black/5 hover:text-ink",
          )}
        >
          <Blocks size={15} strokeWidth={1.8} /> Integrations
          <ChevronDown size={13} className="ml-auto" />
        </button>
      </div>

      <div className="mt-auto space-y-1.5 border-t border-line p-3">
        <button
          onClick={() => setView("account")}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition",
            view === "account" ? "bg-black/6 font-medium text-ink" : "text-ink-soft hover:bg-black/5 hover:text-ink",
          )}
        >
          <Gauge size={15} strokeWidth={1.8} /> Account &amp; usage
        </button>
        <button
          onClick={() => setView("settings")}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition",
            view === "settings" ? "bg-black/6 font-medium text-ink" : "text-ink-soft hover:bg-black/5 hover:text-ink",
          )}
        >
          <Settings size={15} strokeWidth={1.8} /> Settings
        </button>
        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card p-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-clay text-xs font-bold text-white">
            Z
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-semibold">zcode-user</p>
            <p className="text-[11px] text-muted">Local workspace</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
