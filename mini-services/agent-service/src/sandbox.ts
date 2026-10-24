// agent-service — sandbox manager: E2B cloud sandboxes with graceful LOCAL fallback.
// E2B mode runs the FULL zcode core inside the sandbox via stdio-over-HTTP relay (runtime/relay.mjs).
import fs from "node:fs";
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
  files: { write(path: string, data: Buffer | string): Promise<unknown>; read(path: string): Promise<Buffer | Uint8Array> };
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
  devServer?: { proc: unknown; port: number; status: string; cloudUrl?: string };
}

const sandboxes = new Map<string, Entry>();

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

async function getSandbox(projectId: string, mode: string, key: string): Promise<SandboxLike> {
  const existing = sandboxes.get(projectId);
  if (existing) return existing.sandbox;
  const { Sandbox } = await import("e2b");
  const sb = (await Sandbox.create(templateForMode(mode), {
    apiKey: key,
    timeoutMs: 20 * 60_000,
    metadata: { projectId, mode, builder: "zcode-builder" },
  })) as unknown as SandboxLike;
  const entry: Entry = { sandbox: sb, projectId, template: templateForMode(mode), runtimeReady: false };
  entry.keepalive = setInterval(() => {
    sb.setTimeout(20 * 60_000).catch(() => {
      clearInterval(entry.keepalive);
      sandboxes.delete(projectId);
    });
  }, 4 * 60_000);
  sandboxes.set(projectId, entry);
  return sb;
}

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
  // upload generated provider config (BYOK + builtin zai-bridge)
  const providerCfgPath = path.join(process.cwd(), "runtime", "provider_config.json");
  if (fs.existsSync(providerCfgPath)) {
    await sb.files.write("/home/user/.zc/provider_config.json", fs.readFileSync(providerCfgPath, "utf8"));
  }
}

/** Ensure a Node >= 22 runtime inside the sandbox. Returns the node binary to use (or "node" if system is fine). */
async function ensureNode(sb: SandboxLike): Promise<string> {
  const check = await sb.commands.run("node --version 2>/dev/null || echo none", { timeoutMs: 15000 });
  const version = String((check as { stdout?: string }).stdout || "").trim();
  const major = Number(version.replace("v", "").split(".")[0] || "0");
  if (version !== "none" && major >= 22) return "node";
  console.log(`[sandbox] installing Node 22 (found: ${version}) via tarball`);
  // Official tarball — no apt required (works on any debian/ubuntu image)
  await sb.commands.run(
    "mkdir -p /opt/node22 && curl -fsSL https://nodejs.org/dist/v22.20.0/node-v22.20.0-linux-x64.tar.xz -o /tmp/node22.tar.xz && tar xJf /tmp/node22.tar.xz -C /opt/node22 --strip-components=1 && rm /tmp/node22.tar.xz && /opt/node22/bin/node --version",
    { timeoutMs: 300000 },
  );
  const after = await sb.commands.run("/opt/node22/bin/node --version", { timeoutMs: 15000 });
  const v2 = String((after as { stdout?: string }).stdout || "").trim();
  if (!v2.startsWith("v22")) throw new Error(`node bootstrap failed (${v2})`);
  return "/opt/node22/bin/node";
}

async function startRelay(sb: SandboxLike, nodeBin: string): Promise<string> {
  await sb.commands.run(`cd /home/user/.zc && (nohup ${nodeBin} relay.mjs > relay.log 2>&1 &)`, { timeoutMs: 15000 });
  const host = sb.getHost(4777);
  const url = `https://${host}`;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) return url;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("relay health timeout");
}

export interface SandboxBootResult {
  runtime: "local" | "e2b";
  sandboxId: string | null;
  relayUrl: string | null;
  error?: string;
}

/** Boot the sandbox for a project (or fall back to local). */
export async function bootSandbox(projectId: string, mode: string): Promise<SandboxBootResult> {
  const key = await resolveKeyFromSettings();
  if (!key) {
    return { runtime: "local", sandboxId: null, relayUrl: null, error: "no e2b key" };
  }
  try {
    const sb = await getSandbox(projectId, mode, key);
    if (!sandboxes.get(projectId)!.runtimeReady) {
      await uploadRuntime(sb);
      const nodeBin = await ensureNode(sb);
      const relayUrl = await startRelay(sb, nodeBin);
      sandboxes.get(projectId)!.runtimeReady = true;
      return { runtime: "e2b", sandboxId: sb.sandboxId, relayUrl };
    }
    const host = sb.getHost(4777);
    return { runtime: "e2b", sandboxId: sb.sandboxId, relayUrl: `https://${host}` };
  } catch (e) {
    console.error("[sandbox] boot failed, falling back local:", (e as Error).message);
    await stopSandbox(projectId).catch(() => undefined);
    return { runtime: "local", sandboxId: null, relayUrl: null, error: (e as Error).message };
  }
}

