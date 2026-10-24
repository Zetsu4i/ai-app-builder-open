// ZCode Builder — API client. Browser always calls same-origin /api/bff/* (Next BFF proxies to agent-service).

import type {
  AgentProfileDTO,
  ArtifactDTO,
  CheckpointDTO,
  DesignSystemDTO,
  DevServerPort,
  DevServerState,
  FileNode,
  GitLogEntry,
  GitStatus,
  HydratePayload,
  McpServerDTO,
  ModeDTO,
  ModelOption,
  PluginDTO,
  ProjectDTO,
  ProviderDTO,
  SessionDTO,
  SkillDTO,
  SwarmRunDTO,
  UsageDTO,
} from "./types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function bff<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/bff${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      msg = body?.error || msg;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function qs(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// ---------- health ----------
export const getHealth = () => bff<{ ok: boolean; core: boolean; bridge: boolean }>("/health");

// ---------- projects ----------
export const listProjects = () => bff<ProjectDTO[]>("/projects");
export const createProject = (body: {
  title?: string;
  mode: string;
  framework?: string;
  config?: Record<string, unknown>;
  initialPrompt?: string;
  swarm?: boolean;
  agentMode?: string;
}) => bff<ProjectDTO>("/projects", { method: "POST", body: JSON.stringify(body) });
export const getProject = (id: string) => bff<ProjectDTO>(`/projects/${id}`);
export const updateProject = (id: string, body: Partial<ProjectDTO> & { modeConfig?: Record<string, unknown> }) =>
  bff<ProjectDTO>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteProject = (id: string) => bff<void>(`/projects/${id}`, { method: "DELETE" });

// ---------- chat ----------
export const hydrateProject = (id: string, sessionId?: string) =>
  bff<HydratePayload>(`/projects/${id}/hydrate${qs({ sessionId })}`);
export const sendChat = (
  id: string,
  body: {
    content: string;
    modelSelection?: string;
    agentMode?: string;
    attachments?: { name: string; mime: string; dataBase64: string }[];
    pickedElements?: { selector: string; tag: string; text?: string; styles?: Record<string, string>; instructions?: string }[];
  },
) => bff<{ accepted: boolean }>(`/projects/${id}/chat`, { method: "POST", body: JSON.stringify(body) });
export const stopChat = (id: string) => bff<{ stopped: boolean }>(`/projects/${id}/stop`, { method: "POST" });
export const enhancePrompt = (prompt: string, mode: string): Promise<{ text: string }> =>
  bff("/enhance", { method: "POST", body: JSON.stringify({ prompt, mode }) });

// ---------- chat sessions ("tasks" on one project) ----------
export const listSessions = (id: string) => bff<{ sessions: SessionDTO[] }>(`/projects/${id}/sessions`);
export const createSession = (id: string, title?: string) =>
  bff<{ session: SessionDTO }>(`/projects/${id}/sessions`, { method: "POST", body: JSON.stringify({ title }) });
export const activateSession = (id: string, sessionId: string) =>
  bff<{ ok: boolean }>(`/projects/${id}/sessions/${sessionId}/activate`, { method: "POST" });

// ---------- interactions ----------
export const respondPermission = (body: {
  projectId: string;
  requestId: string;
  decision: "allow" | "deny";
  modifiedInput?: unknown;
}) => bff<{ ok: boolean }>("/interaction/permission", { method: "POST", body: JSON.stringify(body) });
export const respondQuestion = (body: {
  projectId: string;
  requestId: string;
  action: "accept" | "decline" | "cancel";
  content?: Record<string, string>;
}) => bff<{ ok: boolean }>("/interaction/question", { method: "POST", body: JSON.stringify(body) });

// ---------- files ----------
export const getFileTree = (id: string) => bff<{ tree: FileNode[] }>(`/projects/${id}/files/tree`);
export const readFile = (id: string, path: string) =>
  bff<{ path: string; content: string; size: number }>(`/projects/${id}/files/content${qs({ path })}`);
export const writeFile = (id: string, path: string, content: string) =>
  bff<{ ok: boolean }>(`/projects/${id}/files/content`, { method: "PUT", body: JSON.stringify({ path, content }) });
export const createEntry = (id: string, path: string, type: "file" | "dir") =>
  bff<{ ok: boolean }>(`/projects/${id}/files/entry`, { method: "POST", body: JSON.stringify({ path, type }) });
