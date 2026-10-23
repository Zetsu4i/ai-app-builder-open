"use client";

// ZCode Builder — global client store (zustand). Replaces the "Forge" App.tsx useState soup.

import { create } from "zustand";
import * as api from "./api";
import { getSocket, joinProject, leaveProject } from "./socket";
import type {
  AgentEvent,
  ArtifactDTO,
  ChatMessage,
  CheckpointDTO,
  ComposerConfig,
  DevServerState,
  FileNode,
  GitLogEntry,
  GitStatus,
  HydratePayload,
  MessagePart,
  PickedElement,
  ProjectDTO,
  SwarmRunDTO,
  ToolInvocationPart,
} from "./types";

export type View = "home" | "workspace" | "projects" | "integrations" | "settings" | "account" | "library" | "suite";
export type WorkspaceMode =
  | "preview"
  | "code"
  | "git"
  | "database"
  | "terminal"
  | "browser"
  | "console"
  | "stream"
  | "jobs"
  | "artifacts";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
}

export interface ConsoleEntry {
  id: string;
  level: "error" | "warn" | "log" | "info";
  text: string;
  detail?: string;
  createdAt: string;
  fixed?: boolean;
}

// ---------- part merging helpers (ported from deprecated editor-store) ----------
export function mergeToolPart(parts: MessagePart[], incoming: MessagePart): MessagePart[] {
  if (incoming.type === "tool-invocation") {
    const idx = parts.findIndex((p) => p.type === "tool-invocation" && p.id === incoming.id);
    if (idx >= 0) {
      const next = [...parts];
      const prev = parts[idx] as ToolInvocationPart;
      next[idx] = { ...prev, ...incoming, input: incoming.input ?? prev.input, output: incoming.output ?? prev.output };
      return next;
    }
    return [...parts, incoming];
  }
  if (incoming.type === "delegation") {
    const idx = parts.findIndex(
      (p) => p.type === "delegation" && p.agent === incoming.agent && p.phase === incoming.phase && (incoming.taskId ? p.taskId === incoming.taskId : true),
    );
    if (idx >= 0) {
      const next = [...parts];
      next[idx] = { ...(parts[idx] as typeof incoming), ...incoming };
      return next;
    }
    return [...parts, incoming];
  }
  if (incoming.type === "text" || incoming.type === "reasoning") {
    const last = parts[parts.length - 1];
    if (last && last.type === incoming.type) {
      const next = [...parts];
      next[next.length - 1] = { ...last, text: last.text + incoming.text };
      return next;
    }
    return [...parts, { ...incoming }];
  }
  if (incoming.type === "plan") {
    return [...parts.filter((p) => p.type !== "plan"), incoming];
  }
  if (incoming.type === "approval" || incoming.type === "question") {
    const key = incoming.type === "approval" ? "requestId" : "requestId";
    const idx = parts.findIndex((p) => (p.type === "approval" || p.type === "question") && p[key] === incoming[key]);
    if (idx >= 0) {
      const next = [...parts];
      next[idx] = { ...(parts[idx] as typeof incoming), ...incoming };
      return next;
    }
    return [...parts, incoming];
  }
  return [...parts, incoming];
}

function eventToParts(e: AgentEvent): MessagePart[] {
  if (e.kind === "checkpoint") {
    const p = e.payload as { id?: string; label?: string; commitHash?: string };
    return [{ type: "checkpoint", id: p.id || e.id, label: p.label || "Checkpoint", commitHash: p.commitHash }];
  }
  return [];
}

interface ForgeState {
  // shell
  view: View;
  sidebarCollapsed: boolean;
  toasts: Toast[];
  commandOpen: boolean;
  publishOpen: boolean;
  shareOpen: boolean;
  newFileOpen: boolean;
  githubImportOpen: boolean;
  settingsSheetOpen: boolean;
  contextPanelOpen: boolean;
  versionsOpen: boolean;

