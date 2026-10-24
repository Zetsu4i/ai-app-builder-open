// agent-service — skills / mcp / plugins / design-systems / agents / settings / providers / models / usage
import fs from "node:fs";
import path from "node:path";
import { db } from "./db";
import { CORE_EXTRACTED_DIR, DESIGN_SYSTEMS_DIR, PACKS_DIR, projectWorkspaceDir } from "./config";

// ---------------- skills ----------------

function parseFrontmatter(raw: string): { name?: string; description?: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const name = m[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = m[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  return { name, description };
}

function walkSkillDirs(root: string, depth = 0): { path: string; slug: string }[] {
  const out: { path: string; slug: string }[] = [];
  if (depth > 3) return out;
  let items: fs.Dirent[] = [];
  try {
    items = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const item of items) {
    if (!item.isDirectory()) continue;
    const full = path.join(root, item.name);
    if (fs.existsSync(path.join(full, "SKILL.md"))) out.push({ path: full, slug: item.name });
    else out.push(...walkSkillDirs(full, depth + 1));
  }
  return out;
}

/**
 * Builtin skills shipped with the platform — the skills inside the vendored
 * core's plugins/packages (document, spreadsheets, pdf, presentations,
 * browser-use, computer-use, ios/android, guide, …) plus the local packs.
 */
function builtinSkillDirs(): { path: string; slug: string; origin: string }[] {
  const out: { path: string; slug: string; origin: string }[] = [];
  const roots: { base: string; origin: string }[] = [
    { base: path.join(CORE_EXTRACTED_DIR, "packages"), origin: "builtin" },
    { base: path.join(CORE_EXTRACTED_DIR, "plugins"), origin: "builtin" },
    { base: path.join(CORE_EXTRACTED_DIR, "skills"), origin: "builtin" },
  ];
  const seen = new Set<string>();
  for (const { base, origin } of roots) {
    for (const dir of walkSkillDirs(base)) {
      if (seen.has(dir.slug)) continue;
      seen.add(dir.slug);
      out.push({ ...dir, origin });
    }
  }
  return out;
}

export async function listSkills(projectId?: string) {
  const rows = await db.skillInstall.findMany({ orderBy: { createdAt: "asc" } });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));

  interface SkillRow {
    slug: string;
    name: string;
    description: string;
    source: string;
    scope: string;
    enabled: boolean;
  }
  const skills: SkillRow[] = [];
  const push = (s: SkillRow) => {
    if (!skills.some((x) => x.slug === s.slug)) skills.push(s);
  };

  // 1. builtin skills from the core (installed rows override)
  for (const dir of builtinSkillDirs()) {
    try {
      const fm = parseFrontmatter(fs.readFileSync(path.join(dir.path, "SKILL.md"), "utf8"));
      const row = bySlug.get(dir.slug);
      push({
        slug: dir.slug,
        name: row?.name || fm.name || dir.slug,
        description: row?.description || (fm.description || "").slice(0, 160),
        source: row?.source || dir.origin,
        scope: row?.scope || "user",
        enabled: row?.enabled ?? true,
      });
    } catch {
      /* noop */
    }
  }
  // 2. pack skills (superpowers / design) — listed even before installing
  for (const pack of ["superpowers", "design"]) {
    for (const dir of walkSkillDirs(path.join(PACKS_DIR, pack))) {
      if (bySlug.has(dir.slug)) continue;
      try {
        const fm = parseFrontmatter(fs.readFileSync(path.join(dir.path, "SKILL.md"), "utf8"));
        push({ slug: dir.slug, name: fm.name || dir.slug, description: (fm.description || "").slice(0, 160), source: pack, scope: "workspace", enabled: false });
      } catch {
        /* noop */
      }
    }
  }
  // 3. workspace-scoped custom skills on disk
  if (projectId) {
    const wsDir = projectWorkspaceDir(projectId);
    for (const base of [".zcode/skills", ".agents/skills"]) {
      for (const dir of walkSkillDirs(path.join(wsDir, base))) {
        if (bySlug.has(dir.slug) || skills.some((s) => s.slug === dir.slug)) continue;
        try {
          const fm = parseFrontmatter(fs.readFileSync(path.join(dir.path, "SKILL.md"), "utf8"));
          push({ slug: dir.slug, name: fm.name || dir.slug, description: (fm.description || "").slice(0, 160), source: "workspace", scope: "workspace", enabled: true });
        } catch {
          /* noop */
        }
      }
    }
  }
  // 4. installed db rows that aren't on disk anymore (user installs, remote sources)
  for (const r of rows) {
    push({ slug: r.slug, name: r.name, description: r.description, source: r.source, scope: r.scope, enabled: r.enabled });
  }

  // available packs (not yet installed) — kept for the pack installer UI
  const packs: { slug: string; name: string; pack: string; description: string }[] = [];
  for (const pack of ["superpowers", "design"]) {
    for (const dir of walkSkillDirs(path.join(PACKS_DIR, pack))) {
      if (rows.some((r) => r.slug === dir.slug)) continue;
      try {
        const raw = fs.readFileSync(path.join(dir.path, "SKILL.md"), "utf8");
        const fm = parseFrontmatter(raw);
        packs.push({ slug: dir.slug, name: fm.name || dir.slug, pack, description: (fm.description || "").slice(0, 160) });
      } catch {
        /* noop */
      }
    }
  }
  return { skills, packs, disk: [] as { slug: string; name: string; description: string }[] };
}