export const deleteEntry = (id: string, path: string) =>
  bff<{ ok: boolean }>(`/projects/${id}/files/entry${qs({ path })}`, { method: "DELETE" });
export const searchFiles = (id: string, query: string) =>
  bff<{ matches: { path: string; line: number; text: string }[] }>(`/projects/${id}/files/search${qs({ query })}`);
export const fileStats = (id: string) =>
  bff<{ files: number; lines: number; bytes: number }>(`/projects/${id}/files/stats`);

// ---------- git ----------
export const gitStatus = (id: string) => bff<GitStatus>(`/projects/${id}/git/status`);
export const gitLog = (id: string) => bff<{ log: GitLogEntry[] }>(`/projects/${id}/git/log`);
export const gitDiff = (id: string, path?: string) =>
  bff<{ diff: string }>(`/projects/${id}/git/diff${qs({ path })}`);
export const gitCommit = (id: string, message: string) =>
  bff<{ ok: boolean; hash: string }>(`/projects/${id}/git/commit`, { method: "POST", body: JSON.stringify({ message }) });
export const gitCheckpoint = (id: string, label?: string) =>
  bff<CheckpointDTO>(`/projects/${id}/git/checkpoint`, { method: "POST", body: JSON.stringify({ label }) });
export const gitRestore = (id: string, checkpointId: string) =>
  bff<{ ok: boolean }>(`/projects/${id}/git/restore`, { method: "POST", body: JSON.stringify({ checkpointId }) });
export const listCheckpoints = (id: string) => bff<{ checkpoints: CheckpointDTO[] }>(`/projects/${id}/checkpoints`);
export const listVersions = (id: string) => bff<{ versions: CheckpointDTO[] }>(`/projects/${id}/versions`);

// ---------- artifacts / export ----------
export const listArtifacts = (id: string) => bff<{ artifacts: ArtifactDTO[] }>(`/projects/${id}/artifacts`);
export const exportChat = (id: string) => bff<{ markdown: string }>(`/projects/${id}/export/chat`);
export const exportZipUrl = (id: string) => `/api/bff/projects/${id}/export/zip`;
export const artifactRawUrl = (id: string, path: string) => `/api/bff/projects/${id}/artifacts/raw${qs({ path })}`;

// ---------- preview & devserver ----------
export const devServerAction = (id: string, action: "start" | "stop" | "restart") =>
  bff<DevServerState>(`/projects/${id}/devserver`, { method: "POST", body: JSON.stringify({ action }) });
export const getDevServer = (id: string) => bff<DevServerState>(`/projects/${id}/devserver`);
export const getPorts = (id: string) => bff<{ ports: DevServerPort[] }>(`/projects/${id}/ports`);
export const previewUrl = (id: string, path = "") => `/preview/${id}${path}`;
export const previewBase = (id: string) => `/preview/${id}/`;
/** Raw proxy for a secondary port the agent opened — /preview/<id>/p/<port>/ */
export const previewPortBase = (id: string, port: number) => `/preview/${id}/p/${port}/`;

// ---------- sandbox ----------
export const sandboxAction = (id: string, action: "start" | "stop" | "sync") =>
  bff<DevServerState | { ok: boolean }>(`/projects/${id}/sandbox`, { method: "POST", body: JSON.stringify({ action }) });
export const getSandbox = (id: string) => bff<DevServerState>(`/projects/${id}/sandbox`);

// ---------- terminal ----------
export const runTerminal = (id: string, command: string) =>
  bff<{ ok: boolean }>(`/projects/${id}/terminal`, { method: "POST", body: JSON.stringify({ command }) });

// ---------- github ----------
export const githubImport = (id: string, body: { repo: string; branch?: string; token?: string }) =>
  bff<{ ok: boolean }>(`/projects/${id}/github/import`, { method: "POST", body: JSON.stringify(body) });
export const githubPublish = (id: string, body: { repo: string; branch?: string; token?: string }) =>
  bff<{ ok: boolean; url?: string }>(`/projects/${id}/github/publish`, { method: "POST", body: JSON.stringify(body) });

// ---------- swarm ----------
export const swarmStart = (id: string, goal: string) =>
  bff<{ runId: string }>(`/projects/${id}/swarm/start`, { method: "POST", body: JSON.stringify({ goal }) });
export const swarmStop = (id: string) => bff<{ ok: boolean }>(`/projects/${id}/swarm/stop`, { method: "POST" });
export const swarmGet = (id: string) => bff<SwarmRunDTO | null>(`/projects/${id}/swarm/current`);

