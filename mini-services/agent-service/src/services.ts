// agent-service — file service, git service, artifacts scanner, dev-server manager (local),
// terminal exec, exports. Local runtime SSOT = workspaces/<id>.
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { DEV_SERVER_PORT_MIN, DEV_SERVER_PORT_MAX, projectWorkspaceDir, safeJoin } from "./config";
import { emitProjectEvent } from "./turns";

// ---------------- files ----------------

export interface TreeNode {
  path: string;
  name: string;
  type: "file" | "dir";
  size?: number;
  children?: TreeNode[];
}

export function buildFileTree(projectId: string): TreeNode[] {
  const dir = projectWorkspaceDir(projectId);
  const SKIP = new Set(["node_modules", ".git", ".next", "dist", "coverage", ".zc-seeded", ".swarm"]);
  const walk = (rel: string): TreeNode[] => {
    const full = safeJoin(dir, rel || ".");
    let items: fs.Dirent[] = [];
    try {
      items = fs.readdirSync(full, { withFileTypes: true });
    } catch {
      return [];
    }
    const nodes: TreeNode[] = [];
    for (const item of items.sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name))) {
      if (SKIP.has(item.name)) continue;
      const childRel = rel ? `${rel}/${item.name}` : item.name;
      if (item.isDirectory()) {
        nodes.push({ path: childRel, name: item.name, type: "dir", children: walk(childRel) });
      } else {
        let size = 0;
        try {
          size = fs.statSync(path.join(full, item.name)).size;
        } catch {
          /* noop */
        }
        nodes.push({ path: childRel, name: item.name, type: "file", size });
      }
    }
    return nodes;
  };
  return walk("");
}

export function readFileContent(projectId: string, rel: string): { content: string; size: number } {
  const full = safeJoin(projectWorkspaceDir(projectId), rel);
  const stat = fs.statSync(full);
  return { content: fs.readFileSync(full, "utf8"), size: stat.size };
}

export function writeFileContent(projectId: string, rel: string, content: string): void {
  const full = safeJoin(projectWorkspaceDir(projectId), rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

export function createEntry(projectId: string, rel: string, type: "file" | "dir"): void {
  const full = safeJoin(projectWorkspaceDir(projectId), rel);
  if (type === "dir") fs.mkdirSync(full, { recursive: true });
  else {
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, "");
  }
}

export function deleteEntry(projectId: string, rel: string): void {
  const full = safeJoin(projectWorkspaceDir(projectId), rel);
  fs.rmSync(full, { recursive: true, force: true });
}

export function searchFiles(projectId: string, query: string): { path: string; line: number; text: string }[] {
  const dir = projectWorkspaceDir(projectId);
  const matches: { path: string; line: number; text: string }[] = [];
  try {
    const proc = Bun.spawnSync(["grep", "-rn", "-i", "-m", "3", "--", query, ".", "--include=*", "-I"], { cwd: dir, timeout: 8000 });
    const out = new TextDecoder().decode(proc.stdout || new Uint8Array());
    for (const line of out.split("\n")) {
      const m = line.match(/^\.\/(.+?):(\d+):(.*)$/);
      if (m && !m[1].startsWith("node_modules")) matches.push({ path: m[1], line: Number(m[2]), text: m[3].slice(0, 200) });
      if (matches.length >= 50) break;
    }
  } catch {
    /* noop */
  }
  return matches;
}

export function fileStats(projectId: string): { files: number; lines: number; bytes: number } {
  const dir = projectWorkspaceDir(projectId);
  let files = 0;
  let lines = 0;
  let bytes = 0;
  const skip = new Set(["node_modules", ".git", ".next", "dist"]);
  const walk = (d: string) => {
    let items: fs.Dirent[] = [];
    try {
      items = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of items) {
      if (item.isDirectory()) {
        if (!skip.has(item.name)) walk(path.join(d, item.name));
      } else {
        files++;
        try {
          const s = fs.statSync(path.join(d, item.name));
          bytes += s.size;
          if (s.size < 400_000 && /\.(ts|tsx|js|jsx|py|css|html|md|json|txt|sql|yml|yaml)$/.test(item.name)) {
            lines += fs.readFileSync(path.join(d, item.name), "utf8").split("\n").length;
          }
        } catch {
          /* noop */
        }
      }
    }
  };
  walk(dir);
  return { files, lines, bytes };
}

// ---------------- git ----------------

function gitArgs(projectId: string, args: string[]) {
  const dir = projectWorkspaceDir(projectId);
  return Bun.spawnSync(["git", ...args], { cwd: dir, timeout: 15000 });
}

export async function gitEnsureRepo(projectId: string): Promise<void> {
  const dir = projectWorkspaceDir(projectId);
  if (!fs.existsSync(path.join(dir, ".git"))) {
    Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
  }
}

export async function gitCommitAll(projectId: string, message: string): Promise<string | null> {
  await gitEnsureRepo(projectId);
  const dir = projectWorkspaceDir(projectId);
  Bun.spawnSync(["git", "add", "-A"], { cwd: dir });
  const proc = Bun.spawnSync(
    ["git", "-c", "user.email=agent@zcode.local", "-c", "user.name=ZCode Builder", "commit", "-qm", message, "--allow-empty"],
    { cwd: dir },
  );
  if (proc.exitCode !== 0) return null;
  const hash = Bun.spawnSync(["git", "rev-parse", "HEAD"], { cwd: dir });
  return new TextDecoder().decode(hash.stdout || new Uint8Array()).trim() || null;
}

export async function gitStatus(projectId: string): Promise<Record<string, unknown>> {
  await gitEnsureRepo(projectId);
  const branch = new TextDecoder().decode(gitArgs(projectId, ["rev-parse", "--abbrev-ref", "HEAD"]).stdout || new Uint8Array()).trim() || "main";
  const porcelain = new TextDecoder().decode(gitArgs(projectId, ["status", "--porcelain", "-b"]).stdout || new Uint8Array());
  const staged: { path: string; status: string }[] = [];
  const unstaged: { path: string; status: string }[] = [];
  const untracked: { path: string }[] = [];
  for (const line of porcelain.split("\n").slice(1)) {
    if (!line.trim()) continue;
    const x = line[0];
    const y = line[1];
    const p = line.slice(3).trim();
    if (x === "?") untracked.push({ path: p });
    else {
      if (x !== " ") staged.push({ path: p, status: x });
      if (y !== " ") unstaged.push({ path: p, status: y });
    }
  }
  return { branch, ahead: 0, behind: 0, staged, unstaged, untracked };
}

export async function gitLog(projectId: string, limit = 40): Promise<{ hash: string; short: string; message: string; author: string; date: string }[]> {
  await gitEnsureRepo(projectId);
  const out = new TextDecoder().decode(gitArgs(projectId, ["log", `--pretty=%H|%h|%an|%ad|%s`, "--date=iso", `-n${limit}`]).stdout || new Uint8Array());
  return out
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, short, author, date, ...rest] = line.split("|");
      return { hash, short, author, date, message: rest.join("|") };
    });
}

