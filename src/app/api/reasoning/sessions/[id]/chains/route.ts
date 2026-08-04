import { NextRequest, NextResponse } from "next/server";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { getReasoningChains } from "@/server/reasoning";
import { AppError } from "@/shared/errors";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const organizationId = await requireActiveOrganization();

    const chains = await getReasoningChains(id, organizationId);
    return NextResponse.json({ data: chains });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to fetch reasoning chains";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
