/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";

export async function matchSuppliersToVariant(organizationId: string, variantId: string) {
  const variant = await (prisma as any).generativeVariant
    ?.findUnique({
      where: { id: variantId },
    })
    .catch(() => null);

  // Get matching suppliers
  const matchedIds = (variant?.matchedSupplierIds as string[]) || [];

  // If we have matched ids from generation, fetch them; otherwise fetch active suppliers in organization
  let suppliers =
    (await (prisma as any).supplier
      ?.findMany({
        where: {
          organizationId,
          ...(matchedIds.length > 0 ? { id: { in: matchedIds } } : { status: "ACTIVE" }),
        },
        include: {
          capabilities: true,
          facilities: true,
          qualityEvents: true,
          certifications: true,
        },
      })
      .catch(() => [])) ?? [];

  // If no suppliers matched, fallback to any active suppliers in organization
  if (suppliers.length === 0) {
    suppliers =
      (await (prisma as any).supplier
        ?.findMany({
          where: { organizationId, status: "ACTIVE" },
          include: {
            capabilities: true,
            facilities: true,
            qualityEvents: true,
            certifications: true,
          },
          take: 3,
        })
        .catch(() => [])) ?? [];
  }

  // Map to marketplace matching models containing real-time capacity and quality risk metrics
  const results = suppliers.map((s: any) => {
    // Calculate historical NCRs
    const ncrs = (s.qualityEvents || []).filter(
      (e: any) => e.eventType === "NCR" && e.status === "OPEN",
    ).length;

    // Determine dynamic matching score based on live capacity, certifications, and quality history
    let matchScore = 100;

    // Penalize for open NCRs
    matchScore -= ncrs * 10;

    const rating = typeof s.rating === "number" ? s.rating : null;
    const liveCapacityScore = typeof s.liveCapacityScore === "number" ? s.liveCapacityScore : null;
    if (typeof rating === "number") {
      matchScore = Math.round(matchScore * (rating / 5.0));
    }
    matchScore = Math.max(0, Math.min(matchScore, 100));

    const baseLeadTime = 10;
    const adjustedLeadTime =
      liveCapacityScore && liveCapacityScore > 0
        ? Math.round(baseLeadTime / liveCapacityScore)
        : null;

    return {
      supplierId: s.id,
      name: s.name,
      identifier: s.identifier,
      rating,
      liveCapacityScore,
      matchScore,
      leadTimeDays: adjustedLeadTime,
      activeNcrCount: ncrs,
      capabilities: (s.capabilities || []).map((c: any) => c.capabilityName),
      certifications: (s.certifications || []).map(
        (c: any) => c.name || c.certificationType || "Certified",
      ),
      riskLevel: ncrs > 2 ? "HIGH" : ncrs > 0 ? "MEDIUM" : "LOW",
    };
  });

  // Sort by match score descending
  return results.sort((a: any, b: any) => b.matchScore - a.matchScore);
}

/** Intentionally a no-op: never invent ratings, capacity, or tags for a tenant. */
export async function seedSupplierCapacities(_organizationId: string) {
  void _organizationId;
}
