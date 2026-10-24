/**
 * ZCode Protocol SDK (unofficial, reverse-engineered)
 * ---------------------------------------------------
 * A minimal, dependency-free Node.js client for the "ZCode Protocol" NDJSON
 * stdio app-server exposed by the ZCode agent core (`zcode.cjs app-server --stdio`).
 *
 * Transport : newline-delimited JSON (NDJSON) over stdin/stdout
 * Messages  : JSON-RPC-like envelopes (see docs/02-zcode-protocol.md)
 *   request      { id, method, params?, trace? }
 *   notification { method, params?, trace? }
 *   response     { id, result }
 *   error        { id, error: { code, message, data? } }
 *
 * The server can also initiate requests (string ids like "server-1"), which the
 * client MUST answer — most importantly `session/requestRuntimePreferences`
 * and the `interaction/*` family (permission prompts, user input, ...).
 */
'use strict';

const { spawn } = require('node:child_process');
const { EventEmitter } = require('node:events');
const path = require('node:path');
const os = require('node:os');

const PROTOCOL_NAME = 'ZCode Protocol';
const PROTOCOL_VERSION = 1;

/** RPC method table (zcodeProtocolMethods), extracted verbatim from the bundle. */
const Methods = {
  runtimeCapabilities: 'runtime/capabilities',
  computerUseOperationEvent: 'computer-use/operation-event',
  sessionCreate: 'session/create',
  sessionResume: 'session/resume',
  sessionList: 'session/list',
  sessionSubagents: 'session/subagents',
  sessionRequestRuntimePreferences: 'session/requestRuntimePreferences',
  sessionRead: 'session/read',
  sessionMessages: 'session/messages',
  sessionEvents: 'session/events',
  sessionDebug: 'session/debug',
  sessionSubscribe: 'session/subscribe',
  sessionSend: 'session/send',
  sessionStop: 'session/stop',
  sessionCancelBackgroundTask: 'session/cancelBackgroundTask',
  sessionFork: 'session/fork',
  sessionCompact: 'session/compact',
  sessionGoal: 'session/goal',
  sessionClose: 'session/close',
  sessionSetModel: 'session/setModel',
  sessionSetThoughtLevel: 'session/setThoughtLevel',
  sessionSetMode: 'session/setMode',
  workspaceReadPresentation: 'workspace/readPresentation',
  workspaceHookTrustGrant: 'workspace/hooks/trustGrant',
  providerUpdateAccountConfig: 'provider/updateAccountConfig',
  workspaceUpdateInteractionPreferences: 'workspace/updateInteractionPreferences',
  workspaceUpdateModelIoPreferences: 'workspace/updateModelIoPreferences',
  workspaceUpdateOffPeakToolPolicy: 'workspace/updateOffPeakToolPolicy',
  workspaceUpdateDynamicWorkflowPolicy: 'workspace/updateDynamicWorkflowPolicy',
  workspaceGenerateText: 'workspace/generateText',
  workspaceCancelGenerateText: 'workspace/cancelGenerateText',
  providerTestModelConnectivity: 'provider/testModelConnectivity',
  mcpList: 'mcp/list',
  pluginsList: 'plugins/list',
  pluginsReferenceCatalog: 'plugins/referenceCatalog',
  pluginsReferenceCatalogWithCategory: 'plugins/referenceCatalogWithCategory',
  skillsReferenceCatalog: 'skills/referenceCatalog',
  workflowsList: 'workflows/list',
  workflowsGet: 'workflows/get',
  workflowsUpdateMeta: 'workflows/updateMeta',
  workflowsDelete: 'workflows/delete',
  workflowsRuns: 'workflows/runs',
  workflowsMove: 'workflows/move',
  pluginsResolveSuggestedReference: 'plugins/resolveSuggestedReference',
  pluginsSetEnabled: 'plugins/setEnabled',
  pluginsOverview: 'plugins/overview',
  pluginsMarketplaceAdd: 'plugins/marketplace/add',
  pluginsMarketplaceRemove: 'plugins/marketplace/remove',
  pluginsMarketplaceUpdate: 'plugins/marketplace/update',
  pluginsInstall: 'plugins/install',
  pluginsCancelOperation: 'plugins/cancelOperation',
  pluginsUninstall: 'plugins/uninstall',
  pluginsUpdate: 'plugins/update',
  pluginsRestoreBuiltin: 'plugins/restoreBuiltin',
  pluginsConfigure: 'plugins/configure',
  pluginsResetConfig: 'plugins/resetConfig',
  pluginsValidate: 'plugins/validate',
  pluginsDescribe: 'plugins/describe',
  automationCreate: 'automation/create',
  automationUpdate: 'automation/update',
  automationCheckTaskBinding: 'automation/checkTaskBinding',
  automationList: 'automation/list',
  automationDelete: 'automation/delete',
  offPeakCreate: 'offPeak/create',
  offPeakList: 'offPeak/list',
  usageStats: 'usage/stats',
  sessionUsage: 'session/usage',
  processChildProcesses: 'process/childProcesses',
  interactionRequestPermission: 'interaction/requestPermission',
  interactionRequestUserInput: 'interaction/requestUserInput',
  interactionRequestProviderRuntimeHeaders: 'interaction/requestProviderRuntimeHeaders',
  interactionRequestOfficialMcpAuthHeaders: 'interaction/requestOfficialMcpAuthHeaders',
  interactionBrowserList: 'interaction/browserList',
  interactionBrowserExecute: 'interaction/browserExecute',
};

