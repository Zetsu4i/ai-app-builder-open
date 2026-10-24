"use client";

// Forge workspace — live preview pane. Ported from the source PreviewPane with
// real wiring: the iframe loads the project through the same-origin BFF preview
// proxy (`/api/bff/projects/:id/preview/`) or the e2b cloudUrl for cloud sandboxes.
// Element picking is message-based: we post {type:"forge:enable-pick"} into the
// iframe (the preview proxy injects the bridge when ?forge_pick=1) and listen for
// {type:"forge:picked", selector, tag, text, styles} messages back.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Monitor, Tablet, Smartphone, RotateCw, ExternalLink, Lock, Copy, Check,
  ArrowLeft, ArrowRight, Loader2, QrCode, Radio, Wifi, MousePointer2,
  TriangleAlert, PanelRightClose, ChevronRight,
} from "lucide-react";
import { useForge } from "@/lib/store";
import { previewBase } from "@/lib/api";
import type { PickedElement } from "@/lib/types";
import { cn } from "./forge-utils";
import { PickedElementSheet, PickedChips, FORGE_PICK_FLAG, type ForgePickInbound } from "./ElementPicker";

type DeviceMode = "desktop" | "tablet" | "mobile";

const WIDTHS: Record<DeviceMode, string> = {
  desktop: "max-w-full",
  tablet: "max-w-[768px]",
  mobile: "max-w-[390px]",
};

function describeStatus(status: string): { label: string; cls: string } {
  if (status === "ready") return { label: "Live", cls: "text-moss" };
  if (status === "starting" || status === "installing") return { label: "Building…", cls: "text-honey" };
  if (status === "error") return { label: "Error", cls: "text-clay" };
  return { label: "Offline", cls: "text-muted" };
}

