import { NextResponse } from "next/server";
import { getEngineeringRecommendations } from "@/server/sentinel/recommendation-engine";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { getCurrentUser } from "@/server/auth";
import { AppError } from "@/shared/errors";

export async function GET() {
  try {
    const orgId = await requireActiveOrganization();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const recommendations = await getEngineeringRecommendations(orgId);

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (err) {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch recommendations.",
      },
      { status: statusCode },
    );
  }
}
