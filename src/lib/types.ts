// ZCode Builder — shared domain types (contract between UI and agent-service)

// ---------- Message parts ----------
export type TextPart = { type: "text"; text: string };
export type ReasoningPart = { type: "reasoning"; text: string; durationMs?: number };
export type ToolInvocationPart = {
  type: "tool-invocation";
  id: string; // toolCallId
  toolName: string;
  state: "input-streaming" | "input-available" | "running" | "output-available" | "error";
  input?: unknown;
  argsText?: string; // incremental raw args while streaming
  output?: unknown;
  isError?: boolean;
  durationMs?: number;
  riskLevel?: string;
  readOnly?: boolean;
};
export type DelegationPart = {
  type: "delegation";
  taskId?: string;
  agent: string;
  phase: "spawned" | "activity" | "stopped";
  text?: string;
  color?: string;
  status?: string;
  subagentId?: string;
};
export type PlanPart = {
  type: "plan";
  todos: { id: string; content: string; status: "pending" | "in_progress" | "completed" | "cancelled" }[];
};
export type QuestionPart = {
  type: "question";
  requestId: string;
  prompt?: string;
  questions: { id: string; question: string; options?: { value: string; label: string }[] }[];
  answered?: { action: string; content?: Record<string, string> };
};
export type ApprovalPart = {
  type: "approval";
  requestId: string;
  toolName: string;
  input?: unknown;
  riskLevel?: string;
  reason?: string;
  resolved?: "allow" | "deny";
};
export type CheckpointPart = { type: "checkpoint"; id: string; label: string; commitHash?: string };
export type DiffPart = { type: "diff"; path: string; additions: number; deletions: number };
export type FileChipPart = { type: "file-chip"; path: string; action?: "read" | "write" | "edit" };
export type AttachmentPart = { type: "attachment"; name: string; mime: string; size: number; path: string };
export type PickedElementPart = { type: "picked-element"; pick: PickedElement };

export type MessagePart =
  | TextPart
  | ReasoningPart
  | ToolInvocationPart
  | DelegationPart
  | PlanPart
  | QuestionPart
  | ApprovalPart
  | CheckpointPart
  | DiffPart
  | FileChipPart
  | AttachmentPart
  | PickedElementPart;

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  parts: MessagePart[];
  createdAt: string;
  streaming?: boolean;
  stats?: { toolCount: number; failedTools: number; durationMs: number; tokens?: number };
}

// ---------- Events ----------
export type AgentEventKind =
  | "status"
  | "sandbox"
  | "devserver"
  | "preview"
  | "git"
  | "terminal"
  | "console"
  | "artifacts"
  | "error"
  | "filetree"
  | "swarm"
  | "checkpoint"
  | "usage";

export interface AgentEvent {
  id: string;
  kind: AgentEventKind;
  payload: Record<string, unknown>;
  seq: number;
  createdAt: string;
}

// ---------- Project ----------
export interface ProjectDTO {
  id: string;
  title: string;
  mode: string;
  framework: string;
  modeConfig: Record<string, unknown>;
  status: string;
  sandboxId: string | null;
  sandboxStatus: string;
  sandboxRuntime: "local" | "e2b";
  agentMode: string;
  swarmEnabled: boolean;
  instructions: string | null;
  githubRepo: string | null;
  githubBranch: string | null;
  hue: number;
  coreSessionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FileNode {
  path: string;
  name: string;
  type: "file" | "dir";
  size?: number;
  children?: FileNode[];
  modified?: boolean;
  added?: boolean;
}

export interface ArtifactDTO {
  id: string;
  name: string;
  path: string;
  type: string;
  mime: string;
  size: number;
  createdAt: string;
}

export interface CheckpointDTO {
  id: string;
  label: string;
  commitHash: string | null;
  createdAt: string;
}

export interface GitLogEntry {
  hash: string;
  short: string;
  message: string;
  author: string;
  date: string;
}

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: { path: string; status: string }[];
  unstaged: { path: string; status: string }[];
  untracked: { path: string }[];
}

export interface DevServerState {
  status: "stopped" | "installing" | "starting" | "ready" | "error";
  command?: string;
  port?: number;
  url?: string; // local preview url (proxied) or cloud url for e2b
  cloudUrl?: string;
  error?: string;
}

/** A port the project has something listening on (for the preview port selector). */
export interface DevServerPort {
  port: number;
  managed: boolean; // true = the platform-managed dev server
  cmd: string; // process command line (label)
}

/** A file attached from the composer (sent with the next message). */
export interface ChatAttachment {
  id: string;
  name: string;
  mime: string;
  size: number;
  dataBase64: string;
}

export interface SandboxState {
  runtime: "local" | "e2b";
  status: string;
  sandboxId: string | null;
  template?: string;
  error?: string;
}

