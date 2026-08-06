import { NextResponse } from "next/server";
import { getEngineeringRecommendations } from "@/server/sentinel/recommendation-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || "default-org";

    const recommendations = await getEngineeringRecommendations(orgId);

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch recommendations.",
      },
      { status: 500 },
    );
  }
}
