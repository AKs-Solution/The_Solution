import { NextRequest, NextResponse } from "next/server";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { getDecisionTree } from "@/server/reasoning";
import { AppError } from "@/shared/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const organizationId = await requireActiveOrganization();

    const decisionTree = await getDecisionTree(id, organizationId);
    return NextResponse.json({ data: decisionTree });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to fetch decision tree";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
