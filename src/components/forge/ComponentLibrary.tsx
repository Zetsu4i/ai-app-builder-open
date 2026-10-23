"use client";

import { useState } from "react";
import {
  Check, ChevronDown, ChevronRight, Copy, Search, Layers, Plus,
  ArrowUp, Loader2, RotateCcw, Bookmark, Camera, Bot, GitFork,
  HelpCircle, Plug, SquareTerminal, OctagonAlert, Eye, Code,
  Palette, LayoutDashboard, PanelLeft, PanelRight, Play, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useForge } from "@/lib/store";

/* ================================================================
   COMPONENT LIBRARY
   Every UI primitive in the project with a live specimen and the
   exact code that produces it.
   ================================================================ */

interface Specimen {
  id: string;
  name: string;
  group: string;
  notes?: string;
  code: string;
  render: () => React.ReactNode;
  dark?: boolean;
}

/* ---------------- buttons ---------------- */

const btnCode = `// Primary — ink fill, the only filled button besides Stop
<button className="flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3
  text-[12px] font-semibold text-white transition hover:bg-stone-800">
  <Rocket size={13} /> Publish
</button>

// Secondary — outline, for everything that isn't the main action
<button className="flex h-8 items-center gap-1.5 rounded-lg border
  border-line bg-card px-3 text-[12px] font-semibold text-ink-soft
  transition hover:border-ink/25 hover:text-ink">
  <Share2 size={13} /> Share
</button>

// Ghost icon — h-7 w-7, muted, never filled
<button className="flex h-7 w-7 items-center justify-center rounded-md
  text-muted transition hover:bg-black/5 hover:text-ink" title="Copy">
  <Copy size={13} />
</button>

// Destructive / stop — the only clay-filled button
<button className="flex h-8 w-8 items-center justify-center rounded-lg
  bg-clay text-white transition hover:bg-clay/90">
  <Square size={13} className="fill-current" />
</button>`;

/* ---------------- segmented tabs ---------------- */

const tabCode = `// Wrapper is a bordered pill container, p-1 gap-0.5
// Active segment = ink fill + white text + shadow-sm
<div className="flex items-center gap-0.5 rounded-xl border border-line
  bg-card p-1" role="tablist">
  <button role="tab" aria-selected
    className="flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3
      text-[12.5px] font-semibold text-white shadow-sm">
    <Eye size={14} /> Preview
  </button>
  <button role="tab" aria-selected={false}
    className="flex h-8 items-center gap-1.5 rounded-lg px-3
      text-[12.5px] font-semibold text-ink-soft transition
      hover:bg-black/5 hover:text-ink">
    <Code2 size={14} /> Code
  </button>
</div>`;

/* ---------------- inputs ---------------- */

const inputCode = `// Text input — h-8, cream fill, ink border on focus
<div className="flex h-8 items-center gap-2 rounded-lg border border-line
  bg-card px-2.5 focus-within:border-ink/30">
  <Search size={13} className="shrink-0 text-muted" />
  <input placeholder="Search chats…" className="w-full bg-transparent
    text-[12.5px] outline-none placeholder:text-faint" />
</div>

// Checkbox — 4px radius; Radio — full circle
<span className={cn("flex h-4 w-4 items-center justify-center border",
  on ? "border-ink bg-ink text-white" : "border-line bg-card",
  multi ? "rounded-[4px]" : "rounded-full")}>
  {on && <Check size={10} strokeWidth={3.5} />}
</span>`;

/* ---------------- toggle ---------------- */

const toggleCode = `/* .toggle is defined in index.css — 34×20px, 16px knob */
<span className="toggle" data-on={on} />

// Scale it down inside dense toolbars
<span className="toggle scale-[0.72]" data-on={on} />`;

/* ---------------- tool cards ---------------- */

const toolCode = `// Every tool card shares this skeleton:
// rounded-xl border, running = clay, done = line + moss check
<div className={cn("overflow-hidden rounded-xl border transition",
  running ? "border-clay/25 bg-clay/[0.04]" : "border-line bg-card")}>
  <div className="flex items-center gap-2.5 px-3 py-2">
    <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
      running ? "bg-clay/15 text-clay" : "bg-black/[0.07] text-ink-soft")}>
      {running ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[12px] font-semibold">{label}</span>
      <span className="block truncate font-mono text-[10.5px] text-muted">{detail}</span>
    </span>
    <span className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9.5px]
      font-bold bg-moss/15 text-moss">exit 0</span>
  </div>
</div>`;