export async function installSkill(body: {
  projectId?: string;
  source: "paste" | "url" | "npx" | "folder" | "pack";
  slug?: string;
  name?: string;
  content?: string;
  url?: string;
  packSlug?: string;
  scope?: "workspace" | "user";
}): Promise<{ ok: boolean; slug: string; error?: string }> {
  const slug = (body.slug || `skill-${Date.now().toString(36)}`).replace(/[^a-z0-9-]/gi, "-").toLowerCase();

  if (body.source === "pack" && body.packSlug) {
    // find pack dir
    for (const pack of ["superpowers", "design"]) {
      const dir = path.join(PACKS_DIR, pack, body.packSlug);
      if (fs.existsSync(path.join(dir, "SKILL.md"))) {
        const raw = fs.readFileSync(path.join(dir, "SKILL.md"), "utf8");
        const fm = parseFrontmatter(raw);
        const target = path.join(projectWorkspaceDir(body.projectId || "global"), ".agents", "skills", body.packSlug);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.cpSync(dir, target, { recursive: true });
        await db.skillInstall.upsert({
          where: { slug: body.packSlug },
          create: { slug: body.packSlug, name: fm.name || body.packSlug, description: (fm.description || "").slice(0, 300), source: pack, scope: body.scope || "workspace" },
          update: { enabled: true },
        });
        return { ok: true, slug: body.packSlug };
      }
    }
    return { ok: false, slug: body.packSlug, error: "pack not found" };
  }

  if (body.source === "paste" && body.content) {
    const fm = parseFrontmatter(body.content);
    const target = path.join(projectWorkspaceDir(body.projectId || "global"), ".agents", "skills", slug);
    fs.mkdirSync(target, { recursive: true });
    fs.writeFileSync(path.join(target, "SKILL.md"), body.content);
    await db.skillInstall.upsert({
      where: { slug },
      create: { slug, name: body.name || fm.name || slug, description: (fm.description || body.content.slice(0, 150)).slice(0, 300), source: "custom", scope: body.scope || "workspace" },
      update: { enabled: true },
    });
    return { ok: true, slug };
  }

  if (body.source === "url" && body.url) {
    // support git repos and direct SKILL.md urls
    const url = body.url;
    const tmp = `/tmp/skill-install-${Date.now()}`;
    if (/\.git$/.test(url) || url.includes("github.com")) {
      const repoUrl = url.replace(/\/$/, "").replace(/\.git$/, "");
      const name = repoUrl.split("/").pop() || slug;
      const proc = Bun.spawnSync(["git", "clone", "--depth", "1", repoUrl, tmp], { timeout: 60000 });
      if (proc.exitCode !== 0) return { ok: false, slug, error: "git clone failed" };
      // find SKILL.md files
      const found = walkSkillDirs(tmp, 0);
      const withSkill = found.length ? found : fs.existsSync(path.join(tmp, "SKILL.md")) ? [{ path: tmp, slug: name }] : [];
      let first = "";
      for (const f of withSkill.slice(0, 20)) {
        const s = f.slug || name;
        const target = path.join(projectWorkspaceDir(body.projectId || "global"), ".agents", "skills", s);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.cpSync(f.path, target, { recursive: true });
        if (!first) first = s;
      }
      if (!first) return { ok: false, slug, error: "no SKILL.md found in repo" };
      const raw = fs.readFileSync(path.join(withSkill[0].path, "SKILL.md"), "utf8");
      const fm = parseFrontmatter(raw);
      await db.skillInstall.upsert({
        where: { slug: first },
        create: { slug: first, name: fm.name || first, description: (fm.description || "installed from url").slice(0, 300), source: "url", scope: body.scope || "workspace", meta: JSON.stringify({ url }) },
        update: { enabled: true },
      });
      return { ok: true, slug: first };
    }
    // direct url fetch
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      const text = await res.text();
      return installSkill({ ...body, source: "paste", content: text });
    } catch (e) {
      return { ok: false, slug, error: (e as Error).message };
    }
  }

  if (body.source === "npx" && body.url) {
    // "npx skills" registry: fetch from skills.sh-compatible URL or run npx in a temp dir
    try {
      const tmp = `/tmp/npx-skills-${Date.now()}`;
      fs.mkdirSync(tmp, { recursive: true });
      const proc = Bun.spawnSync(["bash", "-lc", `cd ${tmp} && npx -y skills add ${JSON.stringify(body.url)} --yes 2>&1 || npx -y skills install ${JSON.stringify(body.url)} --yes 2>&1`], { timeout: 120000 });
      void proc;
      const found = walkSkillDirs(tmp);
      if (!found.length) {
        // fall back to treating the url as a git repo
        return installSkill({ ...body, source: "url" });
      }
      let first = "";
      for (const f of found.slice(0, 10)) {
        const target = path.join(projectWorkspaceDir(body.projectId || "global"), ".agents", "skills", f.slug);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.cpSync(f.path, target, { recursive: true });
        if (!first) first = f.slug;
      }
      const raw = fs.readFileSync(path.join(found[0].path, "SKILL.md"), "utf8");
      const fm = parseFrontmatter(raw);
      await db.skillInstall.upsert({
        where: { slug: first },
        create: { slug: first, name: fm.name || first, description: (fm.description || "installed via npx skills").slice(0, 300), source: "npx", scope: body.scope || "workspace" },
        update: { enabled: true },
      });
      return { ok: true, slug: first };
    } catch (e) {
      return { ok: false, slug, error: (e as Error).message };
    }
  }

  return { ok: false, slug, error: "invalid install request" };
}

