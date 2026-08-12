/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { validateSession } from "@/server/auth/session-service";

export async function GET() {
  try {
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await (prisma as any).drawingProject?.findMany({
      where: { ownerId: session.userId },
      orderBy: { createdAt: "desc" },
    }).catch(() => []);

    return NextResponse.json({ data: projects || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const project = await (prisma as any).drawingProject?.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: session.userId,
      },
    }).catch(() => null);

    if (!project) {
      return NextResponse.json({ error: "Failed to create drawing project" }, { status: 500 });
    }

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
