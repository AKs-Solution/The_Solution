import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin/admin-auth";
import { setUserStatus } from "@/server/admin/admin-service";
import { adminErrorResponse } from "@/server/admin/errors";

export async function POST(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const admin = await requireAdmin();
    const { userId } = await params;
    const body: unknown = await _request.json();
    const status =
      typeof body === "object" && body !== null && "status" in body
        ? String((body as { status: unknown }).status)
        : "";
    await setUserStatus(userId, status, admin.id);
    return NextResponse.json({ data: { status } });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
