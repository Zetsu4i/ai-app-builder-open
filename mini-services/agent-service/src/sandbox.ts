// agent-service — sandbox manager: E2B cloud sandboxes with graceful LOCAL fallback.
// E2B mode runs the FULL zcode core inside the sandbox via stdio-over-HTTP relay (runtime/relay.mjs).
// The relay ALSO serves the z-ai LLM bridge (/llm/v1/*) — the sandbox has no other route to a provider.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { db } from "./db";
import {
  CORE_EXTRACTED_DIR,
  DEV_SERVER_PORT_MIN,
  DEV_SERVER_PORT_MAX,
  projectWorkspaceDir,
} from "./config";

type SandboxLike = {
  sandboxId: string;
  files: {
    write(path: string, data: Buffer | string): Promise<unknown>;
    read(path: string, opts?: Record<string, unknown>): Promise<Buffer | Uint8Array | string>;
  };
  commands: {
    run(cmd: string, opts?: Record<string, unknown>): Promise<unknown>;
  };
  getHost(port: number): string;
  setTimeout(ms: number): Promise<unknown>;
  kill(): Promise<unknown>;
};

interface Entry {
  sandbox: SandboxLike;
  projectId: string;
  template: string;
  runtimeReady: boolean;
  keepalive?: ReturnType<typeof setInterval>;
  monitor?: ReturnType<typeof setInterval>;
  devServer?: { port: number; status: string; cloudUrl?: string };
  booting?: Promise<SandboxBootResult> | null;
  relayFails: number;
  devFails: number;
  restartingDev: boolean;
  reprovisioning?: boolean;
}

const sandboxes = new Map<string, Entry>();

const lastBootFail = new Map<string, number>();
/** True when a boot attempt failed recently — lets turns proceed locally without permanently pinning the project. */
export function bootRecentlyFailed(projectId: string): boolean {
  const t = lastBootFail.get(projectId);
  return !!t && Date.now() - t < 10 * 60_000;
}

// ---------------- event bridge (wired from index.ts to avoid import cycles) ----------------

type SandboxEventFn = (projectId: string, kind: string, payload: Record<string, unknown>) => Promise<void> | void;
let emitEvent: SandboxEventFn = async () => {};
export function setSandboxEvents(fn: SandboxEventFn): void {
  emitEvent = fn;
}

function consoleEvent(projectId: string, text: string, level: "info" | "warn" | "error" = "info"): void {
  void emitEvent(projectId, "console", { level, text: `[sandbox] ${text}` });
}

// ---------------- key & template resolution ----------------

export function e2bConfigured(): boolean {
  return !!resolveKey();
}

function resolveKey(): string | null {
  const env = process.env.E2B_API_KEY;
  if (env && env.startsWith("e2b_")) return env;
  return null;
}

export async function resolveKeyFromSettings(): Promise<string | null> {
  const direct = resolveKey();
  if (direct) return direct;
  try {
    const s = await db.setting.findUnique({ where: { key: "e2b" } });
    if (s?.value) {
      const v = JSON.parse(s.value) as { apiKey?: string } | string;
      const key = typeof v === "string" ? v : v.apiKey;
      if (key && key.startsWith("e2b_")) return key;
    }
  } catch {
    /* noop */
  }
  return null;
}

export function templateForMode(mode: string): string {
  const envKey = `E2B_TEMPLATE_${mode.toUpperCase().replace(/[^A-Z]/g, "_")}`;
  return process.env[envKey] || process.env.E2B_TEMPLATE || "code-interpreter-v1";
}

// ---------------- relay helpers ----------------

// must match RELAY_VERSION in runtime/relay.mjs — bump both together
const RELAY_VERSION = 2;

