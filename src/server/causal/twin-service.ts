/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";

export async function getCausalTwins(organizationId: string) {
  const existing = await (prisma as any).causalFlightTwin?.findMany({
    where: { organizationId },
    orderBy: { updatedAt: "desc" },
  }).catch(() => []) ?? [];

  return existing;
}

export async function simulateFlightTwinWear(organizationId: string, twinId: string) {
  const twin = await (prisma as any).causalFlightTwin?.findFirst({
    where: { id: twinId, organizationId },
  }).catch(() => null);

  if (!twin) {
    return null;
  }

  return (prisma as any).causalFlightTwin?.update({
    where: { id: twinId },
    data: {
      flightHours: twin.flightHours + 250.0,
      predictedLifeHrs: Math.max(2000.0, twin.predictedLifeHrs - 400.0),
    },
  }).catch(() => twin);
}

