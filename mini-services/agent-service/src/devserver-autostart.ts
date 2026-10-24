// agent-service — automatic dev-server boot.
// The preview must come alive by itself: after a turn finishes, on hydrate
// (reload / re-open), and after a sandbox restart. No "warming up forever".
import { db } from "./db";
import { isE2BActive, sandboxDevServerAction, sandboxDevServerInfo } from "./sandbox";
import { devServerAction, devServerInfo } from "./services";
import { emitProjectEvent } from "./turns";

const lastAttempt = new Map<string, number>();
const COOLDOWN_MS = 30_000;

function autoStartable(framework: string, mode: string): boolean {
  if (mode === "design") return false; // design preview is static
  return ["react-vite", "nextjs", "flask", "express", "expo"].includes(framework);
}

/**
 * Boot the dev server for a project if it is stopped and the workspace has
 * something to serve. Safe to call often — cooldown + status guards inside.
 */
export async function maybeAutoStartDevServer(projectId: string, reason: "turn-end" | "hydrate" | "manual"): Promise<void> {
  try {
    const row = await db.project.findUnique({ where: { id: projectId } });
    if (!row) return;
    if (!autoStartable(row.framework, row.mode)) return;

    // something to serve? (avoid booting vite for a freshly seeded empty project)
    if (reason !== "manual") {
      const msgCount = await db.agentMessage.count({ where: { projectId } });
      if (msgCount === 0) return;
    }

    // E2B sandboxes: the dev server lives inside the sandbox
    if (isE2BActive(projectId)) {
      const info = sandboxDevServerInfo(projectId);
      if (info.status === "ready" || info.status === "starting") return;
      const now = Date.now();
      if (now - (lastAttempt.get(projectId) ?? 0) < COOLDOWN_MS) return;
      lastAttempt.set(projectId, now);
      await emitProjectEvent(projectId, "devserver", { status: "starting", auto: true, reason });
      void sandboxDevServerAction(projectId, "start", row.framework)
        .then((res) => emitProjectEvent(projectId, "devserver", { status: res.status, cloudUrl: res.url, error: res.error }))
        .catch((e) => emitProjectEvent(projectId, "devserver", { status: "error", error: (e as Error).message }));
      return;
    }

    const info = devServerInfo(projectId);
    if (info.status === "ready" || info.status === "starting" || info.status === "installing") return;
    const now = Date.now();
    if (now - (lastAttempt.get(projectId) ?? 0) < COOLDOWN_MS) return;
    lastAttempt.set(projectId, now);
    console.log(`[devserver] auto-start (${reason}) project=${projectId.slice(0, 8)} framework=${row.framework}`);
    await emitProjectEvent(projectId, "devserver", { status: "installing", auto: true, reason });
    void devServerAction(projectId, "start", row.framework, row.mode).catch((e) =>
      emitProjectEvent(projectId, "devserver", { status: "error", error: (e as Error).message }),
    );
  } catch (e) {
    console.warn(`[devserver] auto-start failed:`, (e as Error).message);
  }
}