/** Notification table (zcodeProtocolNotifications) + observed extras. */
const Notifications = {
  storageStartup: 'startup/storageState',
  providerRuntimeHeadersCancelled: 'interaction/providerRuntimeHeadersCancelled',
  mcpTelemetry: 'process/mcpTelemetry',
  mcpResourceSamples: 'process/mcpResourceSamples',
  toolExecResource: 'process/toolExecResource',
  pluginOperationProgress: 'plugins/operationProgress',
  processResourceSample: 'process/resourceSample',
  // observed on the wire (desktop-continuous delivery):
  sessionEvent: 'session/event',
  stateUpdated: 'state.updated',
  computerUseOperationEvent: 'computer-use/operation-event',
  telemetryEvent: 'v4/telemetry/event',
};

/** Default answers for the server-initiated runtime preferences request. */
const DEFAULT_RUNTIME_PREFERENCES = {
  nativeSearchEnhancementsEnabled: true,
  memoryEnabled: false,
  askUserQuestionAutoResolutionEnabled: true,
  modelContextBudgetStrategy: 'preflight-v1',
};

class ZCodeProtocolError extends Error {
  constructor(message, rpcError) {
    super(message);
    this.name = 'ZCodeProtocolError';
    this.rpcError = rpcError;
  }
}

/**
 * Low-level NDJSON JSON-RPC-ish client over a spawned `zcode app-server --stdio`
 * process (or any duplex stream pair).
 *
 * Events emitted:
 *   'notification' (method, params)
 *   'request'      (method, params, id)   — for server-initiated requests
 *   'message'      (rawMessage)           — every parsed frame
 *   'exit'         (code, signal)
 *   'log'          (line)                 — child stderr lines
 */
class ZCodeProtocolClient extends EventEmitter {
  /**
   * @param {object} opts
   * @param {string} [opts.entry]       path to zcode.cjs (agent core bundle)
   * @param {string} [opts.nodeBin]     node >= 22.5 executable (needs node:sqlite)
   * @param {string[]} [opts.args]      extra CLI args (default ['app-server','--stdio'])
   * @param {object} [opts.env]         extra env vars
   * @param {string} [opts.cwd]         working directory for the child process
   * @param {string} [opts.builtinProviderConfig]  path to zcode-builtin.json
   * @param {string} [opts.personalProviderConfig] path to provider_config.json (personal providers)
   * @param {string} [opts.nativeModulesPath]      dir containing node-pty/ssh2 (app.asar.unpacked/node_modules)
   * @param {boolean} [opts.logger]     log frames to stderr
   */
  constructor(opts = {}) {
    super();
    this.opts = opts;
    this.child = null;
    this.nextId = 1;
    this.pending = new Map();
    this.requestHandlers = new Map();
    this.buffer = '';
    this.closed = false;
  }

  start() {
    if (this.child) throw new Error('already started');
    const o = this.opts;
    const nodeBin = o.nodeBin || process.execPath;
    const args = o.args || ['app-server', '--stdio'];
    const env = {
      ...process.env,
      ...(o.nativeModulesPath ? { NODE_PATH: o.nativeModulesPath } : {}),
      ...(o.builtinProviderConfig ? { ZCODE_BUILTIN_PROVIDER_CONFIG_FILE: o.builtinProviderConfig } : {}),
      ...(o.personalProviderConfig ? { ZCODE_PERSONAL_PROVIDER_CONFIG_FILE: o.personalProviderConfig } : {}),
      ...(o.env || {}),
    };
    this.child = spawn(nodeBin, [o.entry, ...args], { env, cwd: o.cwd, stdio: ['pipe', 'pipe', 'pipe'] });
    this.child.stdout.on('data', (d) => this._onData(d));
    this.child.stderr.on('data', (d) => {
      for (const line of String(d).split('\n')) if (line.trim()) this.emit('log', line);
    });
    this.child.on('exit', (code, signal) => {
      this.closed = true;
      for (const [, p] of this.pending) p.reject(new ZCodeProtocolError(`server exited (code=${code})`));
      this.pending.clear();
      this.emit('exit', code, signal);
    });
    return this;
  }

