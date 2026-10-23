"use client";

// CardSuite — reference gallery of every card, adapted to the real sibling
// card components (ToolCards / QuestionCard / Artifacts / ArtifactPreview /
// AgentEventCards) and the shared domain types.

import { useState } from "react";
import {
  Check, ChevronDown, ChevronRight, Loader2, Camera, ArrowRight, GitFork,
  Bot, HelpCircle, FilePen, TriangleAlert, OctagonAlert, ShieldCheck,
  Copy, RotateCcw, ThumbsUp, ThumbsDown, MousePointer2, Bookmark, History, AlertCircle, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArtifactDTO, QuestionPart, ToolInvocationPart } from "@/lib/types";
import { ToolRow } from "./ToolCards";
import { QuestionCard } from "./QuestionCard";
import { UserEditCard } from "./Artifacts";
import { ScreenshotVisual } from "./ScreenshotVisual";
import { ArtifactFileCard, ArtifactPreview } from "./ArtifactPreview";
import { TerminalReadCard, WebViewErrorCard, type WebViewError } from "./AgentEventCards";

/* Every card variation in one reference gallery — the canonical card library. */

/** showcase project id — dead on purpose, keeps download/preview links local */
const DEMO_PROJECT = "demo";

/* ---- tool card samples (real ToolInvocationPart shapes) ---- */

function part(
  id: string,
  toolName: string,
  state: ToolInvocationPart["state"],
  input: Record<string, unknown>,
  extra?: Partial<ToolInvocationPart>,
): ToolInvocationPart {
  return { type: "tool-invocation", id, toolName, state, input, ...extra };
}

const TOOL_SAMPLES: ToolInvocationPart[] = [
  // generic — read · edit · create
  part("1", "Read", "output-available", { file_path: "components/Hero.tsx" }),
  part("2", "Read", "running", { file_path: "components/Bestsellers.tsx" }),
  part("3", "Edit", "output-available", {
    file_path: "app/globals.css",
    old_string: "--accent: #cc4b60;",
    new_string: "--accent: #cc2b60;\n--accent-deep: #a31f4c;",
  }),
  part("4", "Edit", "running", {
    file_path: "components/Hero.tsx",
    old_string: "text-3xl",
    new_string: "text-5xl font-display",
  }),
  part("5", "Write", "output-available", {
    file_path: "components/Recipe.tsx",
    content: "export function Recipe() {\n  return <article>Slow-proof your starter…</article>;\n}\n",
  }),
  // skill & MCP
  part("6", "Skill", "output-available", { skill: "tailwind-tokens", scope: "user" }, { readOnly: true }),
  part("7", "Skill", "running", { skill: "next-app-router" }, { readOnly: true }),
  part("8", "mcp__postgres__query", "output-available", { query: "SELECT * FROM information_schema.tables LIMIT 20" }),
  part("9", "mcp__github__list_files", "running", { repo: "spice-and-crumb", per_page: 10 }),
  // terminal — success · failure · running
  part("10", "Bash", "output-available", { command: "pnpm lint --fix", cwd: "~/spice-and-crumb" }, {
    output: { stdout: "Sorting imports in 4 files\nAuto-fixing 2 style issues\nNo remaining problems", exitCode: 0 },
  }),
  part("11", "Bash", "error", { command: "pnpm build", cwd: "~/spice-and-crumb" }, {
    output: { stderr: "Failed to compile.\nType error: Property 'items' does not exist on type 'Props'.", exitCode: 1 },
  }),
  part("12", "Bash", "running", { command: "pnpm test --watch", cwd: "~/spice-and-crumb" }),
  // browser & artifact
  part("13", "WebFetch", "output-available", { url: "http://localhost:3000/", viewport: "1280×800", steps: 6 }),
  part("14", "WebFetch", "running", { url: "exp://192.168.1.24:8081", viewport: "390×844", steps: 2 }),
  part("15", "Bash", "output-available", { command: "zip -r build.zip ." }, {
    output: { artifact: { path: "build/spice-crumb-build.zip", name: "spice-crumb-build.zip", size: 290816, mime: "application/zip" } },
  }),
  part("16", "Bash", "output-available", { command: "pandoc quarterly-review.md -o quarterly-review.pdf" }, {
    output: { artifact: { path: "reports/quarterly-review.pdf", name: "quarterly-review.pdf", size: 94208, mime: "application/pdf" } },
  }),
  // search
  part("17", "Grep", "output-available", { pattern: "Cinnamon", output_mode: "content" }, {
    output: { matches: [{ path: "lib/products.ts", line: 12 }, { path: "components/Bestsellers.tsx", line: 34 }] },
  }),
];

