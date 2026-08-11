import { NextResponse } from "next/server";
import { validateSession } from "@/server/auth/session-service";
import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";

export async function GET() {
  const session = await validateSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { metadata: true },
    });
    const metadata = user?.metadata;
    if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
      const record = metadata as Record<string, unknown>;
      if (record.workspace) return NextResponse.json({ data: record.workspace });
    }
    return NextResponse.json({ data: null });
  } catch (err) {
    console.warn("[Preferences] DB offline — returning empty preferences:", err);
    return NextResponse.json({ data: null });
  }
}

export async function PUT(request: Request) {
  const session = await validateSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.workspace || typeof body.workspace !== "object") {
    return NextResponse.json({ error: "Missing workspace preferences" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { metadata: true },
    });
    const metadata = user?.metadata;
    const merged: Record<string, unknown> =
      metadata && typeof metadata === "object" && !Array.isArray(metadata)
        ? { ...(metadata as Record<string, unknown>) }
        : {};
    merged.workspace = body.workspace;

    await prisma.user.update({
      where: { id: session.userId },
      data: { metadata: merged as Prisma.InputJsonValue },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.warn("[Preferences] DB offline — preferences kept locally:", err);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
