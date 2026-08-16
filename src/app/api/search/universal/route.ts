import { NextResponse } from "next/server";
import { isGuestSession, validateSession } from "@/server/auth/session-service";
import { getActiveOrganizationId } from "@/server/organizations/organization-context";
import { executeUnifiedSearch } from "@/server/retrieval/unified-search";
import { searchPublicCorpus } from "@/server/public-aerospace/corpus";

export async function GET(request: Request) {
  try {
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();

    if (!query) {
      return NextResponse.json({ data: [] });
    }

    if (isGuestSession(session)) {
      const results = searchPublicCorpus(query, 16).map((record) => ({
        id: record.id,
        title: record.title,
        type: record.kind,
        href: record.href,
      }));
      return NextResponse.json({ data: results });
    }

    const orgId = await getActiveOrganizationId();
    if (!orgId) {
      return NextResponse.json({ error: "No active organization" }, { status: 400 });
    }

    const unifiedResult = await executeUnifiedSearch({
      organizationId: orgId,
      query,
      limit: 16,
    });

    const results = unifiedResult.data.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      href: item.href,
    }));

    return NextResponse.json({ data: results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
