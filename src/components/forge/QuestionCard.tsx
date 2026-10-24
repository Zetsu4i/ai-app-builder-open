"use client";

// ZCode Builder — agent question card. Renders QuestionPart, submits real
// answers via api.respondQuestion and marks the part answered in the store.

import { useState } from "react";
import {
  HelpCircle, Check, Loader2, CornerDownRight, SkipForward, Pencil, X, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as api from "@/lib/api";
import { useForge } from "@/lib/store";
import type { QuestionPart } from "@/lib/types";

export function QuestionCard({ part, projectId }: { part: QuestionPart; projectId: string }) {
  const answered = part.answered;
  const open = !answered;
  const [picked, setPicked] = useState<Record<string, string[]>>({});
  const [multi, setMulti] = useState<Record<string, boolean>>({});
  const [customMode, setCustomMode] = useState<Record<string, boolean>>({});
  const [customText, setCustomText] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const respond = async (action: "accept" | "decline", content?: Record<string, string>) => {
    setBusy(true);
    try {
      await api.respondQuestion({ projectId, requestId: part.requestId, action, content });
      const { messages, toast } = useForge.getState();
      const updated = messages.map((m) => ({
        ...m,
        parts: m.parts.map((p) =>
          p.type === "question" && p.requestId === part.requestId
            ? { ...p, answered: { action, content: content ?? {} } }
            : p,
        ),
      }));
      useForge.setState({ messages: updated });
      if (action === "decline") toast({ title: "Skipped", description: "The agent will use its best judgement." });
    } catch (e) {
      useForge.getState().toast({ title: "Failed to send answer", description: String(e), variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const togglePick = (qid: string, value: string) => {
    if (!open) return;
    setPicked((prev) => {
      const cur = prev[qid] ?? [];
      if (multi[qid]) return { ...prev, [qid]: cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value] };
      return { ...prev, [qid]: [value] };
    });
  };

  const submitPicked = (qid: string) => {
    const vals = picked[qid] ?? [];
    if (vals.length === 0 || !open) return;
    void respond("accept", { [qid]: multi[qid] ? vals.join(", ") : vals[0] });
  };

  const submitCustom = (qid: string) => {
    const t = (customText[qid] ?? "").trim();
    if (!t || !open) return;
    void respond("accept", { [qid]: t });
  };

  const answeredValues = answered?.content
    ? Object.values(answered.content).filter((v) => v && v.length > 0)
    : [];

  return (
    <div
      className={cn(
        "anim-fade-up mt-2.5 overflow-hidden rounded-xl border bg-card",
        answered ? "border-moss/35" : "border-clay/30 bg-clay/[0.03]",
      )}
    >
      {/* header */}
      <div className="flex items-center gap-2 border-b border-line-soft px-3 py-2">
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            answered ? "bg-moss/15 text-moss" : "bg-clay/15 text-clay",
          )}
        >
          {answered ? <Check size={12} strokeWidth={3} /> : <HelpCircle size={13} />}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
          {answered ? "You answered" : "Forge needs your input"}
        </span>
        {busy && <Loader2 size={12} className="animate-spin text-clay" />}
        {answered && (
          <span className="ml-auto rounded-full bg-moss/15 px-2 py-0.5 text-[10px] font-bold text-moss">
            {answered.action === "decline" ? "skipped" : `${answeredValues.length} answer${answeredValues.length === 1 ? "" : "s"}`}
          </span>
        )}
      </div>

      {/* questions */}
      {part.questions.map((q, qi) => {
        const qOpen = open && !answered;
        const isMulti = !!multi[q.id];
        const cur = picked[q.id] ?? [];
        const inCustom = !!customMode[q.id];
        return (
          <div key={q.id} className={cn("px-3 py-2.5", qi > 0 && "border-t border-line-soft")}>
            <p className="text-[13px] font-semibold leading-snug text-ink">{q.question}</p>

            {/* answered state */}
            {answered && answered.content?.[q.id] ? (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {answered.action === "decline" ? (
                  <span className="rounded-lg border border-line bg-cream px-2.5 py-1.5 text-[12px] text-muted">skipped</span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-lg border border-moss/35 bg-moss/[0.07] px-2.5 py-1.5 text-[12px] font-medium text-ink">
                    <Check size={11} className="text-moss" strokeWidth={3} /> {answered.content[q.id]}
                  </span>
                )}
              </div>
            ) : null}

            {/* options */}
            {qOpen && !inCustom && (q.options?.length ?? 0) > 0 && (
              <div className="mt-2 space-y-1.5">
                {q.options!.map((o) => {
                  const on = cur.includes(o.value);
                  return (
                    <button
                      key={o.value}
                      onClick={() => togglePick(q.id, o.value)}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left transition",
                        on ? "border-ink bg-ink/[0.05]" : "border-line bg-cream/60 hover:border-ink/25 hover:bg-card",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center border transition",
                          isMulti ? "rounded-[4px]" : "rounded-full",
                          on ? "border-ink bg-ink text-white" : "border-line bg-card",
                        )}
                      >
                        {on && <Check size={10} strokeWidth={3.5} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block text-[12.5px] font-medium", on ? "text-ink" : "text-ink-soft")}>{o.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* actions */}
            {qOpen && !inCustom && (
              <div className="mt-2.5 flex items-center gap-1.5">
                <button
                  onClick={() => submitPicked(q.id)}
                  disabled={cur.length === 0 || busy}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-lg px-3 text-[11.5px] font-semibold transition",
                    cur.length ? "bg-ink text-white hover:bg-stone-800" : "bg-black/[0.06] text-faint",
                  )}
                >
                  <Check size={11} strokeWidth={3} /> Confirm{isMulti && cur.length > 1 ? ` ${cur.length}` : ""}
                </button>

                {(q.options?.length ?? 0) > 1 && (
                  <button
                    onClick={() => setMulti((m) => ({ ...m, [q.id]: !m[q.id] }))}
                    title="Toggle multi-select"
                    className={cn(
                      "flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[11.5px] font-semibold transition",
                      isMulti ? "border-ink bg-ink/[0.05] text-ink" : "border-line bg-card text-ink-soft hover:border-ink/25 hover:text-ink",
                    )}
                  >
                    <Check size={10} /> Multi
                  </button>
                )}

                <button
                  onClick={() => setCustomMode((c) => ({ ...c, [q.id]: true }))}
                  className="flex h-7 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-[11.5px] font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink"
                >
                  <Pencil size={10} /> Write my own
                </button>

                <button
                  onClick={() => void respond("decline")}
                  disabled={busy}
                  className="ml-auto flex h-7 items-center gap-1 rounded-lg px-2 text-[11.5px] font-medium text-muted transition hover:text-ink"
                >
                  <SkipForward size={10} /> Skip
                </button>
              </div>
            )}

            {/* custom input */}
            {qOpen && inCustom && (
              <div className="anim-fade-in mt-2 space-y-1.5">
                <div className="flex items-start gap-2 rounded-lg border border-line bg-cream px-2.5 py-2 focus-within:border-ink/30">
                  <CornerDownRight size={13} className="mt-[3px] shrink-0 text-muted" />
                  <textarea
                    autoFocus
                    value={customText[q.id] ?? ""}
                    onChange={(e) => setCustomText((c) => ({ ...c, [q.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submitCustom(q.id);
                      }
                      if (e.key === "Escape") {
                        setCustomMode((c) => ({ ...c, [q.id]: false }));
                        setCustomText((c) => ({ ...c, [q.id]: "" }));
                      }
                    }}
                    rows={2}
                    placeholder="Describe exactly what you want…"
                    className="w-full resize-none bg-transparent text-[12.5px] leading-relaxed outline-none placeholder:text-faint"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => submitCustom(q.id)}
                    disabled={!(customText[q.id] ?? "").trim() || busy}
                    className={cn(
                      "flex h-7 items-center gap-1.5 rounded-lg px-3 text-[11.5px] font-semibold transition",
                      (customText[q.id] ?? "").trim() ? "bg-ink text-white hover:bg-stone-800" : "bg-black/[0.06] text-faint",
                    )}
                  >
                    <Sparkles size={11} /> Send answer
                  </button>
                  {(q.options?.length ?? 0) > 0 && (
                    <button
                      onClick={() => setCustomMode((c) => ({ ...c, [q.id]: false }))}
                      className="flex h-7 items-center gap-1 rounded-lg border border-line bg-card px-2.5 text-[11.5px] font-semibold text-ink-soft transition hover:text-ink"
                    >
                      <X size={10} /> Back to options
                    </button>
                  )}
                  <kbd className="ml-auto rounded border border-line bg-cream px-1.5 py-0.5 text-[9.5px] font-bold text-muted">↵ send</kbd>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* skipped */}
      {answered?.action === "decline" && (
        <div className="flex items-center gap-1.5 border-t border-line-soft px-3 py-2 text-[11.5px] text-muted">
          <SkipForward size={10} /> Skipped — Forge used its best judgement.
        </div>
      )}
    </div>
  );
}

/** Inline indicator shown while the agent waits on an unanswered question. */
export function WaitingBadge({ label = "waiting for your answer" }: { label?: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-clay">
      <Loader2 size={11} className="animate-spin" /> {label}
    </span>
  );
}
