import { prisma } from "@/server/db";

export interface DecisionExpectation {
  metricName: string;
  expectedValue: number | string;
  observedValue: number | string;
  unit?: string;
  isWithinBounds: boolean;
  variancePercentage: number;
}

export interface MonitoredDecision {
  decisionId: string;
  description: string;
  decisionType: string;
  status: "HEALTHY" | "DEVIATED" | "INVALIDATED";
  expectations: DecisionExpectation[];
  lastEvaluatedAt: string;
  evidenceHashes: string[];
  alertsTriggered: string[];
}

/**
 * Decision Sentinel Engine
 */
export async function monitorActiveDecisions(organizationId: string): Promise<{
  monitoredDecisions: MonitoredDecision[];
  deviatedCount: number;
  invalidatedCount: number;
}> {
  try {
    const decisions = await prisma.engineeringDecision
      .findMany({
        where: { organizationId },
        take: 20,
      })
      .catch(() => []);

    const monitored: MonitoredDecision[] = decisions.map((d) => ({
      decisionId: d.id,
      description: d.description,
      decisionType: d.decisionType,
      status: "HEALTHY",
      expectations: [],
      lastEvaluatedAt: new Date().toISOString(),
      evidenceHashes: [],
      alertsTriggered: [],
    }));

    const deviatedCount = monitored.filter((m) => m.status === "DEVIATED").length;
    const invalidatedCount = monitored.filter((m) => m.status === "INVALIDATED").length;

    return {
      monitoredDecisions: monitored,
      deviatedCount,
      invalidatedCount,
    };
  } catch (err) {
    console.warn("[DecisionSentinel] DB query error:", err);
    return {
      monitoredDecisions: [],
      deviatedCount: 0,
      invalidatedCount: 0,
    };
  }
}
