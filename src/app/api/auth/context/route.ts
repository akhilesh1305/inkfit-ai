import { NextResponse } from "next/server";
import { getAuthContext, permissionsForRole } from "@/lib/auth-guard";
import { ROLE_LABELS } from "@/lib/rbac";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) {
    return NextResponse.json({ user: null, authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: ctx.user,
    platformRole: ctx.platformRole,
    platformRoleLabel: ROLE_LABELS[ctx.platformRole],
    workspaceId: ctx.workspaceId,
    workspaceRole: ctx.workspaceRole,
    workspaceRoleLabel: ctx.workspaceRole ? ROLE_LABELS[ctx.workspaceRole] : null,
    effectiveRole: ctx.effectiveRole,
    effectiveRoleLabel: ROLE_LABELS[ctx.effectiveRole],
    permissions: permissionsForRole(ctx.effectiveRole),
  });
}
