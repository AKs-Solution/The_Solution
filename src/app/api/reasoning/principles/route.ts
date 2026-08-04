import { NextRequest, NextResponse } from "next/server";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { createCustomPrinciple, getEngineeringPrinciples } from "@/server/reasoning";
import { AppError } from "@/shared/errors";

export async function GET(req: NextRequest) {
  try {
    let organizationId: string | undefined;
    try {
      organizationId = await requireActiveOrganization();
    } catch {
      // Fallback
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;

    const principles = await getEngineeringPrinciples(organizationId, category);
    return NextResponse.json({ data: principles });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to fetch engineering principles";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const organizationId = await requireActiveOrganization();
    const body = await req.json();

    if (!body.code || !body.name || !body.category || !body.description) {
      return NextResponse.json(
        { error: "Missing required fields (code, name, category, description)" },
        { status: 400 },
      );
    }

    const principle = await createCustomPrinciple(organizationId, {
      code: body.code,
      name: body.name,
      category: body.category,
      description: body.description,
      governingEquations: Array.isArray(body.governingEquations) ? body.governingEquations : [],
      domain: body.domain || "Systems",
      supportingEvidenceRefs: Array.isArray(body.supportingEvidenceRefs)
        ? body.supportingEvidenceRefs
        : [],
    });

    return NextResponse.json({ data: principle }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    const message =
      err instanceof Error ? err.message : "Failed to create custom engineering principle";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
