// agent-service — workspace seeding, AGENTS.md contract, worklog, PLAN/TODO.
import fs from "node:fs";
import path from "node:path";
import { db } from "./db";
import { projectWorkspaceDir } from "./config";
import { BUILTIN_MODES, seedFilesFor, getBuiltinMode, type ModeDef } from "./modes";
import { MODE_RULES, agentsMdFor } from "./agents-md";

export function customModeDirective(slug: string): { directive: string; framework: string; swarmAllowed: boolean } | null {
  return null; // replaced by db lookup in index.ts
}

export async function resolveMode(modeSlug: string): Promise<ModeDef & { isCustom: boolean }> {
  if (modeSlug.startsWith("custom:")) {
    const slug = modeSlug.slice(7);
    const row = await db.modeTemplate.findUnique({ where: { slug } });
    if (row) {
      return {
        slug: modeSlug,
        name: row.name,
        icon: row.icon,
        color: row.color,
        description: row.directive.slice(0, 80) || "Custom mode",
        frameworks: [row.framework],
        samplePrompts: safeJsonArray(row.samplePrompts) as string[],
        swarmAllowed: row.swarmAllowed,
        directive: row.directive,
        skills: safeJsonArray(row.skills) as string[],
        defaultFramework: row.framework,
        isCustom: true,
      };
    }
  }
  const builtin = getBuiltinMode(modeSlug) || BUILTIN_MODES[0];
  return { ...builtin, isCustom: false };
}

function safeJsonArray(s: string | null | undefined): unknown[] {
  try {
    const v = JSON.parse(s || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export async function seedWorkspaceIfNeeded(projectId: string, modeSlug: string, framework: string, modeConfig: Record<string, unknown>): Promise<void> {
  const dir = projectWorkspaceDir(projectId);
  const marker = path.join(dir, ".zc-seeded");
  if (fs.existsSync(marker)) return;

  const seed = modeSlug.startsWith("custom:")
    ? await seedForCustomMode(modeSlug.slice(7))
    : seedFilesFor(modeSlug, framework);
  for (const f of seed) {
    const full = path.join(dir, f.path);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, f.content);
  }

  // AGENTS.md — the workspace contract the core reads
  const mode = await resolveMode(modeSlug);
  fs.writeFileSync(path.join(dir, "AGENTS.md"), agentsMdFor(mode.name, MODE_RULES[modeSlug] || MODE_RULES.default));

  // work docs
  if (!fs.existsSync(path.join(dir, "PLAN.md"))) fs.writeFileSync(path.join(dir, "PLAN.md"), "# Plan\n\n(tbd)\n");
  if (!fs.existsSync(path.join(dir, "TODO.md"))) fs.writeFileSync(path.join(dir, "TODO.md"), "# TODO\n\n- [ ] Initial setup\n");
  if (!fs.existsSync(path.join(dir, "WORKLOG.md"))) fs.writeFileSync(path.join(dir, "WORKLOG.md"), "# Worklog\n\n");

  // .zcode workspace config (skills/mcp hints)
  const zcodeDir = path.join(dir, ".zcode");
  fs.mkdirSync(zcodeDir, { recursive: true });
  const mcpServers = (modeConfig?.mcpServers as string[] | undefined) || [];
  fs.writeFileSync(path.join(zcodeDir, "config.json"), JSON.stringify({ mode: modeSlug }, null, 2));

  // git init
  const git = Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
  void git;
  Bun.spawnSync(["git", "add", "-A"], { cwd: dir });
  Bun.spawnSync(["git", "-c", "user.email=agent@zcode.local", "-c", "user.name=ZCode Builder", "commit", "-qm", "seed workspace"], { cwd: dir });

  fs.writeFileSync(marker, new Date().toISOString());
}

async function seedForCustomMode(slug: string): Promise<{ path: string; content: string }[]> {
  const row = await db.modeTemplate.findUnique({ where: { slug } });
  if (!row) return [];
  try {
    return JSON.parse(row.startingFiles || "[]");
  } catch {
    return [];
  }
}

export function nextWorklogTaskId(dir: string): number {
  try {
    const content = fs.readFileSync(path.join(dir, "WORKLOG.md"), "utf8");
    const matches = [...content.matchAll(/Task ID:\s*(\d+)/g)];
    return matches.reduce((max, m) => Math.max(max, Number(m[1])), 0) + 1;
  } catch {
    return 1;
  }
}

export function appendWorklogRunHeader(dir: string, taskId: number, task: string): void {
  const file = path.join(dir, "WORKLOG.md");
  const stamp = new Date().toISOString();
  const section = `\n---\nTask ID: ${taskId}\nAgent: main-agent\nTask: ${task.replace(/\n/g, " ").slice(0, 200)}\nDate: ${stamp}\n\nWork Log:\n- (agent fills this during the turn)\n\nStage Summary:\n- (agent fills)\n`;
  fs.appendFileSync(file, section);
}

export async function generateTitle(prompt: string): Promise<string | null> {
  try {
    const { bridgeText } = await import("./bridge");
    const raw = await bridgeText(
      `Give a short product/app title (2-5 words, Title Case, no quotes) for this request:\n"${prompt.slice(0, 300)}"`,
      "You output only the title.",
      32,
    );
    const clean = raw.replace(/["'\n]/g, "").trim();
    return clean ? clean.slice(0, 60) : null;
  } catch {
    return null;
  }
}