/* ---- agent message shape samples ---- */

function SkeletonAgent({ children, streaming, ts = "11:18 AM" }: { children: React.ReactNode; streaming?: boolean; ts?: string }) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-ink text-[12px] font-bold text-paper">F</span>
        <span className="font-display text-[16px]">forge</span>
        {streaming && (
          <span className="ml-1 flex items-center gap-1.5 text-[11.5px] font-medium text-muted">
            <span className="working-dot h-1.5 w-1.5 rounded-full bg-clay" /> working
          </span>
        )}
        <span className="ml-auto text-[11px] text-faint">{ts}</span>
      </div>
      {children}
    </div>
  );
}

const PLAN_DONE = [
  { id: "p1", text: "Inspect hero typography", done: true, active: false },
  { id: "p2", text: "Strengthen Flavour accent", done: true, active: false },
  { id: "p3", text: "Rebuild preview", done: true, active: false },
];
const PLAN_ACTIVE = [
  { id: "p1", text: "Inspect hero typography", done: true, active: false },
  { id: "p2", text: "Strengthen Flavour accent", done: false, active: true },
  { id: "p3", text: "Rebuild preview", done: false, active: false },
];

/* ---- artifact samples (real ArtifactDTO shapes) ---- */

const ARTIFACT_SAMPLES: ArtifactDTO[] = [
  { id: "a1", name: "q1-sales.xlsx", path: "exports/q1-sales.xlsx", type: "file", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 43008, createdAt: "2026-02-01T10:00:00Z" },
  { id: "a2", name: "quarterly-review.docx", path: "exports/quarterly-review.docx", type: "file", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 90112, createdAt: "2026-02-01T10:05:00Z" },
  { id: "a3", name: "brand-guidelines.pdf", path: "exports/brand-guidelines.pdf", type: "file", mime: "application/pdf", size: 1269760, createdAt: "2026-02-01T10:08:00Z" },
  { id: "a4", name: "hero-01.png", path: "shots/hero-01.png", type: "image", mime: "image/png", size: 219136, createdAt: "2026-02-01T10:12:00Z" },
  { id: "a5", name: "shelf-cards.png", path: "shots/shelf-cards.png", type: "image", mime: "image/png", size: 190464, createdAt: "2026-02-01T10:13:00Z" },
  { id: "a6", name: "spice-crumb-build.zip", path: "build/spice-crumb-build.zip", type: "archive", mime: "application/zip", size: 2908160, createdAt: "2026-02-01T10:15:00Z" },
  { id: "a7", name: "RELEASE.md", path: "RELEASE.md", type: "file", mime: "text/markdown", size: 6144, createdAt: "2026-02-01T10:16:00Z" },
  { id: "a8", name: "build-log.txt", path: ".logs/build-log.txt", type: "file", mime: "text/plain", size: 34816, createdAt: "2026-02-01T10:17:00Z" },
  { id: "a9", name: "products.csv", path: "data/products.csv", type: "file", mime: "text/csv", size: 12288, createdAt: "2026-02-01T10:18:00Z" },
];

const WEBVIEW_ERRORS: WebViewError[] = [
  { id: "we1", level: "error", text: "TypeError: Cannot read properties of undefined (reading 'map')", source: "components/Bestsellers.tsx", detail: "The `products` import resolved to undefined at module scope. The named export was renamed in lib/products.ts but the component still references the old identifier.", count: 3 },
  { id: "we2", level: "warn", text: 'Each child in a list should have a unique "key" prop.', source: "components/Categories.tsx:34", detail: "The category list renders without a stable key, causing full remounts on every re-render.", count: 1 },
];

/* ---- question part variants ---- */

const Q_BASE = {
  requestId: "demo-q1",
  prompt: "Design decision needed",
  questions: [
    {
      id: "hero",
      question: "How far should I push the hero headline?",
      options: [
        { value: "subtle", label: "Subtle refinement" },
        { value: "bold", label: "Clearly bolder" },
        { value: "oversized", label: "Editorial oversized" },
      ],
    },
  ],
};

