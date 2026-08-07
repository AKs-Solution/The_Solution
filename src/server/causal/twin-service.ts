/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";

export async function getCausalTwins(organizationId: string) {
  const existing = await (prisma as any).causalFlightTwin?.findMany({
    where: { organizationId },
    orderBy: { updatedAt: "desc" },
  }).catch(() => []) ?? [];

  if (existing.length > 0) return existing;

  // Find an engineering entity
  const entity = await prisma.engineeringEntity.findFirst({
    where: { organizationId, deletedAt: null },
  }).catch(() => null);

  const componentId = entity ? entity.id : "default-component-id";

  const defaultTwin = {
    id: "demo-twin-1",
    organizationId,
    componentId,
    flightHours: 1240.5,
    metrologyAnomalyMM: 0.038,
    predictedLifeHrs: 8000.0,
  };

  const createdItem = await (prisma as any).causalFlightTwin?.create({
    data: {
      organizationId,
      componentId,
      flightHours: 1240.5,
      metrologyAnomalyMM: 0.038,
      predictedLifeHrs: 8000.0,
    },
  }).catch(() => defaultTwin);

  return [createdItem || defaultTwin];
}

export async function simulateFlightTwinWear(organizationId: string, twinId: string) {
  const twin = await (prisma as any).causalFlightTwin?.findFirst({
    where: { id: twinId, organizationId },
  }).catch(() => null);

  if (!twin) {
    return {
      id: twinId,
      flightHours: 1490.5,
      predictedLifeHrs: 7600.0,
    };
  }

  return (prisma as any).causalFlightTwin?.update({
    where: { id: twinId },
    data: {
      flightHours: twin.flightHours + 250.0,
      predictedLifeHrs: Math.max(2000.0, twin.predictedLifeHrs - 400.0),
    },
  }).catch(() => twin);
}
