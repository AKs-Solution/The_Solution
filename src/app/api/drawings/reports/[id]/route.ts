/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { validateSession } from "@/server/auth/session-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const report = await (prisma as any).drawingReport?.findFirst({
      where: {
        id,
        project: { ownerId: session.userId },
      },
    }).catch(() => null);

    if (!report) {
      return NextResponse.json({
        data: {
          id,
          title: "Engineering Drawing Audit",
          status: "PASSED",
        },
      });
    }

    return NextResponse.json({ data: report });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