  _onData(chunk) {
    this.buffer += chunk.toString('utf8');
    let i;
    while ((i = this.buffer.indexOf('\n')) >= 0) {
      const line = this.buffer.slice(0, i).trim();
      this.buffer = this.buffer.slice(i + 1);
      if (!line) continue;
      let msg;
      try { msg = JSON.parse(line); } catch { continue; }
      this._dispatch(msg);
    }
  }

  _dispatch(msg) {
    this.emit('message', msg);
    const isResponse = 'id' in msg && ('result' in msg || 'error' in msg);
    if (isResponse) {
      const p = this.pending.get(msg.id);
      if (p) {
        this.pending.delete(msg.id);
        if ('error' in msg) p.reject(new ZCodeProtocolError(msg.error.message, msg.error));
        else p.resolve(msg.result);
      }
      return;
    }
    const isRequest = 'id' in msg && 'method' in msg;
    if (isRequest) {
      this.emit('request', msg.method, msg.params, msg.id);
      const handler = this.requestHandlers.get(msg.method) || this.requestHandlers.get('*');
      if (handler) {
        Promise.resolve()
          .then(() => handler(msg.params, msg.method))
          .then((result) => this.sendRaw({ id: msg.id, result: result === undefined ? {} : result }))
          .catch((err) => this.sendRaw({ id: msg.id, error: { code: -32603, message: String(err && err.message || err) } }));
      }
      return;
    }
    if ('method' in msg) this.emit('notification', msg.method, msg.params);
  }

  sendRaw(obj) {
    if (!this.child || this.closed) throw new Error('not running');
    this.child.stdin.write(JSON.stringify(obj) + '\n');
  }

  /** Send an RPC request; resolves with `result` or rejects with ZCodeProtocolError. */
  request(method, params, { timeoutMs = 60000 } = {}) {
    const id = this.nextId++;
    const msg = { id, method };
    if (params !== undefined) msg.params = params;
    return new Promise((resolve, reject) => {
      const timer = timeoutMs ? setTimeout(() => {
        if (this.pending.delete(id)) reject(new ZCodeProtocolError(`timeout: ${method}`));
      }, timeoutMs) : null;
      this.pending.set(id, {
        resolve: (v) => { if (timer) clearTimeout(timer); resolve(v); },
        reject: (e) => { if (timer) clearTimeout(timer); reject(e); },
      });
      try { this.sendRaw(msg); } catch (e) { this.pending.delete(id); reject(e); }
    });
  }

  notify(method, params) {
    const msg = { method };
    if (params !== undefined) msg.params = params;
    this.sendRaw(msg);
  }

  /** Register a handler for server-initiated requests ('*' = fallback). */
  onRequest(method, handler) {
    this.requestHandlers.set(method, handler);
    return this;
  }

  /** Wait until the SQLite store reports `phase: "ready"` (or fail). */
  async waitForReady({ timeoutMs = 30000 } = {}) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { off(); reject(new Error('timeout waiting for storage ready')); }, timeoutMs);
      const onNotif = (method, params) => {
        if (method === Notifications.storageStartup && params && params.phase === 'ready') {
          off(); resolve(params);
        } else if (method === Notifications.storageStartup && params && params.phase === 'failed') {
          off(); reject(new Error('storage failed: ' + JSON.stringify(params)));
        }
      };
      const off = () => { clearTimeout(timer); this.off('notification', onNotif); };
      this.on('notification', onNotif);
    });
  }

  stop() {
    if (this.child && !this.closed) { try { this.child.stdin.end(); } catch {} this.child.kill('SIGTERM'); }
  }
}

/** Workspace reference object required by most params. */
function workspaceRef(workspacePath, opts = {}) {
  return {
    workspacePath,
    workspaceKey: opts.workspaceKey || workspacePath,
    ...(opts.workspaceIdentity ? { workspaceIdentity: opts.workspaceIdentity } : {}),
    ...(opts.remoteSessionId ? { remoteSessionId: opts.remoteSessionId } : {}),
  };
}

