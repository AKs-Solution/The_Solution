import { NextRequest, NextResponse } from "next/server";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { searchReasoning } from "@/server/reasoning";
import { AppError } from "@/shared/errors";
import { getCurrentUser } from "@/server/auth";
import { searchPublicReasoning } from "@/server/public-aerospace/corpus";

export async function POST(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const body = await _req.json();

    if (!body.query || typeof body.query !== "string") {
      return NextResponse.json({ error: "Query string is required" }, { status: 400 });
    }

    if (user.guest) {
      return NextResponse.json({ data: searchPublicReasoning(body.query) });
    }

    const organizationId = await requireActiveOrganization();

    const result = await searchReasoning(organizationId, {
      query: body.query,
      domain: body.domain,
      limit: body.limit,
    });

    return NextResponse.json({ data: result });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to execute reasoning search";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
