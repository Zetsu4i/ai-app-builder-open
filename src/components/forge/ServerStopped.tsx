"use client";

// Forge workspace — "dev server stopped" gate, shown in place of the preview.

import { Server, Play, Loader2, TriangleAlert } from "lucide-react";
import { cn } from "./forge-utils";

/** Shown in place of the preview while the dev server is stopped. */
export default function ServerStopped({ port, starting, error, runtime, onStart }: {
  port?: number;
  starting: boolean;
  error?: string;
  runtime?: "local" | "e2b";
  onStart: () => void;
}) {
  return (
    <div className="flex h-full min-h-[420px] items-center justify-center bg-code-bg">
      <div className="max-w-sm text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-card text-muted shadow-sm">
          <Server size={19} />
        </span>
        <h3 className="mt-4 text-[14px] font-semibold">Development server is stopped</h3>
        <p className="mx-auto mt-1.5 max-w-[280px] text-[11px] leading-relaxed text-muted">
          Resume the project preview when you are ready. Forge will run the configured server
          {port ? <> on port <strong className="font-semibold text-ink">{port}</strong></> : null}
          {runtime === "e2b" ? " inside the cloud sandbox" : null}.
        </p>
        {error && (
          <p className="mx-auto mt-2 flex max-w-[300px] items-start gap-1.5 rounded-lg border border-clay/25 bg-clay/[0.06] px-2.5 py-1.5 text-left text-[10.5px] leading-relaxed text-clay">
            <TriangleAlert size={11} className="mt-[2px] shrink-0" /> {error}
          </p>
        )}
        <button
          onClick={onStart}
          disabled={starting}
          className={cn(
            "mx-auto mt-4 flex h-8 items-center gap-1.5 rounded-lg px-3 text-[10.5px] font-semibold transition",
            starting ? "bg-black/[0.07] text-faint" : "bg-ink text-white hover:bg-stone-800",
          )}
        >
          {starting
            ? <><Loader2 size={11} className="animate-spin" /> Starting…</>
            : <><Play size={11} className="fill-current" /> Start dev server</>}
        </button>
        <p className="mt-2 font-mono text-[8.5px] text-faint">
          {runtime === "e2b" ? "cloud sandbox" : "local runtime"}{port ? ` · localhost:${port}` : ""}
        </p>
      </div>
    </div>
  );
}