export async function toggleSkill(slug: string, enabled: boolean) {
  await db.skillInstall.update({ where: { slug }, data: { enabled } });
}

export async function deleteSkill(slug: string) {
  await db.skillInstall.delete({ where: { slug } }).catch(() => undefined);
}

// ---------------- MCP ----------------

export async function listMcp() {
  const rows = await db.mcpServer.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    command: r.command,
    args: safeArr(r.args),
    url: r.url,
    enabled: r.enabled,
    status: r.status,
    tools: safeArr(r.tools),
  }));
}

function safeArr(s: string | null | undefined): string[] {
  try {
    const v = JSON.parse(s || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function safeObj(s: string | null | undefined): Record<string, string> {
  try {
    return JSON.parse(s || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export interface McpUpsert {
  name: string;
  type: "stdio" | "http" | "sse";
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
  enabled?: boolean;
}

export async function upsertMcp(body: McpUpsert) {
  await db.mcpServer.upsert({
    where: { name: body.name },
    create: {
      name: body.name,
      type: body.type,
      command: body.command || "",
      args: JSON.stringify(body.args || []),
      env: JSON.stringify(body.env || {}),
      url: body.url || "",
      headers: JSON.stringify(body.headers || {}),
      enabled: body.enabled ?? true,
    },
    update: {
      type: body.type,
      command: body.command || "",
      args: JSON.stringify(body.args || []),
      env: JSON.stringify(body.env || {}),
      url: body.url || "",
      headers: JSON.stringify(body.headers || {}),
      enabled: body.enabled ?? true,
    },
  });
  return listMcp();
}

export async function deleteMcp(name: string) {
  await db.mcpServer.delete({ where: { name } }).catch(() => undefined);
}

export async function testMcp(name: string): Promise<{ ok: boolean; tools?: string[]; error?: string }> {
  const row = await db.mcpServer.findUnique({ where: { name } });
  if (!row) return { ok: false, error: "not found" };
  if (row.type === "stdio" && row.command) {
    try {
      const proc = Bun.spawnSync(["bash", "-lc", `${row.command} --help 2>&1 | head -5`], { timeout: 10000 });
      const ok = proc.exitCode === 0 || proc.exitCode === 2; // some servers exit non-zero on --help
      await db.mcpServer.update({ where: { name }, data: { status: ok ? "ok" : "error" } });
      return { ok, error: ok ? undefined : `command exited ${proc.exitCode}` };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }
  if (row.url) {
    try {
      const res = await fetch(row.url, { method: row.type === "sse" ? "GET" : "POST", headers: safeObj(row.headers), body: row.type === "http" ? JSON.stringify({ jsonrpc: "2.0", method: "initialize", params: {}, id: 1 }) : undefined, signal: AbortSignal.timeout(10000) });
      const ok = res.status < 500;
      await db.mcpServer.update({ where: { name }, data: { status: ok ? "ok" : "error" } });
      return { ok };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }
  return { ok: false, error: "nothing to test" };
}

/** MCP servers to pass to session/create */
export async function mcpsForSession(names?: string[]): Promise<Record<string, unknown>[]> {
  const rows = await db.mcpServer.findMany({ where: { enabled: true } });
  const filtered = names?.length ? rows.filter((r) => names.includes(r.name)) : rows;
  return filtered.map((r) => {
    if (r.type === "stdio") {
      return {
        name: r.name,
        command: r.command,
        args: safeArr(r.args),
        env: Object.entries(safeObj(r.env)).map(([k, v]) => ({ name: k, value: v })),
        isolation: "workspace",
      };
    }
    return { name: r.name, type: r.type, url: r.url, headers: safeObj(r.headers) };
  });
}

// ---------------- plugins ----------------

export async function listPlugins() {
  const rows = await db.pluginInstall.findMany();
  const plugins: Record<string, unknown>[] = [];
  const seen = new Set<string>();
  const scan = (seedDir: string, source: string) => {
    try {
      for (const item of fs.readdirSync(seedDir, { withFileTypes: true })) {
        if (!item.isDirectory()) continue;
        const manifestPath = path.join(seedDir, item.name, ".zcode-plugin", "plugin.json");
        if (!fs.existsSync(manifestPath)) continue;
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Record<string, unknown>;
          const slug = String(manifest.name || item.name);
          if (seen.has(slug)) continue;
          seen.add(slug);
          plugins.push({
            slug,
            name: (manifest.name as string) || item.name,
            description: (manifest.description as string) || "",
            version: (manifest.version as string) || "",
            enabled: rows.find((r) => r.slug === slug)?.enabled ?? true,
            source,
            skills: countSkills(path.join(seedDir, item.name)),
          });
        } catch {
          /* noop */
        }
      }
    } catch {
      /* noop */
    }
  };
  scan(path.join(CORE_EXTRACTED_DIR, "plugins"), "builtin");
  scan(path.join(CORE_EXTRACTED_DIR, "packages"), "builtin");
  return plugins;
}

function countSkills(pluginDir: string): string[] {
  const skillsDir = path.join(pluginDir, "skills");
  try {
    return fs.readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }
}

export async function togglePlugin(slug: string, enabled: boolean) {
  await db.pluginInstall.upsert({
    where: { slug },
    create: { slug, manifest: "{}", enabled, source: "builtin" },
    update: { enabled },
  });
}

// ---------------- design systems ----------------

export async function listDesignSystems() {
  const out: { slug: string; name: string; category: string; description: string }[] = [];
  try {
    for (const item of fs.readdirSync(DESIGN_SYSTEMS_DIR, { withFileTypes: true })) {
      if (!item.isDirectory()) continue;
      const dir = path.join(DESIGN_SYSTEMS_DIR, item.name);
      const manifestPath = path.join(dir, "manifest.json");
      if (!fs.existsSync(manifestPath)) continue;
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as { name?: string; category?: string; description?: string };
        out.push({ slug: item.name, name: manifest.name || item.name, category: manifest.category || "style", description: (manifest.description || "").slice(0, 160) });
      } catch {
        /* noop */
      }
    }
  } catch {
    /* noop */
  }
  return out;
}

export function designSystemFiles(slug: string): { design?: string; tokens?: string; usage?: string } {
  const dir = path.join(DESIGN_SYSTEMS_DIR, slug);
  const read = (f: string) => {
    try {
      return fs.readFileSync(path.join(dir, f), "utf8");
    } catch {
      return undefined;
    }
  };
  return { design: read("DESIGN.md"), tokens: read("tokens.css"), usage: read("USAGE.md") };
}

/** Install a design system's files into the workspace so the core can read them */
export function installDesignSystemToWorkspace(projectId: string, slug: string): boolean {
  const src = path.join(DESIGN_SYSTEMS_DIR, slug);
  if (!fs.existsSync(src)) return false;
  const dst = path.join(projectWorkspaceDir(projectId), "design-systems", slug);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.cpSync(src, dst, { recursive: true });
  return true;
}

// ---------------- agent profiles ----------------

export async function listAgentProfiles() {
  const rows = await db.agentProfile.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    systemPrompt: r.systemPrompt,
    color: r.color,
    maxTurns: r.maxTurns,
    enabled: r.enabled,
    spawnCount: r.spawnCount,
    modelProvider: r.modelProvider,
    modelId: r.modelId,
  }));
}

export async function upsertAgentProfile(body: Record<string, unknown>) {
  const slug = String(body.slug || `agent-${Date.now().toString(36)}`);
  const data = {
    name: String(body.name || slug),
    systemPrompt: String(body.systemPrompt || ""),
    color: String(body.color || "clay"),
    maxTurns: Number(body.maxTurns || 24),
    enabled: body.enabled === undefined ? true : !!body.enabled,
    modelProvider: String(body.modelProvider || ""),
    modelId: String(body.modelId || ""),
  };
  await db.agentProfile.upsert({ where: { slug }, create: { slug, ...data }, update: data });
  return listAgentProfiles();
}

export async function deleteAgentProfile(slug: string) {
  await db.agentProfile.delete({ where: { slug } }).catch(() => undefined);
}

// ---------------- settings ----------------

export async function getSettings(): Promise<Record<string, unknown>> {
  const rows = await db.setting.findMany();
  const out: Record<string, unknown> = {};
  for (const r of rows) {
    try {
      out[r.key] = JSON.parse(r.value);
    } catch {
      out[r.key] = r.value;
    }
  }
  // mask secrets
  if (out.e2b) {
    const v = out.e2b as { apiKey?: string } | string;
    const key = typeof v === "string" ? v : v.apiKey;
    out.e2b = { masked: key ? `${key.slice(0, 8)}…${key.slice(-4)}` : null, configured: !!key };
  }
  if (out.github) {
    const v = out.github as { token?: string } | string;
    const token = typeof v === "string" ? v : v.token;
    out.github = { masked: token ? `${token.slice(0, 6)}…${token.slice(-4)}` : null, configured: !!token };
  }
  return out;
}

function settingRaw(rows: { key: string; value: string }[], key: string): string | null {
  const r = rows.find((x) => x.key === key);
  return r?.value ?? null;
}

export async function putSettings(body: Record<string, unknown>): Promise<void> {
  for (const [key, value] of Object.entries(body)) {
    if (value === null || value === undefined) continue;
    let toStore: unknown = value;
    if (key === "e2b") {
      const v = value as { apiKey?: string } | string;
      const apiKey = typeof v === "string" ? v : v.apiKey;
      if (!apiKey) continue;
      toStore = { apiKey };
    }
    if (key === "github") {
      const v = value as { token?: string } | string;
      const token = typeof v === "string" ? v : v.token;
      if (!token) continue;
      toStore = { token };
    }
    await db.setting.upsert({
      where: { key },
      create: { key, value: JSON.stringify(toStore) },
      update: { value: JSON.stringify(toStore) },
    });
  }
}

export async function getRawSetting(key: string): Promise<Record<string, unknown> | string | null> {
  const rows = await db.setting.findMany({ where: { key } });
  const raw = settingRaw(rows, key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

// ---------------- providers & models ----------------

export async function listProviders() {
  const rows = await db.providerConfig.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    providerId: r.providerId,
    providerName: r.providerName,
    baseUrl: r.baseUrl,
    apiType: r.apiType,
    models: safeJson(r.models) as { modelId: string; contextWindow?: number; supportsImages?: boolean }[],
    enabled: r.enabled,
    isBuiltin: r.isBuiltin,
    hasKey: !!r.apiKey && r.apiKey !== "builtin",
  }));
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s || "[]");
  } catch {
    return [];
  }
}

