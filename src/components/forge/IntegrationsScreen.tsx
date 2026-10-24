"use client";

// IntegrationsScreen — skills, MCP servers, plugins, design systems, agent profiles.
// Ported from the Forge reference; every row is wired to the real BFF API.

import { useCallback, useEffect, useState } from "react";
import {
  Search, Puzzle, Blocks, Cpu, Palette, Users, Plus, Check, X,
  Loader2, Upload, FolderOpen, FileText, Trash2,
  ShieldCheck, ChevronRight, Package, RefreshCw, Sparkles, FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useForge } from "@/lib/store";
import * as api from "@/lib/api";
import type { AgentProfileDTO, DesignSystemDTO, McpServerDTO, PluginDTO, SkillDTO } from "@/lib/types";

type Tab = "skills" | "mcps" | "plugins" | "systems" | "agents";

const TABS: { id: Tab; label: string; icon: typeof Puzzle; hint: string }[] = [
  { id: "skills", label: "Skills", icon: Puzzle, hint: "Markdown, scripts or folders the agent loads on demand" },
  { id: "mcps", label: "MCP servers", icon: Blocks, hint: "External tools and data the agent can call" },
  { id: "plugins", label: "Plugins", icon: Cpu, hint: "Drop-in runtime extensions" },
  { id: "systems", label: "Design systems", icon: Palette, hint: "Token sets that drive every surface" },
  { id: "agents", label: "Agent profiles", icon: Users, hint: "Reusable personas for swarm sub-agents" },
];

const PACKS = [
  { slug: "superpowers", name: "Superpowers", desc: "17 elite agent-process skills — planning, TDD, debugging, review", count: 17 },
  { slug: "context-mode", name: "Context Mode", desc: "Intent-filtered outputs, session ledger, token savings", count: 4 },
  { slug: "frontend-craft", name: "Frontend Craft", desc: "Design tokens, chart craft, taste and redesign skills", count: 6 },
];

const AGENT_COLORS = ["#b4532a", "#5b6b4c", "#c98a2d", "#2f6bff", "#7c3aed", "#0e7490", "#1d7a3a", "#cc2b60"];

