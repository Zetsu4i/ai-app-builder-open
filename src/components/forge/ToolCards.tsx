"use client";

// ZCode Builder — tool invocation cards. Maps the real agent-core tool names
// (Read/Write/Edit/Bash/Glob/Grep/WebFetch/WebSearch/TodoWrite/Skill/Agent/
// AskUserQuestion/SendMessage/EnterPlanMode/Cron*/Task*/NotebookEdit/ApplyPatch/
// mcp__server__tool) onto the Forge card design.

import React, { useState } from "react";
import {
  BookOpenCheck, Plug, SquareTerminal, Globe, Check, Loader2,
  ChevronRight, Copy, Check as CheckIcon, ArrowUpRight,
  FileSearch, FilePenLine, FilePlus2, Search, History, HelpCircle,
  ListChecks, ListTodo, Send, CircleAlert, Clock,
  Bot, Table2, PackageOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArtifactDTO, ToolInvocationPart } from "@/lib/types";
import { ArtifactFileCard, ArtifactPreview } from "./ArtifactPreview";

/* ------------------------------------------------------------------ */
/*  input / output accessors                                           */
/* ------------------------------------------------------------------ */

type Rec = Record<string, unknown>;

function asRec(v: unknown): Rec {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Rec) : {};
}
function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}
export function toolInput(p: ToolInvocationPart): Rec {
  return asRec(p.input);
}

function flattenText(v: unknown, depth = 0): string | null {
  if (v == null || depth > 3) return null;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) {
    const parts = v.map((x) => flattenText(x, depth + 1)).filter((s): s is string => !!s);
    return parts.length ? parts.join("\n") : null;
  }
  const rec = asRec(v);
  for (const k of ["text", "content", "result", "message", "summary", "output", "stdout"]) {
    const t = flattenText(rec[k], depth + 1);
    if (t) return t;
  }
  return null;
}

export function resultText(p: ToolInvocationPart): string | null {
  if (p.state !== "output-available" && p.state !== "error") return null;
  return flattenText(p.output);
}

function lineCount(v: unknown): number | undefined {
  const s = str(v);
  if (s === undefined) return undefined;
  return s.split("\n").length;
}

/* ------------------------------------------------------------------ */
/*  shared shells                                                      */
/* ------------------------------------------------------------------ */

function isActive(p: ToolInvocationPart) {
  return p.state === "running" || p.state === "input-streaming";
}
function isError(p: ToolInvocationPart) {
  return p.state === "error" || p.isError === true;
}

function CardShell({ part, children, onClick, title }: {
  part: ToolInvocationPart;
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      title={title}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "overflow-hidden rounded-xl border transition",
        isError(part) ? "border-clay/40 bg-clay/[0.05]"
          : isActive(part) ? "border-clay/25 bg-clay/[0.04]"
          : "border-line bg-card",
        onClick && !isActive(part) && "hover:border-ink/25 cursor-pointer",
      )}
    >
      {children}
      {part.state === "input-streaming" && part.argsText ? (
        <div className="border-t border-clay/15 bg-clay/[0.03] px-3 py-1.5">
          <code className="line-clamp-3 whitespace-pre-wrap break-all font-mono text-[10px] leading-relaxed text-ink-soft/80">
            {part.argsText}
          </code>
        </div>
      ) : null}
      {isError(part) ? (
        <div className="border-t border-clay/20 bg-clay/[0.04] px-3 py-1.5">
          <code className="line-clamp-3 whitespace-pre-wrap break-all font-mono text-[10px] leading-relaxed text-clay">
            {resultText(part) ?? "Tool call failed"}
          </code>
        </div>
      ) : null}
    </div>
  );
}

function LeadingIcon({ part, icon: Icon, tint = "bg-black/[0.07] text-ink-soft" }: {
  part: ToolInvocationPart;
  icon: typeof FileSearch;
  tint?: string;
}) {
  const active = isActive(part);
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
        active ? "bg-clay/15 text-clay" : isError(part) ? "bg-clay/15 text-clay" : tint,
      )}
    >
      {active ? (
        <Loader2 size={12} className="animate-spin" />
      ) : isError(part) ? (
        <CircleAlert size={12} />
      ) : part.state === "output-available" ? (
        <Check size={12} className="text-moss" />
      ) : (
        <Icon size={12} />
      )}
    </span>
  );
}

