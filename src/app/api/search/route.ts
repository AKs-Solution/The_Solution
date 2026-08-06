import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { validateSession } from "@/server/auth/session-service";
import { requirePermission } from "@/server/rbac";
import { executeUnifiedSearch } from "@/server/retrieval/unified-search";
import { AppError } from "@/shared/errors";

const searchQuerySchema = z.object({
  q: z.string().trim().max(500).default(""),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  type: z.enum(["entity", "document", "organization", "user"]).optional(),
});

const MIN_QUERY_LENGTH = 2;

export async function GET(request: Request) {
  try {
    const orgId = await requireActiveOrganization();
    const session = await validateSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }
    await requirePermission(orgId, session.userId, "organization:read");

    const url = new URL(request.url);
    const parsed = searchQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { q, limit, type } = parsed.data;

    if (q.length < MIN_QUERY_LENGTH) {
      return NextResponse.json({ data: [] });
    }

    const unifiedResult = await executeUnifiedSearch({
      organizationId: orgId,
      query: q,
      limit,
      entityTypes: type ? [type.toUpperCase()] : undefined,
    });

    const mappedData = unifiedResult.data.map((item) => ({
      id: item.id,
      type: item.type.toLowerCase(),
      label: item.title,
      subtitle: item.subtitle,
      href: item.href,
      icon: item.type === "ENTITY" ? "Tags" : item.type === "DOCUMENT" ? "FileText" : "Hash",
    }));

    return NextResponse.json({ data: mappedData });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
