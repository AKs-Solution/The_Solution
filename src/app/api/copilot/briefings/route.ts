import { NextResponse } from "next/server";
import { generateEngineeringBriefing } from "@/server/copilot/briefings-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || "default-org";

    const briefing = await generateEngineeringBriefing(orgId);

    return NextResponse.json({
      success: true,
      briefing,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to generate briefing.",
      },
      { status: 500 },
    );
  }
}
