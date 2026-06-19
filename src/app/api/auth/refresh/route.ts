import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { normalizePlatformRole } from "@/lib/rbac";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, email: true, plan: true, platformRole: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const platformRole = normalizePlatformRole(user.platformRole);
    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      platformRole,
    });

    const res = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        platformRole,
      },
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Session refresh failed." }, { status: 500 });
  }
}
