"use client";

// Forge workspace — database panel. Real-data strategy: the workspace has no
// managed database, so the panel detects *.db / *.sqlite / *.sqlite3 files in the
// file tree and runs SQL through the sandbox terminal (sqlite3 CLI). Output lines
// stream back over socket "agent:event" kind "terminal" and are parsed into a
// result grid (best-effort) or shown raw. No db files → polished empty state.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Database, Table2, Play, Loader2, Check, HardDrive, Search, CircleDot, FileWarning, KeyRound,
} from "lucide-react";
import * as api from "@/lib/api";
import { useForge } from "@/lib/store";
import { getSocket } from "@/lib/socket";
import { cn, findFiles } from "./forge-utils";

const STARTER_QUERIES = [
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;",
  "SELECT sql FROM sqlite_master WHERE type='table' LIMIT 10;",
  "SELECT count(*) FROM sqlite_master;",
];

const SCHEMA_QUERY = "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;";
const DB_COLORS = ["#b4532a", "#5b6b4c", "#2f6bff", "#c98a2d", "#7c3aed"];

interface SqlResult {
  cols: string[];
  rows: Record<string, string>[];
  raw: string[];
  ms: number;
}

function shellEscape(s: string) {
  return s.replace(/"/g, '\\"');
}

function parseOutput(chunks: { text: string; at: number }[]): SqlResult {
  const ms = chunks.length ? Date.now() - chunks[0].at : 0;
  const raw = chunks.flatMap((c) => c.text.replace(/\r/g, "").split("\n")).filter((l) => l.length > 0);
  const usable = raw.filter((l) => !/^sqlite>\s*$/.test(l));
  const tableish = usable.length > 1 && usable.filter((l) => l.includes("|")).length >= usable.length - 1;
  if (tableish) {
    const cols = usable[0].split("|").map((c) => c.trim());
    const rows = usable.slice(1).map((l) => {
      const vals = l.split("|").map((v) => v.trim());
      return Object.fromEntries(cols.map((c, i) => [c, vals[i] ?? ""]));
    });
    return { cols, rows, raw: usable, ms };
  }
  return { cols: [], rows: [], raw: usable, ms };
}

export default function DatabasePanel() {
  const project = useForge((s) => s.activeProject);
  const fileTree = useForge((s) => s.fileTree);
  const refreshFileTree = useForge((s) => s.refreshFileTree);
  const toast = useForge((s) => s.toast);

  const dbFiles = useMemo(() => findFiles(fileTree, (n) => /\.(db|sqlite|sqlite3)$/i.test(n)), [fileTree]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [view, setView] = useState<"data" | "schema">("data");
  const [sql, setSql] = useState(STARTER_QUERIES[0]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SqlResult | null>(null);
  const [schemaResult, setSchemaResult] = useState<SqlResult | null>(null);
  const [filter, setFilter] = useState("");

  const bufferRef = useRef<{ text: string; at: number }[]>([]);

  // collect terminal output lines emitted for this project room
  useEffect(() => {
    if (!project) return;
    const s = getSocket();
    const handler = (e: { kind: string; payload: Record<string, unknown> }) => {
      if (e.kind !== "terminal") return;
      const data = (e.payload as { data?: string }).data;
      if (!data) return;
      bufferRef.current.push({ text: data, at: Date.now() });
    };
    s.on("agent:event", handler);
    return () => { s.off("agent:event", handler); };
  }, [project]);

  const selected = activeFile ?? dbFiles[0]?.path ?? null;

  /** Run a command in the sandbox terminal and collect the streamed output. */
  const execute = useCallback(async (projectId: string, command: string): Promise<SqlResult | null> => {
    bufferRef.current = [];
    const startedAt = Date.now();
    try {
      await api.runTerminal(projectId, command);
    } catch (e) {
      toast({ title: "Failed to run query", description: String(e), variant: "error" });
      return null;
    }
    // wait for streamed output: finish after 1s of quiet, hard cap 8s
    await new Promise<void>((resolve) => {
      const tick = window.setInterval(() => {
        const last = bufferRef.current[bufferRef.current.length - 1];
        const quietMs = last ? Date.now() - last.at : Date.now() - startedAt;
        const hasOutput = bufferRef.current.length > 0;
        if ((hasOutput && quietMs > 1000) || quietMs > 8000) {
          window.clearInterval(tick);
          resolve();
        }
      }, 250);
    });
    return parseOutput(bufferRef.current);
  }, [toast]);

  const run = async () => {
    if (!project || !selected || running) return;
    setRunning(true);
    setResult(null);
    const res = await execute(project.id, `sqlite3 -header -separator '|' "${shellEscape(selected)}" "${shellEscape(sql)}"`);
    setResult(res);
    setRunning(false);
  };

  const runSchema = async () => {
    if (!project || !selected || running) return;
    setRunning(true);
    const res = await execute(project.id, `sqlite3 -header -separator '|' "${shellEscape(selected)}" "${shellEscape(SCHEMA_QUERY)}"`);
    setSchemaResult(res);
    setRunning(false);
  };

  useEffect(() => {
    if (view === "schema" && !schemaResult) {
      const t = window.setTimeout(() => void runSchema(), 0);
      return () => window.clearTimeout(t);
    }
  }, [view, selected]);

  const rows = useMemo(() => {
    if (!result) return [];
    if (!filter.trim()) return result.rows;
    const q = filter.toLowerCase();
    return result.rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }, [result, filter]);

  if (!project) return <div className="h-full min-w-0 flex-1 bg-cream" />;

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-cream">
      {/* connection bar */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line px-3">
        <span className="flex h-7 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-[12px] font-semibold">
          <Database size={13} className="text-[#2f6bff]" /> workspace sqlite
        </span>
        {selected && (
          <span className="hidden items-center gap-1.5 rounded-full border border-line bg-card px-2 py-1 font-mono text-[10.5px] text-muted lg:flex">
            <CircleDot size={10} className={cn(dbFiles.length > 0 ? "text-moss" : "text-honey")} /> {selected.split("/").pop()}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => void refreshFileTree()} className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink" title="Re-detect database files">
            <Search size={13} />
          </button>
        </div>
      </div>

      {dbFiles.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="max-w-sm rounded-2xl border border-line bg-card p-6 text-center shadow-sm">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-cream text-muted">
              <HardDrive size={19} />
            </span>
            <h3 className="mt-4 text-[14px] font-semibold">No database detected in workspace</h3>
            <p className="mx-auto mt-1.5 max-w-[300px] text-[11px] leading-relaxed text-muted">
              When your project contains <span className="font-mono text-ink-soft">*.db</span>,{" "}
              <span className="font-mono text-ink-soft">*.sqlite</span> or{" "}
              <span className="font-mono text-ink-soft">*.sqlite3</span> files they appear here — browse them and run
              SQL through the sandbox terminal. Ask the agent to seed one for you.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1">
          {/* db files sidebar */}
          <div className="flex w-[196px] shrink-0 flex-col border-r border-line bg-paper/60">
            <div className="px-3 pb-1.5 pt-2.5 text-[10.5px] font-bold uppercase tracking-wider text-muted">Databases · {dbFiles.length}</div>
            <div className="flex-1 overflow-y-auto px-1.5">
              {dbFiles.map((f, i) => (
                <button
                  key={f.path}
                  onClick={() => { setActiveFile(f.path); setResult(null); setSchemaResult(null); setFilter(""); }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-[6px] text-left text-[12.5px] transition",
                    selected === f.path ? "bg-ink/[0.07] font-semibold text-ink" : "text-ink-soft hover:bg-black/[0.05] hover:text-ink",
                  )}
                >
                  <Table2 size={14} style={{ color: DB_COLORS[i % DB_COLORS.length] }} strokeWidth={1.8} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono">{f.name}</span>
                    <span className="block truncate font-mono text-[9.5px] text-faint">{f.path}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="border-t border-line-soft p-2.5">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Engine</p>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
                Queries run via <span className="font-mono text-ink-soft">sqlite3</span> inside the project sandbox.
              </p>
            </div>
          </div>

          {/* main */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-9 shrink-0 items-center gap-2 border-b border-line-soft px-3">
              <div className="flex items-center gap-0.5 rounded-lg border border-line bg-card p-0.5">
                {(["data", "schema"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={cn(
                      "h-7 rounded-md px-3 text-[12px] font-semibold capitalize transition",
                      view === v ? "bg-ink text-white" : "text-ink-soft hover:bg-black/5 hover:text-ink",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <span className="truncate font-mono text-[11.5px] text-muted">{selected}</span>
              {view === "data" && result && result.cols.length > 0 && (
                <div className="ml-auto flex w-[160px] items-center gap-1.5 rounded-lg border border-line bg-card px-2 py-1">
                  <Search size={12} className="text-muted" />
                  <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter rows…" className="w-full bg-transparent text-[11.5px] outline-none placeholder:text-faint" />
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              {view === "schema" ? (
                running && !schemaResult ? (
                  <div className="flex h-full items-center justify-center gap-2 text-[12px] text-muted">
                    <Loader2 size={13} className="animate-spin" /> Introspecting schema…
                  </div>
                ) : (
                  <div className="space-y-3 p-3">
                    {(schemaResult?.rows ?? []).map((r, i) => (
                      <div key={i} className="overflow-hidden rounded-xl border border-line bg-card">
                        <div className="flex items-center gap-2 border-b border-line-soft bg-gutter px-3.5 py-2.5">
                          <Table2 size={14} style={{ color: DB_COLORS[i % DB_COLORS.length] }} />
                          <span className="font-mono text-[12.5px] font-bold">{r.name}</span>
                          <span className="ml-auto text-[11px] text-muted">table</span>
                        </div>
                        <pre className="code-editor overflow-auto px-3.5 py-2.5 text-ink-soft">{r.sql || "--"}</pre>
                      </div>
                    ))}
                    {schemaResult && schemaResult.rows.length === 0 && (
                      <div className="flex flex-col items-center gap-1.5 py-10 text-center">
                        <KeyRound size={18} className="text-faint" />
                        <p className="text-[12.5px] font-medium text-ink-soft">No tables found</p>
                        <p className="text-[11px] text-muted">This database file is empty.</p>
                      </div>
                    )}
                    {schemaResult && schemaResult.raw.length > 0 && schemaResult.rows.length === 0 && (
                      <div className="overflow-hidden rounded-xl border border-line bg-card">
                        <pre className="code-editor overflow-auto px-3.5 py-2.5 text-ink-soft">{schemaResult.raw.join("\n")}</pre>
                      </div>
                    )}
                  </div>
                )
              ) : !result ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                  <Table2 size={20} className="text-faint" />
                  <p className="text-[12.5px] font-medium text-ink-soft">Run a query to see rows</p>
                  <p className="text-[11px] text-muted">Try the starters below — e.g. list tables first.</p>
                </div>
              ) : result.cols.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gutter">
                      <th className="w-10 border-b border-r border-line-soft px-2 py-2 text-right font-mono text-[10px] font-medium text-faint">#</th>
                      {result.cols.map((c) => (
                        <th key={c} className="border-b border-r border-line-soft px-3 py-2 text-left font-mono text-[11px] font-semibold text-ink">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="transition hover:bg-honey/[0.07]">
                        <td className="border-b border-r border-line-soft bg-gutter/60 px-2 py-[7px] text-right font-mono text-[10.5px] text-faint">{i + 1}</td>
                        {result.cols.map((c) => (
                          <td key={c} className="max-w-[260px] truncate border-b border-r border-line-soft px-3 py-[7px] font-mono text-[11.5px] text-ink-soft">
                            {r[c] === "NULL" || r[c] === "" ? <span className="italic text-faint">null</span> : r[c]}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr><td colSpan={result.cols.length + 1} className="px-3 py-4 text-center text-[11.5px] text-muted">No rows match “{filter}”.</td></tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="p-3">
                  <div className="overflow-hidden rounded-xl border border-line bg-card">
                    <p className="border-b border-line-soft bg-gutter px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-wider text-muted">Raw output</p>
                    <div className="code-editor max-h-[320px] overflow-auto px-3 py-2">
                      {result.raw.map((l, i) => (
                        <div key={i} className="whitespace-pre-wrap text-ink-soft">{l}</div>
                      ))}
                      {result.raw.length === 0 && <p className="text-[11.5px] text-faint">(no output)</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* query editor */}
            {view === "data" && (
              <div className="shrink-0 border-t border-line bg-card">
                <div className="flex items-center gap-2 px-3 pb-1.5 pt-2">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted">SQL query</span>
                  <div className="ml-auto flex gap-1 overflow-x-auto">
                    {STARTER_QUERIES.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setSql(q)}
                        className="shrink-0 rounded-md border border-line bg-cream px-2 py-1 font-mono text-[10px] text-muted transition hover:border-ink/25 hover:text-ink"
                      >
                        {q.split("\n")[0].slice(0, 34)}…
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={sql}
                  onChange={(e) => setSql(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void run(); } }}
                  spellCheck={false}
                  rows={3}
                  className="code-editor w-full resize-none bg-transparent px-3 pb-2 outline-none"
                />
                <div className="flex items-center gap-2 border-t border-line-soft px-3 py-1.5">
                  <button
                    onClick={() => void run()}
                    disabled={running}
                    className={cn(
                      "flex h-7 items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold transition",
                      running ? "bg-black/[0.06] text-faint" : "bg-ink text-white hover:bg-stone-800",
                    )}
                  >
                    {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Run
                    <kbd className="ml-1 text-[9.5px] opacity-60">⌘↵</kbd>
                  </button>
                  <span className="hidden font-mono text-[10.5px] text-muted sm:block">sqlite3 · {selected?.split("/").pop()}</span>
                  {result && !running && (
                    <span className="ml-auto flex items-center gap-1.5 text-[10.5px] font-medium text-moss">
                      <Check size={11} /> {result.cols.length > 0 ? `${result.rows.length} rows` : `${result.raw.length} lines`} · {result.ms} ms
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* footer note */}
      <div className="flex h-[26px] shrink-0 items-center gap-2 border-t border-line-soft bg-cream px-3 text-[10.5px] text-muted">
        <FileWarning size={10} className="text-honey" />
        Schema view reads CREATE statements from sqlite_master. Output is parsed best-effort from the terminal stream.
      </div>
    </div>
  );
}
