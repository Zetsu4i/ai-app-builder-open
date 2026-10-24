"use client";

// ZCode Builder — composer settings: modes, design systems, styles, skills,
// MCPs, swarm. Reads/writes the zustand composer config; loads real catalogs
// from the BFF (modes / design systems / skills / MCPs).

import { useEffect, useState } from "react";
import {
  Monitor, Smartphone, Palette, FileText, Check, Puzzle,
  Blocks, Users, Cpu, Info, Layers2, SlidersHorizontal, X,
  Sparkles, Presentation, MousePointerClick, BarChart3, Globe, Binary,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as api from "@/lib/api";
import { useForge } from "@/lib/store";
import type { ComposerConfig, DesignSystemDTO, McpServerDTO, ModeDTO, SkillDTO } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  modes — 8 builtins + custom from api.listModes()                   */
/* ------------------------------------------------------------------ */

export const MODES: { id: string; label: string; icon: typeof Monitor; desc: string; target: string }[] = [
  { id: "web", label: "Web App", icon: Globe, desc: "Sites and web apps", target: "Vercel preview" },
  { id: "mobile", label: "Mobile App", icon: Smartphone, desc: "Expo + React Native", target: "Expo Go · QR" },
  { id: "design", label: "Design", icon: Palette, desc: "Visual systems and assets", target: "Figma-ready" },
  { id: "app", label: "Anything", icon: Sparkles, desc: "Agent chooses the medium", target: "Auto" },
  { id: "presentation", label: "Presentation", icon: Presentation, desc: "Decks and slides", target: "HTML deck" },
  { id: "document", label: "Document", icon: FileText, desc: "Reports and structured docs", target: "Markdown / PDF" },
  { id: "computer", label: "Computer Use", icon: MousePointerClick, desc: "Drive a real browser", target: "Chromium session" },
  { id: "data", label: "Data Analysis", icon: BarChart3, desc: "Datasets, charts, insights", target: "Tables + charts" },
  { id: "reverse", label: "Reverse Engineering", icon: Binary, desc: "Binary & protocol analysis with REA tooling", target: "Ghidra + REA MCP" },
];

const MODE_FRAMEWORKS: Record<string, string[]> = {
  web: ["Next.js", "Vite + React", "Astro", "SvelteKit", "Remix"],
  mobile: ["Expo SDK 52", "Expo Router", "React Native CLI", "Bare workflow"],
  design: ["Tokens only", "Tailwind theme", "CSS variables", "Style Dictionary"],
  app: ["Auto", "Next.js", "Expo SDK 52", "Markdown"],
  presentation: ["HTML deck", "Reveal.js", "MDX deck"],
  document: ["Markdown", "MDX", "LaTeX", "Notion export"],
  computer: ["Playwright", "Puppeteer", "CDP"],
  data: ["Pandas", "DuckDB", "SQLite", "Observable"],
  reverse: ["Python"],
};

/** slug → icon for the builtin modes (custom modes fall back to Sparkles). */
const ICON_BY_MODE: Record<string, typeof Monitor> = Object.fromEntries(MODES.map((m) => [m.id, m.icon] as const));
const modeIconFor = (slug: string): typeof Monitor => ICON_BY_MODE[slug] ?? Sparkles;

export const STYLES = [
  "Warm editorial", "Scandinavian minimal", "Brutalist grid", "Soft glass",
  "Dark neo-bank", "Playful rounded", "Swiss typographic", "Retro print",
];

const FALLBACK_DESIGN_SYSTEMS: DesignSystemDTO[] = [
  { slug: "forge-warm", name: "Forge Warm", category: "editorial", description: "Warm paper, clay accents" },
  { slug: "none", name: "None — start fresh", category: "bare", description: "No preset tokens" },
];

export const AGENT_MODES: { id: ComposerConfig["agentMode"]; label: string; note: string }[] = [
  { id: "plan", label: "Plan", note: "research + plan only" },
  { id: "build", label: "Build", note: "ask before risky tools" },
  { id: "edit", label: "Edit", note: "files only, no commands" },
  { id: "yolo", label: "Yolo", note: "auto-approve everything" },
  { id: "auto", label: "Auto", note: "agent decides" },
];

/* ------------------------------------------------------------------ */
/*  catalog loaders (module caches so all instances share one fetch)   */
/* ------------------------------------------------------------------ */

let modesCache: ModeDTO[] | null = null;
let dsCache: DesignSystemDTO[] | null = null;
let skillsCache: SkillDTO[] | null = null;
let mcpsCache: McpServerDTO[] | null = null;

function useCatalog<T>(load: () => Promise<T>, cache: T | null, fallback: T): T {
  const [value, setValue] = useState<T>(cache ?? fallback);
  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    load()
      .then((v) => {
        if (cancelled) return;
        setValue(v);
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return value;
}

export function useModes(): ModeDTO[] {
  const fallback: ModeDTO[] = MODES.map((m) => ({
    slug: m.id,
    name: m.label,
    icon: m.id,
    color: "#b4532a",
    description: m.desc,
    frameworks: MODE_FRAMEWORKS[m.id] ?? [],
    samplePrompts: [],
    swarmAllowed: m.id !== "design",
    isBuiltin: true,
  }));
  return useCatalog<ModeDTO[]>(
    async () => {
      const { modes } = await api.listModes();
      modesCache = modes;
      // builtin first (with static framework fallbacks), custom after
      const builtin = modes.filter((m) => m.isBuiltin).map((m) => ({ ...m, frameworks: m.frameworks.length ? m.frameworks : MODE_FRAMEWORKS[m.slug] ?? [] }));
      const custom = modes.filter((m) => !m.isBuiltin);
      return [...builtin, ...custom];
    },
    modesCache,
    fallback,
  );
}

export function useDesignSystems(): DesignSystemDTO[] {
  return useCatalog<DesignSystemDTO[]>(
    async () => {
      const { systems } = await api.listDesignSystems();
      dsCache = systems;
      return systems.length ? systems : FALLBACK_DESIGN_SYSTEMS;
    },
    dsCache,
    FALLBACK_DESIGN_SYSTEMS,
  );
}

export function useSkills(): SkillDTO[] {
  return useCatalog<SkillDTO[]>(
    async () => {
      const { skills } = await api.listSkills();
      skillsCache = skills;
      return skills;
    },
    skillsCache,
    [],
  );
}

export function useMcps(): McpServerDTO[] {
  return useCatalog<McpServerDTO[]>(
    async () => {
      const { servers } = await api.listMcp();
      mcpsCache = servers;
      return servers;
    },
    mcpsCache,
    [],
  );
}

export const skillLabel = (id: string) => skillsCache?.find((s) => s.slug === id)?.name ?? id;
export const mcpLabel = (id: string) => mcpsCache?.find((s) => s.name === id)?.name ?? id;
export const modeLabel = (id: string) => modesCache?.find((m) => m.slug === id)?.name ?? MODES.find((m) => m.id === id)?.label ?? id;
export const frameworksFor = (modeId: string): string[] =>
  modesCache?.find((m) => m.slug === modeId)?.frameworks ?? MODE_FRAMEWORKS[modeId] ?? [];

/* ------------------------------------------------------------------ */
/*  primitives                                                         */
/* ------------------------------------------------------------------ */

function Section({ icon: Icon, title, hint, children }: {
  icon: typeof Blocks;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line-soft px-3 py-2.5 first:border-t-0">
      <div className="flex items-center gap-1.5">
        <Icon size={12} className="text-muted" />
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">{title}</span>
        {hint && <span className="ml-auto text-[10px] text-faint">{hint}</span>}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Chip({ on, onClick, disabled, children }: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left text-[11.5px] font-medium transition",
        on ? "border-ink bg-ink text-white" : "border-line bg-cream text-ink-soft hover:border-ink/25 hover:text-ink",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {on && <Check size={10} strokeWidth={3} />}
      <span className="truncate">{children}</span>
    </button>
  );
}

/** Row in the + context panel. */
function ToggleRow({ label, note, on, onToggle }: {
  label: string;
  note: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition",
        on ? "border-moss/40 bg-moss/[0.06]" : "border-line bg-card hover:border-ink/20",
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", on ? "bg-moss" : "bg-faint")} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-medium text-ink">{label}</span>
        <span className="block truncate text-[10.5px] text-muted">{note}</span>
      </span>
      <span className="toggle shrink-0 scale-[0.82]" data-on={on} />
    </button>
  );
}

const DS_COLORS = ["#b4532a", "#5b6b4c", "#c98a2d", "#8a8580", "#cc2b60", "#292524"];
function dsColors(slug: string): string[] {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  const a = DS_COLORS[h % DS_COLORS.length];
  const b = DS_COLORS[(h >> 3) % DS_COLORS.length];
  const c = DS_COLORS[(h >> 6) % DS_COLORS.length];
  return [a, b, c];
}

/* ------------------------------------------------------------------ */
/*  full settings sheet                                                */
/* ------------------------------------------------------------------ */

export function SettingsSheet() {
  const config = useForge((s) => s.composer);
  const setComposer = useForge((s) => s.setComposer);
  const modes = useModes();
  const designSystems = useDesignSystems();
  const set = <K extends keyof ComposerConfig>(k: K, v: ComposerConfig[K]) => setComposer({ [k]: v } as Partial<ComposerConfig>);
  const isDesign = config.mode === "design";
  const frameworks = frameworksFor(config.mode);
  const currentMode = modes.find((m) => m.slug === config.mode);
  const swarmDisabled = isDesign || (currentMode ? !currentMode.swarmAllowed : false);

  return (
    <div className="max-h-[380px] overflow-y-auto">
      {/* framework */}
      <Section icon={SlidersHorizontal} title={config.mode === "mobile" ? "Mobile framework" : "Framework"}>
        {frameworks.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {frameworks.map((f) => (
              <Chip key={f} on={config.framework === f} onClick={() => set("framework", f)}>
                {f}
              </Chip>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-muted">No frameworks for this mode — the agent picks the stack.</p>
        )}
      </Section>

      <Section icon={Info} title="Design system">
        <div className="space-y-1">
          {designSystems.map((d) => {
            const on = config.designSystem === d.slug;
            const colors = dsColors(d.slug);
            return (
              <button
                key={d.slug}
                onClick={() => set("designSystem", on ? null : d.slug)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-[12px] transition",
                  on ? "border-ink bg-ink/[0.05] font-semibold text-ink" : "border-line bg-card text-ink-soft hover:border-ink/20",
                )}
              >
                <span className="flex shrink-0 gap-0.5">
                  {colors.map((c, i) => (
                    <span key={i} className="h-3 w-3 rounded-[3px] border border-black/10" style={{ background: c }} />
                  ))}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {d.name}
                  {d.category && <span className="ml-1.5 text-[10px] font-normal text-muted">{d.category}</span>}
                </span>
                {on && <Check size={12} className="ml-auto shrink-0 text-moss" />}
              </button>
            );
          })}
        </div>
      </Section>

      <Section icon={Layers2} title="Visual style">
        <div className="flex flex-wrap gap-1.5">
          {STYLES.map((s) => (
            <Chip key={s} on={config.style === s} onClick={() => set("style", config.style === s ? null : s)}>
              {s}
            </Chip>
          ))}
        </div>
      </Section>

      {/* agent mode */}
      <Section icon={Cpu} title="Agent mode" hint="how autonomous the agent is">
        <div className="flex flex-wrap gap-1.5">
          {AGENT_MODES.map((m) => (
            <Chip key={m.id} on={config.agentMode === m.id} onClick={() => set("agentMode", m.id)}>
              {m.label} <span className="text-[9.5px] font-normal opacity-70">{m.note}</span>
            </Chip>
          ))}
        </div>
      </Section>

      {/* swarm */}
      <Section icon={Users} title="Swarm mode" hint={swarmDisabled ? (isDesign ? "not available in design mode" : "not available for this mode") : "parallel sub-agents"}>
        <button
          onClick={() => !swarmDisabled && set("swarm", !config.swarm)}
          disabled={swarmDisabled}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition",
            config.swarm && !swarmDisabled ? "border-clay/40 bg-clay/[0.06]" : "border-line bg-card hover:border-ink/20",
            swarmDisabled && "cursor-not-allowed opacity-60",
          )}
        >
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              config.swarm && !swarmDisabled ? "bg-clay text-white" : "bg-black/[0.06] text-ink-soft",
            )}
          >
            <Users size={15} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold text-ink">Orchestrate parallel agents</span>
            <span className="block text-[11px] leading-snug text-muted">
              An orchestrator decomposes the task and runs sub-agents concurrently.
            </span>
          </span>
          <span className="toggle shrink-0" data-on={config.swarm && !swarmDisabled} />
        </button>
        {config.swarm && !swarmDisabled && (
          <div className="anim-fade-in mt-2 rounded-xl border border-line bg-cream px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold">Agents in swarm</span>
              <span className="font-mono text-[12px] font-bold text-ink">{config.swarmAgents}</span>
            </div>
            <input
              type="range"
              min={2}
              max={8}
              value={config.swarmAgents}
              onChange={(e) => set("swarmAgents", Number(e.target.value))}
              className="mt-2 w-full"
            />
          </div>
        )}
      </Section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ComposerConfigPanel — one scrollable panel with EVERYTHING          */
/*  (mode, framework, design system, style, agent mode, swarm,          */
/*  skills, MCPs). Opened from the HomeScreen +/Edit buttons.           */
/* ------------------------------------------------------------------ */

export function ComposerConfigPanel({ onClose }: { onClose: () => void }) {
  const config = useForge((s) => s.composer);
  const setComposer = useForge((s) => s.setComposer);
  const modes = useModes();
  const designSystems = useDesignSystems();
  const skills = useSkills();
  const mcps = useMcps();

  const currentMode = modes.find((m) => m.slug === config.mode);
  const frameworks = frameworksFor(config.mode);
  const swarmDisabled = config.mode === "design" || (currentMode ? !currentMode.swarmAllowed : false);

  const set = <K extends keyof ComposerConfig>(k: K, v: ComposerConfig[K]) =>
    setComposer({ [k]: v } as Partial<ComposerConfig>);

  const toggleIn = (key: "skills" | "mcps", id: string) => {
    const cur = config[key];
    const has = cur.includes(id);
    setComposer({ [key]: has ? cur.filter((x) => x !== id) : [...cur, id] } as Partial<ComposerConfig>);
  };

  return (
    <div className="flex min-h-0 w-full flex-col overflow-hidden text-ink">
      {/* header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-line-soft px-3 py-2.5">
        <SlidersHorizontal size={12} className="text-muted" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Task setup</span>
        <span className="truncate rounded bg-black/[0.06] px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-ink-soft">
          {config.mode} mode
        </span>
        <button
          onClick={onClose}
          title="Close"
          className="ml-auto flex h-5 w-5 items-center justify-center rounded text-muted transition hover:bg-black/5 hover:text-ink"
        >
          <X size={12} />
        </button>
      </div>

      {/* scrollable body */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* mode */}
        <Section icon={Blocks} title="Mode">
          <div className="grid gap-1.5 sm:grid-cols-2">
            {modes.map((m) => {
              const I = modeIconFor(m.slug);
              const on = config.mode === m.slug;
              return (
                <button
                  key={m.slug}
                  onClick={() => setComposer({ mode: m.slug, framework: m.frameworks[0] ?? "" })}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border px-2 py-1.5 text-left transition",
                    on ? "border-ink/25 bg-black/[0.05]" : "border-transparent hover:bg-black/[0.04]",
                  )}
                >
                  <I size={14} className={cn("shrink-0", on ? "text-clay" : "text-muted")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-semibold text-ink">
                      {m.name}
                      {!m.isBuiltin && (
                        <span className="ml-1.5 rounded bg-black/[0.06] px-1 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-muted">
                          custom
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-[9.5px] text-muted">{m.description}</span>
                  </span>
                  {on && <Check size={12} className="shrink-0 text-moss" />}
                </button>
              );
            })}
          </div>
        </Section>

        {/* framework */}
        {frameworks.length > 0 && (
          <Section icon={SlidersHorizontal} title="Framework">
            <div className="flex flex-wrap gap-1.5">
              {frameworks.map((f) => (
                <Chip key={f} on={config.framework === f} onClick={() => set("framework", f)}>
                  {f}
                </Chip>
              ))}
            </div>
          </Section>
        )}

        {/* design system */}
        <Section icon={Info} title="Design system">
          <div className="grid gap-1.5 sm:grid-cols-2">
            {designSystems.map((d) => {
              const on = config.designSystem === d.slug;
              const colors = dsColors(d.slug);
              return (
                <button
                  key={d.slug}
                  onClick={() => set("designSystem", on ? null : d.slug)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-[12px] transition",
                    on ? "border-ink bg-ink/[0.05] font-semibold text-ink" : "border-line bg-card text-ink-soft hover:border-ink/20",
                  )}
                >
                  <span className="flex shrink-0 gap-0.5">
                    {colors.map((c, i) => (
                      <span key={i} className="h-3 w-3 rounded-[3px] border border-black/10" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {d.name}
                    {d.category && <span className="ml-1.5 text-[10px] font-normal text-muted">{d.category}</span>}
                  </span>
                  {on && <Check size={12} className="ml-auto shrink-0 text-moss" />}
                </button>
              );
            })}
          </div>
        </Section>

        {/* visual style */}
        <Section icon={Layers2} title="Visual style">
          <div className="flex flex-wrap gap-1.5">
            {STYLES.map((s) => (
              <Chip key={s} on={config.style === s} onClick={() => set("style", config.style === s ? null : s)}>
                {s}
              </Chip>
            ))}
          </div>
        </Section>

        {/* agent mode */}
        <Section icon={Cpu} title="Agent mode" hint="how autonomous the agent is">
          <div className="flex flex-wrap gap-1.5">
            {AGENT_MODES.map((m) => {
              const on = config.agentMode === m.id;
              return (
                <Chip key={m.id} on={on} onClick={() => set("agentMode", m.id)}>
                  {m.label}
                  {m.id === "yolo" && (
                    <span
                      className={cn(
                        "rounded px-1 py-px text-[9px] font-bold uppercase tracking-wide",
                        on ? "bg-white/25" : "bg-black/[0.08]",
                      )}
                    >
                      default
                    </span>
                  )}
                  <span className="text-[9.5px] font-normal opacity-70">{m.note}</span>
                </Chip>
              );
            })}
          </div>
        </Section>

        {/* swarm */}
        <Section
          icon={Users}
          title="Swarm mode"
          hint={swarmDisabled ? (config.mode === "design" ? "not available in design mode" : "not available for this mode") : "parallel sub-agents"}
        >
          <button
            onClick={() => !swarmDisabled && set("swarm", !config.swarm)}
            disabled={swarmDisabled}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition",
              config.swarm && !swarmDisabled ? "border-clay/40 bg-clay/[0.06]" : "border-line bg-card hover:border-ink/20",
              swarmDisabled && "cursor-not-allowed opacity-60",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                config.swarm && !swarmDisabled ? "bg-clay text-white" : "bg-black/[0.06] text-ink-soft",
              )}
            >
              <Users size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-semibold text-ink">Orchestrate parallel agents</span>
              <span className="block text-[11px] leading-snug text-muted">
                An orchestrator decomposes the task and runs sub-agents concurrently.
              </span>
            </span>
            <span className="toggle shrink-0" data-on={config.swarm && !swarmDisabled} />
          </button>
          {config.swarm && !swarmDisabled && (
            <div className="anim-fade-in mt-2 rounded-xl border border-line bg-cream px-3 py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-semibold">Agents in swarm</span>
                <span className="font-mono text-[12px] font-bold text-ink">{config.swarmAgents}</span>
              </div>
              <input
                type="range"
                min={2}
                max={8}
                value={config.swarmAgents}
                onChange={(e) => set("swarmAgents", Number(e.target.value))}
                className="mt-2 w-full"
              />
            </div>
          )}
        </Section>

        {/* skills */}
        <Section icon={Puzzle} title="Skills" hint={`${config.skills.length} selected`}>
          {skills.length === 0 ? (
            <p className="px-1 py-2 text-[11px] text-muted">No skills installed yet.</p>
          ) : (
            <div className="grid gap-1.5 sm:grid-cols-2">
              {skills.map((s) => (
                <ToggleRow
                  key={s.slug}
                  label={s.name}
                  note={[s.description, s.source].filter(Boolean).join(" · ")}
                  on={config.skills.includes(s.slug)}
                  onToggle={() => toggleIn("skills", s.slug)}
                />
              ))}
            </div>
          )}
        </Section>

        {/* MCPs */}
        <Section icon={Blocks} title="MCP servers" hint={`${config.mcps.length} selected`}>
          {mcps.length === 0 ? (
            <p className="px-1 py-2 text-[11px] text-muted">No MCP servers configured.</p>
          ) : (
            <div className="grid gap-1.5 sm:grid-cols-2">
              {mcps.map((m) => (
                <ToggleRow
                  key={m.id}
                  label={m.name}
                  note={m.status ? `${m.type} · ${m.status}` : m.type}
                  on={config.mcps.includes(m.name)}
                  onToggle={() => toggleIn("mcps", m.name)}
                />
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* footer */}
      <div className="shrink-0 border-t border-line-soft bg-cream px-3 py-2.5">
        <p className="text-[10px] leading-relaxed text-muted">
          {config.skills.length} skills · {config.mcps.length} MCPs · agent mode{" "}
          <span className="font-semibold text-ink-soft">{config.agentMode}</span>
        </p>
        <button
          onClick={onClose}
          className="mt-2 w-full rounded-lg bg-ink py-2 text-[12px] font-semibold text-white transition hover:bg-stone-800"
        >
          Done
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  + context panel: skills + MCPs                                     */
/* ------------------------------------------------------------------ */

export function ContextPanel({ onClose }: { onClose: () => void }) {
  const config = useForge((s) => s.composer);
  const setComposer = useForge((s) => s.setComposer);
  const contextUsed = useForge((s) => s.contextUsed);
  const contextWindow = useForge((s) => s.contextWindow);
  const skills = useSkills();
  const mcps = useMcps();
  const [tab, setTab] = useState<"skills" | "mcps">("skills");

  const toggle = (key: "skills" | "mcps", id: string) => {
    const cur = config[key];
    const has = cur.includes(id);
    setComposer({ [key]: has ? cur.filter((x) => x !== id) : [...cur, id] } as Partial<ComposerConfig>);
  };

  const source: { id: string; label: string; note: string }[] =
    tab === "skills"
      ? skills.map((s) => ({ id: s.slug, label: s.name, note: s.description || s.source }))
      : mcps.map((m) => ({ id: m.name, label: m.name, note: m.status ? `${m.type} · ${m.status}` : m.type }));

  const pct = contextWindow > 0 ? Math.min(100, Math.round((contextUsed / contextWindow) * 100)) : 0;

  return (
    <div className="w-[286px] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line-soft px-3 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Context</span>
        <span className="truncate rounded bg-black/[0.06] px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-ink-soft">
          {config.mode} mode
        </span>
        <button onClick={onClose} className="ml-auto flex h-5 w-5 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-ink">
          <X size={12} />
        </button>
      </div>

      <div className="flex gap-0.5 px-2 pt-2">
        {(["skills", "mcps"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "h-7 flex-1 rounded-md text-[11px] font-bold uppercase transition",
              tab === t ? "bg-ink text-white" : "text-muted hover:bg-black/5 hover:text-ink",
            )}
          >
            {t === "skills" ? `Skills · ${config.skills.length}` : `MCPs · ${config.mcps.length}`}
          </button>
        ))}
      </div>

      <div className="max-h-[248px] overflow-y-auto p-2">
        <p className="px-1 pb-1.5 text-[10px] leading-relaxed text-faint">
          {tab === "skills"
            ? "Toggle the skills the agent loads into context for this task."
            : "Toggle MCP servers to give the agent more tools."}
        </p>
        {source.length === 0 ? (
          <p className="px-1 py-3 text-center text-[11px] text-muted">
            {tab === "skills" ? "No skills installed yet." : "No MCP servers configured."}
          </p>
        ) : (
          <div className="space-y-1">
            {source.map((item) => {
              const on = config[tab].includes(item.id);
              return <ToggleRow key={item.id} label={item.label} note={item.note} on={on} onToggle={() => toggle(tab, item.id)} />;
            })}
          </div>
        )}
      </div>

      <div className="border-t border-line-soft bg-cream px-3 py-2">
        <p className="text-[10px] leading-relaxed text-muted">
          <Puzzle size={9} className="mr-1 inline" />
          {config.skills.length} skills · {config.mcps.length} MCPs active
          <span className="ml-1.5 font-mono text-faint">· context {pct}%</span>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  chips strip + summary                                              */
/* ------------------------------------------------------------------ */

/** Additions strip under the composer — removable chips. Reads the store. */
export function ConfigChips({ onOpen }: { onOpen: () => void }) {
  const config = useForge((s) => s.composer);
  const setComposer = useForge((s) => s.setComposer);
  const skills = useSkills();
  const mcps = useMcps();
  const builtin = MODES.find((m) => m.id === config.mode);
  const label = builtin ? builtin.label : modeLabel(config.mode);
  const Icon = builtin ? builtin.icon : Sparkles;
  const builtinSkillIds = new Set(skills.filter((s) => s.source === "builtin").map((s) => s.slug));
  const extraSkills = config.skills.filter((s) => !builtinSkillIds.has(s));
  const extraMcps = config.mcps.filter((m) => !mcpsCache?.some((s) => s.name === m));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="flex items-center gap-1 rounded-md bg-black/[0.05] px-2 py-1 text-[10px] font-semibold text-ink-soft">
        <Icon size={9} /> {label}
      </span>
      {config.framework && (
        <span className="rounded-md bg-black/[0.05] px-2 py-1 font-mono text-[10px] font-semibold text-ink-soft">{config.framework}</span>
      )}
      {config.style && <span className="rounded-md bg-black/[0.05] px-2 py-1 text-[10px] font-semibold text-ink-soft">{config.style}</span>}
      {config.designSystem && (
        <span className="rounded-md bg-black/[0.05] px-2 py-1 text-[10px] font-semibold text-ink-soft">{config.designSystem}</span>
      )}
      <span className="flex items-center gap-1 rounded-md bg-sage-bg px-2 py-1 text-[10px] font-semibold text-moss">
        <Puzzle size={9} /> Skills {config.skills.length}
        {extraSkills.length > 0 && <span className="opacity-70">(+{extraSkills.length})</span>}
      </span>
      <span className="flex items-center gap-1 rounded-md bg-sage-bg px-2 py-1 text-[10px] font-semibold text-moss">
        <Blocks size={9} /> MCPs {config.mcps.length}
        {extraMcps.length > 0 && <span className="opacity-70">(+{extraMcps.length})</span>}
      </span>
      {config.swarm && (
        <span className="flex items-center gap-1 rounded-md bg-clay/10 px-2 py-1 text-[10px] font-bold text-clay">
          <Users size={9} /> Swarm ×{config.swarmAgents}
          <button onClick={() => setComposer({ swarm: false })} className="ml-0.5 hover:text-ink">
            <X size={9} />
          </button>
        </span>
      )}
      <button onClick={onOpen} className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-muted transition hover:text-ink">
        <SlidersHorizontal size={10} /> Edit
      </button>
    </div>
  );
}

export function ConfigSummary() {
  const config = useForge((s) => s.composer);
  const bits: string[] = [modeLabel(config.mode)];
  if (config.framework) bits.push(config.framework);
  if (config.swarm) bits.push(`swarm ×${config.swarmAgents}`);
  return <>{bits.join(" · ")}</>;
}

/** Compact swarm toggle used directly in the composer toolbar. */
export function SwarmToggle() {
  const config = useForge((s) => s.composer);
  const setComposer = useForge((s) => s.setComposer);
  const on = config.swarm;
  const disabled = config.mode === "design";
  return (
    <button
      onClick={() => !disabled && setComposer({ swarm: !on })}
      disabled={disabled}
      title={disabled ? "Swarm is not available in design mode" : on ? "Swarm mode on — parallel sub-agents" : "Enable swarm mode"}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition",
        on && !disabled ? "border-clay/40 bg-clay/[0.08] text-clay" : "border-line bg-card text-ink-soft hover:text-ink",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <Users size={13} />
      Swarm
      <span className="toggle scale-[0.72]" data-on={on && !disabled} />
      {on && !disabled && <span className="font-mono text-[10.5px] font-bold">×{config.swarmAgents}</span>}
    </button>
  );
}