// ---------- Swarm ----------
export interface SwarmTaskDTO {
  id: string;
  nodeKey: string;
  subject: string;
  description: string;
  role: string;
  lane: string;
  filePaths: string[];
  dependsOn: string[];
  acceptance: string[];
  status: string;
  owner: string | null;
  result: string | null;
  error: string | null;
  attempts: number;
}

export interface SwarmWorkerDTO {
  id: string;
  slug: string;
  role: string;
  status: string;
  currentTask: string | null;
}

export interface SwarmRunDTO {
  id: string;
  goal: string;
  status: string;
  planMd: string;
  summary: string;
  error: string | null;
  tasks: SwarmTaskDTO[];
  workers: SwarmWorkerDTO[];
  events: { id: string; type: string; payload: Record<string, unknown>; createdAt: string }[];
}

// ---------- Config ----------
export interface ModeDTO {
  slug: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  frameworks: string[];
  samplePrompts: string[];
  swarmAllowed: boolean;
  isBuiltin: boolean;
}

export interface ProviderDTO {
  id: string;
  providerId: string;
  providerName: string;
  baseUrl: string;
  apiType: string;
  models: { modelId: string; contextWindow?: number; supportsImages?: boolean }[];
  enabled: boolean;
  isBuiltin: boolean;
  hasKey: boolean;
}

export interface ModelOption {
  id: string; // "providerId::modelId"
  providerId: string;
  modelId: string;
  label: string;
  builtin: boolean;
}

export interface SkillDTO {
  slug: string;
  name: string;
  description: string;
  source: string;
  scope: string;
  enabled: boolean;
}

export interface McpServerDTO {
  id: string;
  name: string;
  type: string;
  command: string;
  args: string[];
  url: string;
  enabled: boolean;
  status: string;
  tools: string[];
}

export interface PluginDTO {
  slug: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  source: string;
  skills: string[];
}

export interface DesignSystemDTO {
  slug: string;
  name: string;
  category: string;
  description: string;
  tokens?: string; // tokens.css content (for preview chips)
}

export interface AgentProfileDTO {
  id: string;
  slug: string;
  name: string;
  systemPrompt: string;
  color: string;
  maxTurns: number;
  enabled: boolean;
  spawnCount: number;
  modelProvider: string;
  modelId: string;
}

export interface UsageDTO {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  modelRequestCount: number;
  modelErrorCount: number;
  projects: number;
  messages: number;
}

export interface HydratePayload {
  project: ProjectDTO;
  sessionId: string | null;
  sessions: SessionDTO[];
  messages: ChatMessage[];
  events: AgentEvent[];
  artifacts: ArtifactDTO[];
  checkpoints: CheckpointDTO[];
  /** project-wide major checkpoints (Version history) */
  versions: CheckpointDTO[];
  /** live turn state — lets a reload re-attach to a still-working agent */
  turn: { active: boolean; liveId: string | null; parts: MessagePart[]; startedAt: number | null };
  /** unresolved permission / question waiting on the user */
  pending: ({ type: "permission" | "question" } & Record<string, unknown>) | null;
  fileTree: FileNode[];
  sandbox: SandboxState;
  devServer: DevServerState;
  swarmRun: SwarmRunDTO | null;
  usage: { contextUsed: number; contextWindow: number; totalTokens: number } | null;
}

// ---------- chat sessions ("tasks" on one project) ----------
export interface SessionDTO {
  id: string;
  title: string;
  isActive: boolean;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

// ---------- Composer ----------
export interface ComposerConfig {
  mode: string;
  framework: string;
  designSystem: string | null;
  style: string | null;
  skills: string[];
  mcps: string[];
  swarm: boolean;
  swarmAgents: number;
  agentMode: "plan" | "build" | "edit" | "yolo" | "auto";
}

// ---------- Element picker ----------
export interface PickedElement {
  id: string;
  selector: string;
  tag: string;
  text?: string;
  styles?: Record<string, string>;
  instructions?: string;
}

// ---------- Socket payloads ----------
export interface SocketMessageDelta {
  messageId: string;
  delta: string;
}
export interface SocketMessagePart {
  messageId: string;
  part: MessagePart;
}
export interface SocketMessageFinal {
  id: string;
  liveId: string;
  role: "assistant";
  parts: MessagePart[];
  stats?: ChatMessage["stats"];
}
export interface SocketAgentEvent {
  id: string;
  kind: AgentEventKind;
  payload: Record<string, unknown>;
  seq: number;
  createdAt: string;
}
export interface SocketPermissionRequest {
  requestId: string;
  projectId: string;
  toolName: string;
  input?: unknown;
  riskLevel?: string;
  reason?: string;
}
export interface SocketQuestionRequest {
  requestId: string;
  projectId: string;
  prompt?: string;
  questions: { id: string; question: string; options?: { value: string; label: string }[] }[];
}
export interface SocketTerminalData {
  stream: "stdout" | "stderr";
  data: string;
}
