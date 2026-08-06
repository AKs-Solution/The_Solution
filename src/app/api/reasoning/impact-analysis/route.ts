import { NextResponse } from "next/server";
import { analyzeDependencyImpact } from "@/server/reasoning/dependency-analyzer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || "default-org";
    const targetId = searchParams.get("targetId") || "target-entity-1";

    const impact = await analyzeDependencyImpact(orgId, targetId);

    return NextResponse.json({
      success: true,
      impact,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to execute impact analysis.",
      },
      { status: 500 },
    );
  }
}
