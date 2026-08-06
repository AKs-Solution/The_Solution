import { NextResponse } from "next/server";
import { generateCertificationPackage } from "@/server/compliance/package-generator";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const orgId = body.organizationId || "default-org";
    const programName = body.programName || "Propulsion Subsystem Flight Certification";

    const certPackage = await generateCertificationPackage(orgId, programName);

    return NextResponse.json({
      success: true,
      certPackage,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to generate certification package.",
      },
      { status: 500 },
    );
  }
}