function tokenSwatches(tokens?: string): string[] {
  if (!tokens) return ["#d6cfbd", "#c2b9a3", "#a8a29e", "#8a8580", "#57534e"];
  const out: string[] = [];
  const re = /--[\w-]+\s*:\s*(#[0-9a-fA-F]{3,8})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tokens)) !== null && out.length < 6) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  return out.length ? out : ["#d6cfbd", "#c2b9a3", "#a8a29e", "#8a8580", "#57534e"];
}

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

/* ---------------- MCP add dialog ---------------- */

function McpAddPanel({ onDone }: { onDone: () => void }) {
  const toast = useForge((s) => s.toast);
  const [name, setName] = useState("");
  const [type, setType] = useState("stdio");
  const [command, setCommand] = useState("");
  const [args, setArgs] = useState("");
  const [env, setEnv] = useState("");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      await api.upsertMcp({
        name: name.trim(),
        type,
        command: type === "stdio" ? command.trim() : "",
        args: type === "stdio" ? args.trim().split(/\s+/).filter(Boolean) : [],
        env: Object.fromEntries(
          env
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l.includes("="))
            .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
        ),
        url: type !== "stdio" ? url.trim() : "",
        headers: Object.fromEntries(
          headers
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l.includes(":"))
            .map((l) => [l.slice(0, l.indexOf(":")).trim(), l.slice(l.indexOf(":") + 1).trim()]),
        ),
        enabled: true,
      });
      toast({ title: "MCP server added", description: name, variant: "success" });
      onDone();
    } catch (e) {
      toast({ title: "Failed to add MCP server", description: String(e), variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="anim-fade-up mt-3 overflow-hidden rounded-xl border border-line bg-card">
      <div className="flex items-center gap-2 border-b border-line-soft bg-cream px-3 py-2">
        <Blocks size={12} className="shrink-0 text-honey" />
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Add MCP server</span>
        <button onClick={onDone} className="ml-auto text-muted hover:text-ink">
          <X size={13} />
        </button>
      </div>
      <div className="grid gap-3 p-3 lg:grid-cols-2">
        <label className="block">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="postgres"
            className="mt-1 h-8 w-full rounded-lg border border-line bg-cream px-2.5 font-mono text-[12px] outline-none focus:border-ink/30"
          />
        </label>
        <label className="block">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Transport</span>
          <div className="mt-1 flex gap-1.5">
            {["stdio", "http", "sse"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "h-8 flex-1 rounded-lg border font-mono text-[11px] font-semibold transition",
                  type === t ? "border-ink bg-ink text-white" : "border-line bg-cream text-ink-soft hover:text-ink",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </label>
        {type === "stdio" ? (
          <>
            <label className="block">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Command</span>
              <input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="npx -y @modelcontextprotocol/server-postgres"
                className="mt-1 h-8 w-full rounded-lg border border-line bg-cream px-2.5 font-mono text-[11px] outline-none focus:border-ink/30"
              />
            </label>
            <label className="block">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Args (space separated)</span>
              <input
                value={args}
                onChange={(e) => setArgs(e.target.value)}
                placeholder="--connection postgresql://…"
                className="mt-1 h-8 w-full rounded-lg border border-line bg-cream px-2.5 font-mono text-[11px] outline-none focus:border-ink/30"
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Env (KEY=VALUE per line)</span>
              <textarea
                value={env}
                onChange={(e) => setEnv(e.target.value)}
                rows={2}
                placeholder="PGUSER=app&#10;PGPASSWORD=secret"
                className="mt-1 w-full resize-none rounded-lg border border-line bg-cream px-2.5 py-1.5 font-mono text-[11px] outline-none focus:border-ink/30"
              />
            </label>
          </>
        ) : (
          <>
            <label className="block lg:col-span-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">URL</span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://mcp.example.com/sse"
                className="mt-1 h-8 w-full rounded-lg border border-line bg-cream px-2.5 font-mono text-[11px] outline-none focus:border-ink/30"
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Headers (Key: Value per line)</span>
              <textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                rows={2}
                placeholder="Authorization: Bearer …"
                className="mt-1 w-full resize-none rounded-lg border border-line bg-cream px-2.5 py-1.5 font-mono text-[11px] outline-none focus:border-ink/30"
              />
            </label>
          </>
        )}
      </div>
      <div className="flex justify-end border-t border-line-soft bg-cream px-3 py-2">
        <button
          onClick={() => void submit()}
          disabled={!name.trim() || busy}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-[12px] font-semibold text-white transition",
            name.trim() && !busy ? "bg-ink hover:bg-stone-800" : "bg-black/[0.07] text-faint",
          )}
        >
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add server
        </button>
      </div>
    </div>
  );
}

/* ---------------- Agent profile dialog ---------------- */

function AgentAddPanel({ onDone, editing }: { onDone: () => void; editing?: AgentProfileDTO | null }) {
  const toast = useForge((s) => s.toast);
  const [name, setName] = useState(editing?.name ?? "");
  const [systemPrompt, setSystemPrompt] = useState(editing?.systemPrompt ?? "");
  const [color, setColor] = useState(editing?.color ?? AGENT_COLORS[0]);
  const [maxTurns, setMaxTurns] = useState(editing?.maxTurns ?? 24);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      await api.upsertAgentProfile({
        ...(editing ? { slug: editing.slug } : {}),
        name: name.trim(),
        systemPrompt,
        color,
        maxTurns,
      });
      toast({ title: editing ? "Agent updated" : "Agent created", description: name, variant: "success" });
      onDone();
    } catch (e) {
      toast({ title: "Failed to save agent profile", description: String(e), variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="anim-fade-up mt-3 overflow-hidden rounded-xl border border-line bg-card">
      <div className="flex items-center gap-2 border-b border-line-soft bg-cream px-3 py-2">
        <Users size={12} className="shrink-0 text-honey" />
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">
          {editing ? `Edit agent · ${editing.slug}` : "New agent profile"}
        </span>
        <button onClick={onDone} className="ml-auto text-muted hover:text-ink">
          <X size={13} />
        </button>
      </div>
      <div className="grid gap-3 p-3 lg:grid-cols-3">
        <label className="block">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Content Strategist"
            className="mt-1 h-8 w-full rounded-lg border border-line bg-cream px-2.5 text-[12px] outline-none focus:border-ink/30"
          />
        </label>
        <label className="block">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Color</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {AGENT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn("h-7 w-7 rounded-lg border-2 transition", color === c ? "border-ink" : "border-transparent")}
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </label>
        <label className="block">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Max turns</span>
          <input
            type="number"
            min={1}
            max={200}
            value={maxTurns}
            onChange={(e) => setMaxTurns(Number(e.target.value) || 1)}
            className="mt-1 h-8 w-full rounded-lg border border-line bg-cream px-2.5 font-mono text-[12px] outline-none focus:border-ink/30"
          />
        </label>
        <label className="block lg:col-span-3">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">System prompt</span>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={3}
            placeholder="You are a senior copywriter. Write with voice, cut filler, and always propose two alternatives…"
            className="mt-1 w-full resize-none rounded-lg border border-line bg-cream px-2.5 py-1.5 text-[12px] leading-relaxed outline-none focus:border-ink/30"
          />
        </label>
      </div>
      <div className="flex justify-end border-t border-line-soft bg-cream px-3 py-2">
        <button
          onClick={() => void submit()}
          disabled={!name.trim() || busy}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-[12px] font-semibold text-white transition",
            name.trim() && !busy ? "bg-ink hover:bg-stone-800" : "bg-black/[0.07] text-faint",
          )}
        >
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} {editing ? "Save changes" : "Create agent"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- main screen ---------------- */

export default function IntegrationsScreen() {
  const toast = useForge((s) => s.toast);
  const setComposer = useForge((s) => s.setComposer);
  const activeProject = useForge((s) => s.activeProject);

  const [tab, setTab] = useState<Tab>("skills");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const [skills, setSkills] = useState<SkillDTO[]>([]);
  const [servers, setServers] = useState<McpServerDTO[]>([]);
  const [plugins, setPlugins] = useState<PluginDTO[]>([]);
  const [systems, setSystems] = useState<DesignSystemDTO[]>([]);
  const [agents, setAgents] = useState<AgentProfileDTO[]>([]);

  // skill install form
  const [pasteSlug, setPasteSlug] = useState("");
  const [pasteName, setPasteName] = useState("");
  const [pasteBody, setPasteBody] = useState("");
  const [pasteToProject, setPasteToProject] = useState(false);
  const [pasteUrl, setPasteUrl] = useState("");

  const [mcpTest, setMcpTest] = useState<Record<string, { ok: boolean; tools?: string[]; error?: string }>>({});
  const [editingAgent, setEditingAgent] = useState<AgentProfileDTO | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [sk, mc, pl, ds, ag] = await Promise.all([
        api.listSkills().catch(() => ({ skills: [] as SkillDTO[] })),
        api.listMcp().catch(() => ({ servers: [] as McpServerDTO[] })),
        api.listPlugins().catch(() => ({ plugins: [] as PluginDTO[] })),
        api.listDesignSystems().catch(() => ({ systems: [] as DesignSystemDTO[] })),
        api.listAgentProfiles().catch(() => ({ agents: [] as AgentProfileDTO[] })),
      ]);
      setSkills(sk.skills);
      setServers(mc.servers);
      setPlugins(pl.plugins);
      setSystems(ds.systems);
      setAgents(ag.agents);
    } catch (e) {
      toast({ title: "Failed to load integrations", description: String(e), variant: "error" });
    }
  }, [toast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const active = TABS.find((t) => t.id === tab)!;
  const list = (() => {
    const needle = q.trim().toLowerCase();
    const hit = (name: string, note: string) => !needle || name.toLowerCase().includes(needle) || note.toLowerCase().includes(needle);
    if (tab === "skills") return skills.filter((s) => hit(s.name, s.description));
    if (tab === "mcps") return servers.filter((s) => hit(s.name, s.type));
    if (tab === "plugins") return plugins.filter((p) => hit(p.name, p.description));
    if (tab === "systems") return systems.filter((d) => hit(d.name, d.description));
    return agents.filter((a) => hit(a.name, a.systemPrompt));
  })();

  const onCount =
    tab === "skills" ? skills.filter((s) => s.enabled).length
    : tab === "mcps" ? servers.filter((s) => s.enabled).length
    : tab === "plugins" ? plugins.filter((p) => p.enabled).length
    : tab === "systems" ? systems.length
    : agents.filter((a) => a.enabled).length;

  /* ---------- actions ---------- */

  const toggleSkill = async (s: SkillDTO) => {
    setBusy(s.slug);
    try {
      await api.toggleSkill(s.slug, !s.enabled);
      setSkills((prev) => prev.map((x) => (x.slug === s.slug ? { ...x, enabled: !x.enabled } : x)));
    } catch (e) {
      toast({ title: "Toggle failed", description: String(e), variant: "error" });
    } finally {
      setBusy(null);
    }
  };

  const deleteSkill = async (s: SkillDTO) => {
    setBusy(s.slug);
    try {
      await api.deleteSkill(s.slug);
      setSkills((prev) => prev.filter((x) => x.slug !== s.slug));
      toast({ title: "Skill removed", description: s.name, variant: "success" });
    } catch (e) {
      toast({ title: "Delete failed", description: String(e), variant: "error" });
    } finally {
      setBusy(null);
    }
  };

  const install = async (body: Parameters<typeof api.installSkill>[0], label: string) => {
    setBusy(label);
    try {
      const res = await api.installSkill(body);
      toast({ title: "Skill installed", description: res.slug, variant: "success" });
      await refresh();
    } catch (e) {
      toast({ title: "Install failed", description: String(e), variant: "error" });
    } finally {
      setBusy(null);
    }
  };

  const toggleMcp = async (s: McpServerDTO) => {
    setBusy(s.id);
    try {
      await api.upsertMcp({ ...s, enabled: !s.enabled });
      setServers((prev) => prev.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x)));
    } catch (e) {
      toast({ title: "Toggle failed", description: String(e), variant: "error" });
    } finally {
      setBusy(null);
    }
  };

  const testMcp = async (s: McpServerDTO) => {
    setBusy(`test-${s.id}`);
    try {
      const res = await api.testMcp(s.name);
      setMcpTest((prev) => ({ ...prev, [s.id]: res }));
    } catch (e) {
      setMcpTest((prev) => ({ ...prev, [s.id]: { ok: false, error: String(e) } }));
    } finally {
      setBusy(null);
    }
  };

  const deleteMcp = async (s: McpServerDTO) => {
    setBusy(s.id);
    try {
      await api.deleteMcp(s.name);
      setServers((prev) => prev.filter((x) => x.id !== s.id));
      toast({ title: "MCP server removed", description: s.name, variant: "success" });
    } catch (e) {
      toast({ title: "Delete failed", description: String(e), variant: "error" });
    } finally {
      setBusy(null);
    }
  };

  const togglePlugin = async (p: PluginDTO) => {
    setBusy(p.slug);
    try {
      await api.togglePlugin(p.slug, !p.enabled);
      setPlugins((prev) => prev.map((x) => (x.slug === p.slug ? { ...x, enabled: !x.enabled } : x)));
    } catch (e) {
      toast({ title: "Toggle failed", description: String(e), variant: "error" });
    } finally {
      setBusy(null);
    }
  };

  const toggleAgent = async (a: AgentProfileDTO) => {
    setBusy(a.id);
    try {
      await api.upsertAgentProfile({ ...a, enabled: !a.enabled });
      setAgents((prev) => prev.map((x) => (x.id === a.id ? { ...x, enabled: !x.enabled } : x)));
    } catch (e) {
      toast({ title: "Toggle failed", description: String(e), variant: "error" });
    } finally {
      setBusy(null);
    }
  };

  const deleteAgent = async (a: AgentProfileDTO) => {
    setBusy(a.id);
    try {
      await api.deleteAgentProfile(a.slug);
      setAgents((prev) => prev.filter((x) => x.id !== a.id));
      toast({ title: "Agent removed", description: a.name, variant: "success" });
    } catch (e) {
      toast({ title: "Delete failed", description: String(e), variant: "error" });
    } finally {
      setBusy(null);
    }
  };

  const applySystem = (d: DesignSystemDTO) => {
    setComposer({ designSystem: d.slug });
    toast({ title: "Design system attached", description: `${d.name} → composer`, variant: "success" });
  };

  const copySlug = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(slug);
      toast({ title: "Slug copied", description: slug });
    } catch {
      /* clipboard unavailable */
    }
  };

  const addLabel =
    tab === "skills" ? "Add skill" : tab === "mcps" ? "Add server" : tab === "agents" ? (editingAgent ? "Editing agent" : "New agent") : "Add";

  return (
    <div className="flex h-full flex-1 flex-col bg-paper">
      {/* header */}
      <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-line px-4">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold">
          <Blocks size={14} className="text-muted" /> Integrations
        </span>
        <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-bold text-ink-soft">{onCount} active</span>
        <div className="ml-auto flex h-8 w-[240px] items-center gap-2 rounded-lg border border-line bg-card px-2.5">
          <Search size={13} className="shrink-0 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${active.label.toLowerCase()}…`}
            className="w-full bg-transparent text-[12px] outline-none placeholder:text-faint"
          />
        </div>
        {(tab === "skills" || tab === "mcps" || tab === "agents") && (
          <button
            onClick={() => {
              setEditingAgent(null);
              setAdding(!adding);
            }}
            className={cn("flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold text-white transition", adding ? "bg-stone-700" : "bg-ink hover:bg-stone-800")}
          >
            <Plus size={13} /> {addLabel}
          </button>
        )}
      </div>

      {/* tabs */}
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-line-soft px-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setQ("");
                setAdding(false);
              }}
              title={t.hint}
              className={cn(
                "flex h-9 shrink-0 items-center gap-1.5 border-b-2 px-3 text-[12px] font-semibold transition",
                on ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
              )}
            >
              <Icon size={13} /> {t.label}
              <span className={cn("rounded px-1.5 text-[9.5px] font-bold", on ? "bg-ink text-white" : "bg-black/[0.07] text-ink-soft")}>
                {t.id === "skills" ? skills.length : t.id === "mcps" ? servers.length : t.id === "plugins" ? plugins.length : t.id === "systems" ? systems.length : agents.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[880px] px-4 py-4">
          <p className="text-[11.5px] leading-relaxed text-muted">{active.hint}.</p>

          {/* ------- skills add panel ------- */}
          {adding && tab === "skills" && (
            <div className="anim-fade-up mt-3 overflow-hidden rounded-xl border border-line bg-card">
              <div className="flex items-center gap-2 border-b border-line-soft bg-cream px-3 py-2">
                <Sparkles size={12} className="shrink-0 text-honey" />
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Install a skill</span>
                <button onClick={() => setAdding(false)} className="ml-auto text-muted hover:text-ink">
                  <X size={13} />
                </button>
              </div>
              <div className="grid gap-3 p-3 lg:grid-cols-3">
                {/* paste */}
                <div className="rounded-xl border border-line bg-cream p-3">
                  <p className="flex items-center gap-1.5 text-[11.5px] font-bold">
                    <FileText size={12} className="text-muted" /> Paste SKILL.md
                  </p>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-muted">Give it a slug and paste the markdown body — frontmatter optional.</p>
                  <div className="mt-2 space-y-1.5">
                    <input
                      value={pasteSlug}
                      onChange={(e) => setPasteSlug(e.target.value)}
                      placeholder="my-skill"
                      className="h-7 w-full rounded-lg border border-line bg-card px-2 font-mono text-[11px] outline-none focus:border-ink/30"
                    />
                    <input
                      value={pasteName}
                      onChange={(e) => setPasteName(e.target.value)}
                      placeholder="My skill"
                      className="h-7 w-full rounded-lg border border-line bg-card px-2 text-[11px] outline-none focus:border-ink/30"
                    />
                    <textarea
                      value={pasteBody}
                      onChange={(e) => setPasteBody(e.target.value)}
                      rows={5}
                      placeholder={"---\nname: My skill\ndescription: Use when…\n---\n\nInstructions…"}
                      className="w-full resize-none rounded-lg border border-line bg-card px-2 py-1.5 font-mono text-[10.5px] outline-none focus:border-ink/30"
                    />
                    {activeProject && (
                      <label className="flex cursor-pointer items-center gap-1.5 text-[10px] font-medium text-muted">
                        <input
                          type="checkbox"
                          checked={pasteToProject}
                          onChange={(e) => setPasteToProject(e.target.checked)}
                          className="h-3 w-3 accent-[#1c1917]"
                        />
                        Install into “{activeProject.title}”
                      </label>
                    )}
                    <button
                      onClick={() =>
                        void install(
                          {
                            source: "paste",
                            slug: pasteSlug.trim() || undefined,
                            name: pasteName.trim() || undefined,
                            content: pasteBody,
                            projectId: pasteToProject && activeProject ? activeProject.id : undefined,
                          },
                          "paste",
                        )
                      }
                      disabled={!pasteBody.trim() || busy === "paste"}
                      className={cn(
                        "flex h-7 w-full items-center justify-center gap-1.5 rounded-lg text-[11px] font-semibold text-white transition",
                        pasteBody.trim() && busy !== "paste" ? "bg-ink hover:bg-stone-800" : "bg-black/[0.07] text-faint",
                      )}
                    >
                      {busy === "paste" ? <Loader2 size={11} className="animate-spin" /> : <Package size={11} />} Install pasted skill
                    </button>
                  </div>
                </div>

                {/* url */}
                <div className="rounded-xl border border-line bg-cream p-3">
                  <p className="flex items-center gap-1.5 text-[11.5px] font-bold">
                    <Upload size={12} className="text-muted" /> Install from URL
                  </p>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
                    A git repo or a raw SKILL.md URL. The server clones and registers it.
                  </p>
                  <input
                    value={pasteUrl}
                    onChange={(e) => setPasteUrl(e.target.value)}
                    placeholder="https://github.com/user/skill-repo"
                    className="mt-2 h-8 w-full rounded-lg border border-line bg-card px-2 font-mono text-[11px] outline-none focus:border-ink/30"
                  />
                  <button
                    onClick={() => void install({ source: "url", url: pasteUrl.trim() }, "url")}
                    disabled={!pasteUrl.trim() || busy === "url"}
                    className={cn(
                      "mt-2 flex h-7 w-full items-center justify-center gap-1.5 rounded-lg text-[11px] font-semibold text-white transition",
                      pasteUrl.trim() && busy !== "url" ? "bg-ink hover:bg-stone-800" : "bg-black/[0.07] text-faint",
                    )}
                  >
                    {busy === "url" ? <Loader2 size={11} className="animate-spin" /> : <Package size={11} />} Fetch & install
                  </button>
                  <div className="mt-3 rounded-lg border border-dashed border-ink/20 p-2.5 text-center">
                    <FolderOpen size={15} className="mx-auto text-faint" />
                    <p className="mt-1 text-[10px] leading-snug text-muted">Skills can also be scoped to the project that is open — use the composer context panel.</p>
                  </div>
                </div>

                {/* packs */}
                <div className="rounded-xl border border-line bg-cream p-3">
                  <p className="flex items-center gap-1.5 text-[11.5px] font-bold">
                    <Package size={12} className="text-muted" /> Bundled packs
                  </p>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-muted">Curated bundles installed in one call.</p>
                  <div className="mt-2 space-y-1.5">
                    {PACKS.map((p) => (
                      <button
                        key={p.slug}
                        onClick={() => void install({ source: "pack", packSlug: p.slug }, `pack-${p.slug}`)}
                        disabled={busy === `pack-${p.slug}`}
                        className="flex w-full items-center gap-2 rounded-lg border border-line bg-card px-2 py-1.5 text-left transition hover:border-ink/25"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11.5px] font-semibold">{p.name}</span>
                          <span className="block truncate text-[9.5px] text-muted">{p.desc}</span>
                        </span>
                        {busy === `pack-${p.slug}` ? (
                          <Loader2 size={12} className="shrink-0 animate-spin text-clay" />
                        ) : (
                          <Plus size={12} className="shrink-0 text-muted" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------- mcp add panel ------- */}
          {adding && tab === "mcps" && <McpAddPanel onDone={() => setAdding(false)} />}

          {/* ------- agent add/edit panel ------- */}
          {adding && tab === "agents" && <AgentAddPanel onDone={() => setAdding(false)} editing={editingAgent} />}

          {/* ------- lists ------- */}
          <div className="mt-3 space-y-1.5">
            {/* skills */}
            {tab === "skills" &&
              list.map((s) => (
                <SkillRow
                  key={s.slug}
                  skill={s}
                  busy={busy === s.slug}
                  onToggle={() => void toggleSkill(s)}
                  onDelete={() => void deleteSkill(s)}
                />
              ))}

            {/* mcps */}
            {tab === "mcps" &&
              list.map((s) => {
                const t = mcpTest[s.id];
                return (
                  <div key={s.id} className={cn("rounded-xl border px-3 py-2.5 transition", s.enabled ? "border-moss/35 bg-moss/[0.04]" : "border-line bg-card")}>
                    <div className="flex items-center gap-3">
                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", s.enabled ? "bg-moss/12 text-moss" : "bg-black/[0.06] text-ink-soft")}>
                        {busy === s.id ? <Loader2 size={14} className="animate-spin" /> : <Blocks size={14} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[12.5px] font-semibold text-ink">{s.name}</span>
                          <span className="hidden shrink-0 rounded bg-black/[0.05] px-1.5 py-0.5 font-mono text-[9px] text-muted sm:block">{s.type}</span>
                          <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase", s.status === "ready" || s.status === "connected" ? "bg-moss/15 text-moss" : "bg-black/[0.06] text-muted")}>
                            {s.status || "idle"}
                          </span>
                        </span>
                        <span className="block truncate text-[11px] text-muted">
                          {s.type === "stdio" ? `${s.command} ${s.args.join(" ")}`.trim() || "—" : s.url || "—"} · {s.tools.length} tools
                        </span>
                      </span>
                      <button
                        onClick={() => void testMcp(s)}
                        disabled={busy === `test-${s.id}`}
                        title="Test connection"
                        className="flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-cream px-2 text-[10.5px] font-bold text-ink-soft transition hover:border-ink/25 hover:text-ink"
                      >
                        {busy === `test-${s.id}` ? <Loader2 size={11} className="animate-spin" /> : <FlaskConical size={11} />} Test
                      </button>
                      <button onClick={() => void toggleMcp(s)} disabled={busy === s.id} title={s.enabled ? "Disable" : "Enable"} className="shrink-0">
                        <Toggle on={s.enabled} />
                      </button>
                      <button
                        onClick={() => void deleteMcp(s)}
                        disabled={busy === s.id}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-faint transition hover:bg-clay/10 hover:text-clay"
                        title="Remove server"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {t && (
                      <div className={cn("anim-fade-in mt-2 rounded-lg border px-2.5 py-2 text-[11px]", t.ok ? "border-moss/30 bg-moss/[0.06] text-moss" : "border-clay/30 bg-clay/[0.06] text-clay")}>
                        {t.ok ? (
                          <>
                            <span className="font-bold">{t.tools?.length ?? 0} tools detected</span>
                            {t.tools && t.tools.length > 0 && <span className="mt-1 block truncate font-mono text-[10px] text-muted">{t.tools.join(" · ")}</span>}
                          </>
                        ) : (
                          <span className="font-bold">Test failed — {t.error ?? "no response"}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            {/* plugins */}
            {tab === "plugins" &&
              list.map((p) => (
                <div key={p.slug} className={cn("flex items-center gap-3 rounded-xl border px-3 py-2.5 transition", p.enabled ? "border-moss/35 bg-moss/[0.04]" : "border-line bg-card")}>
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", p.enabled ? "bg-moss/12 text-moss" : "bg-black/[0.06] text-ink-soft")}>
                    {busy === p.slug ? <Loader2 size={14} className="animate-spin" /> : <Cpu size={14} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[12.5px] font-semibold text-ink">{p.name}</span>
                      <span className="hidden shrink-0 rounded bg-black/[0.05] px-1.5 py-0.5 font-mono text-[9px] text-muted sm:block">v{p.version}</span>
                      {p.source && <span className="hidden shrink-0 truncate font-mono text-[9.5px] text-faint lg:block">{p.source}</span>}
                    </span>
                    <span className="block truncate text-[11px] text-muted">
                      {p.description}
                      {p.skills.length > 0 && <span className="text-faint"> · {p.skills.join(", ")}</span>}
                    </span>
                  </span>
                  <button onClick={() => void togglePlugin(p)} disabled={busy === p.slug} title={p.enabled ? "Disable" : "Enable"} className="shrink-0">
                    <Toggle on={p.enabled} />
                  </button>
                </div>
              ))}

            {/* design systems */}
            {tab === "systems" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((d) => {
                  const swatches = tokenSwatches(d.tokens);
                  return (
                    <div key={d.slug} className="overflow-hidden rounded-xl border border-line bg-card transition hover:border-ink/25 hover:shadow-md">
                      <button onClick={() => applySystem(d)} className="block w-full text-left" title={`Use ${d.name} in the composer`}>
                        <span className="flex h-12 items-stretch">
                          {swatches.map((c, i) => (
                            <span key={`${c}-${i}`} className="flex-1" style={{ background: c }} />
                          ))}
                        </span>
                        <span className="block px-3 py-2.5">
                          <span className="flex items-center gap-2">
                            <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink">{d.name}</span>
                            <span className="shrink-0 rounded bg-black/[0.05] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted">{d.category}</span>
                          </span>
                          <span className="mt-0.5 block line-clamp-2 text-[10.5px] leading-relaxed text-muted">{d.description}</span>
                        </span>
                      </button>
                      <span className="flex items-center gap-1 border-t border-line-soft bg-cream px-2 py-1.5">
                        <button onClick={() => applySystem(d)} className="flex h-6 items-center gap-1 rounded-md bg-ink px-2 text-[10px] font-bold text-white transition hover:bg-stone-800">
                          <Check size={9} /> Use
                        </button>
                        <button onClick={() => void copySlug(d.slug)} className="flex h-6 items-center gap-1 rounded-md border border-line bg-card px-2 text-[10px] font-bold text-ink-soft transition hover:text-ink">
                          <FileText size={9} /> Copy slug
                        </button>
                        <span className="ml-auto truncate font-mono text-[9px] text-faint">{d.slug}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* agents */}
            {tab === "agents" &&
              list.map((a) => (
                <div key={a.id} className={cn("flex items-center gap-3 rounded-xl border px-3 py-2.5 transition", a.enabled ? "border-moss/35 bg-moss/[0.04]" : "border-line bg-card")}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: a.color }}>
                    <Users size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[12.5px] font-semibold text-ink">{a.name}</span>
                      <span className="hidden shrink-0 rounded bg-black/[0.05] px-1.5 py-0.5 font-mono text-[9px] text-muted sm:block">{a.slug}</span>
                    </span>
                    <span className="block truncate text-[11px] text-muted">
                      {a.systemPrompt || "No system prompt"} · max {a.maxTurns} turns
                    </span>
                  </span>
                  <span className="hidden shrink-0 rounded bg-black/[0.06] px-2 py-0.5 text-[9.5px] font-bold text-ink-soft sm:block" title="Times spawned">
                    ×{a.spawnCount}
                  </span>
                  <button onClick={() => void toggleAgent(a)} disabled={busy === a.id} title={a.enabled ? "Disable" : "Enable"} className="shrink-0">
                    <Toggle on={a.enabled} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingAgent(a);
                      setAdding(true);
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-faint transition hover:bg-black/5 hover:text-ink"
                    title="Edit agent"
                  >
                    <FileText size={12} />
                  </button>
                  <button
                    onClick={() => void deleteAgent(a)}
                    disabled={busy === a.id}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-faint transition hover:bg-clay/10 hover:text-clay"
                    title="Remove agent"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

            {list.length === 0 && <p className="py-12 text-center text-[12.5px] text-muted">No {active.label.toLowerCase()} match “{q}”.</p>}
          </div>

          <button onClick={() => void refresh()} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink/20 py-3 text-[12px] font-semibold text-muted transition hover:border-ink/40 hover:text-ink">
            <RefreshCw size={12} /> Refresh registry
            <ChevronRight size={12} />
          </button>
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- skill row ---------------- */

function SkillRow({ skill, busy, onToggle, onDelete }: { skill: SkillDTO; busy: boolean; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-xl border px-3 py-2.5 transition", skill.enabled ? "border-moss/35 bg-moss/[0.04]" : "border-line bg-card")}>
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", skill.enabled ? "bg-moss/12 text-moss" : "bg-black/[0.06] text-ink-soft")}>
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Puzzle size={14} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[12.5px] font-semibold text-ink">{skill.name}</span>
          <span className="hidden shrink-0 rounded bg-black/[0.05] px-1.5 py-0.5 font-mono text-[9px] text-muted sm:block">{skill.source}</span>
          <span className="hidden shrink-0 rounded bg-black/[0.05] px-1.5 py-0.5 font-mono text-[9px] text-muted md:block">{skill.scope}</span>
        </span>
        <span className="block truncate text-[11px] text-muted">{skill.description}</span>
      </span>
      {skill.enabled && <ShieldCheck size={13} className="shrink-0 text-moss" />}
      <button onClick={onToggle} disabled={busy} title={skill.enabled ? "Deactivate" : "Activate"} className="shrink-0">
        <Toggle on={skill.enabled} />
      </button>
      <button
        onClick={onDelete}
        disabled={busy}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-faint transition hover:bg-clay/10 hover:text-clay"
        title="Remove skill"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
