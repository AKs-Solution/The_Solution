import { prisma } from "@/server/db";

export interface RealtimeAlertItem {
  id: string;
  type: "DECISION_INVALIDATED" | "SUPPLIER_DEGRADATION" | "PRECEDENT_MATCH" | "EVIDENCE_MISSING";
  title: string;
  reason: string;
  evidenceHashes: string[];
  affectedSystems: string[];
  recommendedAction: string;
  timestamp: string;
}

export interface ExecutiveDashboardData {
  programMaturityScore: number; // 0 - 100
  innovationVelocityIndex: number;
  activeDecisionsCount: number;
  deviatedDecisionsCount: number;
  agingAssumptionsCount: number;
  technicalDebtHotspotsCount: number;
  realtimeAlerts: RealtimeAlertItem[];
  evaluatedAt: string;
}

/**
 * Executive Dashboard & Real-time Alerting Engine
 */
export async function getExecutiveDashboardData(
  organizationId: string,
): Promise<ExecutiveDashboardData> {
  try {
    const [decisions, alerts] = await Promise.all([
      prisma.engineeringDecision
        .findMany({
          where: { organizationId },
        })
        .catch(() => []),
      prisma.anomalyAlert
        .findMany({
          orderBy: { detectedAt: "desc" },
          take: 10,
        })
        .catch(() => []),
    ]);

    const realtimeAlerts: RealtimeAlertItem[] = alerts.map((a) => ({
      id: a.id,
      type: "DECISION_INVALIDATED",
      title: a.alertType,
      reason: a.description,
      evidenceHashes: [],
      affectedSystems: a.recordId ? [a.recordId] : [],
      recommendedAction: "Conduct immediate engineering safety review.",
      timestamp: a.detectedAt.toISOString(),
    }));

    const activeDecisionsCount = decisions.length;

    return {
      programMaturityScore: 0,
      innovationVelocityIndex: 0,
      activeDecisionsCount,
      deviatedDecisionsCount: 0,
      agingAssumptionsCount: 0,
      technicalDebtHotspotsCount: 0,
      realtimeAlerts,
      evaluatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn("[ExecutiveDashboardEngine] DB query error:", err);
    return {
      programMaturityScore: 0,
      innovationVelocityIndex: 0,
      activeDecisionsCount: 0,
      deviatedDecisionsCount: 0,
      agingAssumptionsCount: 0,
      technicalDebtHotspotsCount: 0,
      realtimeAlerts: [],
      evaluatedAt: new Date().toISOString(),
    };
  }
}
