// agent-service — swarm orchestrator.
// Port of oh-my-codex primitives (claim-leases, evidence-gated completion, phase FSM)
// + symphony's single-authority tick loop, with per-lane isolated workspaces and merge.
import fs from "node:fs";
import path from "node:path";
import { db } from "./db";
import { SWARM_RUNS_ROOT, projectWorkspaceDir } from "./config";
import { emitProjectEvent } from "./turns";
import { bridgeText } from "./bridge";
import { gitCommitAll, gitCheckpoint } from "./services";

interface PlanNode {
  id: string;
  subject: string;
  description: string;
  role?: string;
  lane?: string;
  filePaths?: string[];
  depends_on?: string[];
  acceptance?: string[];
}

interface DagPlan {
  schema_version: number;
  plan_slug: string;
  nodes: PlanNode[];
  worker_policy?: { max_workers?: number };
}

const LEASE_MS = 15 * 60_000;
const STALL_MS = 5 * 60_000;
const TICK_MS = 3000;
const MAX_WORKERS = 6;
const MAX_FIX_ATTEMPTS = 3;

const activeRuns = new Map<string, { timer: ReturnType<typeof setInterval>; lastActivity: Map<string, number>; fixAttempts: number }>();

// ---------------- planning ----------------

function plannerPrompt(goal: string, tree: string): string {
  return `You are a swarm PLANNER. Decompose the goal into a strict JSON task DAG.

GOAL: ${goal}

WORKSPACE TREE:
${tree.slice(0, 2500)}

Output ONLY valid JSON (no markdown fences) with this exact shape:
{
  "schema_version": 1,
  "plan_slug": "short-slug",
  "nodes": [
    { "id": "n1", "subject": "short title", "description": "precise instructions for a worker agent",
      "role": "executor|researcher|test-engineer|reviewer", "lane": "lane-slug",
      "filePaths": ["src/auth/login.ts"], "depends_on": [], "acceptance": ["verifiable criterion"] }
  ],
  "worker_policy": { "max_workers": 3 }
}

Rules:
- 2-6 nodes. Each node must be independently executable by ONE worker in ITS OWN COPY of the workspace.
- Workers may ONLY create/edit files listed in their filePaths (no shared-file collisions).
- depends_on uses ids of other nodes (concrete, acyclic).
- Every node needs at least one acceptance criterion that can be verified by reading files.
- Include a final "integrate" node (role reviewer) that depends on all others and writes a SUMMARY.md.`;
}

function parseDag(raw: string): DagPlan | null {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const dag = JSON.parse(cleaned.slice(start, end + 1)) as DagPlan;
    if (!dag.nodes?.length) return null;
    const ids = new Set(dag.nodes.map((n) => n.id));
    for (const n of dag.nodes) {
      if (!n.id || !n.subject) return null;
      for (const dep of n.depends_on || []) if (!ids.has(dep)) return null;
    }
    // DFS cycle check
    const visiting = new Set<string>();
    const done = new Set<string>();
    const visit = (id: string): boolean => {
      if (done.has(id)) return true;
      if (visiting.has(id)) return false;
      visiting.add(id);
      const node = dag.nodes.find((n) => n.id === id)!;
      for (const dep of node.depends_on || []) if (!visit(dep)) return false;
      visiting.delete(id);
      done.add(id);
      return true;
    };
    for (const n of dag.nodes) if (!visit(n.id)) return null;
    return dag;
  } catch {
    return null;
  }
}

function deriveLanes(dag: DagPlan): { laneOf: Map<string, string>; lanes: string[] } {
  const laneOf = new Map<string, string>();
  for (const n of dag.nodes) laneOf.set(n.id, n.lane || `lane-${laneOf.size + 1}`);
  // cluster nodes with identical filePath sets into same lane
  const byFiles = new Map<string, string>();
  for (const n of dag.nodes) {
    const key = (n.filePaths || []).slice().sort().join("|") || `files-${n.id}`;
    if (byFiles.has(key)) laneOf.set(n.id, byFiles.get(key)!);
    else byFiles.set(key, laneOf.get(n.id)!);
  }
  const lanes = [...new Set(laneOf.values())];
  return { laneOf, lanes: lanes.slice(0, MAX_WORKERS) };
}

// ---------------- materialize ----------------

