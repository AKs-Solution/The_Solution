import { NextRequest, NextResponse } from "next/server";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { getReasoningExplanation } from "@/server/reasoning";
import { AppError } from "@/shared/errors";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const organizationId = await requireActiveOrganization();

    const explanation = await getReasoningExplanation(id, organizationId);
    return NextResponse.json({ data: explanation });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to fetch reasoning explanation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