function DiffCounters({ added, removed }: { added?: number; removed?: number }) {
  if (added === undefined && removed === undefined) return null;
  return (
    <span className="flex shrink-0 items-center gap-1 font-mono text-[10.5px] font-bold">
      <span className="text-moss">+{added ?? 0}</span>
      <span className="text-clay">−{removed ?? 0}</span>
    </span>
  );
}

function QueuedBadge({ part }: { part: ToolInvocationPart }) {
  if (part.state !== "input-available") return null;
  return (
    <span className="flex shrink-0 items-center gap-1 rounded bg-black/[0.05] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted">
      <Clock size={9} /> queued
    </span>
  );
}

function ResultLine({ part, clamp = 2 }: { part: ToolInvocationPart; clamp?: number }) {
  const text = resultText(part);
  if (!text || isError(part)) return null;
  const clampCls = clamp >= 3 ? "line-clamp-3" : clamp <= 1 ? "line-clamp-1" : "line-clamp-2";
  return (
    <div className={cn("border-t border-line-soft bg-cream px-3 py-1.5", clampCls)}>
      <code className="whitespace-pre-wrap break-all font-mono text-[10px] leading-relaxed text-ink-soft">{text}</code>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  file cards (Read / Write / Edit / NotebookEdit)                    */
/* ------------------------------------------------------------------ */

function FileCard({ part, kind, onOpenFile }: {
  part: ToolInvocationPart;
  kind: "read" | "write" | "edit";
  onOpenFile: (p: string) => void;
}) {
  const input = toolInput(part);
  const path = str(input.file_path) ?? str(input.path) ?? str(input.notebook_path) ?? "file";
  const Icon = kind === "read" ? FileSearch : kind === "write" ? FilePlus2 : FilePenLine;
  return (
    <CardShell part={part} onClick={() => onOpenFile(path)} title={`Open ${path}`}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <LeadingIcon part={part} icon={Icon} tint={kind === "write" ? "bg-moss/12 text-moss" : "bg-black/[0.07] text-ink-soft"} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-ink">
            {kind === "read" ? "Read file" : kind === "write" ? "Created file" : "Edited file"}
          </span>
          <span className="block truncate font-mono text-[11px] text-muted">{path}</span>
        </span>
        <DiffCounters
          added={kind === "write" ? lineCount(input.content) : undefined}
        />
        {part.state === "output-available" && !isActive(part) && <Check size={13} className="shrink-0 text-moss" />}
      </div>
    </CardShell>
  );
}

function EditCard({ part, onOpenFile }: { part: ToolInvocationPart; onOpenFile: (p: string) => void }) {
  const input = toolInput(part);
  const path = str(input.file_path) ?? str(input.path) ?? "file";
  const added = lineCount(input.new_string) ?? lineCount(input.newString);
  const removed = lineCount(input.old_string) ?? lineCount(input.oldString);
  return (
    <CardShell part={part} onClick={() => onOpenFile(path)} title={`Open ${path}`}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <LeadingIcon part={part} icon={FilePenLine} tint="bg-moss/12 text-moss" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-ink">Edited file</span>
          <span className="block truncate font-mono text-[11px] text-muted">{path}</span>
        </span>
        <DiffCounters added={added} removed={removed} />
        {part.state === "output-available" && !isActive(part) && <Check size={13} className="shrink-0 text-moss" />}
      </div>
    </CardShell>
  );
}

function ApplyPatchCard({ part, onOpenFile }: { part: ToolInvocationPart; onOpenFile: (p: string) => void }) {
  const input = toolInput(part);
  const path = str(input.file_path) ?? str(input.path);
  const patch = str(input.patch) ?? str(input.diff) ?? "";
  const added = patch ? patch.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).length : undefined;
  const removed = patch ? patch.split("\n").filter((l) => l.startsWith("-") && !l.startsWith("---")).length : undefined;
  return (
    <CardShell part={part} onClick={path ? () => onOpenFile(path) : undefined}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <LeadingIcon part={part} icon={FilePenLine} tint="bg-moss/12 text-moss" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-ink">Applied patch</span>
          <span className="block truncate font-mono text-[11px] text-muted">{path ?? "patch"}</span>
        </span>
        <DiffCounters added={added} removed={removed} />
      </div>
    </CardShell>
  );
}

/* ------------------------------------------------------------------ */
/*  terminal command card (Bash)                                       */
/* ------------------------------------------------------------------ */

function bashOutput(p: ToolInvocationPart): { lines: string[]; exitCode?: number; cwd?: string } {
  const input = toolInput(p);
  const out = p.output;
  let lines: string[] = [];
  let exitCode: number | undefined;
  if (typeof out === "string") lines = out ? out.split("\n") : [];
  else if (out && typeof out === "object") {
    const rec = asRec(out);
    const stdout = str(rec.stdout);
    const stderr = str(rec.stderr);
    if (stdout) lines.push(...stdout.split("\n"));
    if (stderr) lines.push(...stderr.split("\n"));
    const code = rec.exitCode ?? rec.exit_code ?? rec.code;
    if (typeof code === "number") exitCode = code;
    if (lines.length === 0) {
      const t = flattenText(out);
      if (t) lines = t.split("\n");
    }
  }
  if (lines.length === 0 && isError(p)) {
    const t = resultText(p);
    if (t) lines = t.split("\n");
  }
  return { lines: lines.filter((l, i, a) => !(l === "" && i === a.length - 1)).slice(-120), exitCode, cwd: str(input.cwd) };
}

export function TerminalCommandCard({ part }: { part: ToolInvocationPart }) {
  const [open, setOpen] = useState(false);
  const input = toolInput(part);
  const command = str(input.command) ?? str(input.cmd) ?? "command";
  const { lines, exitCode, cwd } = bashOutput(part);
  const running = isActive(part);
  const ok = exitCode === undefined || exitCode === 0;
  return (
    <CardShell part={part}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <LeadingIcon part={part} icon={SquareTerminal} />
        <code className="min-w-0 flex-1 truncate font-mono text-[11.5px] font-semibold text-ink">
          <span className="text-moss">$ </span>
          {command}
        </code>
        {!running && (
          <span className={cn("shrink-0 rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold", ok ? "bg-moss/15 text-moss" : "bg-clay/15 text-clay")}>
            {isError(part) ? "failed" : `exit ${exitCode ?? 0}`}
          </span>
        )}
        {lines.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
            className="shrink-0 rounded p-0.5 text-muted hover:bg-black/5"
            title="Toggle output"
          >
            <ChevronRight size={13} className={open ? "rotate-90" : ""} />
          </button>
        )}
      </div>
      {open && lines.length > 0 && (
        <div className="anim-fade-in space-y-0.5 border-t border-line-soft bg-[#211d1a] px-3 py-2">
          {cwd && <p className="pb-1 font-mono text-[9px] uppercase tracking-wider text-white/30">{cwd}</p>}
          {lines.map((l, i) => (
            <div key={i} className="whitespace-pre-wrap break-words font-mono text-[10.5px] leading-relaxed text-white/75">{l}</div>
          ))}
        </div>
      )}
    </CardShell>
  );
}