export async function gitDiff(projectId: string, rel?: string): Promise<string> {
  await gitEnsureRepo(projectId);
  const args = ["diff", "HEAD", "--"];
  if (rel) args.push(rel);
  return new TextDecoder().decode(gitArgs(projectId, args).stdout || new Uint8Array());
}

export async function gitCheckpoint(projectId: string, label?: string): Promise<{ id: string; label: string; commitHash: string | null }> {
  await gitEnsureRepo(projectId);
  const hash = await gitCommitAll(projectId, label || `checkpoint ${new Date().toISOString()}`);
  const row = await import("./db").then(({ db }) =>
    db.checkpoint.create({ data: { projectId, label: label || `Checkpoint ${new Date().toLocaleString()}`, commitHash: hash } }),
  );
  await emitProjectEvent(projectId, "checkpoint", { id: row.id, label: row.label, commitHash: hash });
  return { id: row.id, label: row.label, commitHash: hash };
}

export async function gitRestore(projectId: string, checkpointId: string): Promise<boolean> {
  const { db } = await import("./db");
  const cp = await db.checkpoint.findUnique({ where: { id: checkpointId } });
  if (!cp?.commitHash) return false;
  const dir = projectWorkspaceDir(projectId);
  Bun.spawnSync(["git", "add", "-A"], { cwd: dir });
  Bun.spawnSync(["git", "-c", "user.email=agent@zcode.local", "-c", "user.name=ZCode Builder", "commit", "-qm", `pre-restore ${Date.now()}`, "--allow-empty"], { cwd: dir });
  const res = Bun.spawnSync(["git", "reset", "--hard", cp.commitHash], { cwd: dir });
  return res.exitCode === 0;
}

export async function githubImport(projectId: string, repo: string, branch?: string, token?: string): Promise<boolean> {
  const dir = projectWorkspaceDir(projectId);
  // clear workspace except .git
  for (const item of fs.readdirSync(dir)) {
    if (item === ".git" || item === ".zc-seeded") continue;
    fs.rmSync(path.join(dir, item), { recursive: true, force: true });
  }
  const url = token
    ? repo.replace("https://", `https://x-access-token:${token}@`)
    : repo;
  const cloneArgs = branch ? ["clone", "--depth", "1", "-b", branch, url, "."] : ["clone", "--depth", "1", url, "."];
  const proc = Bun.spawnSync(["git"].concat(cloneArgs), { cwd: dir, timeout: 120000 });
  return proc.exitCode === 0;
}

