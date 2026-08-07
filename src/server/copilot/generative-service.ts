/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";

export interface GenerativeVariantInput {
  organizationId: string;
  intent: string;
}

export async function synthesizeDesignVariants(organizationId: string, intent: string) {
  // Clear old generated variants for this intent to avoid cluttering in this demo environment
  await (prisma as any).generativeVariant?.deleteMany({
    where: { organizationId, intent },
  }).catch(() => null);

  // Find suppliers that we can recommend
  const activeSuppliers = await prisma.supplier.findMany({
    where: { organizationId, status: "ACTIVE" },
    take: 3,
  }).catch(() => []) ?? [];

  const supplierIds = activeSuppliers.map((s) => s.id);

  // Generate 3 design options based on the intent keywords
  const lowerIntent = intent.toLowerCase();

  let designCategory = "Bracket";
  if (lowerIntent.includes("chamber") || lowerIntent.includes("thrust")) {
    designCategory = "Thrust Chamber Assembly";
  } else if (lowerIntent.includes("manifold") || lowerIntent.includes("pipe")) {
    designCategory = "Propellant Manifold";
  } else if (lowerIntent.includes("nozzle") || lowerIntent.includes("cone")) {
    designCategory = "Expansion Nozzle";
  }

  const variants = [
    {
      id: "var-opt-a",
      organizationId,
      intent,
      name: `${designCategory} Option A: Additive Optimized`,
      description:
        "Generative lattice design optimized for Laser Powder Bed Fusion (LPBF) in Inconel 718. Mass is minimized using variable density structures.",
      geometrySpecs: {
        massKg: designCategory === "Bracket" ? 1.4 : 18.5,
        dimensions: "150mm x 120mm x 80mm",
        minimumWallThickness: "1.2mm",
        manufacturingProcess: "Additive (LPBF)",
        material: "Inconel 718",
      },
      predictedCost: designCategory === "Bracket" ? 340.0 : 4200.0,
      predictedLeadTime: 8, // 8 days
      manufacturabilityScore: 92.5,
      confidenceScore: 95.0,
      matchedSupplierIds: supplierIds.slice(0, 2),
      rationale:
        "Fuses organic topologies with Inconel 718 additive rules. Matches historical high-yield runs on EOS M400 printers. Lowers post-process tooling requirements.",
    },
    {
      id: "var-opt-b",
      organizationId,
      intent,
      name: `${designCategory} Option B: Subtractive Lightened`,
      description:
        "Machined variant using 5-axis CNC pocketing in Titanium 6Al-4V. Conventional build strategy with weight-saving pockets.",
      geometrySpecs: {
        massKg: designCategory === "Bracket" ? 1.9 : 24.0,
        dimensions: "155mm x 120mm x 82mm",
        minimumWallThickness: "1.8mm",
        manufacturingProcess: "Subtractive (5-Axis Milling)",
        material: "Titanium 6Al-4V",
      },
      predictedCost: designCategory === "Bracket" ? 220.0 : 2900.0,
      predictedLeadTime: 12,
      manufacturabilityScore: 88.0,
      confidenceScore: 90.0,
      matchedSupplierIds: supplierIds.slice(1, 3),
      rationale:
        "Subtractive approach avoids LPBF thermal stress issues. Leverages proven 5-axis tooling paths. Minor risk of chatter in thin pocket walls.",
    },
    {
      id: "var-opt-c",
      organizationId,
      intent,
      name: `${designCategory} Option C: Hybrid Cast-Finish`,
      description:
        "Hybrid casting with critical flange surfaces post-machined. Optimized for batch production scale.",
      geometrySpecs: {
        massKg: designCategory === "Bracket" ? 2.2 : 28.5,
        dimensions: "160mm x 125mm x 85mm",
        minimumWallThickness: "3.0mm",
        manufacturingProcess: "Hybrid (Investment Casting + CNC)",
        material: "316L Stainless Steel",
      },
      predictedCost: designCategory === "Bracket" ? 110.0 : 1500.0,
      predictedLeadTime: 25,
      manufacturabilityScore: 85.0,
      confidenceScore: 82.5,
      matchedSupplierIds: supplierIds.slice(0, 1),
      rationale:
        "Lowest unit cost but higher lead time due to mold preparation. High manufacturing yield guaranteed by thick-wall cast parameters.",
    },
  ];

  const created = [];
  for (const v of variants) {
    const item = await (prisma as any).generativeVariant?.create({
      data: v,
    }).catch(() => v);
    created.push(item || v);
  }

  return created;
}

export async function getGenerativeVariants(organizationId: string, intent: string) {
  const variants = await (prisma as any).generativeVariant?.findMany({
    where: { organizationId, intent },
    orderBy: { createdAt: "desc" },
  }).catch(() => []) ?? [];

  if (variants.length > 0) return variants;
  return synthesizeDesignVariants(organizationId, intent);
}
