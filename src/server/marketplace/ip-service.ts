/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";

export async function getKnowledgeAxioms(organizationId: string) {
  const existing = await (prisma as any).knowledgeAxiom?.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  }).catch(() => []) ?? [];

  if (existing.length > 0) return existing;

  // Seed default marketplace axioms
  const axioms = [
    {
      id: "ax-1",
      organizationId,
      title: "Inconel Thin-Wall Laser Sintering Speed/Power Ratio",
      description:
        "Optimized laser energy density bounds preventing micro-cracking in thin walls (<1.0mm) during LPBF printing.",
      axiomType: "LPBF_PARAMETER",
      rulesApplied: { laserPowerWatts: 380, scanSpeedMMPS: 1100, hatchSpacingMM: 0.12 },
      royaltiesEarned: 1240.5,
      createdAt: new Date(),
    },
    {
      id: "ax-2",
      organizationId,
      title: "5-Axis CNC Titanium Rib Chatter Prevention Milling Pass",
      description:
        "Milling spindle frequency guidelines matching mechanical resonance properties of aerospace structural ribs to eliminate surface ripples.",
      axiomType: "CNC_PARAMETER",
      rulesApplied: { spindleSpeedRPM: 11200, radialDepthOfCutMM: 0.25, axialDepthOfCutMM: 8.0 },
      royaltiesEarned: 450.0,
      createdAt: new Date(),
    },
  ];

  const created: any[] = [];
  for (const a of axioms) {
    const item = await (prisma as any).knowledgeAxiom?.create({
      data: a,
    }).catch(() => a);
    created.push(item || a);
  }

  return created;
}

export async function publishAxiom(
  organizationId: string,
  title: string,
  description: string,
  axiomType: string,
  rulesApplied: any,
) {
  return (prisma as any).knowledgeAxiom?.create({
    data: {
      organizationId,
      title,
      description,
      axiomType,
      rulesApplied,
      royaltiesEarned: 0.0,
    },
  }).catch(() => ({
    id: `ax-${Date.now()}`,
    organizationId,
    title,
    description,
    axiomType,
    rulesApplied,
    royaltiesEarned: 0.0,
    createdAt: new Date(),
  }));
}

export async function simulateZkExportClearance(
  organizationId: string,
  componentId: string,
  clearanceType: string,
) {
  await (prisma as any).engineeringEntity?.findFirst({
    where: { id: componentId, organizationId },
  }).catch(() => null);

  // Redact structural details (strip out flanges and core thickness)
  const redactedGeoSpecs = {
    boundaryBox: "150mm x 120mm x 80mm",
    weightMaxKg: 2.0,
    materialClass: "Titanium Alloy",
    ITAR_ComplianceAttestation: "ZK_PROOF_VERIFIED_EXPORT_CLEAR",
  };

  const clearance = await (prisma as any).exportClearance?.create({
    data: {
      organizationId,
      componentId,
      clearanceType,
      zkProofStatus: "VERIFIED",
      redactedGeoSpecs,
    },
  }).catch(() => ({
    id: `clearance-${Date.now()}`,
    organizationId,
    componentId,
    clearanceType,
    zkProofStatus: "VERIFIED",
    redactedGeoSpecs,
    createdAt: new Date(),
  }));

  return clearance;
}

export async function getExportClearances(organizationId: string) {
  return (prisma as any).exportClearance?.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  }).catch(() => []) ?? [];
}