async function relayHealth(sb: SandboxLike, timeoutMs = 4000): Promise<boolean> {
  try {
    const host = sb.getHost(4777);
    const res = await fetch(`https://${host}/health`, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return false;
    const body = (await res.json()) as { ok?: boolean; exited?: boolean; v?: number };
    return body.ok === true && body.exited !== true && body.v === RELAY_VERSION;
  } catch {
    return false;
  }
}

async function probeSandboxAlive(sb: SandboxLike): Promise<boolean> {
  try {
    const r = (await sb.commands.run("echo alive", { timeoutMs: 8000 })) as { stdout?: string };
    return String(r.stdout || "").includes("alive");
  } catch {
    return false;
  }
}

// ---------------- sandbox acquisition (create / reconnect / re-provision) ----------------

async function acquireSandbox(projectId: string, mode: string, key: string): Promise<{ sb: SandboxLike; fresh: boolean; reused: boolean }> {
  const { Sandbox } = await import("e2b");

  // 1) in-memory entry exists → validate it is still alive
  const existing = sandboxes.get(projectId);
  if (existing) {
    if (existing.runtimeReady && (await relayHealth(existing.sandbox))) return { sb: existing.sandbox, fresh: false, reused: true };
    if (await probeSandboxAlive(existing.sandbox)) return { sb: existing.sandbox, fresh: false, reused: true };
    teardownEntry(existing, "sandbox lost (health check failed)");
  }

  // 2) reconnect to the sandbox recorded on the project (service restart / page reload)
  try {
    const row = await db.project.findUnique({ where: { id: projectId }, select: { sandboxId: true } });
    if (row?.sandboxId) {
      const sb = (await Sandbox.connect(row.sandboxId, { apiKey: key, timeoutMs: 20 * 60_000 })) as unknown as SandboxLike;
      if (await probeSandboxAlive(sb)) {
        if (await relayHealth(sb)) return { sb, fresh: false, reused: true };
        // sandbox alive but relay dead → re-provision runtime inside it
        consoleEvent(projectId, `reconnecting to sandbox ${row.sandboxId.slice(0, 12)} — re-provisioning relay…`);
        await uploadRuntime(sb);
        const nodeBin = await ensureNode(sb);
        await startRelay(sb, nodeBin);
        return { sb, fresh: false, reused: true };
      }
    }
  } catch {
    /* recorded sandbox is gone → fall through to a fresh create */
  }

  // 3) fresh sandbox
  const template = templateForMode(mode);
  const sb = (await Sandbox.create(template, {
    apiKey: key,
    timeoutMs: 20 * 60_000,
    metadata: { projectId, mode, builder: "zcode-builder" },
  })) as unknown as SandboxLike;
  return { sb, fresh: true, reused: false };
}

async function getSandbox(projectId: string, mode: string, key: string): Promise<SandboxLike> {
  const existing = sandboxes.get(projectId);
  if (existing && existing.runtimeReady) return existing.sandbox;
  const { sb, fresh, reused } = await acquireSandbox(projectId, mode, key);
  const entry: Entry = sandboxes.get(projectId) ?? {
    sandbox: sb,
    projectId,
    template: templateForMode(mode),
    runtimeReady: false,
    relayFails: 0,
    devFails: 0,
    restartingDev: false,
  };
  entry.sandbox = sb;
  entry.relayFails = 0;
  entry.devFails = 0;
  if (!entry.keepalive) {
    entry.keepalive = setInterval(() => {
      sb.setTimeout(20 * 60_000).catch(() => {
        teardownEntry(entry, "sandbox lease could not be renewed");
      });
    }, 4 * 60_000);
  }
  if (!entry.monitor) startEntryMonitor(entry);
  sandboxes.set(projectId, entry);
  if (!entry.runtimeReady) {
    consoleEvent(projectId, fresh ? "provisioning sandbox runtime…" : reused ? "sandbox runtime restored" : "provisioning sandbox runtime…");
    await uploadRuntime(sb);
    const nodeBin = await ensureNode(sb);
    await startRelay(sb, nodeBin);
    entry.runtimeReady = true;
    consoleEvent(projectId, `sandbox ready (${entry.template}) — agent core + LLM bridge online`);
  }
  return sb;
}

// ---------------- runtime provisioning ----------------

async function uploadRuntime(sb: SandboxLike): Promise<void> {
  // tar.gz the extracted core (no pretty bundle) and upload once
  const proc = Bun.spawnSync(["tar", "czf", "/tmp/zc-runtime.tgz", "-C", path.dirname(CORE_EXTRACTED_DIR), path.basename(CORE_EXTRACTED_DIR)]);
  if (proc.exitCode !== 0) throw new Error("failed to tar agent core");
  const bytes = fs.readFileSync("/tmp/zc-runtime.tgz");
  await sb.commands.run("mkdir -p /home/user/.zc /home/user/workspace");
  await sb.files.write("/home/user/.zc/zc-runtime.tgz", bytes);
  const relay = fs.readFileSync(path.join(import.meta.dir, "..", "runtime", "relay.mjs"), "utf8");
  await sb.files.write("/home/user/.zc/relay.mjs", relay);
  await sb.commands.run("cd /home/user/.zc && tar xzf zc-runtime.tgz && rm zc-runtime.tgz && ln -sfn plugins extracted/packages");
  // z-ai credentials so the in-sandbox relay can serve the LLM bridge
  const zaiCfg = readHostZaiConfig();
  if (zaiCfg) await sb.files.write("/home/user/.zc/.z-ai-config", zaiCfg);
  // provider config generated from the DB (BYOK included); LLM baseUrls are rewritten
  // to the in-sandbox relay (the host's 127.0.0.1:3031 bridge is unreachable from here)
  try {
    const { writeProviderConfig } = await import("./runtime");
    const cfgPath = await writeProviderConfig();
    const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8")) as Record<string, unknown>;
    rewriteProviderBaseUrls(cfg);
    await sb.files.write("/home/user/.zc/provider_config.json", JSON.stringify(cfg, null, 2));
  } catch (e) {
    console.warn("[sandbox] provider config upload failed (BYOK unavailable in sandbox):", (e as Error).message);
  }
}

function readHostZaiConfig(): string | null {
  const candidates = [
    process.env.Z_AI_CONFIG_FILE,
    path.join(process.cwd(), ".z-ai-config"),
    path.join(os.homedir(), ".z-ai-config"),
    "/etc/.z-ai-config",
  ].filter(Boolean) as string[];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
    } catch {
      /* try next */
    }
  }
  return null;
}