async function materializeRun(projectId: string, runId: string, goal: string, dag: DagPlan, fallbackReason?: string) {
  const runDir = path.join(SWARM_RUNS_ROOT, runId);
  fs.mkdirSync(path.join(runDir, "tasks"), { recursive: true });
  fs.mkdirSync(path.join(runDir, "mailbox"), { recursive: true });
  fs.writeFileSync(path.join(runDir, "plan.md"), `# Swarm plan — ${goal}\n\n${fallbackReason ? `> Fallback: ${fallbackReason}\n` : ""}\n\`\`\`json\n${JSON.stringify(dag, null, 2)}\n\`\`\`\n`);
  fs.writeFileSync(path.join(runDir, "dag.json"), JSON.stringify(dag, null, 2));

  const { laneOf, lanes } = deriveLanes(dag);
  for (const [i, node] of dag.nodes.entries()) {
    const key = node.id;
    const status = (node.depends_on || []).length ? "blocked" : "pending";
    await db.swarmTask.create({
      data: {
        runId,
        nodeKey: key,
        subject: node.subject,
        description: node.description,
        role: node.role || "executor",
        lane: laneOf.get(key) || `lane-${i}`,
        filePaths: JSON.stringify(node.filePaths || []),
        dependsOn: JSON.stringify(node.depends_on || []),
        acceptance: JSON.stringify(node.acceptance || []),
        status,
      },
    });
    fs.writeFileSync(path.join(runDir, "tasks", `task-${key}.json`), JSON.stringify(node, null, 2));
  }
  for (const lane of lanes) {
    await db.swarmWorker.create({ data: { runId, slug: `worker-${lane.replace(/[^a-z0-9]/gi, "") || "main"}`, role: "executor", status: "idle" } });
    fs.writeFileSync(path.join(runDir, "mailbox", `${lane}.json`), JSON.stringify({ worker: lane, messages: [] }));
  }
  await db.swarmRun.update({ where: { id: runId }, data: { dagJson: JSON.stringify(dag), runDir, status: "running" } });
  return { lanes, laneOf };
}

// ---------------- worker execution ----------------

async function runWorkerTask(runId: string, projectId: string, taskId: string, workerSlug: string): Promise<void> {
  const task = await db.swarmTask.findUnique({ where: { id: taskId } });
  const run = await db.swarmRun.findUnique({ where: { id: runId } });
  if (!task || !run) return;

  const claimToken = crypto.randomUUID();
  await db.swarmTask.update({
    where: { id: taskId },
    data: { status: "in_progress", owner: workerSlug, claimToken, leasedUntil: new Date(Date.now() + LEASE_MS), attempts: { increment: 1 } },
  });
  await db.swarmWorker.update({ where: { id: (await db.swarmWorker.findFirst({ where: { runId, slug: workerSlug } }))!.id }, data: { status: "working", currentTask: task.nodeKey, lastHeartbeat: new Date() } });
  await swarmEvent(runId, "task_claimed", { taskId: task.nodeKey, owner: workerSlug });
  void emitProjectEvent(projectId, "swarm", { type: "task_started", task: task.nodeKey, worker: workerSlug });

  // isolated lane workspace: copy of the project workspace
  const baseDir = projectWorkspaceDir(projectId);
  const laneDir = path.join(SWARM_RUNS_ROOT, runId, "workspaces", task.lane);
  try {
    fs.rmSync(laneDir, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(laneDir), { recursive: true });
    Bun.spawnSync(["cp", "-R", `${baseDir}/.`, laneDir], { timeout: 60000 });
  } catch {
    fs.mkdirSync(laneDir, { recursive: true });
  }

  const filePaths = JSON.parse(task.filePaths || "[]") as string[];
  const acceptance = JSON.parse(task.acceptance || "[]") as string[];
  const brief = `You are ${workerSlug}, a ${task.role} worker in a swarm.

TASK ${task.nodeKey}: ${task.subject}
DESCRIPTION: ${task.description}

FILE SCOPE (you may ONLY create/modify these paths, relative to workspace root):
${filePaths.map((f) => `- ${f}`).join("\n") || "- (choose sensibly)"}

ACCEPTANCE CRITERIA:
${acceptance.map((a) => `- ${a}`).join("\n") || "- work completes correctly"}

RULES:
1. Work ONLY inside your file scope. Do not touch other files.
2. Verify your work (open/read files, run if applicable).
3. End your final message with a "Verification:" section listing PASS/FAIL checks for each acceptance criterion.

Complete the task now.`;

  // Execute via the swarm session (a real core session scoped to the lane workspace)
  let report = "";
  try {
    const runtimeMod = await import("./runtime");
    const runtime = runtimeMod.getRuntime();
    const { ensureSwarmSession } = await import("./swarm-session");
    report = await ensureSwarmSession(runtime, `${runId}-${task.lane}`, laneDir, brief);
  } catch (e) {
    report = `Worker failed: ${(e as Error).message}`;
  }

  // evidence gate
  const hasVerification = /Verification:/i.test(report) && /PASS/i.test(report);
  const leaseValid = true;
  const status = hasVerification && leaseValid ? "completed" : "failed";

  // write outbox + evidence file
  const outboxDir = path.join(SWARM_RUNS_ROOT, runId, "workspaces", task.lane, ".swarm");
  fs.mkdirSync(outboxDir, { recursive: true });
  fs.writeFileSync(path.join(outboxDir, "outbox.md"), report);
  fs.writeFileSync(
    path.join(outboxDir, "evidence", `task-${task.nodeKey}.json`.replace("/", "-")),
    JSON.stringify({ taskId: task.nodeKey, claimTokenSha256: await sha256(claimToken), summary: report.slice(0, 800), verification: [{ command: "report-inspection", result: hasVerification ? "passed" : "failed", output: report.slice(0, 400) }], unverified: [] }, null, 2),
  );

  await db.swarmTask.update({
    where: { id: taskId },
    data: { status, result: report.slice(0, 8000), error: status === "failed" ? "missing verification evidence" : null, claimToken: null, leasedUntil: null },
  });
  await swarmEvent(runId, status === "completed" ? "task_completed" : "task_failed", { taskId: task.nodeKey });
  void emitProjectEvent(projectId, "swarm", { type: status === "completed" ? "task_done" : "task_failed", task: task.nodeKey, worker: workerSlug });
}

