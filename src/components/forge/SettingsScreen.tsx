"use client";

// SettingsScreen — model providers (builtin + BYOK), API keys, appearance, notifications.
// Ported from the Forge reference; wired to settings/providers BFF APIs.

import { useCallback, useEffect, useState } from "react";
import {
  KeyRound, Cpu, Shield, Bell, Palette, Check, Trash2,
  Loader2, Server, Eye, EyeOff, Sparkles, Info, Plus, PlugZap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useForge } from "@/lib/store";
import * as api from "@/lib/api";
import type { ModelOption, ProviderDTO } from "@/lib/types";

type Tab = "providers" | "keys" | "appearance" | "notifications";

const API_TYPES = ["openai-chat-completions", "anthropic-messages", "openai-responses"] as const;

const THEMES = [
  { id: "paper", name: "Paper (light)", bg: "#f4f1eb", fg: "#1c1917" },
  { id: "system", name: "System", bg: "#e7e1d3", fg: "#292524" },
  { id: "ink", name: "Ink (dark)", bg: "#211d1a", fg: "#f4f1eb" },
];

const PREFERENCE_TOGGLES = [
  { group: "notifications", key: "notifyRunDone", label: "Run completed", note: "When an agent turn finishes", def: true },
  { group: "notifications", key: "notifyNeedsInput", label: "Needs your input", note: "When a question blocks the run", def: true },
  { group: "notifications", key: "notifyBuildFail", label: "Build failed", note: "When the preview build breaks", def: true },
  { group: "notifications", key: "notifyWeeklyDigest", label: "Weekly digest", note: "Usage and activity summary", def: false },
  { group: "notifications", key: "privacyTrain", label: "Use my data for training", note: "Never shared, opt-in only", def: false },
  { group: "notifications", key: "privacyTelemetry", label: "Anonymous telemetry", note: "Helps improve the product", def: true },
  { group: "notifications", key: "privacyRetention", label: "Keep checkpoints 90 days", note: "Older snapshots are pruned", def: true },
];

function Toggle({ on, onClick, locked }: { on: boolean; onClick?: () => void; locked?: boolean }) {
  return (
    <button onClick={locked ? undefined : onClick} disabled={locked} data-on={on} className="shrink-0" aria-pressed={on}>
      <span
        className={cn("relative inline-block h-5 w-[34px] shrink-0 rounded-full transition-colors", on ? "bg-ink" : "bg-[#d6cfbd]", locked && "opacity-50")}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
            on && "translate-x-[14px]",
          )}
        />
      </span>
    </button>
  );
}

