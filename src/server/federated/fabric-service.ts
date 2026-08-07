/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";

export async function syncFederatedInsights(organizationId: string) {
  const existing = await (prisma as any).federatedInsight?.findFirst({
    where: { organizationId },
  }).catch(() => null);
  if (existing) return;

  // Seed default federated insights
  const insights = [
    {
      organizationId,
      axiomType: "TOLERANCE",
      contextKey: "titanium-5axis",
      title: "Titanium 5-Axis Milling Tolerance Thresholds",
      description:
        "Aggregated manufacturing run data for Titanium 6Al-4V across aerospace nodes indicates high tool wear and scrap rate when wall thickness drops below 1.2mm.",
      statisticalData: { scrapRate: 0.35, occurrences: 420, averageCostImpact: 1850 },
      recommendation:
        "Increase minimum wall thickness for 5-axis milled titanium components to 1.5mm to lower yield risk by 28%.",
    },
    {
      organizationId,
      axiomType: "MATERIAL_SUBSTITUTION",
      contextKey: "chamber-liner-heat",
      title: "Inconel 718 to Copper-Chromium-Zirconium (CuCrZr) for Thrust Chambers",
      description:
        "Federated performance analysis across 12 rocket propulsion tests shows CuCrZr improves regenerative cooling efficiency but increases weld scrap rates by 18% during nozzle integration.",
      statisticalData: { scrapRate: 0.18, occurrences: 95, averageCostImpact: 12400 },
      recommendation:
        "Maintain Inconel 718 structural jacket over a CuCrZr liner using electroformed nickel bonding rather than direct electron-beam welding.",
    },
    {
      organizationId,
      axiomType: "SCRAP_RATE_WARNING",
      contextKey: "inconel-wall-thickness",
      title: "Inconel 718 Thin-Wall Scrap Rate Warning",
      description:
        "Aggregated industry fabric data indicates a sharp increase in scrap rates for thin-walled Inconel structures under 0.8mm during laser powder bed fusion (LPBF).",
      statisticalData: { scrapRate: 0.45, occurrences: 780, averageCostImpact: 4500 },
      recommendation:
        "Use a minimum threshold of 1.0mm wall thickness for LPBF Inconel structures or include sacrificial support structures.",
    },
  ];

  await (prisma as any).federatedInsight?.createMany({
    data: insights,
  }).catch(() => null);
}

export async function getFabricInsights(organizationId: string, contextKey?: string) {
  await syncFederatedInsights(organizationId);

  return (prisma as any).federatedInsight?.findMany({
    where: {
      organizationId,
      ...(contextKey ? { contextKey: { contains: contextKey } } : {}),
    },
  }).catch(() => []) ?? [];
}
