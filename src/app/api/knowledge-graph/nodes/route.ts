import { NextResponse } from "next/server";
import { getGraphStats, getGraphNodes } from "@/server/knowledge-graph";
import { nodesQuerySchema } from "@/server/knowledge-graph/validation";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { requirePermission } from "@/server/rbac";
import { getCurrentUser } from "@/server/auth";
import { AppError } from "@/shared/errors";
import { getPublicGraphStats, getPublicSubgraph } from "@/server/public-aerospace/corpus";

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
    const parsed = nodesQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    if (user.guest) {
      const graph = getPublicSubgraph(parsed.data.entityType, parsed.data.pageSize ?? 50);
      const stats = getPublicGraphStats();
      const page = parsed.data.page ?? 1;
      const pageSize = parsed.data.pageSize ?? 50;
      return NextResponse.json({
        data: graph.nodes,
        total: graph.nodes.length,
        page,
        pageSize,
        totalPages: 1,
        stats,
      });
    }

    const orgId = await requireActiveOrganization();
    await requirePermission(orgId, user.id, "knowledge_graph:read");
    const [stats, nodes] = await Promise.all([
      getGraphStats(orgId),
      getGraphNodes(orgId, parsed.data),
    ]);
    return NextResponse.json({ ...nodes, stats });
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