export interface ProviderUpsert {
  providerId: string;
  providerName?: string;
  apiKey?: string;
  baseUrl?: string;
  apiType?: string;
  models?: { modelId: string; contextWindow?: number; supportsImages?: boolean }[];
  enabled?: boolean;
}

export async function upsertProvider(body: ProviderUpsert) {
  const existing = await db.providerConfig.findUnique({ where: { providerId: body.providerId } });
  const data = {
    providerName: body.providerName || body.providerId,
    baseUrl: body.baseUrl ?? existing?.baseUrl ?? "",
    apiType: body.apiType ?? existing?.apiType ?? "openai-chat-completions",
    models: JSON.stringify(body.models ?? (existing ? safeJson(existing.models) : [])),
    enabled: body.enabled ?? existing?.enabled ?? true,
    ...(body.apiKey ? { apiKey: body.apiKey } : {}),
  };
  await db.providerConfig.upsert({
    where: { providerId: body.providerId },
    create: { providerId: body.providerId, ...data },
    update: data,
  });
  // regenerate provider_config.json for the core
  const { writeProviderConfig } = await import("./runtime");
  await writeProviderConfig();
  return listProviders();
}

export async function deleteProvider(providerId: string) {
  const row = await db.providerConfig.findUnique({ where: { providerId } });
  if (row?.isBuiltin) return;
  await db.providerConfig.delete({ where: { providerId } }).catch(() => undefined);
}