/**
 * High-level session wrapper: create/subscribe/send + structured event decoding.
 *
 * Decoded events emitted:
 *   'text'        (deltaText)        assistant text streaming
 *   'tool-call'   ({toolCallId, toolName, input})
 *   'tool-result' ({toolCallId, toolName, output, isError})
 *   'status'      (status)           idle|running|waiting|paused|completed|error
 *   'turn'        (phaseInfo)        turn started/failed/completed
 *   'permission'  (requestParams)    (also answered automatically when autoApprove)
 *   'raw-event'   (eventPayload)     every session/event payload
 *   'state'       (stateUpdated)     state.updated snapshots
 */
class ZCodeSession extends EventEmitter {
  constructor(client, sessionId, workspace) {
    super();
    this.client = client;
    this.sessionId = sessionId;
    this.workspace = workspace;
    this._subscribed = false;
  }

  /** Create + subscribe + wire events. */
  static async create(client, opts = {}) {
    const ws = workspaceRef(opts.workspacePath, opts.workspace);
    const params = {
      workspace: ws,
      ...(opts.mode ? { mode: opts.mode } : {}),
      ...(opts.model ? { model: opts.model } : {}),
      ...(opts.thoughtLevel ? { thoughtLevel: opts.thoughtLevel } : {}),
      ...(opts.persistence ? { persistence: opts.persistence } : {}),
      ...(opts.mcpServers ? { mcpServers: opts.mcpServers } : {}),
      ...(opts.toolAllowlist ? { toolAllowlist: opts.toolAllowlist } : {}),
      ...(opts.toolDenylist ? { toolDenylist: opts.toolDenylist } : {}),
      ...(opts.dynamicWorkflowEnabled !== undefined ? { dynamicWorkflowEnabled: opts.dynamicWorkflowEnabled } : {}),
      ...(opts.offPeakToolEnabled !== undefined ? { offPeakToolEnabled: opts.offPeakToolEnabled } : {}),
    };
    const res = await client.request(Methods.sessionCreate, params);
    const sessionId = res.session.sessionId;
    const session = new ZCodeSession(client, sessionId, ws);
    session.createResult = res;
    await session.subscribe();
    return session;
  }

  static async resume(client, sessionId, opts = {}) {
    const params = { sessionId, ...(opts.workspace ? { workspace: workspaceRef(opts.workspacePath, opts.workspace) } : {}) };
    const res = await client.request(Methods.sessionResume, params);
    const session = new ZCodeSession(client, sessionId, opts.workspacePath ? workspaceRef(opts.workspacePath, opts.workspace) : null);
    session.resumeResult = res;
    await session.subscribe();
    return session;
  }

  async subscribe(deliveryKind = 'desktop-continuous') {
    const res = await this.client.request(Methods.sessionSubscribe, {
      sessionId: this.sessionId,
      deliveryKind,
      includeSnapshot: true,
    });
    this._subscribed = true;
    this.snapshot = res.snapshot;
    return res;
  }

  /** Send a user message; returns { accepted, stateRevision }. */
  async send(content, opts = {}) {
    return this.client.request(Methods.sessionSend, {
      sessionId: this.sessionId,
      content,
      ...(opts.modelSelection ? { modelSelection: opts.modelSelection } : {}),
      ...(opts.attachments ? { attachments: opts.attachments } : {}),
      ...(opts.inputId ? { inputId: opts.inputId } : {}),
      ...(opts.toolDenylist ? { toolDenylist: opts.toolDenylist } : {}),
    });
  }

  async stop() { return this.client.request(Methods.sessionStop, { sessionId: this.sessionId }); }
  async compact(instructions) {
    return this.client.request(Methods.sessionCompact, { sessionId: this.sessionId, ...(instructions ? { instructions } : {}) });
  }
  async setMode(mode) { return this.client.request(Methods.sessionSetMode, { sessionId: this.sessionId, mode }); }
  async setModel(model) { return this.client.request(Methods.sessionSetModel, { sessionId: this.sessionId, model }); }
  async messages(opts = {}) { return this.client.request(Methods.sessionMessages, { sessionId: this.sessionId, ...opts }); }
  async close() { return this.client.request(Methods.sessionClose, { sessionId: this.sessionId }); }

  /** Decode raw session/event payloads into friendly events. Call once. */
  startDecoding() {
    if (this._decoding) return this;
    this._decoding = true;
    this.client.on('notification', (method, params) => {
      if (method === Notifications.sessionEvent && params && params.sessionId === this.sessionId) {
        this._decodeEvent(params.payload || params.event || params);
        this.emit('raw-event', params);
      } else if (method === Notifications.stateUpdated) {
        this.emit('state', params);
      }
    });
    return this;
  }

