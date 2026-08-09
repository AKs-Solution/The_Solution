/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";

export async function getSupplyChainRisks(organizationId: string) {
  const existing = await (prisma as any).supplyChainRisk?.findMany({
    where: { organizationId },
    orderBy: { simulatedAt: "desc" },
    take: 5,
  }).catch(() => []) ?? [];

  if (existing.length > 0) return existing;

  return simulateSupplyChainRisks(organizationId);
}

export async function simulateSupplyChainRisks(organizationId: string) {
  const risks = [
    {
      id: "risk-1",
      organizationId,
      programName: "Artemis III Nozzle Ring Assembly",
      criticalPathRisk: 78.4,
      bottlenecks: {
        supplierName: "Apex Additive Aerospace",
        cause: "LPBF spindle-hour congestion",
        leadTimeDelayDays: 22,
      },
      delayProbability: 0.85,
      simulatedAt: new Date(),
    },
    {
      id: "risk-2",
      organizationId,
      programName: "eVTOL Carbon Wing Spar",
      criticalPathRisk: 24.5,
      bottlenecks: {
        supplierName: "Composite Structural Systems",
        cause: "Resin material certification delay",
        leadTimeDelayDays: 5,
      },
      delayProbability: 0.3,
      simulatedAt: new Date(),
    },
  ];

  await (prisma as any).supplyChainRisk?.deleteMany({
    where: { organizationId },
  }).catch(() => null);

  const created = [];
  for (const r of risks) {
    const item = await (prisma as any).supplyChainRisk?.create({
      data: r,
    }).catch(() => r);
    created.push(item || r);
  }

  return created;
}

export async function triggerMitigation(organizationId: string, riskId: string) {
  const risk = await (prisma as any).supplyChainRisk?.findFirst({
    where: { id: riskId, organizationId },
  }).catch(() => null);

  if (!risk) {
    return {
      id: riskId,
      criticalPathRisk: 12.0,
      delayProbability: 0.15,
      bottlenecks: {
        supplierName: "Helix Machining Solutions (Alternate)",
        cause: "Mitigated via automated capacity re-routing",
        leadTimeDelayDays: 0,
      },
      simulatedAt: new Date(),
    };
  }

  // Update showing mitigation applied: re-routing drops risk parameters
  return (prisma as any).supplyChainRisk?.update({
    where: { id: riskId },
    data: {
      criticalPathRisk: 12.0,
      delayProbability: 0.15,
      bottlenecks: {
        supplierName: "Helix Machining Solutions (Alternate)",
        cause: "Mitigated via automated capacity re-routing",
        leadTimeDelayDays: 0,
      },
    },
  }).catch(() => ({
    ...risk,
    criticalPathRisk: 12.0,
    delayProbability: 0.15,
    bottlenecks: {
      supplierName: "Helix Machining Solutions (Alternate)",
      cause: "Mitigated via automated capacity re-routing",
      leadTimeDelayDays: 0,
    },
  }));
}