/* ------------------------------------------------------------------ */
/*  search cards (Glob / Grep / WebSearch)                             */
/* ------------------------------------------------------------------ */

function SearchCard({ part }: { part: ToolInvocationPart }) {
  const input = toolInput(part);
  const isGrep = part.toolName === "Grep";
  const pattern = str(input.pattern) ?? str(input.query) ?? "";
  const scope = str(input.path);
  const result = resultText(part);
  const matchCount = result ? result.split("\n").filter(Boolean).length : undefined;
  return (
    <CardShell part={part}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <LeadingIcon part={part} icon={Search} tint="bg-[#2f6bff]/10 text-[#2f6bff]" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-ink">
            {part.toolName === "WebSearch" ? "Web search" : isGrep ? "Grep" : "Glob"}
          </span>
          <span className="block truncate font-mono text-[11px] text-muted">
            {pattern}
            {scope ? ` · ${scope}` : ""}
          </span>
        </span>
        {part.toolName !== "WebSearch" && matchCount !== undefined && matchCount > 0 && (
          <span className="shrink-0 rounded bg-black/[0.06] px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-ink-soft">
            {matchCount} {isGrep ? "matches" : "files"}
          </span>
        )}
        {part.state === "output-available" && !isActive(part) && <Check size={13} className="shrink-0 text-moss" />}
      </div>
      {part.toolName === "WebSearch" && result && !isActive(part) ? <ResultLine part={part} /> : null}
    </CardShell>
  );
}

/* ------------------------------------------------------------------ */
/*  browser card (WebFetch)                                            */
/* ------------------------------------------------------------------ */