/* ---------------- agent message ---------------- */

const msgCode = `// Agent header — ink square + display serif + status + timestamp
<div className="flex items-center gap-2">
  <span className="flex h-6 w-6 items-center justify-center rounded-lg
    bg-ink text-[12px] font-bold text-paper">F</span>
  <span className="font-display text-[16px]">forge</span>
  {streaming && (
    <span className="ml-1 flex items-center gap-1.5 text-[11.5px]
      font-medium text-muted">
      <span className="working-dot h-1.5 w-1.5 rounded-full bg-clay" /> working
    </span>
  )}
  <span className="ml-auto text-[11px] text-faint">{timestamp}</span>
</div>

// Card spacing is always mt-2.5 between siblings, mt-3 after the plan`;

/* ---------------- collapsible panel ---------------- */

const collapseCode = `// Header: icon square + bold title + ml-auto meta + chevron
<button onClick={() => setOpen(!open)} className="flex w-full items-center
  gap-2 p-3 text-left">
  <span className="flex h-7 w-7 shrink-0 items-center justify-center
    rounded-lg bg-clay/10 text-clay"><GitFork size={14} /></span>
  <span className="min-w-0 flex-1">
    <span className="block truncate text-[12px] font-semibold">{title}</span>
    <span className="block truncate text-[10.5px] text-muted">{subtitle}</span>
  </span>
  <span className="shrink-0 text-[9.5px] font-bold uppercase
    text-moss">{status}</span>
  {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
</button>

// Cream mono strip beneath the header
<div className="flex items-center gap-2 border-t border-line-soft bg-cream
  px-3 py-2 font-mono text-[10px]">
  <span className="rounded bg-black/[0.05] px-2 py-1">from</span>
  <ArrowRight size={11} className="text-faint" />
  <span className="rounded bg-sage-bg px-2 py-1 text-moss">to</span>
</div>`;

/* ---------------- checkpoint ---------------- */

const cpCode = `<div className={cn("overflow-hidden rounded-xl border bg-card",
  current ? "border-moss/40" : "border-line")}>
  <div className="flex items-center gap-2 border-b border-line-soft
    bg-cream px-3 py-2">
    <span className={cn("flex h-6 w-6 items-center justify-center rounded-md",
      current ? "bg-moss/15 text-moss" : "bg-black/[0.06] text-ink-soft")}>
      <Bookmark size={12} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[12px] font-semibold">{label}</span>
      <span className="block truncate text-[11px] text-muted">{summary}</span>
    </span>
    {current && <span className="rounded-full bg-moss/15 px-2 py-0.5
      text-[10px] font-bold text-moss">CURRENT</span>}
  </div>
  <div className="flex items-center gap-1.5 border-t border-line-soft
    bg-cream px-3 py-2">
    <button className="flex h-7 items-center gap-1.5 rounded-lg bg-ink
      px-2.5 text-[11.5px] font-semibold text-white"><RotateCcw size={11} />
      Restore</button>
  </div>
</div>`;

/* ---------------- composer ---------------- */

const composerCode = `// Four-row stack: textarea · chips · toolbar · helper
<div className="overflow-hidden rounded-2xl border border-line bg-card
  shadow-[0_8px_28px_-12px_rgba(28,25,23,0.25)] transition
  focus-within:border-ink/30">
  <textarea rows={1} className="max-h-[140px] w-full resize-none
    bg-transparent px-4 pb-1 pt-3.5 text-[13.5px] leading-relaxed
    outline-none placeholder:text-faint" />
  <div className="flex items-center gap-1 px-2.5 pb-2.5 pt-1">
    <button className="flex h-8 w-8 items-center justify-center
      rounded-lg border border-line text-muted hover:text-ink">
      <Plus size={16} />
    </button>
    <div className="ml-auto flex items-center gap-1">
      <button className="flex h-8 items-center gap-1.5 rounded-lg border
        border-line px-2.5 text-[12px] font-medium">Swarm
        <span className="toggle scale-[0.72]" data-on={on} /></button>
      <button className="flex h-8 w-8 items-center justify-center
        rounded-lg bg-ink text-white"><ArrowUp size={15} /></button>
    </div>
  </div>
</div>`;

