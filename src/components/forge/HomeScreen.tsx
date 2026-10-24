"use client";

// HomeScreen — "What do you want to create?" hero + big composer.
// Ported from the Forge reference; wired to the zustand store + real BFF APIs.

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUp, Plus, FolderGit2, Wand2, Mic, ChevronRight, ArrowUpRight,
  Check, Globe, Smartphone, Palette, Sparkles, Presentation, FileText,
  MousePointerClick, BarChart3, Boxes, Loader2, Settings2, Users, Binary,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForge } from "@/lib/store";
import * as api from "@/lib/api";
import type { ModeDTO } from "@/lib/types";
import { ComposerConfigPanel } from "./ComposerSettings";

/* ---------------- modes ---------------- */

const MODE_ICONS: Record<string, LucideIcon> = {
  web: Globe,
  mobile: Smartphone,
  design: Palette,
  app: Sparkles,
  presentation: Presentation,
  document: FileText,
  computer: MousePointerClick,
  data: BarChart3,
  reverse: Binary,
};

const FALLBACK_MODES: ModeDTO[] = [
  { slug: "web", name: "Web", icon: "globe", color: "#b4532a", description: "Sites and web apps", frameworks: ["react-vite"], samplePrompts: [], swarmAllowed: true, isBuiltin: true },
  { slug: "mobile", name: "Mobile", icon: "smartphone", color: "#7c3aed", description: "Expo + React Native", frameworks: ["expo"], samplePrompts: [], swarmAllowed: true, isBuiltin: true },
  { slug: "design", name: "Design", icon: "palette", color: "#2f6bff", description: "Visual systems and assets", frameworks: ["tokens"], samplePrompts: [], swarmAllowed: false, isBuiltin: true },
  { slug: "app", name: "App", icon: "sparkles", color: "#0e7490", description: "Full-stack applications", frameworks: ["nextjs"], samplePrompts: [], swarmAllowed: true, isBuiltin: true },
  { slug: "presentation", name: "Presentation", icon: "presentation", color: "#c98a2d", description: "Slides and decks", frameworks: ["markdown"], samplePrompts: [], swarmAllowed: true, isBuiltin: true },
  { slug: "document", name: "Document", icon: "file-text", color: "#5b6b4c", description: "Reports and structured docs", frameworks: ["markdown"], samplePrompts: [], swarmAllowed: true, isBuiltin: true },
  { slug: "computer", name: "Computer", icon: "mouse-pointer-click", color: "#b4532a", description: "Drive a real browser / desktop", frameworks: ["agent"], samplePrompts: [], swarmAllowed: true, isBuiltin: true },
  { slug: "data", name: "Data", icon: "bar-chart-3", color: "#1d7a3a", description: "Pipelines, analysis, charts", frameworks: ["python"], samplePrompts: [], swarmAllowed: true, isBuiltin: true },
  { slug: "reverse", name: "Reverse Engineering", icon: "binary", color: "#3f3f46", description: "Binary & protocol analysis with REA tooling", frameworks: ["python"], samplePrompts: [], swarmAllowed: true, isBuiltin: true },
];

/* ---------------- sample prompts per mode (3 each) ---------------- */

const SAMPLES: Record<string, string[]> = {
  web: [
    "Build a landing page for a boutique coffee roaster with a hero, menu grid and wholesale CTA",
    "Create a premium e-commerce storefront for an artisan bakery with cart and checkout",
    "Build a SaaS dashboard with usage analytics, billing table and dark sidebar",
  ],
  mobile: [
    "Build an Expo app for tracking sourdough bakes with timers and a photo log",
    "Create a React Native onboarding flow with NativeWind and animated slides",
    "Build a mobile habit tracker with local storage, streaks and push reminders",
  ],
  design: [
    "Design a token set and component inventory for a fintech brand called Ledgerline",
    "Create three hero art directions for a slow-travel brand and pick the strongest",
    "Build a color + type system for an editorial magazine site with a tokens.css output",
  ],
  app: [
    "Build a full-stack CRM with contacts, pipeline board and activity timeline",
    "Create a team wiki app with search, page tree and markdown editing",
    "Build an invoicing app with clients, line items and PDF export",
  ],
  presentation: [
    "Create a 10-slide pitch deck for a startup raising a seed round",
    "Build a quarterly business review deck with revenue charts and wins",
    "Design a workshop deck about design systems with speaker notes",
  ],
  document: [
    "Write a product spec for a subscription box service with pricing tiers",
    "Draft a technical design doc for migrating a monolith to services",
    "Create an onboarding handbook for new designers with checklists",
  ],
  computer: [
    "Open the staging site, screenshot every page and report visual bugs",
    "Log into the admin panel, export the user list and summarize churn signals",
    "Research competitor pricing pages in the browser and build a comparison table",
  ],
  data: [
    "Analyze this sales CSV and build a revenue dashboard with cohort retention",
    "Scrape product listings, clean the data and chart price distribution",
    "Build a KPI report from the analytics export with week-over-week deltas",
  ],
  reverse: [
    "Analyze the binary in samples/, map entry point and key functions, document control flow",
    "Extract embedded strings, flags and configs from this executable and write an IOC report",
    "Reverse this protocol capture and build a python parser",
  ],
};

