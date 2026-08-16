/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";

export interface PredictedSupplierEvent {
  supplierId: string;
  supplierName: string;
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  riskProbability: number;
  predictedEvent: string;
  timeframe: string;
  historicalPrecedents: number;
  recommendedMitigation: Array<{
    action: string;
    successRate: number;
    cost: number;
    timeImpact: number;
  }>;
}

export async function predictSupplierRisk(supplierId: string, geometryType: string = "all") {
  const supplier = await (prisma as any).supplier
    ?.findUnique({
      where: { id: supplierId },
    })
    .catch(() => null);

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  // Get historical performance indicators or construct default from live capacity
  const indicators =
    (await (prisma as any).supplierRiskIndicator
      ?.findMany({
        where: { supplierId, ...(geometryType !== "all" ? { geometryType } : {}) },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
      .catch(() => [])) ?? [];

  const liveCapacity =
    typeof supplier.liveCapacityScore === "number" ? supplier.liveCapacityScore : null;
  const rating = typeof supplier.rating === "number" ? supplier.rating : null;

  let riskProbability = 0;
  let riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
  let predictedEvent = "Insufficient supplier metrics to predict risk.";
  let timeframe = "Unavailable";
  const precedents = indicators.length;

  if (liveCapacity !== null && liveCapacity > 0.9) {
    riskProbability = 0.78;
    riskLevel = "CRITICAL";
    predictedEvent = "Lead time slip risk due to recorded capacity congestion.";
    timeframe = "Within 4-8 weeks";
  } else if (
    (rating !== null && rating < 3.5) ||
    (indicators[0] && indicators[0].riskLevel === "HIGH")
  ) {
    riskProbability = 0.62;
    riskLevel = "HIGH";
    predictedEvent = "Quality risk indicated by recorded rating or risk indicators.";
    timeframe = "Within 6 weeks";
  } else if (indicators.length > 0) {
    riskProbability = indicators[0].confidenceScore || 0;
    riskLevel =
      (indicators[0].riskLevel as unknown as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW") || "MEDIUM";
    predictedEvent = "Risk derived from recorded supplier indicators.";
    timeframe = "Based on latest indicator";
  } else if (liveCapacity !== null || rating !== null) {
    predictedEvent = "Stable operations expected from recorded metrics.";
    timeframe = "Next 12 weeks";
  }

  const mitigations: PredictedSupplierEvent["recommendedMitigation"] = [];

  return {
    supplierId: supplier.id,
    supplierName: supplier.name,
    riskLevel,
    riskProbability,
    predictedEvent,
    timeframe,
    historicalPrecedents: precedents,
    recommendedMitigation: mitigations,
  };
}

export async function getSuppliersAtRisk(organizationId: string) {
  const suppliers =
    (await (prisma as any).supplier
      ?.findMany({
        where: { organizationId },
        take: 20,
      })
      .catch(() => [])) ?? [];

  if (suppliers.length === 0) {
    return {
      suppliersAtRisk: [],
      supplyChainHealth: 0,
      recommendations: [],
    };
  }

  const risks = await Promise.all(
    suppliers.map((s: any) => predictSupplierRisk(s.id, "all").catch(() => null)),
  );

  const filtered = risks
    .filter((r: any): r is PredictedSupplierEvent => r !== null && r.riskProbability > 0.4)
    .sort((a, b) => b.riskProbability - a.riskProbability);

  const healthScore = Math.round(
    100 -
      (filtered.reduce((acc, curr) => acc + curr.riskProbability, 0) / (suppliers.length || 1)) *
        40,
  );

  return {
    suppliersAtRisk: filtered,
    supplyChainHealth: Math.max(0, Math.min(100, healthScore)),
    recommendations: filtered.length
      ? [
          "Review high-capacity suppliers for critical path geometry assignments.",
          "Implement pre-expedited tool ordering for high-risk suppliers.",
        ]
      : [],
  };
}
