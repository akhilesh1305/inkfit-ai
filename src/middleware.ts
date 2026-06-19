import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import {
  canAccessAdmin,
  isReadOnlyRole,
  normalizePlatformRole,
  VIEWER_BLOCKED_WRITE_PATHS,
} from "@/lib/rbac";
import { getAuthSecretKey } from "@/lib/secrets";

const COOKIE_NAME = "inkfit-session";

const PUBLIC_API_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/billing/webhook",
  "/api/demo",
]);

function isOAuthCallback(pathname: string) {
  return /^\/api\/integrations\/oauth\/[^/]+\/callback$/.test(pathname);
}

function getSecret() {
  return getAuthSecretKey();
}

interface TokenUser {
  id?: string;
  email?: string;
  platformRole?: string;
}

async function getUserFromToken(token: string): Promise<TokenUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const user = payload.user as TokenUser;
    if (!user?.id) return null;
    return user;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await getUserFromToken(token) : null;
  const isAuthed = Boolean(user?.id);
  const platformRole = normalizePlatformRole(user?.platformRole);

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isOnboarding = pathname === "/onboarding";
  const isAdmin = pathname.startsWith("/admin");
  const isDashboard = pathname.startsWith("/dashboard");
  const isApi = pathname.startsWith("/api");
  const isProtectedPage = isDashboard || isAdmin || isOnboarding;
  const isPublicApi = PUBLIC_API_PATHS.has(pathname);

  // ── API routes ──────────────────────────────────────────────────────────
  if (isApi) {
    if (isPublicApi || isOAuthCallback(pathname)) {
      return NextResponse.next();
    }

    if (!isAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  }

  // ── Page routes ───────────────────────────────────────────────────────────
  if (isProtectedPage && !isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdmin && isAuthed && !canAccessAdmin(platformRole)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (isDashboard && isAuthed && isReadOnlyRole(platformRole)) {
    const isWriteOnlyPage = VIEWER_BLOCKED_WRITE_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
    if (isWriteOnlyPage) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("denied", "viewer");
      return NextResponse.redirect(url);
    }
  }

  if (isAuthPage && isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = canAccessAdmin(platformRole) ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();

  if (isAuthed && user) {
    response.headers.set("x-user-id", user.id ?? "");
    response.headers.set("x-platform-role", platformRole);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/onboarding",
    "/login",
    "/register",
    "/api/:path*",
  ],
};
