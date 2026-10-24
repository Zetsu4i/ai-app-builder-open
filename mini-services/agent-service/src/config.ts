// agent-service — paths & configuration
import path from "node:path";
import fs from "node:fs";

export const SERVICE_PORT = Number(process.env.AGENT_SERVICE_PORT || 3031);

export const ROOT = path.resolve(import.meta.dir, "../../.."); // src → agent-service → mini-services → project root
// The vendored core lives either at <root>/agent-core (webapp-first checkout) or
// directly at <root>/extracted (this repo's native layout). Use whichever exists.
function resolveAgentCoreDir(): string {
  const candidates = [
    process.env.ZCODE_AGENT_CORE_DIR,
    path.join(ROOT, "agent-core", "extracted") && path.join(ROOT, "agent-core"),
    path.join(ROOT, "extracted") && ROOT,
  ].filter(Boolean) as string[];
  for (const dir of candidates) {
    try {
      if (fs.existsSync(path.join(dir, "extracted", "zcode.cjs"))) return dir;
    } catch {
      /* next */
    }
  }
  return path.join(ROOT, "agent-core");
}
export const AGENT_CORE_DIR = resolveAgentCoreDir();
export const CORE_CJS = path.join(AGENT_CORE_DIR, "extracted", "zcode.cjs");
export const CORE_BUILTIN_CONFIG = path.join(AGENT_CORE_DIR, "extracted", "config", "zcode-builtin.json");
export const CORE_EXTRACTED_DIR = path.join(AGENT_CORE_DIR, "extracted");

export const WORKSPACES_ROOT = process.env.WORKSPACES_ROOT || path.join(ROOT, "workspaces");
export const SWARM_RUNS_ROOT = path.join(ROOT, "swarm-runs");
export const RUNTIME_DIR = path.join(ROOT, "mini-services", "agent-service", "runtime");
export const DESIGN_SYSTEMS_DIR = path.join(ROOT, "design-systems");
export const PACKS_DIR = path.join(ROOT, "packs");
export const E2B_TEMPLATES_DIR = path.join(ROOT, "e2b-templates");
export const DB_FILE = path.join(ROOT, "db", "custom.db");

export const BRIDGE_PORT = SERVICE_PORT; // zai-bridge lives on the same HTTP server
export const BRIDGE_URL = `http://127.0.0.1:${BRIDGE_PORT}/llm/v1`;

export const DEV_SERVER_PORT_MIN = 3100;
export const DEV_SERVER_PORT_MAX = 3199;

export const NODE_BIN = process.env.ZCODE_NODE_BIN || "node";

export function ensureDirs() {
  for (const d of [WORKSPACES_ROOT, SWARM_RUNS_ROOT, RUNTIME_DIR]) {
    fs.mkdirSync(d, { recursive: true });
  }
}

/** Ensure seed plugins are discoverable: ln -s plugins <extracted>/packages */
export function ensureSeedPlugins() {
  const link = path.join(CORE_EXTRACTED_DIR, "packages");
  try {
    if (!fs.existsSync(link)) {
      fs.symlinkSync("plugins", link);
    }
  } catch {
    /* ignore */
  }
}

export function projectWorkspaceDir(projectId: string): string {
  const dir = path.join(WORKSPACES_ROOT, projectId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function safeJoin(base: string, rel: string): string {
  const p = path.resolve(base, rel);
  if (p !== base && !p.startsWith(base + path.sep)) throw new Error("Path escapes workspace");
  return p;
}
