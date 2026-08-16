import { NextResponse } from "next/server";
import { buildEvidenceGraph, buildEvidenceChains } from "@/server/evidence";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { requirePermission } from "@/server/rbac";
import { getCurrentUser } from "@/server/auth";
import { AppError } from "@/shared/errors";
import { getPublicEvidenceChain } from "@/server/public-aerospace/corpus";

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
    const entityId = url.searchParams.get("entityId");
    const maxDepth = Number(url.searchParams.get("maxDepth") ?? 5);

    if (!entityId) {
      return NextResponse.json({ error: "entityId is required" }, { status: 400 });
    }

    if (user.guest) {
      const chain = getPublicEvidenceChain(entityId);
      if (!chain) {
        return NextResponse.json({ error: "Record not found in public corpus" }, { status: 404 });
      }
      return NextResponse.json({ data: [chain] });
    }

    const orgId = await requireActiveOrganization();
    await requirePermission(orgId, user.id, "evidence:read");

    const graph = await buildEvidenceGraph(orgId, entityId, maxDepth);
    const chains = buildEvidenceChains(graph, graph.rootId, maxDepth);
    return NextResponse.json({ data: chains });
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