// ---------- modes ----------
export const listModes = () => bff<{ modes: ModeDTO[] }>("/modes");
export const createMode = (body: Record<string, unknown>) => bff<ModeDTO>("/modes", { method: "POST", body: JSON.stringify(body) });
export const updateMode = (slug: string, body: Record<string, unknown>) =>
  bff<ModeDTO>(`/modes/${encodeURIComponent(slug)}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteMode = (slug: string) => bff<void>(`/modes/${encodeURIComponent(slug)}`, { method: "DELETE" });

// ---------- providers & models ----------
export const listProviders = () => bff<{ providers: ProviderDTO[] }>("/providers");
export const upsertProvider = (body: Record<string, unknown>) =>
  bff<ProviderDTO>("/providers", { method: "POST", body: JSON.stringify(body) });
export const deleteProvider = (providerId: string) =>
  bff<void>(`/providers/${encodeURIComponent(providerId)}`, { method: "DELETE" });
export const testProvider = (providerId: string) =>
  bff<{ ok: boolean; latencyMs?: number; error?: string }>(`/providers/${encodeURIComponent(providerId)}/test`, { method: "POST" });
export const listModels = () => bff<{ models: ModelOption[] }>("/models");

// ---------- skills ----------
export const listSkills = (projectId?: string) => bff<{ skills: SkillDTO[] }>(`/skills${qs({ projectId })}`);
export const installSkill = (body: {
  projectId?: string;
  source: "paste" | "url" | "npx" | "folder" | "pack";
  slug?: string;
  name?: string;
  content?: string; // SKILL.md body for paste
  url?: string; // git url or skill url for url/npx
  packSlug?: string; // for pack installs
  scope?: "workspace" | "user";
}) => bff<{ ok: boolean; slug: string }>("/skills/install", { method: "POST", body: JSON.stringify(body) });
export const toggleSkill = (slug: string, enabled: boolean) =>
  bff<{ ok: boolean }>(`/skills/${encodeURIComponent(slug)}`, { method: "PUT", body: JSON.stringify({ enabled }) });
export const deleteSkill = (slug: string) => bff<void>(`/skills/${encodeURIComponent(slug)}`, { method: "DELETE" });

// ---------- MCP ----------
export const listMcp = () => bff<{ servers: McpServerDTO[] }>("/mcp");
export const upsertMcp = (body: Record<string, unknown>) => bff<McpServerDTO>("/mcp", { method: "POST", body: JSON.stringify(body) });
export const deleteMcp = (name: string) => bff<void>(`/mcp/${encodeURIComponent(name)}`, { method: "DELETE" });
export const testMcp = (name: string) => bff<{ ok: boolean; tools?: string[]; error?: string }>(`/mcp/${encodeURIComponent(name)}/test`, { method: "POST" });

// ---------- plugins ----------
export const listPlugins = () => bff<{ plugins: PluginDTO[] }>("/plugins");
export const togglePlugin = (slug: string, enabled: boolean) =>
  bff<{ ok: boolean }>(`/plugins/${encodeURIComponent(slug)}`, { method: "PUT", body: JSON.stringify({ enabled }) });

// ---------- design systems ----------
export const listDesignSystems = () => bff<{ systems: DesignSystemDTO[] }>("/design-systems");

// ---------- agent profiles ----------
export const listAgentProfiles = () => bff<{ agents: AgentProfileDTO[] }>("/agents");
export const upsertAgentProfile = (body: Record<string, unknown>) => bff<AgentProfileDTO>("/agents", { method: "POST", body: JSON.stringify(body) });
export const deleteAgentProfile = (slug: string) => bff<void>(`/agents/${encodeURIComponent(slug)}`, { method: "DELETE" });

// ---------- settings ----------
export const getSettings = () => bff<Record<string, unknown>>("/settings");
export const putSettings = (body: Record<string, unknown>) =>
  bff<Record<string, unknown>>("/settings", { method: "PUT", body: JSON.stringify(body) });

// ---------- usage ----------
export const getUsage = () => bff<UsageDTO>("/usage");

// ---------- session controls ----------
export const compactSession = (id: string, instructions?: string) =>
  bff<{ ok: boolean }>(`/projects/${id}/compact`, { method: "POST", body: JSON.stringify({ instructions }) });
export const sessionUsage = (id: string) => bff<{ usage: Record<string, number> }>(`/projects/${id}/usage`);
