import { NextResponse } from "next/server";
import { validateSession } from "@/server/auth/session-service";
import {
  getDecisionAuditTrail,
  approveDecision,
  addDecisionMilestone,
} from "@/server/decisions/decision-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const auditTrail = await getDecisionAuditTrail(id, session.organizationId);

    if (!auditTrail) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 });
    }

    return NextResponse.json({ data: auditTrail });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      action,
      approvalType,
      comment,
      conditions,
      milestoneType,
      status,
      actualOutcome,
      metrics,
    } = body;

    if (action === "approve") {
      const result = await approveDecision({
        decisionId: id,
        approverId: session.userId,
        organizationId: session.organizationId,
        approvalType: approvalType || "APPROVED",
        comment,
        conditions,
      });
      return NextResponse.json({ data: result });
    }

    if (action === "milestone") {
      const result = await addDecisionMilestone({
        decisionId: id,
        organizationId: session.organizationId,
        milestoneType: milestoneType || "FIRST_ARTICLE",
        status: status || "COMPLETE",
        actualOutcome,
        metrics,
      });
      return NextResponse.json({ data: result });
    }

    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
