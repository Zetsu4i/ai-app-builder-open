// agent-service — swarm worker sessions: run a scoped worker turn through the real core
// in an isolated lane workspace and capture the final report text.
import type { ZCodeRuntime } from "./runtime";

const swarmReports = new Map<string, string>();
const swarmWaiters = new Map<string, (text: string) => void>();

/** Register interest in a swarm session's final report. */
export function awaitSwarmReport(sessionId: string, timeoutMs = 12 * 60_000): Promise<string> {
  return new Promise((resolve) => {
    const existing = swarmReports.get(sessionId);
    if (existing !== undefined) return resolve(existing);
    const timer = setTimeout(() => {
      swarmWaiters.delete(sessionId);
      resolve(swarmReports.get(sessionId) ?? "Worker timeout — no report");
    }, timeoutMs);
    swarmWaiters.set(sessionId, (text) => {
      clearTimeout(timer);
      resolve(text);
    });
  });
}

/** Called by turns.ts when a turn completes for a swarm session. */
export function completeSwarmReport(sessionId: string, text: string) {
  swarmReports.set(sessionId, text);
  const waiter = swarmWaiters.get(sessionId);
  if (waiter) {
    swarmWaiters.delete(sessionId);
    waiter(text);
  }
}

/**
 * Create (or reuse) a dedicated core session for a swarm lane and run the brief as one turn.
 * Returns the final assistant text (the report).
 */
export async function ensureSwarmSession(runtime: ZCodeRuntime, laneKey: string, laneDir: string, brief: string): Promise<string> {
  const key = `swarm:${laneKey}`;
  let sessionId = runtime.getSessionId(key);
  if (!sessionId) {
    sessionId = await runtime.createSession({
      projectId: key,
      workspacePath: laneDir,
    });
  }
  const reportPromise = awaitSwarmReport(sessionId);
  await runtime.send(key, brief);
  const report = await reportPromise;
  return report || "Worker produced no report.";
}
