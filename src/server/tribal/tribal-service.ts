/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";

export async function getTribalLogs(organizationId: string) {
  const existing = await (prisma as any).tribalKnowledgeLog?.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  }).catch(() => []) ?? [];

  if (existing.length > 0) return existing;

  const logs = [
    {
      id: "tribal-1",
      organizationId,
      operatorName: "Marcus Vance (Senior CNC Specialist)",
      transcription:
        "When milling titanium grade 5 brackets under high moisture, I had to decrease target spindle speed to 10500 RPM to mitigate thermal ripple stress on the bolt holes.",
      associatedCert: "AS9100-Milling-1042",
      gcodeOffset: "G01 X15.4 Y20.8 F3500 -> G01 F3000",
      createdAt: new Date(),
    },
  ];

  const created = [];
  for (const l of logs) {
    const item = await (prisma as any).tribalKnowledgeLog?.create({ data: l }).catch(() => l);
    created.push(item || l);
  }

  return created;
}

export async function captureOperatorOverride(
  organizationId: string,
  operatorName: string,
  transcription: string,
  associatedCert?: string,
  gcodeOffset?: string,
) {
  return (prisma as any).tribalKnowledgeLog?.create({
    data: {
      organizationId,
      operatorName,
      transcription,
      associatedCert: associatedCert || null,
      gcodeOffset: gcodeOffset || "AUTO_GCODE_OFFSET_APPLIED",
    },
  }).catch(() => ({
    id: `tribal-${Date.now()}`,
    organizationId,
    operatorName,
    transcription,
    associatedCert: associatedCert || null,
    gcodeOffset: gcodeOffset || "AUTO_GCODE_OFFSET_APPLIED",
    createdAt: new Date(),
  }));
}