  // projects
  projects: ProjectDTO[];
  activeProject: ProjectDTO | null;

  // chat
  messages: ChatMessage[];
  liveMessageId: string | null;
  isWorking: boolean;
  agentActivity: string | null;
  agentEditing: boolean;
  lastError: { message: string; kind: string } | null;
  todos: { id: string; content: string; status: string }[];
  contextUsed: number;
  contextWindow: number;
  totalTokens: number;

  // composer
  composer: ComposerConfig;

  // workspace
  wsMode: WorkspaceMode;
  wsCollapsed: boolean;
  fileTree: FileNode[];
  openTabs: string[];
  activePath: string | null;
  dirtyPaths: Record<string, boolean>;
  changedLines: Record<string, number[]>;
  editorContent: Record<string, string>;

  // git
  gitStatus: GitStatus | null;
  gitLog: GitLogEntry[];
  checkpoints: CheckpointDTO[];

  // preview / devserver / sandbox
  devServer: DevServerState;
  sandbox: { runtime: "local" | "e2b"; status: string; sandboxId: string | null; error?: string };
  previewKey: number;
  webviewErrors: { message: string; level: string; count: number }[];
  consoleEntries: ConsoleEntry[];
  picks: PickedElement[];

  // artifacts
  artifacts: ArtifactDTO[];

  // swarm
  swarmRun: SwarmRunDTO | null;

  // misc
  usage: { contextUsed: number; contextWindow: number; totalTokens: number } | null;

  // actions
  setView: (v: View) => void;
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  setOverlay: (k: "commandOpen" | "publishOpen" | "shareOpen" | "newFileOpen" | "githubImportOpen" | "settingsSheetOpen" | "contextPanelOpen" | "versionsOpen", v: boolean) => void;
  setSidebarCollapsed: (v: boolean) => void;
  setWsMode: (m: WorkspaceMode) => void;
  setWsCollapsed: (v: boolean) => void;
  setComposer: (c: Partial<ComposerConfig>) => void;

  loadProjects: () => Promise<void>;
  openProject: (id: string) => Promise<void>;
  closeProject: () => void;
  createAndOpen: (body: Parameters<typeof api.createProject>[0]) => Promise<void>;
  patchProject: (patch: Partial<ProjectDTO>) => Promise<void>;

  send: (content: string) => Promise<void>;
  stop: () => Promise<void>;
  retry: () => Promise<void>;

  refreshFileTree: () => Promise<void>;
  openFile: (path: string) => Promise<void>;
  saveFile: (path: string, content: string) => Promise<void>;
  closeTab: (path: string) => void;
  refreshGit: () => Promise<void>;
  refreshArtifacts: () => Promise<void>;
  refreshSwarm: () => Promise<void>;
  bumpPreview: () => void;
  addConsole: (e: Omit<ConsoleEntry, "id" | "createdAt">) => void;
  addPick: (p: PickedElement) => void;
  removePick: (i: number) => void;

  handleSocketInit: () => void;
}

let socketBound = false;