function Section({ title, note, children, dark }: { title: string; note?: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className="border-t border-line-soft px-4 py-4 first:border-t-0">
      <div className="mb-3 flex items-baseline gap-2">
        <p className={cn("text-[10.5px] font-bold uppercase tracking-wider", dark ? "text-white/40" : "text-muted")}>{title}</p>
        {note && <p className={cn("text-[10px]", dark ? "text-white/25" : "text-faint")}>{note}</p>}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

export default function CardSuite() {
  const [qState, setQState] = useState<"open" | "answered" | "skipped">("open");
  const [approval, setApproval] = useState<"pending" | "approved" | "denied">("pending");
  const [dark, setDark] = useState(false);
  const [previewSpec, setPreviewSpec] = useState<ArtifactDTO | null>(null);

  const qPart: QuestionPart =
    qState === "answered"
      ? { type: "question", ...Q_BASE, answered: { action: "accept", content: { hero: "bold" } } }
      : qState === "skipped"
        ? { type: "question", ...Q_BASE, answered: { action: "decline" } }
        : { type: "question", ...Q_BASE };

  return (
    <div className="flex h-full flex-col bg-paper">
      <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-line px-4">
        <p className="text-[13px] font-bold">Card library</p>
        <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-bold text-ink-soft">reference</span>
        <button
          onClick={() => setDark(!dark)}
          className="ml-auto rounded-lg border border-line bg-card px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft transition hover:text-ink"
        >
          {dark ? "Dark surface" : "Light surface"}
        </button>
      </div>

      <div className={cn("min-h-0 flex-1 overflow-y-auto", dark ? "bg-[#211d1a]" : "bg-paper")}>
        <Section title="Tool calls — generic" note="read · edit · create · write">
          {TOOL_SAMPLES.slice(0, 5).map((t) => (
            <ToolRow key={t.id} part={t} projectId={DEMO_PROJECT} onOpenFile={() => {}} onOpenBrowser={() => {}} />
          ))}
        </Section>

        <Section title="Tool calls — skill & MCP">
          {TOOL_SAMPLES.slice(5, 9).map((t) => (
            <ToolRow key={t.id} part={t} projectId={DEMO_PROJECT} onOpenFile={() => {}} onOpenBrowser={() => {}} />
          ))}
        </Section>

        <Section title="Tool calls — terminal" note="success · failure · running">
          {TOOL_SAMPLES.slice(9, 12).map((t) => (
            <ToolRow key={t.id} part={t} projectId={DEMO_PROJECT} onOpenFile={() => {}} onOpenBrowser={() => {}} />
          ))}
        </Section>

        <Section title="Tool calls — browser & artifact" note="clickable · downloadable">
          {TOOL_SAMPLES.slice(12, 16).map((t) => (
            <ToolRow key={t.id} part={t} projectId={DEMO_PROJECT} onOpenFile={() => {}} onOpenBrowser={() => {}} />
          ))}
          {TOOL_SAMPLES.slice(16).map((t) => (
            <ToolRow key={t.id} part={t} projectId={DEMO_PROJECT} onOpenFile={() => {}} onOpenBrowser={() => {}} />
          ))}
        </Section>

        <Section title="Task plan" note="all states">
          {[
            { label: "Complete", todos: PLAN_DONE },
            { label: "In progress", todos: PLAN_ACTIVE },
            { label: "Not started", todos: PLAN_ACTIVE.map((t) => ({ ...t, done: false, active: false })) },
          ].map(({ label, todos }) => (
            <div key={label} className="overflow-hidden rounded-xl border border-line bg-card">
              <div className="flex w-full items-center gap-2 px-3 py-2.5">
                {todos.every((t) => t.done) ? (
                  <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-moss text-white">
                    <Check size={11} strokeWidth={3} />
                  </span>
                ) : todos.some((t) => t.active) ? (
                  <Loader2 size={15} className="shrink-0 animate-spin text-clay" />
                ) : (
                  <span className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-line" />
                )}
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">{label}</span>
                <span className="shrink-0 text-[11px] tabular-nums text-muted">
                  {todos.filter((t) => t.done).length}/{todos.length}
                </span>
                <ChevronDown size={13} className="shrink-0 text-muted" />
              </div>
              <div className="space-y-1 border-t border-line-soft px-3 py-2">
                {todos.map((t) => (
                  <div key={t.id} className="flex items-center gap-2.5 py-1 text-[12.5px]">
                    {t.done ? (
                      <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-moss/15 text-moss">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    ) : t.active ? (
                      <Loader2 size={14} className="shrink-0 animate-spin text-clay" />
                    ) : (
                      <span className="h-[16px] w-[16px] shrink-0 rounded-full border border-line" />
                    )}
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate",
                        t.done ? "text-muted line-through decoration-ink/20" : t.active ? "font-medium text-ink" : "text-muted",
                      )}
                    >
                      {t.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>

        <Section title="Agent questions" note="open · answered · skipped">
          <QuestionCard part={qPart} projectId={DEMO_PROJECT} />
          <div className="flex gap-1.5">
            {(["open", "answered", "skipped"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setQState(st)}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition",
                  qState === st ? "border-ink bg-ink text-white" : "border-line bg-card text-ink-soft hover:text-ink",
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Handoff & swarm">
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="flex w-full items-center gap-2 p-3 text-left">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-clay/10 text-clay">
                <GitFork size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-semibold">Agent handoff</span>
                <span className="block truncate text-[10.5px] text-muted">forge-orchestrator → Content Strategist</span>
              </span>
              <span className="shrink-0 text-[9.5px] font-bold uppercase text-moss">done</span>
              <ChevronRight size={13} className="shrink-0 text-muted" />
            </div>
            <div className="flex items-center gap-2 border-t border-line-soft bg-cream px-3 py-2 font-mono text-[10px]">
              <span className="rounded bg-black/[0.05] px-2 py-1">forge-orchestrator</span>
              <ArrowRight size={11} className="text-faint" />
              <span className="rounded bg-sage-bg px-2 py-1 text-moss">Content Strategist</span>
              <span className="ml-auto text-moss">6s</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="flex w-full items-center gap-2 p-3 text-left">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-clay/10 text-clay">
                <Bot size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-semibold">Swarm</span>
                <span className="block truncate text-[10.5px] text-muted">4 sub-agents · orchestrator dispatched in parallel</span>
              </span>
              <span className="shrink-0 text-[9.5px] font-bold uppercase text-clay">2/4</span>
              <ChevronRight size={13} className="shrink-0 text-muted" />
            </div>
            <div className="flex items-center gap-2 border-t border-line-soft bg-cream px-3 py-2 font-mono text-[10px]">
              <span className="rounded bg-black/[0.05] px-2 py-1">orchestrator</span>
              <ArrowRight size={11} className="text-faint" />
              <span className="rounded bg-sage-bg px-2 py-1 text-moss">4 agents</span>
              <span className="ml-auto text-muted">68%</span>
            </div>
          </div>
        </Section>

        <Section title="User edit & system events">
          <UserEditCard acked={false} edits={[{ id: "e1", path: "components/Hero.tsx", added: 4, removed: 2, time: "11:19 AM" }]} />
          <UserEditCard acked edits={[{ id: "e2", path: "app/globals.css", added: 1, removed: 0, time: "11:21 AM" }]} />
          <div className="overflow-hidden rounded-xl border border-clay/25 bg-clay/[0.04] p-3">
            <div className="flex items-center gap-2 text-[12px] font-semibold">
              <ShieldCheck size={14} className="text-clay" />
              Approve file write
              <span
                className={cn(
                  "ml-auto text-[9px] font-bold uppercase",
                  approval === "approved" ? "text-moss" : approval === "denied" ? "text-clay" : "text-honey",
                )}
              >
                {approval}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted">
              Forge wants to overwrite <span className="font-mono">app/globals.css</span>
            </p>
            {approval === "pending" && (
              <div className="mt-2 flex gap-1.5">
                <button onClick={() => setApproval("approved")} className="rounded-md bg-ink px-2.5 py-1 text-[10px] font-semibold text-white">
                  Approve
                </button>
                <button onClick={() => setApproval("denied")} className="rounded-md border border-line bg-card px-2.5 py-1 text-[10px] font-semibold">
                  Deny
                </button>
              </div>
            )}
          </div>
        </Section>

        <Section title="Errors & warnings" note="console + inline">
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="flex items-start gap-2.5 px-3 py-2.5">
              <span className="mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded bg-clay/10 text-clay">
                <OctagonAlert size={12} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] leading-snug text-ink">
                  TypeError: Cannot read properties of undefined (reading &apos;map&apos;)
                  <span className="ml-2 rounded bg-black/[0.06] px-1.5 py-0.5 font-mono text-[9.5px] text-muted">×3</span>
                </span>
                <span className="mt-0.5 flex items-center gap-2">
                  <span className="truncate font-mono text-[10.5px] text-muted">components/Bestsellers.tsx</span>
                  <span className="shrink-0 rounded bg-moss/15 px-1.5 py-0.5 text-[9.5px] font-bold text-moss">FIXED</span>
                </span>
              </span>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="flex items-start gap-2.5 px-3 py-2.5">
              <span className="mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded bg-honey/12 text-honey">
                <TriangleAlert size={12} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] leading-snug text-ink">img elements must have an alt attribute</span>
                <span className="mt-0.5 block truncate font-mono text-[10.5px] text-muted">components/Hero.tsx</span>
              </span>
            </div>
          </div>
        </Section>

        <Section title="Screenshots" note="compact card · click for full window">
          <button className="w-full overflow-hidden rounded-xl border border-line bg-card text-left transition hover:border-ink/25">
            <div className="flex items-center gap-2 px-3 py-2">
              <Camera size={14} className="text-clay" />
              <span className="truncate text-[12px] font-semibold">Hero — after</span>
              <span className="ml-auto shrink-0 text-[10px] text-muted">PNG · 1280×720</span>
              <ChevronRight size={12} className="shrink-0 text-muted" />
            </div>
            <ScreenshotVisual variant="hero" />
            <p className="px-3 py-2 text-[10.5px] text-muted">h1 · accent verified · click to inspect</p>
          </button>
        </Section>

        <Section title="Checkpoints" note="current · restorable">
          {[
            { label: "Checkpoint 4", summary: "Strengthened hero accent styling", current: true, time: "11:18 AM", n: 2 },
            { label: "Checkpoint 3", summary: "Added bestsellers shelf", current: false, time: "10:42 AM", n: 3 },
          ].map((c) => (
            <div key={c.label} className={cn("overflow-hidden rounded-xl border bg-card", c.current ? "border-moss/40" : "border-line")}>
              <div className="flex items-center gap-2 border-b border-line-soft bg-cream px-3 py-2">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md",
                    c.current ? "bg-moss/15 text-moss" : "bg-black/[0.06] text-ink-soft",
                  )}
                >
                  <Bookmark size={12} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-semibold text-ink">{c.label}</span>
                  <span className="block truncate text-[11px] text-muted">{c.summary}</span>
                </span>
                {c.current && <span className="shrink-0 rounded-full bg-moss/15 px-2 py-0.5 text-[10px] font-bold text-moss">CURRENT</span>}
                <span className="shrink-0 text-[10.5px] text-faint">{c.time}</span>
              </div>
              <div className="flex items-center gap-1.5 border-t border-line-soft bg-cream px-3 py-2">
                <button
                  disabled={c.current}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11.5px] font-semibold",
                    c.current ? "bg-black/[0.05] text-faint" : "bg-ink text-white hover:bg-stone-800",
                  )}
                >
                  <RotateCcw size={11} />
                  {c.current ? "Current state" : "Restore"}
                </button>
                <span className="text-[10.5px] font-semibold text-muted">{c.n} files</span>
                <span className="ml-auto font-mono text-[10px] text-faint">21.7k</span>
              </div>
            </div>
          ))}
        </Section>

        <Section title="Message footers" note="streaming · complete">
          <SkeletonAgent streaming ts="11:22 AM">
            <div className="chat-md stream-caret mt-3 text-[13.5px] leading-[1.65] text-ink">
              <p>Applying your answer now — scaling the headline and deepening the accent.</p>
            </div>
          </SkeletonAgent>
          <SkeletonAgent>
            <div className="chat-md mt-3 text-[13.5px] leading-[1.65] text-ink">
              <p>Done — the hero now has a much stronger visual presence.</p>
            </div>
            <div className="mt-3 flex items-center gap-1 border-t border-line-soft pt-2.5">
              <span className="text-[11px] text-faint">Worked for 12s</span>
              <button className="ml-2 flex items-center gap-1 rounded-md border border-line bg-card px-2 py-1 text-[9.5px] font-semibold text-ink-soft hover:border-ink/25">
                <History size={10} /> Restore checkpoint
              </button>
              <div className="ml-auto flex items-center gap-0.5">
                {[Copy, ThumbsUp, ThumbsDown, RotateCcw].map((I, i) => (
                  <button key={i} className="flex h-7 w-7 items-center justify-center rounded-md text-faint transition hover:bg-black/5 hover:text-ink">
                    <I size={13} />
                  </button>
                ))}
              </div>
            </div>
          </SkeletonAgent>
        </Section>

        <Section title="User turns" note="text · config · picks · image">
          <div className="flex justify-end">
            <div className="max-w-[92%]">
              <div className="rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[13.5px] leading-relaxed text-white shadow-sm">Make the hero headline bolder</div>
              <p className="mt-1 text-right text-[10.5px] text-faint">11:22 AM</p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[92%]">
              <p className="mb-1 flex justify-end">
                <span className="rounded bg-black/[0.05] px-1.5 py-0.5 text-[10px] font-semibold text-ink-soft">WEB · react-vite</span>
              </p>
              <div className="rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[13.5px] leading-relaxed text-white shadow-sm">Tighten the shelf spacing</div>
              <p className="mt-1 text-right text-[10.5px] text-faint">11:24 AM</p>
            </div>
          </div>
          <div className="flex items-start justify-end">
            <div className="max-w-[92%] rounded-xl border border-line bg-card p-3">
              <div className="flex items-center gap-2 text-[12px] font-semibold">
                <FilePen size={13} className="text-honey" />
                Selected 2 elements in the preview
                <span className="ml-auto rounded bg-[#2f6bff]/10 px-2 py-0.5 text-[9px] font-bold text-[#2f6bff]">ATTACHED</span>
              </div>
              <div className="mt-2 space-y-1">
                {["section.hero h1", "h1 em.text-flavour"].map((sel) => (
                  <div key={sel} className="flex items-center gap-2 rounded-lg bg-cream px-2 py-1.5">
                    <MousePointer2 size={10} className="shrink-0 text-[#2f6bff]" />
                    <code className="min-w-0 flex-1 truncate font-mono text-[10px] text-ink-soft">{sel}</code>
                    <Check size={9} className="shrink-0 text-moss" />
                  </div>
                ))}
              </div>
              <p className="mt-2 border-t border-line-soft pt-2 text-[11.5px] italic text-muted">“make these larger and give them more contrast”</p>
            </div>
          </div>
        </Section>

        <Section title="Artifact previews" note="docx · xlsx · pdf · images · zip · txt · md · csv">
          <div className="grid gap-2.5 lg:grid-cols-2">
            {ARTIFACT_SAMPLES.map((a) => (
              <ArtifactFileCard key={a.id} artifact={a} projectId={DEMO_PROJECT} onPreview={() => setPreviewSpec(a)} />
            ))}
          </div>
        </Section>

        <Section title="Agent events" note="terminal read · webview errors">
          <TerminalReadCard
            command="pnpm build"
            cwd="~/spice-and-crumb"
            status="done"
            lines={["▲ Next.js 14.2.5", "✓ Compiled successfully", "✓ Linting and checking validity of types", "✓ Generating static pages (8/8)", "○ Preview deployed in 3.8s"]}
          />
          <TerminalReadCard command="pnpm test --watch" status="running" lines={["✗ 2 of 14 tests failing", "Expected: 4.9 — Received: undefined"]} />
          <WebViewErrorCard errors={WEBVIEW_ERRORS} onOpenConsole={() => {}} />
        </Section>

        <Section title="Empty & edge states">
          {[
            { i: Loader2, t: "Agent is working", d: "Streaming a response and running tool calls" },
            { i: HelpCircle, t: "Waiting for your answer", d: "A question is blocking the run" },
            { i: AlertCircle, t: "Run stopped", d: "You interrupted the agent — partial changes kept" },
            { i: Check, t: "Nothing to do", d: "The workspace already matches the request" },
            { i: Clock, t: "Rate limited", d: "Retrying in 30s — your plan is preserved" },
          ].map((s) => (
            <div key={s.t} className="flex items-start gap-2.5 rounded-xl border border-line bg-card p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-black/[0.06] text-ink-soft">
                <s.i size={12} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-semibold text-ink">{s.t}</span>
                <span className="block text-[11px] text-muted">{s.d}</span>
              </span>
            </div>
          ))}
        </Section>

        <div className="h-8" />
      </div>

      {previewSpec && (
        <ArtifactPreview open onClose={() => setPreviewSpec(null)} projectId={DEMO_PROJECT} artifact={previewSpec} />
      )}
    </div>
  );
}
