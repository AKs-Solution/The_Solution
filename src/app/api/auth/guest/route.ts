import { NextResponse } from "next/server";
import { createGuestSession } from "@/server/auth/session-service";

export async function POST() {
  try {
    await createGuestSession();
    return NextResponse.json({
      data: {
        guest: true,
        name: "Guest",
        organizationName: "Public aerospace corpus",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to start guest session" }, { status: 500 });
  }
}