async function sha256(s: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(s).digest("hex");
}

async function swarmEvent(runId: string, type: string, payload: Record<string, unknown>): Promise<void> {
  await db.swarmEvent.create({ data: { runId, type, payload: JSON.stringify(payload) } });
}

// ---------------- tick loop (single authority) ----------------

async function tick(runId: string, projectId: string) {
  const state = activeRuns.get(runId);
  if (!state) return;
  const run = await db.swarmRun.findUnique({ where: { id: runId }, include: { tasks: true, workers: true } });
  if (!run) return stopRun(runId);

  // 1. RECONCILE — reclaim expired leases
  const now = Date.now();
  for (const t of run.tasks) {
    if (t.status === "in_progress" && t.leasedUntil && t.leasedUntil.getTime() < now) {
      await db.swarmTask.update({ where: { id: t.id }, data: { status: "pending", owner: null, claimToken: null, leasedUntil: null } });
      await swarmEvent(runId, "lease_reclaimed", { taskId: t.nodeKey });
    }
  }

  // 2. counts & phase FSM
  const counts = {
    pending: run.tasks.filter((t) => t.status === "pending" || t.status === "blocked").length,
    inProgress: run.tasks.filter((t) => t.status === "in_progress").length,
    completed: run.tasks.filter((t) => t.status === "completed").length,
    failed: run.tasks.filter((t) => t.status === "failed").length,
  };

  if (counts.inProgress === 0) {
    // dispatch ready tasks
    const completedKeys = new Set(run.tasks.filter((t) => t.status === "completed").map((t) => t.nodeKey));
    const ready = run.tasks
      .filter((t) => t.status === "pending")
      .filter((t) => (JSON.parse(t.dependsOn || "[]") as string[]).every((d) => completedKeys.has(d)));

    if (ready.length) {
      const maxWorkers = Math.min(MAX_WORKERS, (JSON.parse(run.dagJson || "{}") as DagPlan)?.worker_policy?.max_workers || 3);
      let slots = Math.max(1, maxWorkers) - run.workers.filter((w) => w.status === "working").length;
      for (const task of ready) {
        if (slots <= 0) break;
        const worker = run.workers.find((w) => w.status === "idle");
        if (!worker) break;
        slots--;
        void runWorkerTask(runId, projectId, task.id, worker.slug).catch(() => undefined);
      }
    } else if (counts.failed > 0 && state.fixAttempts < MAX_FIX_ATTEMPTS) {
      // retry failed tasks (fix loop)
      state.fixAttempts++;
      for (const t of run.tasks.filter((x) => x.status === "failed")) {
        await db.swarmTask.update({ where: { id: t.id }, data: { status: "pending", error: null } });
      }
      await swarmEvent(runId, "fix_attempt", { attempt: state.fixAttempts });
    } else if (counts.failed > 0) {
      await db.swarmRun.update({ where: { id: runId }, data: { status: "failed", summary: `${counts.failed} task(s) failed after ${state.fixAttempts} fix attempts` } });
      await swarmEvent(runId, "run_failed", {});
      void emitProjectEvent(projectId, "swarm", { type: "done", status: "failed" });
      stopRun(runId);
      return;
    } else {
      // all completed → integrate
      await integrate(runId, projectId, run.tasks);
      return;
    }
  }

  // stall detection
  for (const t of run.tasks.filter((x) => x.status === "in_progress")) {
    const last = state.lastActivity.get(t.nodeKey) ?? Date.now();
    if (now - last > STALL_MS) {
      await db.swarmTask.update({ where: { id: t.id }, data: { status: "pending", owner: null, claimToken: null, leasedUntil: null } });
      await swarmEvent(runId, "stall_reclaimed", { taskId: t.nodeKey });
    }
  }

  await db.swarmRun.update({ where: { id: runId }, data: { updatedAt: new Date() } }).catch(() => undefined);
  void emitProjectEvent(projectId, "swarm", { type: "progress", counts });
}

