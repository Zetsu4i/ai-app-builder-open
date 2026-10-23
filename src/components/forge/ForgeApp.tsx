"use client";

// ForgeApp — composition root (replaces the reference App.tsx).
// Wires views, overlays, keyboard shortcuts, the chat/workspace resizer and the
// agent-service health gate. Siblings (Sidebar/TopBar/ChatPanel/…) read the store themselves.

import { useCallback, useEffect, useRef, useState } from "react";
import { PanelLeft, RefreshCw } from "lucide-react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import StatusBar from "./StatusBar";
import ChatPanel from "./ChatPanel";
import Workspace from "./Workspace";
import Overlays from "./Overlays";
import GitHubImportModal from "./GitHubImportModal";
import HomeScreen from "./HomeScreen";
import AllProjects from "./AllProjects";
import IntegrationsScreen from "./IntegrationsScreen";
import SettingsScreen from "./SettingsScreen";
import AccountScreen from "./AccountScreen";
import ComponentLibrary from "./ComponentLibrary";
import CardSuite from "./CardSuite";
import { useForge, type WorkspaceMode } from "@/lib/store";
import * as api from "@/lib/api";

/* ------------------------------------------------------------------
   Forge warm-paper CSS (keyframes + small utilities from the reference
   index.css). The @theme color tokens live in globals.css; this block
   only guarantees the behavioural classes exist.
   ------------------------------------------------------------------ */
const FORGE_CSS = `
@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
@keyframes blinkCaret { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes pulseDot { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.35); opacity: 0.6; } }
@keyframes thinkingBar { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
@keyframes lineFlash { 0% { background: #fef3c7; } 100% { background: transparent; } }
.anim-fade-up { animation: fadeUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-fade-in { animation: fadeIn 0.25s ease both; }
.anim-slide-right { animation: slideInRight 0.3s cubic-bezier(0.22, 1, 0.36, 1) both; }
.stagger-1 { animation-delay: 0.04s; } .stagger-2 { animation-delay: 0.08s; }
.stagger-3 { animation-delay: 0.12s; } .stagger-4 { animation-delay: 0.16s; }
.stagger-5 { animation-delay: 0.2s; }
.stream-caret::after { content: ""; display: inline-block; width: 8px; height: 15px; margin-left: 3px; vertical-align: -2px; background: #1c1917; border-radius: 1px; animation: blinkCaret 0.9s step-end infinite; }
.working-dot { animation: pulseDot 1.4s ease-in-out infinite; }
.thinking-track { position: relative; overflow: hidden; }
.thinking-track::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(28,25,23,0.08), transparent); animation: thinkingBar 1.2s ease-in-out infinite; }
.code-line-flash { animation: lineFlash 1.6s ease-out both; }
.dot-grid { background-image: radial-gradient(#d8d1bf 1px, transparent 1px); background-size: 22px 22px; }
.toggle { width: 34px; height: 20px; border-radius: 999px; background: #d6cfbd; position: relative; transition: background 0.2s; flex-shrink: 0; }
.toggle[data-on="true"] { background: #1c1917; }
.toggle::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
.toggle[data-on="true"]::after { transform: translateX(14px); }
.resizer { cursor: col-resize; transition: background 0.15s; }
.resizer:hover, .resizer[data-active="true"] { background: #1c1917 !important; }
.chat-md p { margin: 0 0 8px 0; } .chat-md p:last-child { margin-bottom: 0; }
.chat-md ul { margin: 8px 0; padding-left: 18px; list-style: disc; }
.chat-md ol { margin: 8px 0; padding-left: 18px; list-style: decimal; }
.chat-md code { font-family: var(--font-mono, ui-monospace); font-size: 12px; background: #f1ede2; border: 1px solid #e3dccb; padding: 1px 5px; border-radius: 5px; color: #7c2d12; }
.chat-md strong { font-weight: 600; }
`;

/** ⌘1–8 → workspace modes, in a sensible order. */
const MODE_HOTKEYS: WorkspaceMode[] = ["preview", "code", "git", "database", "terminal", "browser", "console", "stream"];

const OVERLAY_KEYS = [
  "commandOpen",
  "publishOpen",
  "shareOpen",
  "newFileOpen",
  "githubImportOpen",
  "settingsSheetOpen",
  "contextPanelOpen",
  "versionsOpen",
] as const;

