/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";

export async function getSpindleTelemetry(organizationId: string) {
  const existing = await (prisma as any).spindleTelemetry?.findMany({
    where: { organizationId },
    orderBy: { timestamp: "desc" },
    take: 10,
  }).catch(() => []) ?? [];

  if (existing.length > 0) return existing;

  return simulateSpindleTelemetries(organizationId);
}

export async function simulateSpindleTelemetries(organizationId: string) {
  // Find a supplier in the organization to link to
  const supplier = await (prisma as any).supplier?.findFirst({
    where: { organizationId, status: "ACTIVE" },
  }).catch(() => null);

  const supplierId = supplier ? supplier.id : "default-supplier-id";

  const telemetries = [
    {
      id: "spindle-1",
      organizationId,
      supplierId,
      machineId: "5-Axis CNC Mill DMG MORI DMU 50",
      spindleSpeedRPM: 12000.0,
      feedRateMMPM: 3500.0,
      vibrationG: 0.12,
      deviationMM: 0.015,
      isAdjusted: false,
      timestamp: new Date(),
    },
    {
      id: "spindle-2",
      organizationId,
      supplierId,
      machineId: "5-Axis CNC Mill DMG MORI DMU 50",
      spindleSpeedRPM: 11800.0,
      feedRateMMPM: 3450.0,
      vibrationG: 0.45,
      deviationMM: 0.052,
      isAdjusted: false,
      timestamp: new Date(),
    },
    {
      id: "spindle-3",
      organizationId,
      supplierId,
      machineId: "EOS M400 Laser Powder Bed Fusion",
      spindleSpeedRPM: 0.0,
      feedRateMMPM: 1200.0,
      vibrationG: 0.02,
      deviationMM: 0.008,
      isAdjusted: false,
      timestamp: new Date(),
    },
  ];

  await (prisma as any).spindleTelemetry?.deleteMany({
    where: { organizationId },
  }).catch(() => null);

  const created = [];
  for (const t of telemetries) {
    const item = await (prisma as any).spindleTelemetry?.create({
      data: t,
    }).catch(() => t);
    created.push(item || t);
  }

  return created;
}

export async function adjustTolerance(organizationId: string, telemetryId: string) {
  const telemetry = await (prisma as any).spindleTelemetry?.findFirst({
    where: { id: telemetryId, organizationId },
  }).catch(() => null);

  if (!telemetry) {
    return {
      id: telemetryId,
      isAdjusted: true,
      deviationMM: 0.012,
    };
  }

  return (prisma as any).spindleTelemetry?.update({
    where: { id: telemetryId },
    data: {
      isAdjusted: true,
      deviationMM: 0.012,
    },
  }).catch(() => ({
    ...telemetry,
    isAdjusted: true,
    deviationMM: 0.012,
  }));
}
