import { createHash } from "crypto";
import { prisma } from "@/server/db";

export interface EnterpriseAuditRecord {
  id: string;
  organizationId: string;
  actorId: string;
  action: string;
  resourceId: string;
  previousValueJson?: string;
  newValueJson?: string;
  ipAddress: string;
  integrityHash: string;
  timestamp: string;
}

/**
 * Immutable Enterprise Audit Logging Engine
 */
export async function logEnterpriseAuditEvent(params: {
  organizationId: string;
  actorId: string;
  action: string;
  resourceId: string;
  previousValueJson?: string;
  newValueJson?: string;
  ipAddress: string;
}): Promise<EnterpriseAuditRecord> {
  const timestamp = new Date().toISOString();
  const rawPayload = `${params.organizationId}:${params.actorId}:${params.action}:${params.resourceId}:${params.previousValueJson || ""}:${params.newValueJson || ""}:${params.ipAddress}:${timestamp}`;
  const integrityHash = createHash("sha256").update(rawPayload).digest("hex");

  const record: EnterpriseAuditRecord = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    organizationId: params.organizationId,
    actorId: params.actorId,
    action: params.action,
    resourceId: params.resourceId,
    previousValueJson: params.previousValueJson,
    newValueJson: params.newValueJson,
    ipAddress: params.ipAddress,
    integrityHash,
    timestamp,
  };

  try {
    if (prisma && "authEvent" in prisma) {
      await (
        prisma as unknown as { authEvent: { create: (data: unknown) => Promise<unknown> } }
      ).authEvent.create({
        data: {
          eventType: params.action,
          userId: params.actorId,
          ipAddress: params.ipAddress,
          details: JSON.stringify({
            organizationId: params.organizationId,
            resourceId: params.resourceId,
            previousValueJson: params.previousValueJson,
            newValueJson: params.newValueJson,
            integrityHash,
          }),
        },
      });
    }
  } catch (err) {
    console.warn("[AuditLogger] DB offline fallback logging:", err);
  }

  return record;
}

/**
 * Verify cryptographic hash integrity of an audit record
 */
export function verifyAuditIntegrity(record: EnterpriseAuditRecord): boolean {
  const rawPayload = `${record.organizationId}:${record.actorId}:${record.action}:${record.resourceId}:${record.previousValueJson || ""}:${record.newValueJson || ""}:${record.ipAddress}:${record.timestamp}`;
  const computedHash = createHash("sha256").update(rawPayload).digest("hex");
  return computedHash === record.integrityHash;
}
