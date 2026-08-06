import { NextResponse } from "next/server";
import { triggerConnectorSync } from "@/server/enterprise/connectors-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const connectorId = body.connectorId || "conn-plm-teamcenter-01";

    const syncResult = await triggerConnectorSync(connectorId);

    return NextResponse.json({
      success: true,
      syncResult,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Sync trigger failed." },
      { status: 500 },
    );
  }
}
