import { NextResponse } from "next/server";
import { gateAuth } from "@/lib/credit-api";
import type { Permission } from "@/lib/rbac";
import type { AuthContext } from "@/lib/auth-guard";

type RouteAuthResult =
  | { ok: true; ctx: AuthContext; userId: string }
  | { ok: false; response: NextResponse };

/** Standard permission gate for API route handlers. */
export async function withRouteAuth(
  permission: Permission = "content:read"
): Promise<RouteAuthResult> {
  const auth = await gateAuth(permission);
  if (!auth.ok) return auth;
  return { ok: true, ctx: auth.ctx, userId: auth.ctx.user.id };
}
