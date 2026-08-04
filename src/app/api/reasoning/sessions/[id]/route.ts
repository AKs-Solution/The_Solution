import { NextRequest, NextResponse } from "next/server";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { cancelReasoningSession, getReasoningSession } from "@/server/reasoning";
import { AppError } from "@/shared/errors";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const organizationId = await requireActiveOrganization();

    const session = await getReasoningSession(id, organizationId);
    return NextResponse.json({ data: session });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to fetch reasoning session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const organizationId = await requireActiveOrganization();

    const cancelled = await cancelReasoningSession(id, organizationId);
    return NextResponse.json({ data: cancelled });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to cancel reasoning session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
