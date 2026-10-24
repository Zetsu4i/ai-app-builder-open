"use client";

// Forge workspace — X11 stream panel. Real data: displays are picked up from
// agent events (kind "status", payload.type === "x11", payload.displays array)
// when the sandbox exposes them; otherwise the panel shows the honest
// "No live streams" empty state. The noise/fps chrome stays as a placeholder
// for when a stream attaches.

import { useEffect, useState } from "react";
import {
  MonitorPlay, Pause, Play, Maximize2, MousePointer2,
  CircleDot, Activity, Frame, Radio,
} from "lucide-react";
import { useForge } from "@/lib/store";
import { getSocket } from "@/lib/socket";
import { cn } from "./forge-utils";

export interface X11Display {
  id: string;
  label: string;
  host: string;
  display: string;
  geometry: string;
  depth: number;
  fps: number;
  status: "live" | "idle" | "connecting" | "offline";
  app: string;
}

/** Deterministic pixel noise so a live stream reads as a feed. */
function StreamNoise({ seed = 0, opacity = 0.06 }: { seed?: number; opacity?: number }) {
  const [cells] = useState(() => Array.from({ length: 120 }, (_, i) => ((i * 37 + seed * 91) % 17) / 17));
  return (
    <div className="pointer-events-none absolute inset-0" style={{ opacity }}>
      <div className="grid h-full w-full grid-cols-12 grid-rows-10">
        {cells.map((v, i) => (
          <span key={i} className="bg-white" style={{ opacity: v * 0.5 }} />
        ))}
      </div>
    </div>
  );
}

function normalizeDisplay(raw: unknown, i: number): X11Display {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: typeof r.id === "string" ? r.id : `d${i}`,
    label: typeof r.label === "string" ? r.label : `Display ${i + 1}`,
    host: typeof r.host === "string" ? r.host : "sandbox",
    display: typeof r.display === "string" ? r.display : `:${i}`,
    geometry: typeof r.geometry === "string" ? r.geometry : "1280×800",
    depth: typeof r.depth === "number" ? r.depth : 24,
    fps: typeof r.fps === "number" ? r.fps : 30,
    status: (r.status === "live" || r.status === "idle" || r.status === "connecting" ? r.status : "offline") as X11Display["status"],
    app: typeof r.app === "string" ? r.app : "x11",
  };
}

