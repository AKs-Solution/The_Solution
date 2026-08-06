import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { createSession } from "@/server/auth/session-service";
import { setActiveOrganizationId } from "@/server/organizations/organization-context";
import { hashPassword } from "@/server/auth/password-service";

export async function POST() {
  const email = "demo@aksci.io";
  let userId = "demo-user-101";
  let orgId = "demo-org-101";

  try {
    let user = await prisma.user.findUnique({ where: { email } }).catch(() => null);
    if (!user) {
      const passwordHash = hashPassword("Demo123!Password");
      user = await prisma.user.create({
        data: {
          email,
          name: "Guest Demo Engineer",
          passwordHash,
          isEmailVerified: true,
          status: "active",
        },
      }).catch(() => null);
    }

    if (user) {
      userId = user.id;
      let org = await prisma.organization.findFirst({
        where: { ownerId: user.id },
      }).catch(() => null);

      if (!org) {
        org = await prisma.organization.create({
          data: {
            name: "AKSCI Aerospace Demo Org",
            slug: "aksci-demo-org",
            description: "Public Guest Demo Organization",
            ownerId: user.id,
            members: {
              create: {
                userId: user.id,
                role: "owner",
                status: "active",
              },
            },
          },
        }).catch(() => null);
      }
      if (org) {
        orgId = org.id;
      }
    }
  } catch (err) {
    console.warn("[DemoAuth] DB offline fallback demo login:", err);
  }

  // Create session & set active organization cookie
  await createSession(userId, { rememberMe: true });
  await setActiveOrganizationId(orgId);

  return NextResponse.json({
    data: {
      user: { id: userId, email, name: "Guest Demo Engineer" },
      organization: { id: orgId, name: "AKSCI Aerospace Demo Org", slug: "aksci-demo-org" },
    },
  });
}

export async function GET() {
  return POST();
}
