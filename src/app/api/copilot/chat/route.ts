import { NextResponse } from "next/server";
import { queryEngineeringCopilot } from "@/server/copilot/copilot-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const orgId = body.organizationId || "default-org";
    const query = body.query || "Why was Titanium 6Al-4V selected?";

    const copilotResponse = await queryEngineeringCopilot(orgId, query);

    return NextResponse.json({
      success: true,
      response: copilotResponse,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Copilot query failed." },
      { status: 500 },
    );
  }
}
