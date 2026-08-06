import { NextResponse } from "next/server";
import { logEnterpriseAuditEvent } from "@/server/enterprise/audit-logger";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const auditRecord = await logEnterpriseAuditEvent({
      organizationId: body.organizationId || "default-org",
      actorId: body.actorId || "user-chief-01",
      action: body.action || "DECISION_APPROVAL",
      resourceId: body.resourceId || "dec-prop-102",
      previousValueJson: body.previousValueJson,
      newValueJson: body.newValueJson,
      ipAddress: body.ipAddress || "10.0.4.12",
    });

    return NextResponse.json({
      success: true,
      auditRecord,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Audit log creation failed." },
      { status: 500 },
    );
  }
}
