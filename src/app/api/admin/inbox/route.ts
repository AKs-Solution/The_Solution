import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin/admin-auth";
import { listInboxSubmissions } from "@/server/admin/admin-service";
import { adminErrorResponse } from "@/server/admin/errors";

export async function GET() {
  try {
    await requireAdmin();
    const data = await listInboxSubmissions();
    return NextResponse.json({ data });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
