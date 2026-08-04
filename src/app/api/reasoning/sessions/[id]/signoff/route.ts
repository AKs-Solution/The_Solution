import { NextRequest, NextResponse } from "next/server";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { validateSession } from "@/server/auth/session-service";
import { submitReasoningSignoff } from "@/server/reasoning";
import { AppError } from "@/shared/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const organizationId = await requireActiveOrganization();
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.status || !["APPROVED", "REJECTED", "CHALLENGED"].includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid sign-off status. Must be APPROVED, REJECTED, or CHALLENGED." },
        { status: 400 },
      );
    }

    const result = await submitReasoningSignoff(id, organizationId, session.userId, {
      status: body.status,
      comments: body.comments || "",
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to submit sign-off";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
