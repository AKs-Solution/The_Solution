/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { validateSession } from "@/server/auth/session-service";

export async function GET(request: Request) {
  try {
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId parameter" }, { status: 400 });
    }

    const jobs = await (prisma as any).drawingComparisonJob?.findMany({
      where: { projectId },
      include: {
        revA: { select: { drawingNumber: true, revisionLabel: true } },
        revB: { select: { drawingNumber: true, revisionLabel: true } },
      },
      orderBy: { createdAt: "desc" },
    }).catch(() => []);

    return NextResponse.json({ data: jobs || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