export async function githubPublish(projectId: string, repo: string, branch?: string, token?: string): Promise<{ ok: boolean; url?: string; error?: string }> {
  const dir = projectWorkspaceDir(projectId);
  if (!token) return { ok: false, error: "GitHub token required (Settings → API keys, or pass one)" };
  await gitEnsureRepo(projectId);
  await gitCommitAll(projectId, "publish from ZCode Builder");
  const url = repo.replace("https://", `https://x-access-token:${token}@`);
  Bun.spawnSync(["git", "remote", "remove", "origin"], { cwd: dir });
  const add = Bun.spawnSync(["git", "remote", "add", "origin", url], { cwd: dir });
  if (add.exitCode !== 0) return { ok: false, error: "failed to add remote (check repo url)" };
  const b = branch || "main";
  const push = Bun.spawnSync(["git", "push", "-u", "origin", b, "--force"], { cwd: dir, timeout: 120000 });
  if (push.exitCode !== 0) {
    const err = new TextDecoder().decode(push.stderr || new Uint8Array());
    return { ok: false, error: err.includes("403") ? "403 — token lacks repo access" : err.slice(0, 200) };
  }
  return { ok: true, url: repo.replace(/\.git$/, "") };
}

// ---------------- artifacts scanner ----------------

const ARTIFACT_MATCHERS: { re: RegExp; type: string; mime: string }[] = [
  { re: /^design\/.*\.html$/, type: "html", mime: "text/html" },
  { re: /^slides\/.*\.html$/, type: "deck", mime: "text/html" },
  { re: /\.(png|jpg|jpeg|gif|webp|svg)$/, type: "image", mime: "image/*" },
  { re: /\.(pptx)$/, type: "doc", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
  { re: /\.(docx)$/, type: "doc", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  { re: /\.(pdf)$/, type: "doc", mime: "application/pdf" },
  { re: /\.(xlsx|csv)$/, type: "data", mime: "text/csv" },
];

export async function scanArtifacts(projectId: string): Promise<void> {
  const dir = projectWorkspaceDir(projectId);
  const { db } = await import("./db");
  const found: { name: string; path: string; type: string; mime: string; size: number }[] = [];
  const walk = (d: string, rel: string) => {
    let items: fs.Dirent[] = [];
    try {
      items = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of items) {
      if (item.name === "node_modules" || item.name === ".git" || item.name === ".next") continue;
      const childRel = rel ? `${rel}/${item.name}` : item.name;
      if (item.isDirectory()) walk(path.join(d, item.name), childRel);
      else {
        for (const m of ARTIFACT_MATCHERS) {
          if (m.re.test(childRel)) {
            let size = 0;
            try {
              size = fs.statSync(path.join(d, item.name)).size;
            } catch {
              /* noop */
            }
            found.push({ name: item.name, path: childRel, type: m.type, mime: m.mime, size });
            break;
          }
        }
      }
    }
  };
  walk(dir, "");
  const existing = await db.artifact.findMany({ where: { projectId } });
  const existingPaths = new Set(existing.map((a) => a.path));
  for (const f of found) {
    if (!existingPaths.has(f.path)) {
      await db.artifact.create({ data: { projectId, ...f } });
    }
  }
  await emitProjectEvent(projectId, "artifacts", { count: found.length });
}

// ---------------- local dev-server manager ----------------

interface DevServerEntry {
  proc: ReturnType<typeof spawn>;
  port: number;
  status: "installing" | "starting" | "ready" | "error";
  logs: string[];
  framework: string;
}
const devServers = new Map<string, DevServerEntry>();

function allocPort(): number {
  const used = new Set([...devServers.values()].map((d) => d.port));
  for (let p = DEV_SERVER_PORT_MIN; p <= DEV_SERVER_PORT_MAX; p++) if (!used.has(p)) return p;
  return DEV_SERVER_PORT_MIN;
}

export async function devServerAction(projectId: string, action: "start" | "stop" | "restart", framework: string, mode: string): Promise<Record<string, unknown>> {
  const dir = projectWorkspaceDir(projectId);
  if (action === "stop" || action === "restart") {
    const existing = devServers.get(projectId);
    if (existing) {
      try {
        existing.proc.kill("SIGTERM");
      } catch {
        /* noop */
      }
      devServers.delete(projectId);
    }
    if (action === "stop") {
      await emitProjectEvent(projectId, "devserver", { status: "stopped" });
      return { status: "stopped" };
    }
  }
  if (mode === "design") {
    await emitProjectEvent(projectId, "devserver", { status: "ready", url: "static" });
    return { status: "ready", url: "static" };
  }

  const port = allocPort();
  let cmd: string;
  if (framework === "nextjs") cmd = `npm install --no-audit --no-fund >/dev/null 2>&1; npx next dev -p ${port} -H 127.0.0.1`;
  else if (framework === "flask") cmd = `pip install -q -r requirements.txt >/dev/null 2>&1; python app.py`;
  else if (framework === "expo") cmd = `npm install --no-audit --no-fund >/dev/null 2>&1; npx expo start --web --port ${port}`;
  else {
    // stop postcss/tailwind config lookup from walking up into the platform tree
    if (!fs.existsSync(path.join(dir, "postcss.config.js"))) fs.writeFileSync(path.join(dir, "postcss.config.js"), "export default { plugins: [] };\n");
    cmd = `npm install --no-audit --no-fund >/dev/null 2>&1; npx vite --port ${port} --host 127.0.0.1 --strictPort --base /preview/${projectId}/`;
  }

  await emitProjectEvent(projectId, "devserver", { status: "installing" });
  const proc = spawn("bash", ["-lc", cmd], { cwd: dir, env: { ...process.env, PORT: String(port), FORCE_COLOR: "0" } });
  const entry: DevServerEntry = { proc, port, status: "starting", logs: [], framework };
  devServers.set(projectId, entry);
  proc.stdout!.on("data", (d: Buffer) => {
    const s = d.toString();
    entry.logs.push(s);
    if (entry.logs.length > 400) entry.logs.splice(0, 200);
    if (entry.status !== "ready" && /(Local:|ready in|localhost:\d+|Running on|listening)/i.test(s)) {
      entry.status = "ready";
      void emitProjectEvent(projectId, "devserver", { status: "ready", port });
      void emitProjectEvent(projectId, "preview", { reload: true });
    }
  });
  proc.stderr!.on("data", (d: Buffer) => {
    const s = d.toString();
    entry.logs.push(s);
    if (entry.logs.length > 400) entry.logs.splice(0, 200);
  });
  proc.on("exit", () => {
    if (devServers.get(projectId) === entry) {
      entry.status = "error";
      void emitProjectEvent(projectId, "devserver", { status: "stopped" });
    }
  });
  return { status: "starting", port };
}

export function devServerInfo(projectId: string): { status: string; port?: number; logs?: string[] } {
  const e = devServers.get(projectId);
  if (!e) return { status: "stopped" };
  return { status: e.status, port: e.port, logs: e.logs.slice(-80) };
}

// ---------------- terminal exec (streaming) ----------------

export function runTerminal(projectId: string, command: string): void {
  const dir = projectWorkspaceDir(projectId);
  const proc = spawn("bash", ["-lc", command], { cwd: dir, env: { ...process.env, TERM: "xterm-256color" } });
  const push = (stream: "stdout" | "stderr", data: string) => {
    void emitProjectEvent(projectId, "terminal", { stream, data });
  };
  proc.stdout!.on("data", (d: Buffer) => push("stdout", d.toString()));
  proc.stderr!.on("data", (d: Buffer) => push("stderr", d.toString()));
  proc.on("exit", (code) => push("stdout", `\n[exit ${code}]\n`));
}

// ---------------- exports ----------------

export function exportChatMarkdown(projectId: string): Promise<string> {
  return import("./db").then(async ({ db }) => {
    const [project, messages] = await Promise.all([
      db.project.findUnique({ where: { id: projectId } }),
      db.agentMessage.findMany({ where: { projectId }, orderBy: { seq: "asc" } }),
    ]);
    const header = `# Chat export — ${project?.title ?? projectId}\n\n- Mode: ${project?.mode}\n- Framework: ${project?.framework}\n- Exported: ${new Date().toISOString()}\n\n---\n`;
    const body = messages
      .map((m) => {
        const parts = JSON.parse(m.parts || "[]") as { type: string; text?: string; toolName?: string; agent?: string }[];
        const lines = parts.map((p) => {
          if (p.type === "text") return p.text || "";
          if (p.type === "reasoning") return `> _thinking:_ ${p.text || ""}`;
          if (p.type === "tool-invocation") return `\`${p.toolName}\``;
          if (p.type === "delegation") return `> _delegate → ${p.agent}_`;
          return "";
        });
        return `## ${m.role}\n\n${lines.filter(Boolean).join("\n\n")}\n`;
      })
      .join("\n---\n\n");
    return header + body;
  });
}

export function exportZipPath(projectId: string): string {
  const dir = projectWorkspaceDir(projectId);
  const out = `/tmp/export-${projectId}-${Date.now()}.zip`;
  Bun.spawnSync(["bash", "-c", `cd ${dir} && zip -rq ${out} . -x "node_modules/*" ".git/*" ".next/*" "dist/*"`]);
  return out;
}
