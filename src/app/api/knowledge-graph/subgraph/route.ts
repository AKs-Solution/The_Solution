import { NextResponse } from "next/server";
import { getSubgraph } from "@/server/knowledge-graph";
import { subgraphQuerySchema, expandSubgraphSchema } from "@/server/knowledge-graph/validation";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { requirePermission } from "@/server/rbac";
import { getCurrentUser } from "@/server/auth";
import { AppError } from "@/shared/errors";
import { getPublicSubgraph } from "@/server/public-aerospace/corpus";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const parsed = subgraphQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    if (user.guest) {
      const result = getPublicSubgraph(parsed.data.entityType, parsed.data.limit);
      return NextResponse.json({ data: result });
    }

    const orgId = await requireActiveOrganization();
    await requirePermission(orgId, user.id, "knowledge_graph:read");
    const result = await getSubgraph(orgId, parsed.data);
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await requireActiveOrganization();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }
    await requirePermission(orgId, user.id, "knowledge_graph:read");

    const body = await request.json();
    const parsed = expandSubgraphSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { expandSubgraph } = await import("@/server/knowledge-graph");
    const result = await expandSubgraph(parsed.data.nodeIds, orgId, parsed.data.depth);
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