export const useForge = create<ForgeState>((set, get) => ({
  view: "home",
  sidebarCollapsed: false,
  toasts: [],
  commandOpen: false,
  publishOpen: false,
  shareOpen: false,
  newFileOpen: false,
  githubImportOpen: false,
  settingsSheetOpen: false,
  contextPanelOpen: false,
  versionsOpen: false,

  projects: [],
  activeProject: null,

  messages: [],
  liveMessageId: null,
  isWorking: false,
  agentActivity: null,
  agentEditing: false,
  lastError: null,
  todos: [],
  contextUsed: 0,
  contextWindow: 200000,
  totalTokens: 0,

  composer: {
    mode: "web",
    framework: "react-vite",
    designSystem: null,
    style: null,
    skills: [],
    mcps: [],
    swarm: false,
    swarmAgents: 3,
    agentMode: "build",
  },

  wsMode: "preview",
  wsCollapsed: false,
  fileTree: [],
  openTabs: [],
  activePath: null,
  dirtyPaths: {},
  changedLines: {},
  editorContent: {},

  gitStatus: null,
  gitLog: [],
  checkpoints: [],

  devServer: { status: "stopped" },
  sandbox: { runtime: "local", status: "stopped", sandboxId: null },
  previewKey: 0,
  webviewErrors: [],
  consoleEntries: [],
  picks: [],

  artifacts: [],
  swarmRun: null,
  usage: null,

  setView: (v) => set({ view: v }),
  toast: (t) => {
    const id = Math.random().toString(36).slice(2);
    set({ toasts: [...get().toasts, { ...t, id }] });
    setTimeout(() => get().dismissToast(id), 4200);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  setOverlay: (k, v) => set({ [k]: v } as Partial<ForgeState>),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setWsMode: (m) => set({ wsMode: m }),
  setWsCollapsed: (v) => set({ wsCollapsed: v }),
  setComposer: (c) => set({ composer: { ...get().composer, ...c } }),

  loadProjects: async () => {
    try {
      const projects = await api.listProjects();
      set({ projects });
    } catch (e) {
      get().toast({ title: "Failed to load projects", description: String(e), variant: "error" });
    }
  },

  openProject: async (id) => {
    try {
      const data: HydratePayload = await api.hydrateProject(id);
      set({
        activeProject: data.project,
        messages: data.messages,
        artifacts: data.artifacts,
        checkpoints: data.checkpoints,
        fileTree: data.fileTree,
        devServer: data.devServer,
        sandbox: data.sandbox,
        swarmRun: data.swarmRun,
        contextUsed: data.usage?.contextUsed ?? 0,
        contextWindow: data.usage?.contextWindow ?? 200000,
        totalTokens: data.usage?.totalTokens ?? 0,
        view: "workspace",
        isWorking: false,
        liveMessageId: null,
        lastError: null,
        openTabs: [],
        activePath: null,
        editorContent: {},
        dirtyPaths: {},
        previewKey: 0,
        wsMode: data.project.mode === "design" ? "preview" : "preview",
        composer: {
          ...get().composer,
          mode: data.project.mode,
          framework: data.project.framework,
          swarm: data.project.swarmEnabled,
          agentMode: (data.project.agentMode as ComposerConfig["agentMode"]) || "build",
          designSystem: (data.project.modeConfig as { designSystem?: string })?.designSystem ?? null,
          style: (data.project.modeConfig as { style?: string })?.style ?? null,
        },
      });
      joinProject(id);
      void get().refreshGit();
    } catch (e) {
      get().toast({ title: "Failed to open project", description: String(e), variant: "error" });
    }
  },

  closeProject: () => {
    const p = get().activeProject;
    if (p) leaveProject(p.id);
    set({ activeProject: null, messages: [], view: "home", swarmRun: null, artifacts: [], openTabs: [], activePath: null });
  },

  createAndOpen: async (body) => {
    try {
      const project = await api.createProject(body);
      await get().loadProjects();
      await get().openProject(project.id);
      if (body.initialPrompt) {
        await get().send(body.initialPrompt);
      }
    } catch (e) {
      get().toast({ title: "Failed to create project", description: String(e), variant: "error" });
    }
  },

  patchProject: async (patch) => {
    const p = get().activeProject;
    if (!p) return;
    try {
      const updated = await api.updateProject(p.id, patch);
      set({ activeProject: updated });
    } catch (e) {
      get().toast({ title: "Failed to update project", description: String(e), variant: "error" });
    }
  },

  send: async (content) => {
    const p = get().activeProject;
    if (!p || get().isWorking) return;
    const userMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      parts: [{ type: "text", text: content }],
      createdAt: new Date().toISOString(),
    };
    const liveId = `live-${Date.now()}`;
    set({
      messages: [...get().messages, userMsg],
      liveMessageId: liveId,
      isWorking: true,
      lastError: null,
      agentActivity: "Thinking…",
    });
    try {
      await api.sendChat(p.id, { content, agentMode: get().composer.agentMode });
    } catch (e) {
      set({ isWorking: false, liveMessageId: null, lastError: { message: String(e), kind: "network" } });
    }
  },

  stop: async () => {
    const p = get().activeProject;
    if (!p) return;
    try {
      await api.stopChat(p.id);
    } catch {
      /* noop */
    }
  },

  retry: async () => {
    const msgs = get().messages;
    const lastUser = [...msgs].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const text = lastUser.parts.find((p) => p.type === "text")?.text;
    if (text) await get().send(text);
  },

  refreshFileTree: async () => {
    const p = get().activeProject;
    if (!p) return;
    try {
      const { tree } = await api.getFileTree(p.id);
      set({ fileTree: tree });
    } catch {
      /* noop */
    }
  },

  openFile: async (path) => {
    const p = get().activeProject;
    if (!p) return;
    set({ activePath: path, wsMode: "code" });
    if (get().openTabs.includes(path)) return;
    try {
      const { content } = await api.readFile(p.id, path);
      set({
        openTabs: [...get().openTabs, path],
        editorContent: { ...get().editorContent, [path]: content },
        dirtyPaths: { ...get().dirtyPaths, [path]: false },
      });
    } catch (e) {
      get().toast({ title: "Failed to open file", description: String(e), variant: "error" });
    }
  },

  saveFile: async (path, content) => {
    const p = get().activeProject;
    if (!p) return;
    try {
      await api.writeFile(p.id, path, content);
      set({
        editorContent: { ...get().editorContent, [path]: content },
        dirtyPaths: { ...get().dirtyPaths, [path]: false },
      });
      get().toast({ title: "Saved", variant: "success" });
      void get().refreshGit();
    } catch (e) {
      get().toast({ title: "Failed to save", description: String(e), variant: "error" });
    }
  },

  closeTab: (path) => {
    const tabs = get().openTabs.filter((t) => t !== path);
    const active = get().activePath === path ? tabs[tabs.length - 1] ?? null : get().activePath;
    set({ openTabs: tabs, activePath: active });
  },

  refreshGit: async () => {
    const p = get().activeProject;
    if (!p) return;
    try {
      const [status, log, cps] = await Promise.all([api.gitStatus(p.id), api.gitLog(p.id), api.listCheckpoints(p.id)]);
      set({ gitStatus: status, gitLog: log.log, checkpoints: cps.checkpoints });
    } catch {
      /* noop */
    }
  },

  refreshArtifacts: async () => {
    const p = get().activeProject;
    if (!p) return;
    try {
      const { artifacts } = await api.listArtifacts(p.id);
      set({ artifacts });
    } catch {
      /* noop */
    }
  },

  refreshSwarm: async () => {
    const p = get().activeProject;
    if (!p) return;
    try {
      const run = await api.swarmGet(p.id);
      set({ swarmRun: run });
    } catch {
      /* noop */
    }
  },

  bumpPreview: () => set({ previewKey: get().previewKey + 1 }),
  addConsole: (e) =>
    set({
      consoleEntries: [
        ...get().consoleEntries,
        { ...e, id: Math.random().toString(36).slice(2), createdAt: new Date().toISOString() },
      ].slice(-300),
    }),
  addPick: (p) => set({ picks: [...get().picks, p] }),
  removePick: (i) => set({ picks: get().picks.filter((_, idx) => idx !== i) }),

  handleSocketInit: () => {
    if (socketBound) return;
    socketBound = true;
    const s = getSocket();
    if (typeof window !== "undefined") {
      (window as unknown as { __forgeSocket: typeof s }).__forgeSocket = s;
    }

    s.on("connect", () => {
      const p = get().activeProject;
      if (p) joinProject(p.id);
    });

    s.on("message:user", ({ id, parts, createdAt }) => {
      const msg: ChatMessage = { id, role: "user", parts: parts as MessagePart[], createdAt };
      const msgs = [...get().messages];
      // replace optimistic local user message
      const localIdx = msgs.findIndex((m) => m.id.startsWith("local-") && m.role === "user");
      if (localIdx >= 0) msgs[localIdx] = msg;
      else msgs.push(msg);
      set({ messages: msgs });
    });

    s.on("message:delta", ({ delta }) => {
      const liveId = get().liveMessageId;
      if (!liveId) return;
      const msgs = [...get().messages];
      const idx = msgs.findIndex((m) => m.id === liveId);
      const part: MessagePart = { type: "text", text: delta };
      if (idx >= 0) {
        msgs[idx] = { ...msgs[idx], parts: mergeToolPart(msgs[idx].parts, part) };
      } else {
        msgs.push({ id: liveId, role: "assistant", parts: [part], createdAt: new Date().toISOString(), streaming: true });
      }
      set({ messages: msgs, agentActivity: null });
    });

    s.on("message:reasoning-delta", ({ delta }) => {
      const liveId = get().liveMessageId;
      if (!liveId) return;
      const msgs = [...get().messages];
      const idx = msgs.findIndex((m) => m.id === liveId);
      const part: MessagePart = { type: "reasoning", text: delta };
      if (idx >= 0) msgs[idx] = { ...msgs[idx], parts: mergeToolPart(msgs[idx].parts, part) };
      else msgs.push({ id: liveId, role: "assistant", parts: [part], createdAt: new Date().toISOString(), streaming: true });
      set({ messages: msgs, agentActivity: "Thinking…" });
    });

    s.on("message:part", ({ part }) => {
      const liveId = get().liveMessageId;
      if (!liveId) return;
      const msgs = [...get().messages];
      const idx = msgs.findIndex((m) => m.id === liveId);
      if (idx < 0) return;
      let parts = msgs[idx].parts;
      if (part.type === "tool-invocation" && (part as ToolInvocationPart).toolName === "TodoWrite") {
        const input = (part as ToolInvocationPart).input as { todos?: { id: string; content: string; status: string }[] } | undefined;
        if (input?.todos) set({ todos: input.todos });
      }
      if (part.type === "plan") {
        set({ todos: part.todos.map((t) => ({ id: t.id, content: t.content, status: t.status })) });
      }
      if (part.type === "delegation" && part.phase === "activity") {
        set({ agentActivity: part.text ?? part.agent });
      }
      if (part.type === "tool-invocation") {
        const name = (part as ToolInvocationPart).toolName;
        if (name === "Edit" || name === "Write" || name === "NotebookEdit") set({ agentEditing: true });
        if ((part as ToolInvocationPart).state === "output-available") set({ agentEditing: false });
      }
      parts = mergeToolPart(parts, part);
      msgs[idx] = { ...msgs[idx], parts, streaming: true };
      set({ messages: msgs });
    });

    s.on("message:final", ({ id, liveId, parts, stats }) => {
      const msgs = get().messages.filter((m) => m.id !== liveId);
      msgs.push({ id, role: "assistant", parts: parts as MessagePart[], createdAt: new Date().toISOString(), stats });
      set({
        messages: msgs,
        liveMessageId: null,
        isWorking: false,
        agentActivity: null,
        agentEditing: false,
      });
      void get().refreshFileTree();
      void get().refreshGit();
      void get().refreshArtifacts();
      void get().bumpPreview();
    });

    s.on("agent:event", (e) => {
      // also append event-derived parts to live message
      if (get().liveMessageId && (e.kind === "checkpoint")) {
        const parts = eventToParts({ ...e, payload: e.payload } as AgentEvent);
        const msgs = [...get().messages];
        const idx = msgs.findIndex((m) => m.id === get().liveMessageId);
        if (idx >= 0) {
          for (const part of parts) msgs[idx] = { ...msgs[idx], parts: mergeToolPart(msgs[idx].parts, part) };
          set({ messages: msgs });
        }
      }
      switch (e.kind) {
        case "sandbox": {
          const p = e.payload as { runtime?: string; status?: string; sandboxId?: string | null; error?: string };
          set({
            sandbox: {
              runtime: (p.runtime as "local" | "e2b") || "local",
              status: p.status || "stopped",
              sandboxId: p.sandboxId ?? null,
              error: p.error,
            },
          });
          break;
        }
        case "devserver": {
          const p = e.payload as Partial<DevServerState>;
          set({ devServer: { ...get().devServer, ...p } });
          if (p.status === "ready") set({ wsMode: "preview" });
          break;
        }
        case "preview": {
          const p = e.payload as { reload?: boolean };
          if (p.reload) get().bumpPreview();
          break;
        }
        case "terminal": {
          const p = e.payload as { stream?: string; data?: string };
          if (p.data) get().addConsole({ level: "info", text: p.data });
          break;
        }
        case "error": {
          const p = e.payload as { message?: string; kind?: string };
          set({ lastError: { message: p.message || "Unknown error", kind: p.kind || "agent" } });
          break;
        }
        case "usage": {
          const p = e.payload as { contextUsed?: number; contextWindow?: number; totalTokens?: number };
          set({
            contextUsed: p.contextUsed ?? get().contextUsed,
            contextWindow: p.contextWindow ?? get().contextWindow,
            totalTokens: p.totalTokens ?? get().totalTokens,
          });
          break;
        }
        case "swarm": {
          void get().refreshSwarm();
          break;
        }
        case "status": {
          const p = e.payload as { activity?: string };
          if (p.activity !== undefined) set({ agentActivity: p.activity });
          break;
        }
      }
    });

    s.on("permission:request", (req) => {
      const liveId = get().liveMessageId;
      const part: MessagePart = {
        type: "approval",
        requestId: req.requestId,
        toolName: req.toolName,
        input: req.input,
        riskLevel: req.riskLevel,
        reason: req.reason,
      };
      if (liveId) {
        const msgs = [...get().messages];
        const idx = msgs.findIndex((m) => m.id === liveId);
        if (idx >= 0) {
          msgs[idx] = { ...msgs[idx], parts: mergeToolPart(msgs[idx].parts, part) };
          set({ messages: msgs });
        }
      }
    });

    s.on("question:request", (req) => {
      const liveId = get().liveMessageId;
      const part: MessagePart = {
        type: "question",
        requestId: req.requestId,
        prompt: req.prompt,
        questions: req.questions,
      };
      if (liveId) {
        const msgs = [...get().messages];
        const idx = msgs.findIndex((m) => m.id === liveId);
        if (idx >= 0) {
          msgs[idx] = { ...msgs[idx], parts: mergeToolPart(msgs[idx].parts, part) };
          set({ messages: msgs });
        }
      }
    });

    s.on("terminal", () => {
      /* handled via agent:event terminal */
    });

    s.on("title", ({ title }) => {
      const p = get().activeProject;
      if (p) set({ activeProject: { ...p, title } });
      void get().loadProjects();
    });

    s.on("swarm", ({ type, payload }) => {
      const run = get().swarmRun;
      if (run) {
        set({
          swarmRun: {
            ...run,
            status: (payload.status as string) ?? run.status,
            tasks: (payload.tasks as SwarmRunDTO["tasks"]) ?? run.tasks,
            workers: (payload.workers as SwarmRunDTO["workers"]) ?? run.workers,
            events: [...(payload.events ? [] : []), ...run.events].slice(-100),
          },
        });
      }
      if (type === "swarm:done") void get().refreshSwarm();
    });

    s.on("error", ({ message }) => {
      get().toast({ title: "Agent error", description: message, variant: "error" });
      set({ isWorking: false, agentActivity: null });
    });
  },
}));
