import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { PlatformRole } from "@/lib/rbac";
import { DEFAULT_PLATFORM_ROLE, normalizePlatformRole } from "@/lib/rbac";
import { getAuthSecretKey } from "@/lib/secrets";

const COOKIE_NAME = "inkfit-session";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  platformRole: PlatformRole;
}

function getSecret() {
  return getAuthSecretKey();
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const user = payload.user as SessionUser;
    if (!user?.id || !user?.email) return null;
    return {
      ...user,
      platformRole: normalizePlatformRole(user.platformRole ?? DEFAULT_PLATFORM_ROLE),
    };
  } catch {
    return null;
  }
}

/** Decode session from JWT without DB — safe for Edge middleware. */
export async function decodeSessionToken(token: string): Promise<SessionUser | null> {
  return verifySessionToken(token);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export { COOKIE_NAME };