export async function testProvider(providerId: string): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const row = await db.providerConfig.findUnique({ where: { providerId } });
  if (!row) return { ok: false, error: "not found" };
  let baseUrl = row.baseUrl;
  if (row.isBuiltin && providerId === "zai-bridge") baseUrl = "http://127.0.0.1:3031/llm/v1";
  if (!baseUrl) return { ok: false, error: "no baseUrl" };
  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${row.apiKey || "x"}` },
      body: JSON.stringify({ model: (safeJson(row.models) as { modelId: string }[])?.[0]?.modelId || "gpt-4o", messages: [{ role: "user", content: "ping" }], max_tokens: 4, stream: false }),
      signal: AbortSignal.timeout(30000),
    });
    const latencyMs = Date.now() - start;
    if (res.ok) return { ok: true, latencyMs };
    const text = await res.text().catch(() => "");
    return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 160)}` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function listModels() {
  const providers = await db.providerConfig.findMany({ where: { enabled: true } });
  const models: { id: string; providerId: string; modelId: string; label: string; builtin: boolean }[] = [
    { id: "zai-bridge::zai-glm", providerId: "zai-bridge", modelId: "zai-glm", label: "Z.ai GLM (built-in, free)", builtin: true },
  ];
  for (const p of providers) {
    if (p.providerId === "zai-bridge") continue;
    for (const m of safeJson(p.models) as { modelId: string }[]) {
      models.push({ id: `${p.providerId}::${m.modelId}`, providerId: p.providerId, modelId: m.modelId, label: `${p.providerName}: ${m.modelId}`, builtin: false });
    }
  }
  return models;
}