/** Decorative QR box (same fallback approach as the source QrBox). */
function QrBox({ value, size = 150 }: { value: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodeURIComponent(value)}&color=1c1917&bgcolor=faf8f4&qzone=1&margin=0`;
  return (
    <div className="relative shrink-0 overflow-hidden rounded-xl border border-line bg-cream p-1.5" style={{ width: size + 12, height: size + 12 }}>
      {!failed ? (
        <img src={src} alt="QR code" width={size} height={size} onError={() => setFailed(true)} className="h-full w-full rounded-lg" />
      ) : (
        <div className="grid h-full w-full grid-cols-7 grid-rows-7 gap-[2px] rounded-lg bg-cream p-0.5">
          {Array.from({ length: 49 }).map((_, i) => (
            <span key={i} className={cn("rounded-[1px]", (i * 7 + (i % 5)) % 3 === 0 ? "bg-ink" : "bg-transparent")} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PreviewPane() {
  const project = useForge((s) => s.activeProject);
  const devServer = useForge((s) => s.devServer);
  const sandbox = useForge((s) => s.sandbox);
  const previewKey = useForge((s) => s.previewKey);
  const picks = useForge((s) => s.picks);
  const addPick = useForge((s) => s.addPick);
  const removePick = useForge((s) => s.removePick);

  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [localKey, setLocalKey] = useState(0);
  const [path, setPath] = useState("");
  const [copied, setCopied] = useState(false);
  const [picking, setPicking] = useState(false);
  const [pending, setPending] = useState<PickedElement | null>(null);
  const [qrOpen, setQrOpen] = useState(true);

  const frameRef = useRef<HTMLIFrameElement>(null);
  const pickingRef = useRef(picking);

  const projectId = project?.id ?? "";
  const isExpo = project?.mode === "mobile";
  const useCloud = sandbox.runtime === "e2b" && !!devServer.cloudUrl;
  const base = projectId ? previewBase(projectId) : "";
  const src = useCloud && devServer.cloudUrl ? devServer.cloudUrl : base;
  const srcWithPick = src + (picking && !useCloud ? (src.includes("?") ? "&" : "?") + FORGE_PICK_FLAG : "");
  const frameKey = `${previewKey}-${localKey}`;
  const status = describeStatus(devServer.status);
  const building = devServer.status === "starting" || devServer.status === "installing";
  const port = devServer.port ?? 3000;
  const isStopped = devServer.status === "stopped";

  /** Push the pick-mode handshake into the iframe once it has loaded. */
  const handshake = useCallback(() => {
    const win = frameRef.current?.contentWindow;
    if (!win) return;
    try {
      win.postMessage(pickingRef.current ? { type: "forge:enable-pick" } : { type: "forge:disable-pick" }, "*");
    } catch {
      /* cross-origin (e2b cloud url) — bridge flag covers it */
    }
  }, []);

  // listen for picked elements coming back from the iframe bridge
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data as Partial<ForgePickInbound> | undefined;
      if (!data || data.type !== "forge:picked") return;
      const el: PickedElement = {
        id: `pick-${Date.now()}`,
        selector: typeof data.selector === "string" ? data.selector : "body",
        tag: typeof data.tag === "string" ? data.tag : "div",
        text: typeof data.text === "string" ? data.text : undefined,
        styles: data.styles && typeof data.styles === "object" ? (data.styles as Record<string, string>) : undefined,
      };
      setPending(el);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // entering pick mode: sync ref + reload iframe with the bridge flag, then handshake
  useEffect(() => {
    pickingRef.current = picking;
    if (picking) handshake();
  }, [picking, handshake]);

  const togglePick = () => {
    if (picking) {
      setPicking(false);
      setPending(null);
      try {
        frameRef.current?.contentWindow?.postMessage({ type: "forge:disable-pick" }, "*");
      } catch { /* noop */ }
    } else {
      setPending(null);
      setPicking(true);
    }
  };

  const attach = (instructions?: string) => {
    if (!pending) return;
    addPick({ ...pending, instructions: instructions?.trim() || undefined });
    setPending(null);
    setPicking(false);
    try {
      frameRef.current?.contentWindow?.postMessage({ type: "forge:disable-pick" }, "*");
    } catch { /* noop */ }
  };

  const reload = () => setLocalKey((k) => k + 1);

  /** If the frame landed on the "warming up" placeholder, remount until real content shows. */
  const warmupRetries = useRef(0);
  const warmupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleWarmupRetry = () => {
    if (warmupRetries.current >= 8) return;
    warmupRetries.current += 1;
    if (warmupTimer.current) clearTimeout(warmupTimer.current);
    warmupTimer.current = setTimeout(() => setLocalKey((k) => k + 1), 2500 * warmupRetries.current);
  };

  const onFrameLoad = () => {
    handshake();
    if (useCloud) {
      scheduleWarmupRetry();
      return;
    }
    try {
      const doc = frameRef.current?.contentDocument;
      // stale "warming up" / error placeholder → remount the frame shortly
      if (doc?.body?.textContent?.includes("Preview warming up")) {
        scheduleWarmupRetry();
        return;
      }
      warmupRetries.current = 0;
      const loc = frameRef.current?.contentWindow?.location;
      if (loc && loc.pathname.startsWith("/api/bff/")) {
        const rest = loc.pathname.slice(base.length - 1); // keep leading slash
        setPath(rest + loc.search);
      } else if (loc && loc.pathname.startsWith(`/preview/${projectId}`)) {
        const rest = loc.pathname.slice((`/preview/${projectId}`).length) || "/";
        setPath(rest + loc.search);
      }
    } catch {
      /* cross-origin — leave path as-is */
    }
  };

  const copyLink = async () => {
    const url = useCloud && devServer.cloudUrl ? devServer.cloudUrl : `${window.location.origin}${src}`;
    try { await navigator.clipboard.writeText(url); } catch { /* noop */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const openExternal = () => {
    const url = useCloud && devServer.cloudUrl ? devServer.cloudUrl : src;
    window.open(url, "_blank", "noopener");
  };

  const hostLabel = useCloud && devServer.cloudUrl
    ? devServer.cloudUrl.replace(/^https?:\/\//, "")
    : `localhost:${port}${path}`;

  if (!project) {
    return <div className="h-full min-w-0 flex-1 bg-paper" />;
  }

  const back = () => { try { frameRef.current?.contentWindow?.history.back(); } catch { /* noop */ } };
  const fwd = () => { try { frameRef.current?.contentWindow?.history.forward(); } catch { /* noop */ } };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-paper-deep/40">
      {/* browser chrome */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line bg-cream px-3">
        <div className="flex items-center gap-0.5">
          <button onClick={back} className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink" title="Back">
            <ArrowLeft size={14} />
          </button>
          <button onClick={fwd} className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink" title="Forward">
            <ArrowRight size={14} />
          </button>
          <button onClick={reload} className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink" title="Reload preview">
            <RotateCw size={13} className={cn(building && "animate-spin")} />
          </button>
        </div>

        {/* address bar */}
        <div className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-line bg-card px-2">
          <Lock size={11} className="shrink-0 text-moss" />
          <span className="shrink-0 rounded-md border border-line bg-cream px-1.5 py-[3px] font-mono text-[11px] font-semibold text-ink" title={`Dev server port :${port}`}>
            :{port}
          </span>
          <span className="shrink-0 font-mono text-[11.5px] text-muted">{useCloud ? "https://" : "http://"}</span>
          <span className="w-full min-w-0 shrink truncate bg-transparent font-mono text-[11.5px] text-ink" title={src}>{hostLabel}</span>
          {building ? (
            <span className="flex shrink-0 items-center gap-1 text-[10.5px] font-semibold text-honey"><Loader2 size={11} className="animate-spin" /> Building…</span>
          ) : devServer.status === "error" ? (
            <span className="flex shrink-0 items-center gap-1 text-[10.5px] font-semibold text-clay"><TriangleAlert size={11} /> Error</span>
          ) : (
            <span className="flex shrink-0 items-center gap-1 text-[10.5px] font-semibold text-moss"><span className="h-1.5 w-1.5 rounded-full bg-moss" /> {status.label}</span>
          )}
        </div>

        {/* select */}
        <button
          onClick={togglePick}
          disabled={isExpo || isStopped}
          title="Select an element from the preview (Esc to cancel)"
          className={cn(
            "flex h-7 shrink-0 items-center gap-1.5 rounded-md border px-2 text-[10.5px] font-semibold transition",
            picking ? "border-clay bg-clay/10 text-clay" : "border-line bg-card text-ink-soft hover:border-ink/20",
            (isExpo || isStopped) && "opacity-40",
          )}
        >
          <MousePointer2 size={12} /> <span className="hidden lg:inline">{picking ? "Cancel" : "Select"}</span>
        </button>

        {/* device */}
        <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-line bg-card p-0.5">
          {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as [DeviceMode, typeof Monitor][]).map(([d, Icon]) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              title={`${d[0].toUpperCase() + d.slice(1)} view`}
              className={cn(
                "flex h-7 w-8 items-center justify-center rounded-md transition",
                device === d ? "bg-ink text-white" : "text-muted hover:bg-black/5 hover:text-ink",
              )}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>

        <button onClick={copyLink} className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink sm:flex" title="Copy link">
          {copied ? <Check size={13} className="text-moss" /> : <Copy size={13} />}
        </button>
        <button onClick={openExternal} className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink sm:flex" title="Open in new tab">
          <ExternalLink size={13} />
        </button>
      </div>

      {/* body */}
      {isExpo ? (
        <div className="flex min-h-0 flex-1">
          {qrOpen ? (
            <div className="flex w-[276px] shrink-0 flex-col border-r border-line bg-cream">
              <div className="flex items-center gap-2 border-b border-line-soft px-3 py-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-white"><QrCode size={13} /></span>
                <span className="text-[12.5px] font-bold">Scan to open on device</span>
                <button onClick={() => setQrOpen(false)} title="Collapse QR panel" className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink">
                  <PanelRightClose size={13} />
                </button>
              </div>
              <div className="flex flex-col items-center px-4 py-4">
                <QrBox value={`${window.location.origin}${src}`} size={158} />
                <p className="mt-3 text-center text-[11.5px] leading-relaxed text-muted">Open <strong className="font-semibold text-ink">Expo Go</strong> and scan.</p>
                <div className="mt-3 w-full rounded-lg border border-line bg-card px-2.5 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Preview URL</p>
                  <p className="mt-0.5 break-all font-mono text-[10.5px] text-ink">{hostLabel}</p>
                </div>
              </div>
              <div className="mt-auto space-y-1.5 border-t border-line-soft px-3 py-2.5">
                {[{ i: Wifi, l: "Metro bundler", v: devServer.status === "ready" ? "connected" : devServer.status }, { i: Radio, l: "Device", v: "scan to pair" }, { i: Smartphone, l: "Runtime", v: sandbox.runtime === "e2b" ? "cloud" : "local" }].map((r) => (
                  <div key={r.l} className="flex items-center gap-2">
                    <r.i size={11} className="shrink-0 text-muted" />
                    <span className="text-[11px] text-muted">{r.l}</span>
                    <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-ink-soft">
                      <span className={cn("h-1.5 w-1.5 rounded-full", devServer.status === "ready" ? "bg-moss" : "bg-honey")} /> {r.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <button onClick={() => setQrOpen(true)} title="Expand QR panel" className="flex w-[42px] shrink-0 flex-col items-center gap-2 border-r border-line bg-cream pt-3 text-muted transition hover:text-ink">
              <QrCode size={15} />
              <span className="text-[10px] font-bold [writing-mode:vertical-lr]">QR</span>
              <ChevronRight size={13} className="mb-2 mt-auto" />
            </button>
          )}

          <div className="relative min-h-0 flex-1 overflow-auto">
            <div className="flex h-full items-start justify-center p-5">
              <div className="w-[300px] overflow-hidden rounded-[36px] border-[9px] border-[#292524] bg-[#292524] shadow-[0_24px_60px_-18px_rgba(28,25,23,0.5)]">
                <div className="flex h-6 items-center justify-center"><span className="h-1.5 w-16 rounded-full bg-black/60" /></div>
                <iframe
                  key={`m${frameKey}`}
                  ref={frameRef}
                  title="Mobile preview"
                  src={src}
                  onLoad={onFrameLoad}
                  className="h-[540px] w-full border-0 bg-[#faf7f0]"
                />
                <div className="flex h-5 items-center justify-center"><span className="h-1 w-24 rounded-full bg-black/50" /></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative min-h-0 flex-1 overflow-auto p-4">
            <div className={cn("preview-frame relative mx-auto h-full min-h-[420px] w-full overflow-hidden rounded-xl border border-line shadow-[0_20px_60px_-24px_rgba(28,25,23,0.35)]", WIDTHS[device])}>
              <iframe
                key={frameKey}
                ref={frameRef}
                title="Live preview"
                src={srcWithPick}
                onLoad={onFrameLoad}
                className="h-full min-h-[420px] w-full border-0 bg-white"
              />
            </div>

            {/* picking banner */}
            {picking && (
              <div className="pointer-events-none absolute left-1/2 top-7 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-clay/25 bg-card/95 px-3 py-1.5 shadow-lg backdrop-blur">
                <MousePointer2 size={12} className="text-clay" />
                <span className="text-[10.5px] font-semibold">Click any element to attach it</span>
                <span className="text-[9.5px] text-muted">Esc to cancel</span>
              </div>
            )}

            {/* picked element attach sheet */}
            <PickedElementSheet
              pick={pending}
              onAttach={attach}
              onDismiss={() => setPending(null)}
              onPickAnother={() => setPending(null)}
            />

            {building && (
              <div className="anim-fade-in pointer-events-none absolute inset-4 flex items-start justify-center pt-6">
                <div className="thinking-track flex items-center gap-2.5 rounded-full border border-line bg-card/95 px-4 py-2 shadow-lg backdrop-blur">
                  <Loader2 size={14} className="animate-spin text-clay" />
                  <span className="text-[12px] font-semibold">
                    {devServer.status === "installing" ? "Installing dependencies…" : "Rebuilding preview…"}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex h-[26px] shrink-0 items-center gap-2 border-t border-line-soft bg-cream px-3 text-[10.5px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", building ? "bg-honey working-dot" : devServer.status === "ready" ? "bg-moss" : "bg-clay")} />
              {building ? "Deploying to preview…" : devServer.status === "ready" ? "Preview is live" : devServer.error ?? "Preview unavailable"}
            </span>
            <PickedChips picks={picks} onClear={() => { for (let i = picks.length - 1; i >= 0; i--) removePick(i); }} />
            <span className="ml-auto hidden sm:block">
              {device === "desktop" ? "1280px" : device === "tablet" ? "768px" : "390px"} · {hostLabel}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