export function BrowserStartedCard({ part, onOpenBrowser }: { part: ToolInvocationPart; onOpenBrowser?: () => void }) {
  const input = toolInput(part);
  const url = str(input.url) ?? "https://…";
  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    /* keep raw */
  }
  return (
    <CardShell part={part} onClick={onOpenBrowser}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <LeadingIcon part={part} icon={Globe} tint="bg-[#2f6bff]/10 text-[#2f6bff]" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold text-ink">Fetched {host}</span>
          <span className="block truncate font-mono text-[10.5px] text-muted">{url}</span>
        </span>
        {part.state === "output-available" && !isActive(part) && <Check size={13} className="shrink-0 text-moss" />}
        <ArrowUpRight size={12} className="shrink-0 text-muted" />
      </div>
      <ResultLine part={part} />
    </CardShell>
  );
}

/* ------------------------------------------------------------------ */
/*  plan tool card (TodoWrite / TodoRead)                              */
/* ------------------------------------------------------------------ */

function PlanToolCard({ part }: { part: ToolInvocationPart }) {
  const input = toolInput(part);
  const rawTodos = Array.isArray(input.todos) ? input.todos : [];
  const todos = rawTodos.map((t) => asRec(t));
  const active = todos.find((t) => t.status === "in_progress");
  return (
    <CardShell part={part}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <LeadingIcon part={part} icon={ListTodo} tint="bg-moss/12 text-moss" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-ink">
            {part.toolName === "TodoRead" ? "Read task plan" : "Updated task plan"}
          </span>
          <span className="block truncate text-[11px] text-muted">
            {active ? str(active.content) ?? "Working…" : todos.length > 0 ? `${todos.length} steps planned` : "Plan updated"}
          </span>
        </span>
        {todos.length > 0 && (
          <span className="shrink-0 text-[11px] font-medium tabular-nums text-muted">
            {todos.filter((t) => t.status === "completed").length}/{todos.length}
          </span>
        )}
      </div>
    </CardShell>
  );
}

/* ------------------------------------------------------------------ */
/*  skill card                                                         */
/* ------------------------------------------------------------------ */

function SkillCard({ part }: { part: ToolInvocationPart }) {
  const input = toolInput(part);
  const skill = str(input.skill) ?? str(input.name) ?? str(input.command) ?? "skill";
  const scope = str(input.scope) ?? str(input.source);
  const running = isActive(part);
  return (
    <CardShell part={part}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            running ? "bg-clay/15 text-clay" : "bg-black/[0.07] text-ink-soft",
          )}
        >
          {running ? <Loader2 size={12} className="animate-spin" /> : <BookOpenCheck size={12} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold text-ink">Loaded skill · {skill}</span>
          {scope && <span className="block truncate font-mono text-[10.5px] text-muted">{scope}</span>}
        </span>
        {!running && !isError(part) && <Check size={13} className="shrink-0 text-moss" />}
      </div>
    </CardShell>
  );
}

/* ------------------------------------------------------------------ */
/*  MCP card — mcp__server__tool                                       */
/* ------------------------------------------------------------------ */

