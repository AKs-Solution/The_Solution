import { NextResponse } from "next/server";
import { queryFailurePrecedents } from "@/server/sentinel/precedent-failure-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || "default-org";
    const q = searchParams.get("q") || undefined;

    const result = await queryFailurePrecedents(orgId, q);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to query precedents." },
      { status: 500 },
    );
  }
}