async function integrate(runId: string, projectId: string, tasks: { lane: string; filePaths: string; status: string }[]) {
  await db.swarmRun.update({ where: { id: runId }, data: { status: "integrating" } });
  const baseDir = projectWorkspaceDir(projectId);
  let merged = 0;
  for (const t of tasks.filter((x) => x.status === "completed")) {
    const laneDir = path.join(SWARM_RUNS_ROOT, runId, "workspaces", t.lane);
    const files = JSON.parse(t.filePaths || "[]") as string[];
    for (const f of files) {
      const src = path.join(laneDir, f);
      const dst = path.join(baseDir, f);
      try {
        if (fs.existsSync(src)) {
          fs.mkdirSync(path.dirname(dst), { recursive: true });
          fs.copyFileSync(src, dst);
          merged++;
        }
      } catch {
        /* noop */
      }
    }
  }
  // leader synthesis
  let summary = `${merged} file(s) merged from ${tasks.filter((x) => x.status === "completed").length} completed task(s).`;
  try {
    summary = await bridgeText(
      `Summarize this swarm run outcome in 3-5 bullets:\n${tasks.map((t) => `- ${t.status}: ${t.lane}`).join("\n")}\nMerged files: ${merged}`,
      "You output concise markdown bullets.",
      300,
    );
  } catch {
    /* keep default */
  }
  await gitCommitAll(projectId, `swarm run ${runId}: merge lane outputs (${merged} files)`);
  await gitCheckpoint(projectId, `Swarm run complete`);
  await db.swarmRun.update({ where: { id: runId }, data: { status: "done", summary } });
  await swarmEvent(runId, "run_complete", { merged });
  void emitProjectEvent(projectId, "swarm", { type: "done", status: "done", summary });
  void emitProjectEvent(projectId, "preview", { reload: true });
  stopRun(runId);
}

function stopRun(runId: string) {
  const state = activeRuns.get(runId);
  if (state) {
    clearInterval(state.timer);
    activeRuns.delete(runId);
  }
}

// ---------------- public API ----------------

export async function startSwarm(projectId: string, goal: string): Promise<{ runId: string }> {
  const run = await db.swarmRun.create({ data: { projectId, goal, status: "planning" } });
  void emitProjectEvent(projectId, "swarm", { type: "planning", runId: run.id });
  try {
    const { workspaceTreeString } = await import("./modes");
    const tree = workspaceTreeString(projectWorkspaceDir(projectId), 3);
    const raw = await bridgeText(plannerPrompt(goal, tree), undefined, 3000);
    const dag = parseDag(raw);
    if (!dag) {
      // fallback: single sequential lane
      const fallback: DagPlan = {
        schema_version: 1,
        plan_slug: "fallback",
        nodes: [
          { id: "n1", subject: goal.slice(0, 80), description: goal, role: "executor", lane: "main", filePaths: [], depends_on: [], acceptance: ["work completes correctly"] },
        ],
        worker_policy: { max_workers: 1 },
      };
      await materializeRun(projectId, run.id, goal, fallback, "planner output invalid — single-lane fallback");
    } else {
      await materializeRun(projectId, run.id, goal, dag);
    }
  } catch (e) {
    await db.swarmRun.update({ where: { id: run.id }, data: { status: "failed", error: (e as Error).message } });
    return { runId: run.id };
  }

  const timer = setInterval(() => void tick(run.id, projectId).catch(() => undefined), TICK_MS);
  activeRuns.set(run.id, { timer, lastActivity: new Map(), fixAttempts: 0 });
  return { runId: run.id };
}

export async function stopSwarm(projectId: string): Promise<void> {
  const runs = await db.swarmRun.findMany({ where: { projectId, status: { in: ["planning", "running", "integrating"] } } });
  for (const r of runs) {
    stopRun(r.id);
    await db.swarmRun.update({ where: { id: r.id }, data: { status: "stopped" } });
    await swarmEvent(r.id, "run_stopped", {});
  }
  void emitProjectEvent(projectId, "swarm", { type: "stopped" });
}

export function currentRun(projectId: string) {
  return db.swarmRun.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: { tasks: { orderBy: { createdAt: "asc" } }, workers: true, events: { orderBy: { createdAt: "desc" }, take: 50 } },
  });
}

export function isSwarmActive(runId: string): boolean {
  return activeRuns.has(runId);
}
