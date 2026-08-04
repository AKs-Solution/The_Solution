import { NextRequest, NextResponse } from "next/server";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { getCurrentUser } from "@/server/auth";
import { listReasoningSessions, startReasoningSession } from "@/server/reasoning";
import { AppError } from "@/shared/errors";

export async function GET(req: NextRequest) {
  try {
    let organizationId: string | undefined;
    try {
      organizationId = await requireActiveOrganization();
    } catch {
      // Fallback
    }

    if (!organizationId) {
      return NextResponse.json({ error: "Organization context required" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const pageSize = searchParams.get("pageSize")
      ? parseInt(searchParams.get("pageSize")!, 10)
      : 20;

    const result = await listReasoningSessions(organizationId, { status, search, page, pageSize });
    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to fetch reasoning sessions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let organizationId: string | undefined;
    let userId: string | undefined;
    try {
      organizationId = await requireActiveOrganization();
      const user = await getCurrentUser();
      userId = user?.id;
    } catch {
      // Fallback
    }

    if (!organizationId) {
      return NextResponse.json({ error: "Organization context required" }, { status: 400 });
    }

    const body = await req.json();
    if (!body.title || !body.problemStatement) {
      return NextResponse.json(
        { error: "Title and problemStatement are required" },
        { status: 400 },
      );
    }

    const session = await startReasoningSession(organizationId, userId || "system", {
      title: body.title,
      problemStatement: body.problemStatement,
      context: body.context,
    });

    return NextResponse.json({ data: session }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to start reasoning session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