/** Point every personal-provider baseUrl that references the host bridge at the in-sandbox relay. */
function rewriteProviderBaseUrls(cfg: Record<string, unknown>): void {
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (node && typeof node === "object") {
      const obj = node as Record<string, unknown>;
      const api = obj.api as Record<string, unknown> | undefined;
      if (api && typeof api.baseUrl === "string" && /127\.0\.0\.1:(3031|4777)/.test(api.baseUrl)) {
        api.baseUrl = "http://127.0.0.1:4777/llm/v1";
      }
      Object.values(obj).forEach(visit);
    }
  };
  visit(cfg);
}

/** Ensure a Node >= 22 runtime inside the sandbox. Returns the node binary to use (or "node" if system is fine). */
async function ensureNode(sb: SandboxLike): Promise<string> {
  const check = await sb.commands.run("node --version 2>/dev/null || echo none", { timeoutMs: 15000 });
  const version = String((check as { stdout?: string }).stdout || "").trim();
  const major = Number(version.replace("v", "").split(".")[0] || "0");
  if (version !== "none" && major >= 22) return "node";
  consoleEvent(sb.sandboxId, "installing Node 22 in sandbox…");
  // Official tarball into the user's home (/opt is root-owned in the sandbox image; gzip variant needs no xz)
  await sb.commands.run(
    "mkdir -p /home/user/.zc/node22 && curl -fsSL https://nodejs.org/dist/v22.20.0/node-v22.20.0-linux-x64.tar.gz -o /tmp/node22.tar.gz && tar xzf /tmp/node22.tar.gz -C /home/user/.zc/node22 --strip-components=1 && rm /tmp/node22.tar.gz && /home/user/.zc/node22/bin/node --version",
    { timeoutMs: 300000 },
  );
  const after = await sb.commands.run("/home/user/.zc/node22/bin/node --version", { timeoutMs: 15000 });
  const v2 = String((after as { stdout?: string }).stdout || "").trim();
  if (!v2.startsWith("v22")) throw new Error(`node bootstrap failed (${v2})`);
  return "/home/user/.zc/node22/bin/node";
}

