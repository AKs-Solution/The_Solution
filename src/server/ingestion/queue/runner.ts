/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";
import { logger } from "@/shared/logging";
import { runPipeline } from "../pipeline/orchestrator";

const DEFAULT_CONCURRENCY = 2;
const DEFAULT_INTERVAL_MS = 3000;
const DEFAULT_STALE_AFTER_MS = 10 * 60 * 1000;

/**
 * Atomically claims and runs a single QUEUED job (respecting scheduledAt and
 * priority). Returns true if a job was claimed, false if the queue is empty.
 * Safe to call concurrently - the conditional updateMany ensures only one
 * caller successfully claims any given job.
 */
export async function processNextJob(): Promise<boolean> {
  const candidate = await (prisma as any).ingestionJob?.findFirst({
    where: { status: "QUEUED", scheduledAt: { lte: new Date() } },
    orderBy: [{ priority: "desc" }, { scheduledAt: "asc" }],
  }).catch(() => null);
  if (!candidate) return false;

  const claim = await (prisma as any).ingestionJob?.updateMany({
    where: { id: candidate.id, status: "QUEUED" },
    data: { status: "RUNNING" },
  }).catch(() => ({ count: 0 })) ?? { count: 0 };
  if (claim.count === 0) return false; // another worker claimed it first

  await runPipeline(candidate.id);
  return true;
}

/**
 * Finds jobs left RUNNING past a staleness threshold (indicating the process
 * was interrupted mid-run - this in-process queue doesn't survive a crash)
 * and either requeues them for another attempt or marks them FAILED once
 * maxAttempts is exhausted.
 */
export async function reconcileStuckJobs(
  staleAfterMs: number = DEFAULT_STALE_AFTER_MS,
): Promise<number> {
  const staleThreshold = new Date(Date.now() - staleAfterMs);
  const stuck = await (prisma as any).ingestionJob?.findMany({
    where: { status: "RUNNING", updatedAt: { lt: staleThreshold } },
  }).catch(() => []) ?? [];

  for (const job of stuck) {
    const maxAttempts = job.maxAttempts || 3;
    const attempt = job.attempt || 1;
    if (attempt < maxAttempts) {
      await (prisma as any).ingestionJob?.update({
        where: { id: job.id },
        data: {
          status: "QUEUED",
          attempt: attempt + 1,
          currentStage: null,
          stageIndex: 0,
          progressPercent: 0,
          errorMessage: "Requeued after an interrupted run",
        },
      }).catch(() => null);
    } else {
      await (prisma as any).ingestionJob?.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          errorMessage:
            "Job was interrupted by a process restart and exceeded its maximum attempts",
          completedAt: new Date(),
        },
      }).catch(() => null);
    }
  }

  if (stuck.length > 0) {
    logger.info("Reconciled stuck ingestion jobs", { count: stuck.length });
  }
  return stuck.length;
}

interface QueueLoopState {
  intervalHandle: ReturnType<typeof setInterval> | null;
  activeWorkers: number;
}

const globalForQueue = globalThis as unknown as { ingestionQueueLoop: QueueLoopState | undefined };

const state: QueueLoopState = globalForQueue.ingestionQueueLoop ?? {
  intervalHandle: null,
  activeWorkers: 0,
};
if (process.env.NODE_ENV !== "production") {
  globalForQueue.ingestionQueueLoop = state;
}

function tick(concurrency: number): void {
  while (state.activeWorkers < concurrency) {
    state.activeWorkers++;
    processNextJob()
      .catch((error) => {
        logger.error("Ingestion queue worker error", {
          error: error instanceof Error ? error.message : String(error),
        });
      })
      .finally(() => {
        state.activeWorkers--;
      });
  }
}

/**
 * Starts the in-process polling loop (idempotent - safe to call from every
 * "start ingestion" request; only the first call in this Node process
 * actually starts a timer, guarded the same way as the Prisma client
 * singleton so Next.js dev hot-reload doesn't spawn duplicate loops).
 */
export function startQueueLoop(options: { concurrency?: number; intervalMs?: number } = {}): void {
  if (state.intervalHandle) return;

  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;

  void reconcileStuckJobs();
  state.intervalHandle = setInterval(() => tick(concurrency), intervalMs);
}

export function stopQueueLoop(): void {
  if (state.intervalHandle) {
    clearInterval(state.intervalHandle);
    state.intervalHandle = null;
  }
}