  /**
   * Decode session/event payloads (verified against ZCode 3.14.0 / cli 0.16.9).
   * The wire uses `kind` discriminators on payload objects:
   *   text_delta        {assistantMessageId, delta, done}
   *   reasoning_delta   {assistantMessageId, delta, done}
   *   tool_input_start  {assistantMessageId, toolCallId, toolName}
   *   tool_input_delta  {assistantMessageId, toolCallId, delta}
   *   tool_input_end    {assistantMessageId, toolCallId}
   *   tool_call         {assistantMessageId, toolCallId, toolName, input}
   *   scheduled         {toolCallId, toolName, schedule, parallelGroupIndex}
   *   started           {toolCallId, toolName, startedAt, readOnly, sideEffectScope}
   *   result            {toolCallId, result: {success, content, perf, ...}, duration}
   *   batch             {toolCallIds, successCount, errorCount}
   *   tool_result       {anchorId, toolCallId, toolName, resultPartId, committedAt}
   *   model_request_started / model_request_completed  (telemetry incl. headers)
   *   (no kind)         title updates {title, previousTitle, source}
   */
  _decodeEvent(ev) {
    if (!ev) return;
    const kind = ev.kind || ev.type;
    switch (kind) {
      case 'text_delta':
        this.emit('text', ev.delta, ev);
        break;
      case 'reasoning_delta':
        this.emit('reasoning', ev.delta, ev);
        break;
      case 'tool_input_start':
        this.emit('tool-input-start', { toolCallId: ev.toolCallId, toolName: ev.toolName }, ev);
        break;
      case 'tool_input_delta':
        this.emit('tool-input-delta', { toolCallId: ev.toolCallId, delta: ev.delta }, ev);
        break;
      case 'tool_call':
        this._toolNames = this._toolNames || new Map();
        this._toolNames.set(ev.toolCallId, ev.toolName);
        this.emit('tool-call', { toolCallId: ev.toolCallId, toolName: ev.toolName, input: ev.input }, ev);
        break;
      case 'scheduled':
        this.emit('tool-scheduled', ev, ev);
        break;
      case 'started':
        this.emit('tool-started', { toolCallId: ev.toolCallId, toolName: ev.toolName }, ev);
        break;
      case 'result':
        this.emit('tool-result', {
          toolCallId: ev.toolCallId,
          toolName: ev.toolName || (this._toolNames && this._toolNames.get(ev.toolCallId)),
          output: ev.result?.content,
          success: ev.result?.success,
          isError: ev.result ? !ev.result.success : undefined,
          result: ev.result,
          duration: ev.duration,
        }, ev);
        break;
      case 'batch':
        this.emit('tool-batch', ev, ev);
        break;
      case 'tool_result':
        this.emit('tool-committed', { toolCallId: ev.toolCallId, toolName: ev.toolName }, ev);
        break;
      case 'model_request_started':
      case 'model_request_completed':
        this.emit('model-request', { kind, providerId: ev.providerId, modelId: ev.modelId, turnId: ev.turnId, requestId: ev.requestId }, ev);
        break;
      case undefined:
        if (ev.title !== undefined) this.emit('title', { title: ev.title, source: ev.source }, ev);
        break;
      default:
        break;
    }
  }
}

/** Convenience: build a client with the desktop-equivalent env + auto answers. */
function createClient(opts = {}) {
  const client = new ZCodeProtocolClient(opts);
  client.onRequest(Methods.sessionRequestRuntimePreferences, () => ({ ...DEFAULT_RUNTIME_PREFERENCES, ...(opts.runtimePreferences || {}) }));
  if (opts.autoApprovePermissions !== false) {
    client.onRequest(Methods.interactionRequestPermission, (params) => {
      const allow = (params.options || []).find((o) => o.kind === 'allow') || (params.options || [])[0];
      return { decision: opts.permissionDecision || 'allow', reason: opts.permissionReason || 'auto-approved by SDK', ...(allow ? { optionId: allow.optionId } : {}) };
    });
  }
  client.onRequest(Methods.interactionRequestUserInput, (params) => {
    const first = (params.questions || []).length ? {} : {};
    return opts.userInputAnswer ? opts.userInputAnswer(params) : first;
  });
  return client;
}

module.exports = {
  PROTOCOL_NAME,
  PROTOCOL_VERSION,
  Methods,
  Notifications,
  DEFAULT_RUNTIME_PREFERENCES,
  ZCodeProtocolClient,
  ZCodeSession,
  ZCodeProtocolError,
  workspaceRef,
  createClient,
};