export default function X11Stream() {
  const project = useForge((s) => s.activeProject);
  const [displays, setDisplays] = useState<X11Display[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [paused, setPaused] = useState(false);
  const [scale, setScale] = useState<"fit" | "1:1">("fit");
  const [fps, setFps] = useState(30);

  useEffect(() => {
    if (!project) return;
    const s = getSocket();
    const handler = (e: { kind: string; payload: Record<string, unknown> }) => {
      if (e.kind !== "status") return;
      const p = e.payload as { type?: string; displays?: unknown };
      if (p.type !== "x11" || !Array.isArray(p.displays)) return;
      const list = p.displays.map(normalizeDisplay);
      setDisplays(list);
      setActiveId((cur) => (cur && list.some((d) => d.id === cur) ? cur : list[0]?.id ?? ""));
    };
    s.on("agent:event", handler);
    return () => { s.off("agent:event", handler); };
  }, [project]);

  const active = displays.find((d) => d.id === activeId) ?? displays[0] ?? null;
  const offline = !active || active.status === "offline";

  // placeholder live frame counter
  useEffect(() => {
    if (paused || !active || active.status !== "live") return;
    const t = setInterval(() => setFps(28 + Math.round(Math.random() * 5)), 900);
    return () => clearInterval(t);
  }, [paused, active]);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#211d1a]">
      {/* stream toolbar */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-white/10 px-3">
        <span className="flex h-7 shrink-0 items-center gap-1.5 rounded-lg bg-white/[0.07] px-2.5 text-[12px] font-semibold text-white/90">
          <MonitorPlay size={13} /> X11 stream
        </span>

        {displays.length > 0 && (
          <select
            value={activeId}
            onChange={(e) => { setActiveId(e.target.value); setPaused(false); }}
            className="h-7 max-w-[190px] shrink-0 rounded-lg border border-white/15 bg-[#2a2522] px-2 text-[11.5px] text-white/85 outline-none"
            title="Choose a display to stream"
          >
            {displays.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#2a2522]">
                {d.label} — {d.display} {d.status !== "live" ? `(${d.status})` : ""}
              </option>
            ))}
          </select>
        )}

        {active && (
          <span className="hidden items-center gap-1.5 rounded-full bg-white/[0.06] px-2 py-1 font-mono text-[10px] text-white/50 lg:flex">
            {active.status === "live"
              ? <><CircleDot size={9} className="text-[#8fd6a0]" /> {active.fps} fps · {active.geometry} · {active.depth}bit</>
              : <><CircleDot size={9} className="text-[#e8c47a]" /> {active.status} · {active.geometry}</>}
          </span>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <button
            onClick={() => setPaused(!paused)}
            disabled={offline}
            className={cn("flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition",
              paused ? "bg-[#8fd6a0]/20 text-[#8fd6a0]" : "bg-ink text-white hover:bg-stone-800", offline && "opacity-40")}
          >
            {paused ? <><Play size={11} className="fill-current" /> Resume</> : <><Pause size={11} /> Pause</>}
          </button>
          <button
            onClick={() => setScale(scale === "fit" ? "1:1" : "fit")}
            disabled={offline}
            className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white", offline && "opacity-40")}
            title={scale === "fit" ? "Actual pixels" : "Fit to panel"}
          >
            {scale === "fit" ? <Maximize2 size={12} /> : <Frame size={12} />}
          </button>
        </div>
      </div>

      {/* stream viewport */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#161311]">
        {!active ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white/40"><MonitorPlay size={19} /></span>
            <p className="text-[13px] font-semibold text-white/70">No live streams</p>
            <p className="max-w-[280px] text-[11px] leading-relaxed text-white/35">
              When the sandbox exposes an X display — an app window, a GUI test run — it appears here as a live,
              controllable stream.
            </p>
            <span className="mt-1 flex h-7 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-[11px] font-semibold text-white/40">
              <Radio size={11} /> Waiting for a display…
            </span>
          </div>
        ) : offline ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white/40"><MonitorPlay size={19} /></span>
            <p className="text-[13px] font-semibold text-white/70">Display offline</p>
            <p className="max-w-[260px] text-[11px] leading-relaxed text-white/35">
              {active.host} has no active X server on {active.display}. Start a session to attach.
            </p>
          </div>
        ) : (
          <>
            <div className="relative h-full w-full">
              <div className="relative h-full w-full">
                {/* placeholder scene — replaced by real frames once the stream attaches */}
                <div className="flex h-full items-center justify-center bg-[#1a1815]">
                  <div className="text-center">
                    <p className="font-mono text-[11px] text-white/50">{active.label}</p>
                    <p className="mt-1 font-mono text-[10px] text-white/30">{active.host}{active.display} · {active.geometry} · {active.depth}bit</p>
                    <div className="mx-auto mt-3 h-16 w-[220px] overflow-hidden rounded-lg border border-white/10 bg-[#211d1a]">
                      <StreamNoise seed={active.display.length} opacity={0.08} />
                    </div>
                  </div>
                </div>
                {!paused && <StreamNoise seed={active.display.length} opacity={0.045} />}
                {paused && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#161311]/60 backdrop-blur-[1px]">
                    <span className="flex items-center gap-2 rounded-full border border-white/15 bg-[#211d1a]/90 px-3.5 py-1.5 text-[11px] font-semibold text-white/80">
                      <Pause size={11} /> Stream paused
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* control bar */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-[#211d1a]/95 px-1.5 py-1 shadow-xl backdrop-blur">
              <span className="flex h-6 items-center gap-1.5 rounded-full px-2 font-mono text-[9.5px] text-white/50">
                <Activity size={9} className={active.status === "live" ? "text-[#8fd6a0]" : "text-[#e8c47a]"} /> {fps} fps
              </span>
              <span className="h-4 w-px bg-white/10" />
              <span className="flex h-6 items-center gap-1.5 rounded-full px-2 text-[9.5px] font-bold text-clay" title="Take control from the agent">
                <MousePointer2 size={10} /> Take control
              </span>
            </div>
          </>
        )}
      </div>

      {/* stream footer */}
      <div className="flex h-[26px] shrink-0 items-center gap-3 border-t border-white/10 px-3 text-[10px] text-white/35">
        <span className="font-mono">{active ? `${active.host}${active.display}` : "no display"}</span>
        <span className="text-white/20">·</span>
        <span>x11vnc · VNC over websocket</span>
        <span className="ml-auto">{paused ? "paused" : active?.status === "live" ? "streaming" : active?.status ?? "idle"}</span>
      </div>
    </div>
  );
}