/* ---------------- layout shells ---------------- */

const layoutCode = `// App shell — fixed viewport, nothing scrolls at page level
<div className="flex h-full flex-col overflow-hidden bg-paper">
  <div className="flex min-h-0 flex-1">
    <Sidebar />                              // w-[248px] | w-10 collapsed
    <div className="flex min-w-0 flex-1 flex-col">
      <TopBar />                             // h-[52px]
      <div className="flex min-h-0 flex-1">
        <ChatPanel />                        // 320-640px, resizable
        <div className="resizer w-[5px] shrink-0" />
        <Workspace />                        // flex-1
      </div>
      <StatusBar />                          // h-[28px]
    </div>
  </div>
</div>

// Panel skeleton — every surface follows this
<div className="flex h-full min-w-0 flex-1 flex-col bg-cream">
  <div className="flex h-11 shrink-0 items-center gap-2 border-b
    border-line px-3">{/* context chip · actions */}</div>
  <div className="min-h-0 flex-1 overflow-y-auto">{/* body */}</div>
  <div className="flex h-[26px] shrink-0 items-center gap-2 border-t
    border-line-soft px-3 text-[10.5px] text-muted">{/* footer */}</div>
</div>`;

/* ---------------- specimens ---------------- */

const SPECIMENS: Specimen[] = [
  { id: "toggle", name: "Toggle", group: "Inputs", code: toggleCode,
    render: () => (
      <div className="flex items-center gap-4 rounded-xl border border-line bg-cream p-4">
        <span className="toggle" data-on />
        <span className="toggle" data-on={false} />
        <span className="toggle scale-[0.72]" data-on />
        <span className="flex h-7 items-center gap-1.5 rounded-lg border border-clay/40 bg-clay/[0.08] px-2.5 text-[12px] font-medium text-clay">
          Swarm <span className="toggle scale-[0.72]" data-on />
        </span>
      </div>
    ) },

  { id: "layout", name: "Layout shells", group: "Layout", code: layoutCode,
    notes: "app shell + panel skeleton",
    render: () => (
      <div className="overflow-hidden rounded-xl border border-line">
        <div className="flex h-9 items-center border-b border-line bg-paper px-3 text-[10.5px] text-muted">TopBar · 52px</div>
        <div className="flex h-[132px]">
          <div className="flex w-[64px] shrink-0 items-center justify-center border-r border-line bg-paper text-[9.5px] text-faint">Sidebar</div>
          <div className="flex w-[96px] shrink-0 items-center justify-center border-r border-line bg-cream text-[9.5px] text-faint">Chat</div>
          <div className="resizer w-[5px] shrink-0 bg-line" />
          <div className="flex flex-1 flex-col">
            <div className="flex h-7 items-center border-b border-line bg-cream px-2 text-[9.5px] text-faint">Panel bar · 44px</div>
            <div className="flex flex-1 items-center justify-center bg-code-bg text-[9.5px] text-faint">Body · scrolls internally</div>
            <div className="flex h-5 items-center border-t border-line-soft bg-cream px-2 text-[9px] text-faint">Footer · 26px</div>
          </div>
        </div>
        <div className="flex h-6 items-center border-t border-line bg-paper px-3 text-[9.5px] text-faint">StatusBar · 28px</div>
      </div>
    ) },

  { id: "btn-primary", name: "Primary button", group: "Buttons", code: btnCode,
    render: () => (
      <div className="flex flex-wrap gap-2">
        <button className="flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-[12px] font-semibold text-white transition hover:bg-stone-800">
          <Download size={13} /> Publish
        </button>
        <button className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-[12px] font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink">
          <Eye size={13} /> Share
        </button>
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink" title="Copy"><Copy size={13} /></button>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-clay text-white transition hover:bg-clay/90" title="Stop">
          <span className="block h-2.5 w-2.5 rounded-[1px] bg-white" />
        </button>
        <button className="flex h-8 items-center gap-1.5 rounded-lg bg-black/[0.06] px-3 text-[12px] font-semibold text-faint">Disabled</button>
      </div>
    ) },

  { id: "tabs", name: "Segmented tabs", group: "Navigation", code: tabCode,
    render: () => (
      <div className="flex items-center gap-0.5 rounded-xl border border-line bg-card p-1">
        <button className="flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-[12.5px] font-semibold text-white shadow-sm"><Eye size={14} /> Preview</button>
        <button className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold text-ink-soft transition hover:bg-black/5 hover:text-ink"><Code size={14} /> Code</button>
        <button className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold text-ink-soft transition hover:bg-black/5 hover:text-ink"><Bot size={14} /> Git</button>
      </div>
    ) },

  { id: "input", name: "Inputs & selection", group: "Inputs", code: inputCode,
    render: () => (
      <div className="space-y-2.5">
        <div className="flex h-8 items-center gap-2 rounded-lg border border-line bg-card px-2.5 focus-within:border-ink/30">
          <Search size={13} className="shrink-0 text-muted" />
          <input placeholder="Search chats…" className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-faint" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-ink bg-ink text-white"><Check size={10} strokeWidth={3.5} /></span>
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-ink bg-ink text-white"><Check size={9} strokeWidth={3.5} /></span>
          <span className="h-4 w-4 rounded-full border border-line" />
          <span className="toggle" data-on />
          <span className="toggle" data-on={false} />
        </div>
      </div>
    ) },

  { id: "tool", name: "Tool call cards", group: "Cards", code: toolCode,
    notes: "running = clay border + wash · done = line border + moss check",
    render: () => (
      <div className="space-y-2">
        {[
          { icon: <SquareTerminal size={12} />, label: "Running command", detail: "pnpm lint --fix", running: true, meta: "…" },
          { icon: <SquareTerminal size={12} />, label: "Running command", detail: "pnpm lint --fix", running: false, meta: "exit 0" },
          { icon: <Plug size={12} />, label: "MCP call · postgres", detail: "query(schema.listTables)", running: false, meta: "done" },
          { icon: <Camera size={12} />, label: "Browser session", detail: "localhost:3000", running: false, meta: "6 steps" },
        ].map((t) => (
          <div key={t.label} className={cn("overflow-hidden rounded-xl border transition", t.running ? "border-clay/25 bg-clay/[0.04]" : "border-line bg-card")}>
            <div className="flex items-center gap-2.5 px-3 py-2">
              <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", t.running ? "bg-clay/15 text-clay" : "bg-black/[0.07] text-ink-soft")}>
                {t.running ? <Loader2 size={12} className="animate-spin" /> : t.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-semibold text-ink">{t.label}</span>
                <span className="block truncate font-mono text-[10.5px] text-muted">{t.detail}</span>
              </span>
              <span className={cn("shrink-0 rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold", t.running ? "bg-black/[0.06] text-muted" : "bg-moss/15 text-moss")}>{t.meta}</span>
            </div>
          </div>
        ))}
      </div>
    ) },

  { id: "msg", name: "Agent message header", group: "Chat", code: msgCode,
    render: () => (
      <div className="rounded-xl border border-line bg-card p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-ink text-[12px] font-bold text-paper">F</span>
          <span className="font-display text-[16px]">forge</span>
          <span className="ml-1 flex items-center gap-1.5 text-[11.5px] font-medium text-muted">
            <span className="working-dot h-1.5 w-1.5 rounded-full bg-clay" /> working
          </span>
          <span className="ml-auto text-[11px] text-faint">11:18 AM</span>
        </div>
      </div>
    ) },

  { id: "collapse", name: "Collapsible panel", group: "Cards", code: collapseCode,
    render: () => (
      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="flex w-full items-center gap-2 p-3 text-left">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-clay/10 text-clay"><GitFork size={14} /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-semibold">Agent handoff</span>
            <span className="block truncate text-[10.5px] text-muted">forge-orchestrator → Content Strategist</span>
          </span>
          <span className="shrink-0 text-[9.5px] font-bold uppercase text-moss">done</span>
          <ChevronDown size={13} className="shrink-0 text-muted" />
        </div>
        <div className="flex items-center gap-2 border-t border-line-soft bg-cream px-3 py-2 font-mono text-[10px]">
          <span className="rounded bg-black/[0.05] px-2 py-1">orchestrator</span>
          <ChevronRight size={11} className="text-faint" />
          <span className="rounded bg-sage-bg px-2 py-1 text-moss">specialist</span>
          <span className="ml-auto text-moss">6s</span>
        </div>
      </div>
    ) },

  { id: "cp", name: "Checkpoint card", group: "Cards", code: cpCode,
    render: () => (
      <div className="space-y-2">
        {[{ c: true, l: "Checkpoint 4", s: "Strengthened hero accent styling" }, { c: false, l: "Checkpoint 3", s: "Added bestsellers shelf" }].map((k) => (
          <div key={k.l} className={cn("overflow-hidden rounded-xl border bg-card", k.c ? "border-moss/40" : "border-line")}>
            <div className="flex items-center gap-2 border-b border-line-soft bg-cream px-3 py-2">
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", k.c ? "bg-moss/15 text-moss" : "bg-black/[0.06] text-ink-soft")}><Bookmark size={12} /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-semibold text-ink">{k.l}</span>
                <span className="block truncate text-[11px] text-muted">{k.s}</span>
              </span>
              {k.c && <span className="shrink-0 rounded-full bg-moss/15 px-2 py-0.5 text-[10px] font-bold text-moss">CURRENT</span>}
            </div>
            <div className="flex items-center gap-1.5 border-t border-line-soft bg-cream px-3 py-2">
              <button disabled={k.c} className={cn("flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11.5px] font-semibold", k.c ? "bg-black/[0.05] text-faint" : "bg-ink text-white")}><RotateCcw size={11} />{k.c ? "Current state" : "Restore"}</button>
              <span className="ml-auto font-mono text-[10px] text-faint">21.7k</span>
            </div>
          </div>
        ))}
      </div>
    ) },

  { id: "composer", name: "Composer", group: "Chat", code: composerCode,
    notes: "textarea · chips · toolbar · helper line",
    render: () => (
      <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-[0_8px_28px_-12px_rgba(28,25,23,0.25)]">
        <div className="px-4 pt-3.5 pb-1 text-[13.5px] text-faint">Ask Forge to build, edit, or explain…</div>
        <div className="flex items-center gap-1 px-2.5 pb-2.5 pt-1">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:text-ink"><Plus size={16} /></button>
          <div className="ml-auto flex items-center gap-1">
            <button className="flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[12px] font-medium text-ink-soft">
              Swarm <span className="toggle scale-[0.72]" data-on />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white"><ArrowUp size={15} strokeWidth={2.4} /></button>
          </div>
        </div>
      </div>
    ) },

  { id: "err", name: "Error & warning", group: "Cards", dark: true, code: "",
    render: () => (
      <div className="space-y-2">
        {[
          { i: <OctagonAlert size={12} />, t: "TypeError: Cannot read properties of undefined", s: "components/Bestsellers.tsx", c: "bg-clay/10 text-clay", tc: "text-[#ffc9bd]" },
          { i: <HelpCircle size={12} />, t: "Each child in a list should have a unique key", s: "components/Categories.tsx:34", c: "bg-[#e8c47a]/10 text-[#e8c47a]", tc: "text-white/80" },
        ].map((e) => (
          <div key={e.t} className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
            <span className={cn("mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded", e.c)}>{e.i}</span>
            <span className="min-w-0 flex-1">
              <span className={cn("block text-[12px] leading-snug", e.tc)}>{e.t}</span>
              <span className="block truncate font-mono text-[10.5px] text-white/40">{e.s}</span>
            </span>
          </div>
        ))}
      </div>
    ) },

  { id: "rails", name: "Collapsed rails", group: "Layout", code: "",
    notes: "left = navigation · right = workspace",
    render: () => (
      <div className="flex items-stretch gap-3">
        <button className="flex h-24 w-10 shrink-0 flex-col items-center gap-2 border-r border-line bg-cream pt-4 text-muted transition hover:text-ink">
          <ChevronRight size={15} />
          <span className="text-[9.5px] font-bold tracking-wider [writing-mode:vertical-lr]">NAVIGATION</span>
          <span className="mt-auto mb-3 flex h-6 w-6 items-center justify-center rounded-full bg-clay text-[9px] font-bold text-white">A</span>
        </button>
        <button className="flex h-24 w-11 shrink-0 flex-col items-center gap-2 border-l border-line bg-cream pt-4 text-muted transition hover:text-ink">
          <PanelRight size={16} />
          <span className="text-[9.5px] font-bold [writing-mode:vertical-lr]">WORKSPACE</span>
        </button>
      </div>
    ) },

  { id: "empty", name: "Empty / stopped state", group: "Layout", code: "",
    render: () => (
      <div className="flex h-40 items-center justify-center rounded-xl border border-line bg-code-bg">
        <div className="max-w-xs text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-card text-muted shadow-sm"><Play size={19} /></span>
          <h3 className="mt-3 text-[13px] font-semibold">Development server is stopped</h3>
          <p className="mx-auto mt-1 max-w-[240px] text-[10.5px] leading-relaxed text-muted">Resume the project preview when you are ready.</p>
          <button className="mx-auto mt-3 flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-[10.5px] font-semibold text-white"><Play size={11} className="fill-current" /> Start dev server</button>
        </div>
      </div>
    ) },
];

const GROUPS = Array.from(new Set(SPECIMENS.map((s) => s.group)));

const PALETTE = [
  { name: "paper", hex: "#f4f1eb", use: "App background, sidebars, top bars" },
  { name: "cream", hex: "#faf8f4", use: "Explorers, panel chrome" },
  { name: "card", hex: "#ffffff", use: "Cards, popovers, modals" },
  { name: "code-bg", hex: "#fdfcf9", use: "Editor body" },
  { name: "line", hex: "#e7e1d3", use: "Primary separators" },
  { name: "ink", hex: "#1c1917", use: "Primary text, primary buttons" },
  { name: "ink-soft", hex: "#57534e", use: "Secondary text" },
  { name: "muted", hex: "#8a8580", use: "Tertiary text, hints" },
  { name: "faint", hex: "#b8b2a7", use: "Placeholders, line numbers" },
  { name: "clay", hex: "#b4532a", use: "Running / error / stop" },
  { name: "moss", hex: "#5b6b4c", use: "Success / done / saved" },
  { name: "honey", hex: "#c98a2d", use: "Warning / modified" },
  { name: "terminal", hex: "#211d1a", use: "Terminal + console only" },
];

export default function ComponentLibrary() {
  const setView = useForge((s) => s.setView);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string>("All");
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const shown = SPECIMENS.filter(
    (s) => (group === "All" || s.group === group) && (!q.trim() || s.name.toLowerCase().includes(q.toLowerCase()))
  );

  const copy = async (s: Specimen) => {
    try { await navigator.clipboard.writeText(s.code); } catch { /* noop */ }
    setCopied(s.id); setTimeout(() => setCopied(null), 1400);
  };

  return (
    <div className="flex h-full flex-1 flex-col bg-paper">
      <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-line px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white"><Layers size={15} /></span>
        <span className="text-[13px] font-bold">Component library</span>
        <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-bold text-ink-soft">{SPECIMENS.length} specimens</span>
        <div className="ml-auto flex h-8 w-[220px] items-center gap-2 rounded-lg border border-line bg-card px-2.5">
          <Search size={13} className="shrink-0 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search components…"
            className="w-full bg-transparent text-[12px] outline-none placeholder:text-faint" />
        </div>
        <button onClick={() => setView("home")} className="flex h-8 items-center rounded-lg border border-line bg-card px-3 text-[12px] font-semibold text-ink-soft transition hover:text-ink">
          Back
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 border-b border-line-soft px-4 py-2">
        {["All", ...GROUPS].map((g) => (
          <button key={g} onClick={() => setGroup(g)}
            className={cn("h-7 rounded-lg px-2.5 text-[11.5px] font-semibold transition",
              group === g ? "bg-ink text-white" : "text-ink-soft hover:bg-black/5 hover:text-ink")}>{g}</button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[900px] px-4 py-5">
          {/* theme */}
          <p className="flex items-center gap-1.5 text-[13px] font-bold"><Palette size={14} className="text-muted" /> Theme tokens</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {PALETTE.map((c) => (
              <div key={c.name} className="overflow-hidden rounded-xl border border-line bg-card">
                <span className="block h-10 w-full border-b border-line-soft" style={{ background: c.hex }} />
                <span className="block px-2.5 py-2">
                  <span className="block font-mono text-[10.5px] font-bold text-ink">{c.name}</span>
                  <span className="block font-mono text-[9.5px] text-faint">{c.hex}</span>
                  <span className="mt-0.5 block text-[9.5px] leading-snug text-muted">{c.use}</span>
                </span>
              </div>
            ))}
          </div>

          {/* type scale */}
          <p className="mt-6 flex items-center gap-1.5 text-[13px] font-bold"><LayoutDashboard size={14} className="text-muted" /> Type scale</p>
          <div className="mt-3 overflow-hidden rounded-xl border border-line bg-card">
            {[
              { n: "Hero", s: "44px", cls: "font-display text-[44px] tracking-tight leading-tight" },
              { n: "Brand", s: "21px", cls: "font-display text-[21px] tracking-tight" },
              { n: "Panel title", s: "16px", cls: "font-display text-[16px]" },
              { n: "Body", s: "13.5px", cls: "text-[13.5px] leading-[1.65]" },
              { n: "Card title", s: "12.5px", cls: "text-[12.5px] font-semibold" },
              { n: "Detail", s: "11.5px", cls: "text-[11.5px] text-muted" },
              { n: "Meta", s: "10.5px", cls: "text-[10.5px] text-muted" },
              { n: "Mono", s: "10.5px", cls: "font-mono text-[10.5px] text-muted" },
            ].map((t, i) => (
              <div key={t.n} className={cn("flex items-center gap-4 px-4 py-2.5", i > 0 && "border-t border-line-soft")}>
                <span className="w-[92px] shrink-0 text-[11px] font-semibold text-ink-soft">{t.n}</span>
                <span className="w-[54px] shrink-0 font-mono text-[10px] text-faint">{t.s}</span>
                <span className={cn("min-w-0 flex-1 truncate text-ink", t.cls)}>Spice &amp; Crumb</span>
              </div>
            ))}
          </div>

          {/* specimens */}
          <p className="mt-6 flex items-center gap-1.5 text-[13px] font-bold"><Layers size={14} className="text-muted" /> Specimens</p>
          <div className="mt-3 space-y-4">
            {shown.map((s) => (
              <div key={s.id} className="overflow-hidden rounded-xl border border-line bg-card">
                <div className="flex items-center gap-2 border-b border-line-soft bg-cream px-3.5 py-2.5">
                  <span className="text-[12.5px] font-bold">{s.name}</span>
                  <span className="rounded bg-black/[0.06] px-1.5 py-0.5 text-[9.5px] font-bold text-ink-soft">{s.group}</span>
                  {s.notes && <span className="hidden truncate text-[10.5px] text-muted lg:block">{s.notes}</span>}
                  <div className="ml-auto flex shrink-0 items-center gap-0.5">
                    <button onClick={() => setOpen(open === s.id ? null : s.id)}
                      title="Show code"
                      className={cn("flex h-7 items-center gap-1.5 rounded-md px-2 text-[10.5px] font-semibold transition",
                        open === s.id ? "bg-ink text-white" : "text-muted hover:bg-black/5 hover:text-ink")}>
                      <Code size={11} /> {open === s.id ? "Hide" : "Code"}
                    </button>
                    {s.code && (
                      <button onClick={() => copy(s)} title="Copy code"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink">
                        {copied === s.id ? <Check size={12} className="text-moss" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>
                <div className={cn("p-4", s.dark ? "bg-[#211d1a]" : "bg-code-bg")}>{s.render()}</div>
                {open === s.id && s.code && (
                  <div className="anim-fade-in relative border-t border-line-soft bg-[#211d1a]">
                    <button onClick={() => copy(s)}
                      className="absolute right-2.5 top-2.5 flex h-6 items-center gap-1 rounded-md bg-white/[0.08] px-2 text-[9.5px] font-bold text-white/70 transition hover:bg-white/15 hover:text-white">
                      {copied === s.id ? <Check size={10} className="text-[#8fd6a0]" /> : <Copy size={10} />} {copied === s.id ? "Copied" : "Copy"}
                    </button>
                    <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-[1.7] text-white/75">{s.code}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-xl border border-line bg-cream px-4 py-3">
            <PanelLeft size={14} className="shrink-0 text-muted" />
            <p className="text-[11px] leading-relaxed text-muted">
              Full written guidelines live in <span className="font-mono font-semibold text-ink">design-guidelines.md</span> — the
              theme, layout, spacing and component rules an agent can follow without reading this codebase.
            </p>
          </div>
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