function ForgeApp() {
  const view = useForge((s) => s.view);
  const setView = useForge((s) => s.setView);
  const sidebarCollapsed = useForge((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useForge((s) => s.setSidebarCollapsed);
  const setOverlay = useForge((s) => s.setOverlay);
  const setWsMode = useForge((s) => s.setWsMode);

  // chat resizer (local, un-persisted — ported from the reference App.tsx)
  const [chatWidth, setChatWidth] = useState(400);
  const [chatHidden, setChatHidden] = useState(false);
  const [chatResizing, setChatResizing] = useState(false);
  const resizing = useRef(false);

  // backend health gate
  const [backendUp, setBackendUp] = useState(true);
  const [healthChecking, setHealthChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setHealthChecking(true);
    try {
      await api.getHealth();
      setBackendUp(true);
    } catch {
      setBackendUp(false);
    } finally {
      setHealthChecking(false);
    }
  }, []);

  useEffect(() => {
    useForge.getState().handleSocketInit();
    void useForge.getState().loadProjects();
  }, []);

  useEffect(() => {
    void checkHealth();
    const id = window.setInterval(() => void checkHealth(), 5000);
    return () => window.clearInterval(id);
  }, [checkHealth]);

  /* ---------- keyboard shortcuts ---------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      const s = useForge.getState();

      if (mod) {
        const k = e.key.toLowerCase();
        if (k === "k") {
          e.preventDefault();
          setOverlay("commandOpen", !s.commandOpen);
        } else if (k === "b") {
          e.preventDefault();
          setSidebarCollapsed(!s.sidebarCollapsed);
        } else if (k === "n") {
          e.preventDefault();
          setView("home");
        } else if (k === "s") {
          e.preventDefault();
          const path = s.activePath;
          if (path && s.dirtyPaths[path] && s.editorContent[path] !== undefined) {
            void s.saveFile(path, s.editorContent[path]);
          }
        } else if (/^[1-8]$/.test(e.key)) {
          e.preventDefault();
          setWsMode(MODE_HOTKEYS[Number(e.key) - 1]);
        }
        return;
      }

      if (typing) return;

      if (e.key === "Escape") {
        const anyOpen = OVERLAY_KEYS.some((k) => s[k]);
        if (anyOpen) {
          e.preventDefault();
          for (const k of OVERLAY_KEYS) if (s[k]) setOverlay(k, false);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOverlay, setSidebarCollapsed, setView, setWsMode]);

  /* ---------- chat resizer ---------- */

  const onResizerDown = (e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    setChatResizing(true);
    const move = (ev: MouseEvent) => {
      if (!resizing.current) return;
      const sidebarW = useForge.getState().sidebarCollapsed ? 60 : 248;
      setChatWidth(Math.min(640, Math.max(320, ev.clientX - sidebarW)));
    };
    const up = () => {
      resizing.current = false;
      setChatResizing(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  /* ---------- views ---------- */

  const renderView = () => {
    switch (view) {
      case "workspace":
        return (
          <>
            <TopBar />
            <div className="flex min-h-0 flex-1">
              {!chatHidden ? (
                <>
                  <div style={{ width: chatWidth }} className="flex h-full shrink-0 flex-col border-r border-line">
                    <ChatPanel />
                  </div>
                  <div
                    onMouseDown={onResizerDown}
                    onDoubleClick={() => setChatHidden(true)}
                    data-active={chatResizing}
                    title="Drag to resize · double-click to hide chat"
                    className="resizer w-[5px] shrink-0 bg-transparent"
                  />
                </>
              ) : (
                <button
                  onClick={() => setChatHidden(false)}
                  className="flex w-10 shrink-0 flex-col items-center gap-2 border-r border-line bg-cream pt-4 text-muted transition hover:text-ink"
                  title="Show chat"
                >
                  <PanelLeft size={16} />
                  <span className="text-[11px] font-bold [writing-mode:vertical-lr]">CHAT</span>
                </button>
              )}
              <Workspace />
            </div>
            <StatusBar />
          </>
        );
      case "projects":
        return <AllProjects />;
      case "integrations":
        return <IntegrationsScreen />;
      case "settings":
        return <SettingsScreen />;
      case "account":
        return <AccountScreen />;
      case "library":
        return <ComponentLibrary />;
      case "suite":
        return <CardSuite />;
      case "home":
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper text-ink">
      <style dangerouslySetInnerHTML={{ __html: FORGE_CSS }} />

      {!backendUp && (
        <div className="flex h-9 shrink-0 items-center justify-center gap-2 border-b border-clay/25 bg-clay/[0.08] px-4 text-[12px] font-medium text-clay">
          <span className="working-dot h-1.5 w-1.5 rounded-full bg-clay" />
          agent-service offline — retrying every 5s
          <button
            onClick={() => void checkHealth()}
            disabled={healthChecking}
            className="flex h-6 items-center gap-1 rounded-md border border-clay/30 bg-card px-2 text-[10.5px] font-bold transition hover:border-clay/50"
          >
            <RefreshCw size={10} className={healthChecking ? "animate-spin" : ""} /> Retry now
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">{renderView()}</div>
      </div>

      <Overlays />
      <GitHubImportModal />
    </div>
  );
}

export default ForgeApp;