export async function stopSandbox(projectId: string): Promise<void> {
  const entry = sandboxes.get(projectId);
  if (!entry) return;
  clearInterval(entry.keepalive);
  sandboxes.delete(projectId);
  try {
    await entry.sandbox.kill();
  } catch {
    /* noop */
  }
}

export function sandboxInfo(projectId: string): { runtime: "local" | "e2b"; status: string; sandboxId: string | null } {
  const entry = sandboxes.get(projectId);
  if (!entry) return { runtime: "local", status: "stopped", sandboxId: null };
  return { runtime: "e2b", status: "running", sandboxId: entry.sandbox.sandboxId };
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

// ---------------- workspace mirroring ----------------

const EXCLUDES = "--exclude node_modules --exclude .git --exclude .next --exclude dist --exclude .zcode --exclude coverage";

export async function syncUp(projectId: string): Promise<void> {
  const entry = sandboxes.get(projectId);
  if (!entry) return;
  const dir = projectWorkspaceDir(projectId);
  const tgz = `/tmp/ws-${projectId}.tgz`;
  const proc = Bun.spawnSync(["tar", "czf", tgz, EXCLUDES, "-C", dir, "."]);
  if (proc.exitCode !== 0) throw new Error("workspace tar failed");
  const bytes = fs.readFileSync(tgz);
  await entry.sandbox.files.write(`/home/user/workspace-in.tgz`, bytes);
  await entry.sandbox.commands.run("mkdir -p /home/user/workspace && cd /home/user/workspace && tar xzf /home/user/workspace-in.tgz && rm /home/user/workspace-in.tgz");
}

export async function syncDown(projectId: string): Promise<void> {
  const entry = sandboxes.get(projectId);
  if (!entry) return;
  const dir = projectWorkspaceDir(projectId);
  await entry.sandbox.commands.run("cd /home/user/workspace && tar czf /home/user/workspace-out.tgz " + EXCLUDES + " . || true", { timeoutMs: 120000 });
  try {
    const buf = (await entry.sandbox.files.read("/home/user/workspace-out.tgz")) as Buffer;
    fs.writeFileSync(`/tmp/ws-out-${projectId}.tgz`, buf);
    Bun.spawnSync(["bash", "-c", `mkdir -p ${dir} && tar xzf /tmp/ws-out-${projectId}.tgz -C ${dir} && rm /tmp/ws-out-${projectId}.tgz`]);
  } catch {
    /* noop */
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
    await sb.commands.run("pkill -f 'vite|next dev|flask|node server.js' || true").catch(() => undefined);
    entry.devServer = undefined;
    return { status: "stopped" };
  }
  // already running / starting → report instead of double-booting
  if (entry.devServer?.status === "ready") return { status: "ready", url: entry.devServer.cloudUrl };
  if (entry.devServer?.status === "starting") return { status: "starting", url: entry.devServer.cloudUrl };
  const port = allocDevPort();
  const cmd =
    framework === "nextjs"
      ? `cd /home/user/workspace && npm install --no-audit --no-fund >/dev/null 2>&1; PORT=${port} npx next dev -p ${port} -H 0.0.0.0`
      : framework === "flask"
        ? `cd /home/user/workspace && pip install -q -r requirements.txt >/dev/null 2>&1; python app.py`
        : `cd /home/user/workspace && rm -rf node_modules/.vite && npm install --no-audit --no-fund >/dev/null 2>&1; npx vite --force --port ${port} --host 0.0.0.0 --strictPort`;
  await sb.commands.run(cmd, { background: true, timeoutMs: 15 * 60_000 });
  const cloudUrl = `https://${sb.getHost(port)}`;
  // readiness poll
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(cloudUrl, { signal: AbortSignal.timeout(3000) });
      if (res.ok || res.status < 500) {
        entry.devServer = { proc: null, port, status: "ready", cloudUrl };
        return { status: "ready", url: cloudUrl };
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  entry.devServer = { proc: null, port, status: "error" };
  return { status: "error", error: "dev server did not become ready", url: cloudUrl };
}
