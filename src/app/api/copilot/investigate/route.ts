import { NextResponse } from "next/server";
import { runAutomatedInvestigation } from "@/server/copilot/investigation-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const orgId = body.organizationId || "default-org";
    const topic = body.topic || "Titanium fastener vibration fatigue failures";

    const report = await runAutomatedInvestigation(orgId, topic);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Investigation failed." },
      { status: 500 },
    );
  }
}
