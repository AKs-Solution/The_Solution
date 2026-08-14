import { prisma } from "@/server/db";

/**
 * Integration-suite gate: the Phase 3/5/7/9/10 acceptance suites exercise
 * full engines against the real database (seeded engineering data, evidence
 * provenance, audit logs). They cannot pass against the in-memory offline
 * fallbacks, so they are skipped unless a live DATABASE_URL is reachable.
 */
let cached: boolean | null = null;

export async function isDatabaseAvailable(): Promise<boolean> {
  if (cached !== null) return cached;
  try {
    await Promise.race([
      prisma.$queryRawUnsafe("SELECT 1"),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB connectivity check timed out")), 3000),
      ),
    ]);
    cached = true;
  } catch {
    cached = false;
  }
  return cached;
}