// ---------------- usage ----------------

export async function usageStats() {
  const [projects, messages, settings] = await Promise.all([
    db.project.count(),
    db.agentMessage.count(),
    db.setting.findUnique({ where: { key: "usageTotals" } }),
  ]);
  let totals = { totalTokens: 0, inputTokens: 0, outputTokens: 0, modelRequestCount: 0, modelErrorCount: 0 };
  if (settings) {
    try {
      totals = { ...totals, ...(JSON.parse(settings.value) as typeof totals) };
    } catch {
      /* noop */
    }
  }
  return { ...totals, projects, messages };
}

export async function bumpUsage(delta: Partial<{ totalTokens: number; inputTokens: number; outputTokens: number; modelRequestCount: number; modelErrorCount: number }>) {
  const cur = await usageStats();
  const next = {
    totalTokens: cur.totalTokens + (delta.totalTokens || 0),
    inputTokens: cur.inputTokens + (delta.inputTokens || 0),
    outputTokens: cur.outputTokens + (delta.outputTokens || 0),
    modelRequestCount: cur.modelRequestCount + (delta.modelRequestCount || 0),
    modelErrorCount: cur.modelErrorCount + (delta.modelErrorCount || 0),
  };
  await db.setting.upsert({
    where: { key: "usageTotals" },
    create: { key: "usageTotals", value: JSON.stringify(next) },
    update: { value: JSON.stringify(next) },
  });
}