/* ---------------- templates ---------------- */

const TEMPLATES: { name: string; desc: string; bg: string; accent: string; glyph: string; mode: string; prompt: string }[] = [
  { name: "Vinyl", desc: "Music & culture", bg: "#3d2b1f", accent: "#e8b04b", glyph: "♪", mode: "web", prompt: "Build a record-store site with a rotating hero, staff picks shelf and listening-party events calendar" },
  { name: "Whiteboard", desc: "Brainstorm canvas", bg: "#f5f2ea", accent: "#2f6bff", glyph: "✎", mode: "app", prompt: "Build an infinite-canvas brainstorm app with sticky notes, arrows and live cursors" },
  { name: "Grove", desc: "Nature & calm", bg: "#dde5d3", accent: "#5b6b4c", glyph: "❧", mode: "web", prompt: "Build a calm botanical garden site with seasonal bloom calendar and ticket booking" },
  { name: "Ledger", desc: "Finance ops", bg: "#e9e4d8", accent: "#b4532a", glyph: "▤", mode: "data", prompt: "Build a cash-flow dashboard from CSV uploads with runway projection and monthly burn charts" },
  { name: "Keynote", desc: "Story deck", bg: "#2b2723", accent: "#c98a2d", glyph: "◭", mode: "presentation", prompt: "Create a 12-slide investor story deck with metric charts and a bold closing ask" },
  { name: "Field Kit", desc: "Computer agent", bg: "#efe6da", accent: "#0e7490", glyph: "⌘", mode: "computer", prompt: "Audit my staging site in the browser: visit every route, screenshot issues and write a fix list" },
];

/* ---------------- small bits ---------------- */

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={cn("relative inline-block h-5 w-[34px] shrink-0 rounded-full transition-colors", on ? "bg-ink" : "bg-[#d6cfbd]")}
      data-on={on}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
          on && "translate-x-[14px]",
        )}
      />
    </span>
  );
}

function hueDot(hue: number) {
  return `linear-gradient(135deg, hsl(${hue} 48% 58%), hsl(${(hue + 46) % 360} 46% 42%))`;
}

