import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { logger } from "@/shared/logging";

export type InboxKind = "interest" | "customer_care";

export async function persistInboxSubmission(input: {
  kind: InboxKind;
  email: string;
  name?: string;
  organization?: string;
  subject?: string;
  message: string;
  metadata?: Record<string, unknown>;
  delivered: boolean;
}): Promise<boolean> {
  try {
    await prisma.inboxSubmission.create({
      data: {
        kind: input.kind,
        email: input.email,
        name: input.name,
        organization: input.organization,
        subject: input.subject,
        message: input.message,
        metadata: (input.metadata ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        delivered: input.delivered,
      },
    });
    return true;
  } catch (error) {
    logger.warn("Inbox submission could not be persisted", {
      kind: input.kind,
      reason: error instanceof Error ? error.name : "unknown",
    });
    return false;
  }
}