export function McpCard({ part }: { part: ToolInvocationPart }) {
  const [copied, setCopied] = useState(false);
  const parts = part.toolName.split("__");
  const server = parts[1] ?? "mcp";
  const method = parts.slice(2).join("__") || "call";
  const args = part.input !== undefined ? JSON.stringify(part.input, null, 0) : part.argsText ?? "";
  const running = isActive(part);
  return (
    <CardShell part={part}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            running ? "bg-clay/15 text-clay" : "bg-moss/12 text-moss",
          )}
        >
          {running ? <Loader2 size={12} className="animate-spin" /> : <Plug size={12} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold text-ink">MCP call · {server}</span>
          <span className="block truncate font-mono text-[10.5px] text-muted">{method}</span>
        </span>
        {!running && !isError(part) && <Check size={13} className="shrink-0 text-moss" />}
      </div>
      {args ? (
        <button
          onClick={async (e) => {
            e.stopPropagation();
            try {
              await navigator.clipboard.writeText(args);
            } catch {
              /* noop */
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          className="flex w-full items-start gap-2 border-t border-line-soft bg-cream px-3 py-1.5 text-left transition hover:bg-honey/[0.06]"
        >
          <code className="line-clamp-2 min-w-0 flex-1 break-all font-mono text-[10px] leading-relaxed text-ink-soft">{args}</code>
          <span className="shrink-0 text-faint">{copied ? <CheckIcon size={10} className="text-moss" /> : <Copy size={10} />}</span>
        </button>
      ) : null}
      <ResultLine part={part} />
    </CardShell>
  );
}

/* ------------------------------------------------------------------ */
/*  delegation (Agent tool)                                            */
/* ------------------------------------------------------------------ */

function DelegationCard({ part }: { part: ToolInvocationPart }) {
  const input = toolInput(part);
  const description = str(input.description) ?? str(input.prompt) ?? "Sub-agent task";
  const agentType = str(input.subagent_type) ?? str(input.subagentType) ?? "sub-agent";
  return (
    <CardShell part={part}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <LeadingIcon part={part} icon={Bot} tint="bg-clay/10 text-clay" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-ink">Delegated to {agentType}</span>
          <span className="block truncate text-[11px] text-muted">{description}</span>
        </span>
        {isActive(part) && <Loader2 size={12} className="shrink-0 animate-spin text-clay" />}
        {part.state === "output-available" && !isError(part) && <Check size={13} className="shrink-0 text-moss" />}
      </div>
    </CardShell>
  );
}

/* ------------------------------------------------------------------ */
/*  misc small cards                                                   */
/* ------------------------------------------------------------------ */

function AskUserCard({ part }: { part: ToolInvocationPart }) {
  const input = toolInput(part);
  const questions = Array.isArray(input.questions) ? input.questions : [];
  const q = questions.length > 0 ? str(asRec(questions[0]).question) : str(input.question);
  return (
    <CardShell part={part}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <LeadingIcon part={part} icon={HelpCircle} tint="bg-honey/12 text-honey" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-ink">Asked the user</span>
          <span className="block truncate text-[11px] text-muted">{q ?? "Waiting for an answer above"}</span>
        </span>
      </div>
    </CardShell>
  );
}

function SendMessageCard({ part }: { part: ToolInvocationPart }) {
  const input = toolInput(part);
  const to = str(input.to) ?? str(input.recipient) ?? str(input.agent) ?? "agent";
  return (
    <CardShell part={part}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <LeadingIcon part={part} icon={Send} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-ink">Sent message to {to}</span>
          <span className="block truncate text-[11px] text-muted">{str(input.message) ?? str(input.content) ?? ""}</span>
        </span>
      </div>
    </CardShell>
  );
}

function PlanModeCard({ part }: { part: ToolInvocationPart }) {
  const entering = part.toolName === "EnterPlanMode";
  return (
    <CardShell part={part}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <LeadingIcon part={part} icon={ListChecks} tint="bg-moss/12 text-moss" />
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink">
          {entering ? "Entered plan mode" : "Exited plan mode"}
        </span>
      </div>
    </CardShell>
  );
}

function CronCard({ part }: { part: ToolInvocationPart }) {
  const input = toolInput(part);
  const label = str(input.id) ?? str(input.name) ?? str(input.cron) ?? str(input.schedule) ?? part.toolName;
  return (
    <CardShell part={part}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <LeadingIcon part={part} icon={History} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-ink">{part.toolName}</span>
          <span className="block truncate font-mono text-[11px] text-muted">{label}</span>
        </span>
      </div>
    </CardShell>
  );
}

function TaskCard({ part }: { part: ToolInvocationPart }) {
  const input = toolInput(part);
  const label = str(input.subject) ?? str(input.taskId) ?? str(input.id) ?? str(input.query) ?? "";
  return (
    <CardShell part={part}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <LeadingIcon part={part} icon={ListTodo} tint="bg-moss/12 text-moss" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-ink">{part.toolName}</span>
          {label && <span className="block truncate font-mono text-[11px] text-muted">{label}</span>}
        </span>
      </div>
    </CardShell>
  );
}

/* ------------------------------------------------------------------ */
/*  downloadable artifact surfaced by a tool                           */
/* ------------------------------------------------------------------ */

function artifactFromOutput(part: ToolInvocationPart): ArtifactDTO | null {
  const rec = asRec(part.output);
  const cand = asRec(rec.artifact ?? rec.file ?? null);
  const path = str(cand.path) ?? str(rec.path) ?? str(rec.filePath);
  if (!path) return null;
  const name = str(cand.name) ?? str(rec.name) ?? path.split("/").pop() ?? "artifact";
  const size = typeof (cand.size ?? rec.size) === "number" ? (cand.size ?? rec.size) as number : 0;
  const mime = str(cand.mime) ?? str(rec.mime) ?? guessMime(name);
  return { id: part.id, name, path, type: "file", mime, size, createdAt: new Date().toISOString() };
}

function guessMime(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "svg") return "image/svg+xml";
  if (ext === "pdf") return "application/pdf";
  if (ext === "csv") return "text/csv";
  if (ext === "zip") return "application/zip";
  return "application/octet-stream";
}

export function ArtifactDownloadCard({ part, artifact, projectId }: {
  part: ToolInvocationPart;
  artifact: ArtifactDTO;
  projectId: string;
}) {
  const [preview, setPreview] = useState(false);
  return (
    <>
      <div className={cn("anim-fade-up overflow-hidden rounded-xl border", isActive(part) ? "border-clay/25 bg-clay/[0.04]" : "border-line bg-card")}>
        <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
          <PackageOpen size={10} /> {part.toolName} produced an artifact
        </div>
        <div className="px-2 pb-2">
          <ArtifactFileCard artifact={artifact} projectId={projectId} onPreview={() => setPreview(true)} />
        </div>
      </div>
      <ArtifactPreview open={preview} onClose={() => setPreview(false)} projectId={projectId} artifact={artifact} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  generic row                                                        */
/* ------------------------------------------------------------------ */

export function GenericToolRow({ part, onOpenFile }: { part: ToolInvocationPart; onOpenFile?: (p: string) => void }) {
  const input = toolInput(part);
  const path = str(input.file_path) ?? str(input.path);
  const detail = part.argsText ?? (part.input !== undefined ? JSON.stringify(part.input) : "") ?? "";
  const result = resultText(part);
  return (
    <CardShell part={part} onClick={path ? () => onOpenFile?.(path) : undefined} title={path ? `Open ${path}` : undefined}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <LeadingIcon part={part} icon={Table2} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-ink">{part.toolName}</span>
          {detail && detail !== "{}" && (
            <span className="block truncate font-mono text-[11px] text-muted">{detail.slice(0, 140)}</span>
          )}
        </span>
        {part.state === "output-available" && !isError(part) && <Check size={13} className="shrink-0 text-moss" />}
      </div>
      {result && !isError(part) ? <ResultLine part={part} clamp={3} /> : null}
    </CardShell>
  );
}

/* ------------------------------------------------------------------ */
/*  dispatcher                                                         */
/* ------------------------------------------------------------------ */

export function ToolRow({ part, projectId, onOpenFile, onOpenBrowser }: {
  part: ToolInvocationPart;
  projectId?: string | null;
  onOpenFile: (p: string) => void;
  onOpenBrowser?: () => void;
}) {
  const name = part.toolName;
  if (name === "Skill") return <SkillCard part={part} />;
  if (name === "Agent") return <DelegationCard part={part} />;
  if (name.startsWith("mcp__")) return <McpCard part={part} />;
  if (name === "Bash") return <TerminalCommandCard part={part} />;
  if (name === "WebFetch") return <BrowserStartedCard part={part} onOpenBrowser={onOpenBrowser} />;
  if (name === "WebSearch") return <SearchCard part={part} />;
  if (name === "Read") return <FileCard part={part} kind="read" onOpenFile={onOpenFile} />;
  if (name === "Write") return <FileCard part={part} kind="write" onOpenFile={onOpenFile} />;
  if (name === "NotebookEdit") return <FileCard part={part} kind="edit" onOpenFile={onOpenFile} />;
  if (name === "Edit") return <EditCard part={part} onOpenFile={onOpenFile} />;
  if (name === "ApplyPatch") return <ApplyPatchCard part={part} onOpenFile={onOpenFile} />;
  if (name === "Glob" || name === "Grep") return <SearchCard part={part} />;
  if (name === "TodoWrite" || name === "TodoRead") return <PlanToolCard part={part} />;
  if (name === "AskUserQuestion") return <AskUserCard part={part} />;
  if (name === "SendMessage") return <SendMessageCard part={part} />;
  if (name === "EnterPlanMode" || name === "ExitPlanMode") return <PlanModeCard part={part} />;
  if (name.startsWith("Cron")) return <CronCard part={part} />;
  if (name.startsWith("Task")) return <TaskCard part={part} />;
  if (projectId) {
    const artifact = artifactFromOutput(part);
    if (artifact) return <ArtifactDownloadCard part={part} artifact={artifact} projectId={projectId} />;
  }
  return <GenericToolRow part={part} onOpenFile={onOpenFile} />;
}