export default function HomeScreen() {
  const composer = useForge((s) => s.composer);
  const setComposer = useForge((s) => s.setComposer);
  const setOverlay = useForge((s) => s.setOverlay);
  const setView = useForge((s) => s.setView);
  const createAndOpen = useForge((s) => s.createAndOpen);
  const openProject = useForge((s) => s.openProject);
  const projects = useForge((s) => s.projects);
  const toast = useForge((s) => s.toast);

  const [draft, setDraft] = useState("");
  const [modes, setModes] = useState<ModeDTO[]>(FALLBACK_MODES);
  const [modeOpen, setModeOpen] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const modeBtnRef = useRef<HTMLButtonElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);

  // load modes (builtin + custom) from the backend
  useEffect(() => {
    let alive = true;
    api
      .listModes()
      .then((res) => {
        if (alive && res.modes?.length) setModes(res.modes);
      })
      .catch(() => {
        /* offline — fallback list stays */
      });
    return () => {
      alive = false;
    };
  }, []);

  const mode = useMemo(() => modes.find((m) => m.slug === composer.mode) ?? modes[0], [modes, composer.mode]);
  const swarmDisabled = mode ? !mode.swarmAllowed : composer.mode === "design";
  const samples = useMemo(() => {
    const fromApi = mode?.samplePrompts?.filter(Boolean) ?? [];
    return fromApi.length >= 3 ? fromApi.slice(0, 3) : SAMPLES[mode?.slug ?? "web"] ?? SAMPLES.web;
  }, [mode]);

  /* ---------- dropdown placement (ported from the reference portal logic) ---------- */

  const placeBelow = (btn: HTMLElement | null, panel: HTMLElement | null) => {
    if (!btn || !panel) return;
    const r = btn.getBoundingClientRect();
    const w = panel.offsetWidth || 280;
    const maxH = window.innerHeight - r.bottom - 16;
    panel.style.visibility = "visible";
    panel.style.top = `${r.bottom + 8}px`;
    panel.style.bottom = "auto";
    let left = r.right - w;
    if (left < 8) left = Math.max(8, r.left);
    if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
    panel.style.left = `${left}px`;
    panel.style.maxHeight = `${Math.max(220, maxH > 220 ? maxH : window.innerHeight - r.bottom - 8)}px`;
  };

  useEffect(() => {
    if (!modeOpen) return;
    const place = () => placeBelow(modeBtnRef.current, modeRef.current);
    place();
    const id = window.setTimeout(place, 16);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [modeOpen]);

  /* ---------- actions ---------- */

  const pickMode = (m: ModeDTO) => {
    setComposer({ mode: m.slug, framework: m.frameworks?.[0] ?? composer.framework });
    setModeOpen(false);
  };

  const enhance = async () => {
    const text = draft.trim();
    if (!text || enhancing) return;
    setEnhancing(true);
    try {
      const res = await api.enhancePrompt(text, composer.mode);
      if (res?.text) setDraft(res.text);
    } catch (e) {
      toast({ title: "Enhance failed", description: String(e), variant: "error" });
    } finally {
      setEnhancing(false);
    }
  };

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    const title = text.length > 46 ? `${text.slice(0, 46).trimEnd()}…` : text;
    void createAndOpen({
      title,
      mode: composer.mode,
      framework: composer.framework,
      config: {
        designSystem: composer.designSystem,
        style: composer.style,
        skills: composer.skills,
        mcps: composer.mcps,
      },
      swarm: composer.swarm,
      agentMode: composer.agentMode,
      initialPrompt: text,
    });
  };

  const recents = projects.slice(0, 4);
  const ModeIcon = MODE_ICONS[mode?.slug ?? ""] ?? Boxes;

  return (
    <div className="dot-grid h-full flex-1 overflow-y-auto bg-paper">
      <div className="mx-auto max-w-[780px] px-6 pb-16 pt-14">
        <h1 className="anim-fade-up text-center font-display text-[42px] leading-tight tracking-tight">
          What do you want to create?
        </h1>
        <p className="anim-fade-up stagger-1 mt-2 text-center text-[14px] text-muted">
          Pick a mode, tune the stack, describe it — the agent plans, writes the code, and shows a live preview.
        </p>

        {/* composer */}
        <div
          className={cn(
            "anim-fade-up stagger-2 relative mt-7 rounded-2xl border bg-card shadow-[0_16px_48px_-20px_rgba(28,25,23,0.3)] transition",
            modeOpen ? "border-ink/30" : "border-line",
          )}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder='Design a modern premium e-commerce website for "Spice & Crumb", an artisan spice and baking brand…'
            rows={4}
            className="w-full resize-none bg-transparent px-5 pb-2 pt-4 text-[14px] leading-relaxed outline-none placeholder:text-faint"
          />

          {/* config chips — mirror store.composer */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-line-soft px-3 py-2">
            <span className="flex items-center gap-1 rounded-md bg-black/[0.05] px-2 py-1 text-[10px] font-semibold text-ink-soft">
              <ModeIcon size={9} /> {mode?.name ?? "Web"}
            </span>
            {composer.framework && (
              <span className="rounded-md bg-black/[0.05] px-2 py-1 font-mono text-[10px] font-semibold text-ink-soft">
                {composer.framework}
              </span>
            )}
            {composer.style && (
              <span className="rounded-md bg-black/[0.05] px-2 py-1 text-[10px] font-semibold text-ink-soft">{composer.style}</span>
            )}
            {composer.designSystem && (
              <span className="rounded-md bg-black/[0.05] px-2 py-1 text-[10px] font-semibold text-ink-soft">
                {composer.designSystem}
              </span>
            )}
            <button
              onClick={() => setConfigOpen(true)}
              className="flex items-center gap-1 rounded-md bg-sage-bg px-2 py-1 text-[10px] font-semibold text-moss transition hover:bg-moss/15"
              title="Edit skills & MCPs"
            >
              Skills {composer.skills.length}
            </button>
            <button
              onClick={() => setConfigOpen(true)}
              className="flex items-center gap-1 rounded-md bg-sage-bg px-2 py-1 text-[10px] font-semibold text-moss transition hover:bg-moss/15"
              title="Edit skills & MCPs"
            >
              MCPs {composer.mcps.length}
            </button>
            {composer.swarm && (
              <span className="flex items-center gap-1 rounded-md bg-clay/10 px-2 py-1 text-[10px] font-bold text-clay">
                <Users size={9} /> Swarm ×{composer.swarmAgents}
                <button onClick={() => setComposer({ swarm: false })} className="ml-0.5 hover:text-ink" title="Disable swarm">
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => setConfigOpen(true)}
              className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-muted transition hover:text-ink"
            >
              <Settings2 size={10} /> Edit
            </button>
          </div>

          {/* toolbar */}
          <div className="flex items-center gap-1.5 px-3 pb-3">
            <button
              onClick={() => setConfigOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition hover:border-ink/25 hover:text-ink"
              title="Add context — task setup, skills and MCPs"
            >
              <Plus size={16} />
            </button>

            {/* mode picker */}
            <div className="relative">
              <button
                ref={modeBtnRef}
                onClick={() => setModeOpen((v) => !v)}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[12px] font-medium text-ink-soft transition hover:text-ink"
              >
                <ModeIcon size={13} /> {mode?.name ?? "Web"} ▾
              </button>
              {modeOpen &&
                createPortal(
                  <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setModeOpen(false)} />
                    <div
                      ref={modeRef}
                      style={{ visibility: "hidden" }}
                      className="anim-fade-up fixed z-[100] w-[262px] overflow-y-auto rounded-xl border border-line bg-card p-1.5 shadow-2xl"
                    >
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">Task mode</p>
                      {modes.map((m) => {
                        const I = MODE_ICONS[m.slug] ?? Boxes;
                        const on = composer.mode === m.slug;
                        return (
                          <button
                            key={m.slug}
                            onClick={() => pickMode(m)}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition",
                              on ? "bg-black/[0.05]" : "hover:bg-black/[0.04]",
                            )}
                          >
                            <I size={14} className={on ? "text-clay" : "text-muted"} />
                            <span className="min-w-0 flex-1">
                              <span className="block text-[12px] font-semibold">
                                {m.name}
                                {!m.isBuiltin && (
                                  <span className="ml-1.5 rounded bg-black/[0.06] px-1 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-muted">
                                    custom
                                  </span>
                                )}
                              </span>
                              <span className="block text-[9.5px] text-muted">{m.description}</span>
                            </span>
                            {on && <Check size={12} className="shrink-0 text-moss" />}
                          </button>
                        );
                      })}
                      <p className="border-t border-line-soft px-2.5 pb-1 pt-2 text-[10px] leading-relaxed text-faint">
                        Each mode pre-activates its own skills and MCPs.
                      </p>
                    </div>
                  </>,
                  document.body,
                )}
            </div>

            {/* swarm — disabled in design mode */}
            <button
              onClick={() => !swarmDisabled && setComposer({ swarm: !composer.swarm })}
              disabled={swarmDisabled}
              title={swarmDisabled ? "Swarm is disabled in design mode" : composer.swarm ? "Swarm mode on — parallel sub-agents" : "Enable swarm mode"}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition",
                composer.swarm ? "border-clay/40 bg-clay/[0.08] text-clay" : "border-line bg-card text-ink-soft hover:text-ink",
                swarmDisabled && "cursor-not-allowed opacity-45",
              )}
            >
              <Users size={13} />
              Swarm
              <Toggle on={composer.swarm} />
              {composer.swarm && <span className="font-mono text-[10.5px] font-bold">×{composer.swarmAgents}</span>}
            </button>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => setOverlay("githubImportOpen", true)}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[12px] font-medium text-ink-soft transition hover:text-ink"
                title="Import a repository from GitHub"
              >
                <FolderGit2 size={13} /> GitHub
              </button>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-black/5 hover:text-ink"
                title="Voice input"
              >
                <Mic size={15} />
              </button>
              <button
                onClick={() => void enhance()}
                disabled={enhancing || !draft.trim()}
                title="Enhance this prompt"
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-lg border transition",
                  enhancing
                    ? "border-clay/40 bg-clay/[0.08] text-clay"
                    : "border-line text-muted hover:border-ink/25 hover:text-ink",
                  !draft.trim() && !enhancing && "opacity-45",
                )}
              >
                {enhancing && (
                  <span className="absolute inset-0 animate-spin rounded-lg border border-transparent border-t-clay border-r-clay/40" />
                )}
                <Wand2 size={15} className={enhancing ? "animate-pulse" : ""} />
              </button>
              <button
                onClick={submit}
                disabled={!draft.trim()}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition",
                  draft.trim() ? "bg-ink text-white hover:bg-stone-800" : "bg-black/[0.07] text-faint",
                )}
                title="Create"
              >
                <ArrowUp size={17} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>

        {/* task-setup modal — opens from the + / Edit / Skills / MCPs buttons */}
        {configOpen &&
          createPortal(
            <div className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-[2px]" onClick={() => setConfigOpen(false)}>
              <div className="flex min-h-full items-center justify-center p-4">
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="anim-fade-up flex max-h-[84vh] w-[min(880px,94vw)] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl"
                >
                  <ComposerConfigPanel onClose={() => setConfigOpen(false)} />
                </div>
              </div>
            </div>,
            document.body,
          )}

        {/* samples */}
        <p className="mt-7 text-[13px] font-semibold">
          Sample prompts · <span className="font-normal text-muted">{mode?.name ?? "Web"}</span>
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {samples.map((s, i) => (
            <button
              key={s}
              onClick={() => setDraft(s)}
              className={cn(
                "anim-fade-up group flex min-h-[104px] flex-col rounded-xl border border-line bg-card p-3.5 text-left transition hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-md",
                `stagger-${(i % 5) + 1}`,
              )}
            >
              <span className="flex-1 text-[12.5px] leading-relaxed text-ink-soft">{s}</span>
              <ArrowUpRight size={14} className="ml-auto mt-2 text-faint transition group-hover:text-ink" />
            </button>
          ))}
        </div>

        {/* templates */}
        <div className="mt-7 flex items-center justify-between">
          <p className="text-[13px] font-semibold">Choose a starting point</p>
          <button
            onClick={() => setView("projects")}
            className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-[12px] font-medium text-ink-soft transition hover:text-ink"
          >
            Browse projects
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.name}
              onClick={() => {
                setDraft(t.prompt);
                setComposer({ mode: t.mode });
              }}
              className="group overflow-hidden rounded-xl border border-line bg-card text-left transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-[86px] items-center justify-center text-[32px]" style={{ background: t.bg, color: t.accent }}>
                {t.glyph}
              </span>
              <span className="block px-3 py-2 text-center">
                <span className="block text-[12.5px] font-semibold">{t.name}</span>
                <span className="block text-[10px] text-muted">{t.desc}</span>
              </span>
            </button>
          ))}
        </div>

        {/* recents */}
        <div className="mt-7 flex items-center justify-between">
          <p className="text-[13px] font-semibold">Recent projects</p>
          <button onClick={() => setView("projects")} className="text-[12px] font-medium text-muted transition hover:text-ink">
            View all →
          </button>
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border border-line bg-card">
          {recents.length === 0 && (
            <div className="flex items-center gap-3 px-4 py-4 text-[12.5px] text-muted">
              <Loader2 size={13} className="animate-spin text-faint" /> Loading your projects…
            </div>
          )}
          {recents.map((p, i) => (
            <button
              key={p.id}
              onClick={() => void openProject(p.id)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-black/[0.03]",
                i > 0 && "border-t border-line-soft",
              )}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: hueDot(p.hue) }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{p.title}</span>
                <span className="block truncate text-[11.5px] capitalize text-muted">
                  {p.mode} · {p.framework} · {p.status}
                </span>
              </span>
              <ChevronRight size={15} className="shrink-0 text-faint" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
