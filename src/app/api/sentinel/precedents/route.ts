import { NextResponse } from "next/server";
import { queryFailurePrecedents } from "@/server/sentinel/precedent-failure-engine";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { getCurrentUser } from "@/server/auth";
import { AppError } from "@/shared/errors";

export async function GET(request: Request) {
  try {
    const orgId = await requireActiveOrganization();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || undefined;

    const result = await queryFailurePrecedents(orgId, q);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err) {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to query precedents." },
      { status: statusCode },
    );
  }
}
