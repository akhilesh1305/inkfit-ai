import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { normalizePlatformRole } from "@/lib/rbac";
import { isAdminEmail } from "@/lib/admin";
import {
  AUTH_RATE_LIMITS,
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limited = checkRateLimit(`login:${ip}`, AUTH_RATE_LIMITS.login);
    if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

    const { email, password } = await req.json();
    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    let platformRole = normalizePlatformRole(user.platformRole);

    if (isAdminEmail(user.email) && platformRole !== "super_admin") {
      await prisma.user.update({
        where: { id: user.id },
        data: { platformRole: "super_admin" },
      });
      platformRole = "super_admin";
    }

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
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