function Section({ icon: Icon, title, note, children }: { icon: typeof Cpu; title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-card">
      <div className="flex items-center gap-2 border-b border-line-soft bg-cream px-4 py-3">
        <Icon size={14} className="shrink-0 text-muted" />
        <span className="text-[12.5px] font-bold">{title}</span>
        {note && <span className="ml-auto text-[10.5px] text-muted">{note}</span>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ---------------- provider editor ---------------- */

interface Draft {
  providerId: string;
  providerName: string;
  apiType: string;
  baseUrl: string;
  apiKey: string;
  modelsText: string;
}

function draftOf(p?: ProviderDTO): Draft {
  return {
    providerId: p?.providerId ?? "",
    providerName: p?.providerName ?? "",
    apiType: p?.apiType ?? "openai-chat-completions",
    baseUrl: p?.baseUrl ?? "",
    apiKey: "",
    modelsText: (p?.models ?? []).map((m) => m.modelId).join("\n"),
  };
}

function ProviderEditor({ initial, existing, onDone }: { initial: Draft; existing?: ProviderDTO; onDone: () => void }) {
  const toast = useForge((s) => s.toast);
  const [d, setD] = useState<Draft>(initial);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!d.providerId.trim() || busy) return;
    setBusy(true);
    try {
      await api.upsertProvider({
        providerId: d.providerId.trim(),
        providerName: d.providerName.trim() || d.providerId.trim(),
        apiType: d.apiType,
        baseUrl: d.baseUrl.trim(),
        models: d.modelsText.split("\n").map((m) => m.trim()).filter(Boolean),
        ...(d.apiKey.trim() ? { apiKey: d.apiKey.trim() } : {}),
      });
      toast({ title: existing ? "Provider updated" : "Provider added", description: d.providerId, variant: "success" });
      onDone();
    } catch (e) {
      toast({ title: "Failed to save provider", description: String(e), variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((prev) => ({ ...prev, [k]: v }));
  const field = "h-8 w-full rounded-lg border border-line bg-cream px-2.5 text-[12px] outline-none focus:border-ink/30";

  return (
    <div className="anim-fade-in mt-2 space-y-2 rounded-xl border border-line bg-cream p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Provider id</span>
          <input value={d.providerId} onChange={(e) => set("providerId", e.target.value)} disabled={!!existing} placeholder="openai" className={cn(field, "mt-1 font-mono disabled:opacity-60")} />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Display name</span>
          <input value={d.providerName} onChange={(e) => set("providerName", e.target.value)} placeholder="OpenAI" className={cn(field, "mt-1")} />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">API type</span>
          <select value={d.apiType} onChange={(e) => set("apiType", e.target.value)} className={cn(field, "mt-1")}>
            {API_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Base URL</span>
          <input value={d.baseUrl} onChange={(e) => set("baseUrl", e.target.value)} placeholder="https://api.openai.com/v1" className={cn(field, "mt-1 font-mono")} />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">API key {existing?.hasKey && <span className="normal-case text-moss">· stored</span>}</span>
          <input type="password" value={d.apiKey} onChange={(e) => set("apiKey", e.target.value)} placeholder={existing?.hasKey ? "•••••••• (leave empty to keep)" : "sk-…"} className={cn(field, "mt-1 font-mono")} />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Models (one per line)</span>
          <textarea
            value={d.modelsText}
            onChange={(e) => set("modelsText", e.target.value)}
            rows={3}
            placeholder={"gpt-4.1\no4-mini"}
            className="mt-1 w-full resize-none rounded-lg border border-line bg-cream px-2.5 py-1.5 font-mono text-[11px] outline-none focus:border-ink/30"
          />
        </label>
      </div>
      <div className="flex justify-end gap-1.5">
        <button onClick={onDone} className="flex h-7 items-center rounded-lg border border-line bg-card px-3 text-[11px] font-semibold text-ink-soft transition hover:text-ink">
          Cancel
        </button>
        <button
          onClick={() => void save()}
          disabled={!d.providerId.trim() || busy}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-lg px-3.5 text-[11px] font-semibold text-white transition",
            d.providerId.trim() && !busy ? "bg-ink hover:bg-stone-800" : "bg-black/[0.07] text-faint",
          )}
        >
          {busy ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save provider
        </button>
      </div>
    </div>
  );
}

/* ---------------- main screen ---------------- */

export default function SettingsScreen() {
  const toast = useForge((s) => s.toast);

  const [tab, setTab] = useState<Tab>("providers");
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [providers, setProviders] = useState<ProviderDTO[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [tests, setTests] = useState<Record<string, { ok: boolean; latencyMs?: number; error?: string }>>({});
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  const [e2bKey, setE2bKey] = useState("");
  const [githubToken, setGithubToken] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [s, pr, mo] = await Promise.all([
        api.getSettings().catch(() => ({}) as Record<string, unknown>),
        api.listProviders().catch(() => ({ providers: [] as ProviderDTO[] })),
        api.listModels().catch(() => ({ models: [] as ModelOption[] })),
      ]);
      setSettings(s);
      setProviders(pr.providers);
      setModels(mo.models);
    } catch (e) {
      toast({ title: "Failed to load settings", description: String(e), variant: "error" });
    }
  }, [toast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const patchSettings = async (patch: Record<string, unknown>, label: string) => {
    setBusy(label);
    try {
      const next = await api.putSettings(patch);
      setSettings((prev) => ({ ...prev, ...(next ?? patch) }));
    } catch (e) {
      toast({ title: "Failed to save setting", description: String(e), variant: "error" });
    } finally {
      setBusy(null);
    }
  };

  const testProvider = async (p: ProviderDTO) => {
    setBusy(`test-${p.id}`);
    try {
      const res = await api.testProvider(p.providerId);
      setTests((prev) => ({ ...prev, [p.id]: res }));
    } catch (e) {
      setTests((prev) => ({ ...prev, [p.id]: { ok: false, error: String(e) } }));
    } finally {
      setBusy(null);
    }
  };

  const deleteProvider = async (p: ProviderDTO) => {
    setBusy(`del-${p.id}`);
    try {
      await api.deleteProvider(p.providerId);
      setProviders((prev) => prev.filter((x) => x.id !== p.id));
      toast({ title: "Provider removed", description: p.providerName, variant: "success" });
    } catch (e) {
      toast({ title: "Failed to remove provider", description: String(e), variant: "error" });
    } finally {
      setBusy(null);
    }
  };

  const defaultModel = typeof settings.defaultModel === "string" ? settings.defaultModel : "";
  const theme = typeof settings.theme === "string" ? settings.theme : "paper";
  const pref = (key: string, def: boolean) => (typeof settings[key] === "boolean" ? (settings[key] as boolean) : def);

  const TABS: { id: Tab; label: string; icon: typeof Cpu }[] = [
    { id: "providers", label: "Model providers", icon: Cpu },
    { id: "keys", label: "API keys", icon: KeyRound },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications & Privacy", icon: Bell },
  ];

  return (
    <div className="flex h-full flex-1 flex-col bg-paper">
      <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-line px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white">
          <Sparkles size={15} />
        </span>
        <span className="text-[13px] font-bold">Settings</span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* tabs */}
        <div className="w-[210px] shrink-0 border-r border-line bg-paper/60 p-2.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition",
                  on ? "bg-ink/[0.07] font-semibold text-ink" : "text-ink-soft hover:bg-black/5 hover:text-ink",
                )}
              >
                <Icon size={14} className={on ? "text-clay" : "text-muted"} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[720px] px-5 py-5">
            {/* ---------------- providers ---------------- */}
            {tab === "providers" && (
              <>
                <p className="text-[13px] font-bold">Model providers</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
                  The built-in bridge works out of the box and is free. Bring your own provider for rate limits and billing you control.
                </p>

                {/* builtin card */}
                <div className="mt-3 flex w-full items-center gap-3 rounded-xl border border-moss/35 bg-moss/[0.05] px-3.5 py-3 text-left">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-moss text-white">
                    <PlugZap size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[12.5px] font-semibold text-ink">Z.ai built-in (free)</span>
                      <span className="shrink-0 rounded bg-moss/15 px-1.5 py-0.5 text-[9px] font-bold text-moss">ALWAYS ON</span>
                    </span>
                    <span className="block truncate text-[11px] text-muted">Managed bridge · no setup · GLM models via the local SDK</span>
                  </span>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss text-white">
                    <Check size={11} strokeWidth={3} />
                  </span>
                </div>

                {/* BYOK list */}
                <div className="mt-2 space-y-2">
                  {providers.map((p) => {
                    const t = tests[p.id];
                    const open = expanded === p.id;
                    return (
                      <div key={p.id} className={cn("rounded-xl border px-3.5 py-3", open ? "border-ink/30 bg-card" : "border-line bg-card")}>
                        <div className="flex items-center gap-2.5">
                          <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", p.hasKey ? "bg-moss/12 text-moss" : "bg-black/[0.06] text-ink-soft")}>
                            {busy === `del-${p.id}` ? <Loader2 size={12} className="animate-spin" /> : <Server size={13} />}
                          </span>
                          <button onClick={() => setExpanded(open ? null : p.id)} className="min-w-0 flex-1 text-left">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-[12.5px] font-semibold text-ink">{p.providerName}</span>
                              <span className="hidden shrink-0 rounded bg-black/[0.05] px-1.5 py-0.5 font-mono text-[9px] text-muted sm:block">{p.apiType}</span>
                              {p.isBuiltin && <span className="shrink-0 rounded bg-black/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted">builtin</span>}
                            </span>
                            <span className="block truncate font-mono text-[10.5px] text-muted">
                              {p.baseUrl || "no base url"} · {p.models.length} models {p.hasKey ? "· key set" : "· no key"}
                            </span>
                          </button>
                          {t && (
                            <span className={cn("shrink-0 rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold", t.ok ? "bg-moss/15 text-moss" : "bg-clay/10 text-clay")}>
                              {t.ok ? `${t.latencyMs ?? "?"}ms` : "failed"}
                            </span>
                          )}
                          <button
                            onClick={() => void testProvider(p)}
                            disabled={busy === `test-${p.id}`}
                            className="flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-cream px-2 text-[10.5px] font-bold text-ink-soft transition hover:border-ink/25 hover:text-ink"
                            title="Test latency"
                          >
                            {busy === `test-${p.id}` ? <Loader2 size={11} className="animate-spin" /> : <PlugZap size={11} />} Test
                          </button>
                          {!p.isBuiltin && (
                            <button
                              onClick={() => void deleteProvider(p)}
                              disabled={busy === `del-${p.id}`}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-faint transition hover:bg-clay/10 hover:text-clay"
                              title="Remove provider"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        {open && <ProviderEditor initial={draftOf(p)} existing={p} onDone={() => setExpanded(null)} />}
                      </div>
                    );
                  })}
                </div>

                {adding ? (
                  <div className="mt-2 rounded-xl border border-line bg-card px-3.5 py-3">
                    <p className="text-[12px] font-bold">New provider</p>
                    <ProviderEditor initial={draftOf()} onDone={() => setAdding(false)} />
                  </div>
                ) : (
                  <button
                    onClick={() => setAdding(true)}
                    className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink/25 text-[12px] font-semibold text-muted transition hover:border-ink/45 hover:text-ink"
                  >
                    <Plus size={13} /> Add a provider
                  </button>
                )}

                <Section icon={Info} title="Default model" note="applies to new runs">
                  <select
                    value={defaultModel}
                    onChange={(e) => void patchSettings({ defaultModel: e.target.value }, "defaultModel")}
                    className="h-9 w-full rounded-lg border border-line bg-cream px-2.5 text-[12px] outline-none focus:border-ink/30"
                  >
                    <option value="">Z.ai built-in default</option>
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                        {m.builtin ? " (builtin)" : ""}
                      </option>
                    ))}
                  </select>
                  {busy === "defaultModel" && <Loader2 size={12} className="mt-2 animate-spin text-clay" />}
                </Section>
              </>
            )}

            {/* ---------------- api keys ---------------- */}
            {tab === "keys" && (
              <>
                <p className="text-[13px] font-bold">API keys</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
                  Keys are stored server-side and never echoed back to the browser. They apply to every new run.
                </p>

                <div className="mt-3 space-y-2">
                  {[
                    { key: "e2b", label: "E2B sandbox key", hint: "e2b_…", value: e2bKey, set: typeof settings.e2b === "string" && !!settings.e2b, setValue: setE2bKey, note: "Cloud sandboxes for project runtimes. Without it the local runtime is used." },
                    { key: "github", label: "GitHub token", hint: "ghp_… / github_pat_…", value: githubToken, set: typeof settings.github === "string" && !!settings.github, setValue: setGithubToken, note: "Enables private repo import and publishing to GitHub." },
                  ].map((k) => (
                    <div key={k.key} className={cn("rounded-xl border px-3.5 py-3", k.set ? "border-moss/35 bg-moss/[0.04]" : "border-line bg-card")}>
                      <div className="flex items-center gap-2.5">
                        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", k.set ? "bg-moss/12 text-moss" : "bg-black/[0.06] text-ink-soft")}>
                          <KeyRound size={13} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12.5px] font-semibold text-ink">{k.label}</span>
                          <span className="block text-[10.5px] leading-snug text-muted">{k.note}</span>
                        </span>
                        <button
                          onClick={() => setReveal((r) => ({ ...r, [k.key]: !r[k.key] }))}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-black/5 hover:text-ink"
                          title={reveal[k.key] ? "Hide" : "Show"}
                        >
                          {reveal[k.key] ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                      <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-line bg-cream px-2.5 focus-within:border-ink/25">
                        <input
                          type={reveal[k.key] ? "text" : "password"}
                          value={k.value}
                          onChange={(e) => k.setValue(e.target.value)}
                          placeholder={k.set ? "•••••••••••• (saved)" : k.hint}
                          className="h-8 w-full bg-transparent font-mono text-[11.5px] outline-none placeholder:text-faint"
                        />
                        <button
                          onClick={() => {
                            if (k.value.trim()) void patchSettings({ [k.key]: k.value.trim() }, k.key);
                          }}
                          disabled={!k.value.trim() || busy === k.key}
                          className={cn(
                            "flex h-6 shrink-0 items-center gap-1 rounded-md px-2 text-[10px] font-bold text-white transition",
                            k.value.trim() && busy !== k.key ? "bg-ink hover:bg-stone-800" : "bg-black/[0.07] text-faint",
                          )}
                        >
                          {busy === k.key ? <Loader2 size={10} className="animate-spin" /> : "Save"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-cream px-3.5 py-3">
                  <Shield size={14} className="shrink-0 text-moss" />
                  <p className="text-[11px] leading-relaxed text-muted">
                    Keys are used server-side only. Rotating a key takes effect on the next run.
                  </p>
                </div>
              </>
            )}

            {/* ---------------- appearance ---------------- */}
            {tab === "appearance" && (
              <>
                <p className="text-[13px] font-bold">Appearance</p>
                <p className="mt-1 text-[11.5px] text-muted">Theme for this workspace. Paper is the Forge default.</p>
                <div className="mt-3 grid grid-cols-3 gap-2.5">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => void patchSettings({ theme: t.id }, `theme-${t.id}`)}
                      className={cn("overflow-hidden rounded-xl border text-left transition", theme === t.id ? "border-ink" : "border-line hover:border-ink/25")}
                    >
                      <span className="flex h-16 items-end gap-1 p-2" style={{ background: t.bg }}>
                        <span className="h-3 w-8 rounded-sm" style={{ background: t.fg, opacity: 0.85 }} />
                        <span className="h-3 w-5 rounded-sm" style={{ background: "#b4532a" }} />
                        <span className="h-3 w-4 rounded-sm" style={{ background: "#c98a2d" }} />
                      </span>
                      <span className="flex items-center gap-1.5 border-t border-line bg-card px-2.5 py-2">
                        <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold">{t.name}</span>
                        {busy === `theme-${t.id}` ? (
                          <Loader2 size={12} className="shrink-0 animate-spin text-clay" />
                        ) : (
                          theme === t.id && <Check size={12} className="shrink-0 text-moss" />
                        )}
                      </span>
                    </button>
                  ))}
                </div>
                <Section icon={Palette} title="Editor" note="cosmetic · stored in settings">
                  <div className="space-y-2.5">
                    {[
                      { key: "editorReduceMotion", label: "Reduce motion", note: "Minimise transitions and animation", def: false },
                      { key: "editorLigatures", label: "Ligatures in code", note: "Enable font ligatures in the editor", def: true },
                      { key: "editorWordWrap", label: "Word wrap by default", note: "Applies to newly opened files", def: false },
                    ].map((f) => (
                      <div key={f.key} className="flex items-center gap-3">
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] font-medium text-ink">{f.label}</span>
                          <span className="block text-[10.5px] text-muted">{f.note}</span>
                        </span>
                        <Toggle on={pref(f.key, f.def)} onClick={() => void patchSettings({ [f.key]: !pref(f.key, f.def) }, f.key)} />
                      </div>
                    ))}
                  </div>
                </Section>
              </>
            )}

            {/* ---------------- notifications & privacy ---------------- */}
            {tab === "notifications" && (
              <>
                <p className="text-[13px] font-bold">Notifications & Privacy</p>
                <p className="mt-1 text-[11.5px] text-muted">Choose what the app tells you about, and how your data is handled.</p>
                <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-card">
                  {PREFERENCE_TOGGLES.map((f, i) => (
                    <div key={f.key} className={cn("flex items-center gap-3 px-4 py-3.5", i > 0 && "border-t border-line-soft")}>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-medium text-ink">{f.label}</span>
                        <span className="block text-[10.5px] text-muted">{f.note}</span>
                      </span>
                      {busy === f.key && <Loader2 size={13} className="shrink-0 animate-spin text-clay" />}
                      <Toggle on={pref(f.key, f.def)} onClick={() => void patchSettings({ [f.key]: !pref(f.key, f.def) }, f.key)} />
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
