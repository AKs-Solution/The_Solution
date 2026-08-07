/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";

export async function detectAnomalies(workspaceId: string) {
  const alerts: any[] = [];

  // 1. Sparse Data Check: Assessments with < 3 evidence records
  const assessments = await (prisma as any).drawingAssessment?.findMany({
    where: { organizationId: workspaceId },
  }).catch(() => []) ?? [];

  for (const a of assessments) {
    const evidenceList = Array.isArray((a as any).evidenceSummary) ? (a as any).evidenceSummary : [];
    if (evidenceList.length < 3) {
      const existing = await (prisma as any).anomalyAlert?.findFirst({
        where: { workspaceId, recordId: a.id, alertType: "sparse_data", isDismissed: false },
      }).catch(() => null);

      if (!existing) {
        const created = await (prisma as any).anomalyAlert?.create({
          data: {
            workspaceId,
            recordId: a.id,
            alertType: "sparse_data",
            severity: "warning",
            description: `Assessment '${a.title || a.fileName}' is based on sparse evidence (${evidenceList.length} records).`,
          },
        }).catch(() => null);
        if (created) alerts.push(created);
      }
    }
  }

  // 2. Supplier Degradation Check: Suppliers with high lead time deviation or scrap rate
  const suppliersAtRisk = await (prisma as any).supplierRiskIndicator?.findMany({
    where: { scrapRate: { gte: 4.0 } },
    include: { supplier: true },
  }).catch(() => []) ?? [];

  for (const r of suppliersAtRisk) {
    const existing = await (prisma as any).anomalyAlert?.findFirst({
      where: {
        workspaceId,
        recordId: r.supplierId,
        alertType: "supplier_degradation",
        isDismissed: false,
      },
    }).catch(() => null);

    if (!existing) {
      const created = await (prisma as any).anomalyAlert?.create({
        data: {
          workspaceId,
          recordId: r.supplierId,
          alertType: "supplier_degradation",
          severity: "critical",
          description: `Supplier '${r.supplier?.name}' scrap rate spiked to ${r.scrapRate}% on ${r.geometryType} tooling jobs.`,
        },
      }).catch(() => null);
      if (created) alerts.push(created);
    }
  }

  // 3. Data Freshness Check: No update in > 30 days
  const newestAssessment = await (prisma as any).drawingAssessment?.findFirst({
    where: { organizationId: workspaceId },
    orderBy: { updatedAt: "desc" },
  }).catch(() => null);

  if (newestAssessment) {
    const diffDays = Math.floor(
      Math.abs(Date.now() - new Date(newestAssessment.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays > 30) {
      const existing = await (prisma as any).anomalyAlert?.findFirst({
        where: { workspaceId, alertType: "stale_data", isDismissed: false },
      }).catch(() => null);

      if (!existing) {
        const created = await (prisma as any).anomalyAlert?.create({
          data: {
            workspaceId,
            alertType: "stale_data",
            severity: "warning",
            description: `Data Ingestion pipeline stale (${diffDays} days since last drawing revision sync).`,
          },
        }).catch(() => null);
        if (created) alerts.push(created);
      }
    }
  }

  return alerts;
}

export async function getActiveAnomalies(workspaceId: string) {
  await detectAnomalies(workspaceId);
  return (prisma as any).anomalyAlert?.findMany({
    where: { workspaceId, isDismissed: false },
    orderBy: { detectedAt: "desc" },
  }).catch(() => []) ?? [];
}

export async function dismissAnomaly(id: string, userId: string) {
  return (prisma as any).anomalyAlert?.update({
    where: { id },
    data: {
      isDismissed: true,
      dismissedAt: new Date(),
      dismissedById: userId,
    },
  }).catch(() => null);
}