async function startRelay(sb: SandboxLike, nodeBin: string): Promise<string> {
  // idempotent: replace any already-running relay (old version / crashed core) first.
  // NOTE: the [r] trick keeps pkill from matching its own command line.
  await sb.commands.run("pkill -f '[r]elay.mjs' 2>/dev/null; sleep 0.5; pkill -9 -f '[r]elay.mjs' 2>/dev/null; true", { timeoutMs: 15000 });
  await sb.commands.run(`cd /home/user/.zc && (nohup ${nodeBin} relay.mjs > relay.log 2>&1 &)`, { timeoutMs: 15000 });
  const host = sb.getHost(4777);
  const url = `https://${host}`;
  for (let i = 0; i < 40; i++) {
    if (await relayHealth(sb)) return url;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("relay health timeout");
}

// ---------------- lifecycle monitors ----------------

/** Injects server.allowedHosts=true into the workspace vite config (cloud preview host check). */
const VITE_PATCH_SCRIPT = `\
const fs = require("fs");
for (const f of ["vite.config.ts", "vite.config.js", "vite.config.mjs"]) {
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, "utf8");
  if (/allowedHosts/.test(s)) continue;
  if (/server\\s*:\\s*\\{/.test(s)) {
    s = s.replace(/server\\s*:\\s*\\{/, "server: { allowedHosts: true,");
  } else {
    s = s.replace(/export default defineConfig\\(\\{/, "export default defineConfig({\\n  server: { allowedHosts: true },");
  }
  fs.writeFileSync(f, s);
  console.log("[patch-vite] allowedHosts injected into " + f);
}
`;

const DEV_ERROR_PATTERNS = [
  /SyntaxError/i, /ReferenceError/i, /TypeError:/i, /Cannot find module/i,
  /EADDRINUSE/i, /EACCES/i, /Module not found/i, /Failed to compile/i,
  /error TS\d+/i, /ERR_MODULE_NOT_FOUND/i, /EPERM/i, /ENOENT/i,
];

function startEntryMonitor(entry: Entry): void {
  entry.monitor = setInterval(async () => {
    try {
      // relay liveness (2 consecutive fails → teardown; next turn re-provisions)
      const ok = await relayHealth(entry.sandbox, 6000);
      if (!ok) {
        entry.relayFails += 1;
        if (entry.relayFails === 1) consoleEvent(entry.projectId, "relay unreachable — checking sandbox…", "warn");
        if (entry.relayFails >= 3) {
          const alive = await probeSandboxAlive(entry.sandbox).catch(() => false);
          if (!alive) {
            teardownEntry(entry, "sandbox expired — it will be re-provisioned on the next task");
            return;
          }
          // relay process died inside a live sandbox → re-provision it in place
          if (!entry.reprovisioning) {
            entry.reprovisioning = true;
            consoleEvent(entry.projectId, "relay died inside a live sandbox — re-provisioning…", "warn");
            try {
              await uploadRuntime(entry.sandbox);
              const nodeBin = await ensureNode(entry.sandbox);
              await startRelay(entry.sandbox, nodeBin);
              entry.runtimeReady = true;
              entry.relayFails = 0;
              consoleEvent(entry.projectId, "relay re-provisioned — back online");
            } catch (e) {
              teardownEntry(entry, `relay re-provision failed: ${(e as Error).message} — will re-provision on the next task`);
            } finally {
              entry.reprovisioning = false;
            }
          }
        }
        return;
      }
      entry.relayFails = 0;

      // dev-server liveness: the in-sandbox LISTENER is the truth (the e2b public
      // proxy 502s during warmup and would cause false restarts). 3 consecutive
      // dead checks → restart with a console note.
      if (entry.devServer && (entry.devServer.status === "ready" || entry.devServer.status === "starting") && !entry.restartingDev) {
        let up = false;
        try {
          const chk = (await entry.sandbox.commands.run(
            `ss -ltn 2>/dev/null | grep -q ':${entry.devServer.port} ' && echo UP || echo DOWN`,
            { timeoutMs: 8000 },
          )) as { stdout?: string };
          up = String(chk.stdout || "").includes("UP");
        } catch {
          /* transient — don't count it */
          up = true;
        }
        if (up) {
          entry.devFails = 0;
          if (entry.devServer.status === "starting") {
            entry.devServer.status = "ready";
            void emitEvent(entry.projectId, "devserver", { status: "ready", cloudUrl: entry.devServer.cloudUrl });
          }
        } else {
          entry.devFails += 1;
          if (entry.devFails >= 3) {
            entry.devFails = 0;
            entry.restartingDev = true;
            const framework = await devFrameworkFor(entry.projectId);
            consoleEvent(entry.projectId, "dev server stopped responding — restarting automatically…", "warn");
            void emitEvent(entry.projectId, "console", { level: "error", text: "[dev server] process stopped responding in sandbox — auto-restarting" });
            try {
              await sandboxDevServerAction(entry.projectId, "stop", framework);
              const res = await sandboxDevServerAction(entry.projectId, "start", framework);
              void emitEvent(entry.projectId, "devserver", { status: res.status, cloudUrl: res.url, error: res.error });
            } catch (e) {
              void emitEvent(entry.projectId, "devserver", { status: "error", error: (e as Error).message });
            } finally {
              entry.restartingDev = false;
            }
          }
        }
      }
    } catch {
      /* monitor must never throw */
    }
  }, 5_000);
}

async function devFrameworkFor(projectId: string): Promise<string> {
  try {
    const row = await db.project.findUnique({ where: { id: projectId }, select: { framework: true } });
    return row?.framework || "react-vite";
  } catch {
    return "react-vite";
  }
}

function teardownEntry(entry: Entry, reason: string): void {
  console.error(`[sandbox] teardown project=${entry.projectId.slice(0, 8)} sandbox=${entry.sandbox.sandboxId?.slice(0, 12)}: ${reason}`);
  if (entry.keepalive) clearInterval(entry.keepalive);
  if (entry.monitor) clearInterval(entry.monitor);
  sandboxes.delete(entry.projectId);
  consoleEvent(entry.projectId, reason, "warn");
  void emitEvent(entry.projectId, "sandbox", { status: "stopped", runtime: "local", reason });
  void entry.sandbox.kill().catch(() => undefined);
}

// ---------------- public API ----------------

export interface SandboxBootResult {
  runtime: "local" | "e2b";
  sandboxId: string | null;
  relayUrl: string | null;
  template?: string;
  error?: string;
}

/** Boot the sandbox for a project (or fall back to local). Singleflight per project. */
export async function bootSandbox(projectId: string, mode: string): Promise<SandboxBootResult> {
  const key = await resolveKeyFromSettings();
  if (!key) {
    return { runtime: "local", sandboxId: null, relayUrl: null, error: "no e2b key" };
  }
  const inFlight = sandboxes.get(projectId)?.booting;
  if (inFlight) return inFlight;
  const boot = (async (): Promise<SandboxBootResult> => {
    try {
      const sb = await getSandbox(projectId, mode, key);
      const host = sb.getHost(4777);
      const entry = sandboxes.get(projectId)!;
      return { runtime: "e2b", sandboxId: sb.sandboxId, relayUrl: `https://${host}`, template: entry.template };
    } catch (e) {
      const err = e as Error;
      console.error("[sandbox] boot failed, falling back local:", err.message, "\n", err.stack?.split("\n").slice(0, 6).join("\n"));
      lastBootFail.set(projectId, Date.now());
      await stopSandbox(projectId).catch(() => undefined);
      return { runtime: "local", sandboxId: null, relayUrl: null, error: err.message };
    }
  })();
  const entry = sandboxes.get(projectId);
  if (entry) entry.booting = boot;
  try {
    return await boot;
  } finally {
    const e2 = sandboxes.get(projectId);
    if (e2 && e2.booting === boot) e2.booting = null;
  }
}

export async function stopSandbox(projectId: string): Promise<void> {
  const entry = sandboxes.get(projectId);
  if (!entry) return;
  if (entry.keepalive) clearInterval(entry.keepalive);
  if (entry.monitor) clearInterval(entry.monitor);
  sandboxes.delete(projectId);
  try {
    await entry.sandbox.kill();
  } catch {
    /* noop */
  }
}

export function sandboxInfo(projectId: string): { runtime: "local" | "e2b"; status: string; sandboxId: string | null; template?: string } {
  const entry = sandboxes.get(projectId);
  if (!entry) return { runtime: "local", status: "stopped", sandboxId: null };
  return { runtime: "e2b", status: entry.runtimeReady ? "running" : "provisioning", sandboxId: entry.sandbox.sandboxId, template: entry.template };
}

export function isE2BActive(projectId: string): boolean {
  return sandboxes.has(projectId);
}

/** URL of the in-sandbox relay (for the runtime to talk to the core). */
export async function getRelayUrl(projectId: string): Promise<string | null> {
  const entry = sandboxes.get(projectId);
  if (!entry || !entry.runtimeReady) return null;
  return `https://${entry.sandbox.getHost(4777)}`;
}

/** Raw e2b host of the active sandbox (e.g. 3000-<id>.e2b.app), or null. */
export function getE2BSandboxHost(projectId: string): string | null {
  const entry = sandboxes.get(projectId);
  if (!entry) return null;
  try {
    return entry.sandbox.getHost(0).replace(/^0-/, "");
  } catch {
    return null;
  }
}

/** Ports with listeners inside the sandbox (for the preview port selector). */
export async function discoverSandboxPorts(projectId: string): Promise<{ port: number; managed: boolean; cmd: string }[]> {
  const entry = sandboxes.get(projectId);
  const out = new Map<number, { port: number; managed: boolean; cmd: string }>();
  if (!entry?.runtimeReady) return [];
  if (entry.devServer) out.set(entry.devServer.port, { port: entry.devServer.port, managed: true, cmd: "platform dev server (sandbox)" });
  try {
    const r = (await entry.sandbox.commands.run(
      "ss -ltnp 2>/dev/null || netstat -tlnp 2>/dev/null || true",
      { timeoutMs: 10000 },
    )) as { stdout?: string };
    for (const line of String(r.stdout || "").split("\n")) {
      const pm = line.match(/(?:127\.0\.0\.1|0\.0\.0\.0|\[::\]|\*):(\d+)\s/) || line.match(/0\.0\.0\.0:(\d+)\s/);
      if (!pm) continue;
      const port = Number(pm[1]);
      // 4777 = the relay; >= 32768 = envd-internal ephemeral listeners — not user servers
      if (port < 1024 || port >= 32768 || port === 4777 || out.has(port)) continue;
      const cmdm = line.match(/users:\(\("([^"]+)"/);
      out.set(port, { port, managed: false, cmd: cmdm ? cmdm[1].slice(0, 80) : "listener (sandbox)" });
    }
  } catch {
    /* ss unavailable in sandbox */
  }
  return [...out.values()].sort((a, b) => Number(b.managed) - Number(a.managed) || a.port - b.port);
}

// ---------------- workspace mirroring ----------------

const EXCLUDES = ["--exclude", "node_modules", "--exclude", ".git", "--exclude", ".next", "--exclude", "dist", "--exclude", ".zcode", "--exclude", "coverage"];

export async function syncUp(projectId: string): Promise<void> {
  const entry = sandboxes.get(projectId);
  if (!entry) return;
  const dir = projectWorkspaceDir(projectId);
  const tgz = `/tmp/ws-${projectId}.tgz`;
  const proc = Bun.spawnSync(["tar", "czf", tgz, ...EXCLUDES, "-C", dir, "."]);
  if (proc.exitCode !== 0) throw new Error("workspace tar failed");
  const bytes = fs.readFileSync(tgz);
  await entry.sandbox.files.write(`/home/user/workspace-in.tgz`, bytes);
  await entry.sandbox.commands.run("mkdir -p /home/user/workspace && cd /home/user/workspace && tar xzf /home/user/workspace-in.tgz && rm /home/user/workspace-in.tgz");
}

export async function syncDown(projectId: string): Promise<void> {
  const entry = sandboxes.get(projectId);
  if (!entry) return;
  const dir = projectWorkspaceDir(projectId);
  await entry.sandbox.commands.run("cd /home/user/workspace && tar czf /home/user/workspace-out.tgz --exclude node_modules --exclude .git --exclude .next --exclude dist --exclude .zcode --exclude coverage . || true", { timeoutMs: 120000 });
  try {
    // format "bytes" is REQUIRED — the default read() returns a utf8 string and corrupts binary tgz
    const buf = (await entry.sandbox.files.read("/home/user/workspace-out.tgz", { format: "bytes" })) as Uint8Array;
    fs.writeFileSync(`/tmp/ws-out-${projectId}.tgz`, Buffer.from(buf));
    const ex = Bun.spawnSync(["bash", "-c", `mkdir -p ${dir} && tar xzf /tmp/ws-out-${projectId}.tgz -C ${dir}`]);
    if (ex.exitCode !== 0) throw new Error(`workspace untar failed: ${new TextDecoder().decode(ex.stderr).slice(0, 200)}`);
    fs.rmSync(`/tmp/ws-out-${projectId}.tgz`, { force: true });
  } catch (e) {
    console.warn(`[sandbox] syncDown failed for ${projectId.slice(0, 8)}:`, (e as Error).message);
  }
}

// ---------------- dev servers inside sandbox ----------------

export function allocDevPort(): number {
  const used = new Set<number>();
  for (const [, e] of sandboxes) if (e.devServer) used.add(e.devServer.port);
  for (let p = DEV_SERVER_PORT_MIN; p <= DEV_SERVER_PORT_MAX; p++) if (!used.has(p)) return p;
  return DEV_SERVER_PORT_MIN;
}

/** Dev-server state living inside the sandbox (for hydrate + preview gate). */
export function sandboxDevServerInfo(projectId: string): { status: string; port?: number; cloudUrl?: string } {
  const entry = sandboxes.get(projectId);
  if (!entry?.devServer) return { status: "stopped" };
  return { status: entry.devServer.status, port: entry.devServer.port, cloudUrl: entry.devServer.cloudUrl };
}

export async function sandboxDevServerAction(
  projectId: string,
  action: "start" | "stop",
  framework: string,
): Promise<{ status: string; url?: string; error?: string }> {
  const entry = sandboxes.get(projectId);
  if (!entry) return { status: "stopped", error: "no sandbox" };
  const sb = entry.sandbox;
  if (action === "stop") {
    // [x] trick: the pattern must not match the invoking shell's own cmdline
    await sb.commands.run("pkill -f '[v]ite' 2>/dev/null; pkill -f '[n]ext dev' 2>/dev/null; pkill -f '[n]ext-server' 2>/dev/null; pkill -f '[f]lask' 2>/dev/null; pkill -f '[s]erve' 2>/dev/null; true").catch(() => undefined);
    entry.devServer = undefined;
    entry.devFails = 0;
    return { status: "stopped" };
  }
  // already running / starting → report instead of double-booting
  if (entry.devServer?.status === "ready") return { status: "ready", url: entry.devServer.cloudUrl };
  if (entry.devServer?.status === "starting") return { status: "starting", url: entry.devServer.cloudUrl };
  const port = allocDevPort();
  // deps install runs as its own blocking step (the server command must be a single
  // process for nohup — envd reaps process groups of finished SDK background calls)
  const install =
    framework === "flask"
      ? "cd /home/user/workspace && (pip install -q -r requirements.txt >/dev/null 2>&1 || true)"
      : "cd /home/user/workspace && rm -rf node_modules/.vite && (npm install --no-audit --no-fund >/dev/null 2>&1 || true)";
  await sb.commands.run(install, { timeoutMs: 300_000 }).catch(() => undefined);
  if (framework !== "flask" && framework !== "nextjs") {
    // vite >= 5.4.12 blocks unknown Host headers (the e2b cloud host is unknown) —
    // allow all hosts for the sandbox preview, idempotently, whatever the config shape
    try {
      await sb.files.write("/home/user/.zc/patch-vite.cjs", VITE_PATCH_SCRIPT);
      await sb.commands.run("cd /home/user/workspace && node /home/user/.zc/patch-vite.cjs || true", { timeoutMs: 30000 });
    } catch {
      /* non-fatal — preview may show vite's host-block page */
    }
  }
  const serverCmd =
    framework === "nextjs"
      ? `PORT=${port} npx --yes next dev -p ${port} -H 0.0.0.0`
      : framework === "flask"
        ? `python3 app.py 2>/dev/null || python app.py`
        : `npx --yes vite --force --port ${port} --host 0.0.0.0 --strictPort`;
  const seen = new Set<string>();
  const rateLimit = (line: string): string | null => {
    const t = line.trim();
    if (!t) return null;
    const key = t.slice(0, 120);
    if (seen.has(key) || seen.size > 200) return null;
    seen.add(key);
    return t;
  };
  // proven relay pattern: (nohup env ... &) survives after the SDK call returns
  await sb.commands.run(
    `cd /home/user/workspace && rm -f /home/user/.zc/devserver.log && (nohup env ${serverCmd} > /home/user/.zc/devserver.log 2>&1 &)`,
    { timeoutMs: 20000 },
  );
  // follow the dev-server log for Problems-tab material (best effort, capped)
  void sb.commands
    .run("timeout 180 tail -F /home/user/.zc/devserver.log 2>/dev/null", {
      timeoutMs: 190_000,
      onStdout: (data: string) => {
        for (const line of String(data).split("\n")) {
          const t = rateLimit(line);
          if (t) void emitEvent(projectId, "console", { level: "info", text: `[dev server] ${t.slice(0, 600)}` });
        }
      },
      onStderr: (data: string) => {
        for (const line of String(data).split("\n")) {
          const t = rateLimit(line);
          if (!t) continue;
          if (DEV_ERROR_PATTERNS.some((re) => re.test(t))) {
            void emitEvent(projectId, "console", { level: "error", text: `[dev server] ${t.slice(0, 600)}` });
          }
        }
      },
    })
    .catch(() => undefined);
  const cloudUrl = `https://${sb.getHost(port)}`;
  entry.devServer = { port, status: "starting", cloudUrl };
  // readiness: the in-sandbox listener is the source of truth (the e2b proxy 502s
  // while warming up); the cloud URL is checked afterwards for UI readiness
  let listenerUp = false;
  for (let i = 0; i < 100; i++) {
    try {
      const chk = (await sb.commands.run(`ss -ltn 2>/dev/null | grep -q ':${port} ' && echo UP || echo DOWN`, { timeoutMs: 8000 })) as { stdout?: string };
      if (String(chk.stdout || "").includes("UP")) {
        listenerUp = true;
        break;
      }
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  if (!listenerUp) {
    entry.devServer = { port, status: "error", cloudUrl };
    return { status: "error", error: "dev server did not start listening", url: cloudUrl };
  }
  // give the e2b proxy a moment, then confirm the public URL answers
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(cloudUrl, { signal: AbortSignal.timeout(5000) });
      if (res.status < 500) {
        entry.devServer = { port, status: "ready", cloudUrl };
        return { status: "ready", url: cloudUrl };
      }
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  // listener is up — the proxy warmup will catch up; report ready anyway so the UI
  // can start loading (its own retry logic handles the remaining warmup window)
  entry.devServer = { port, status: "ready", cloudUrl };
  return { status: "ready", url: cloudUrl };
}
