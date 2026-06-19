import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, type SessionUser } from "@/lib/auth";
import { getActiveWorkspaceIdForUser } from "@/lib/workspace-context";
import {
  type Permission,
  type PlatformRole,
  type WorkspaceRole,
  type Role,
  normalizePlatformRole,
  normalizeWorkspaceRole,
  resolveEffectiveRole,
  hasPermission,
  canAccessAdmin,
} from "@/lib/rbac";

export interface AuthContext {
  user: SessionUser;
  platformRole: PlatformRole;
  workspaceId: string | null;
  workspaceRole: WorkspaceRole | null;
  effectiveRole: Role;
}

async function loadPlatformRole(userId: string, email: string): Promise<PlatformRole> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { platformRole: true },
  });
  let role = normalizePlatformRole(user?.platformRole);

  const adminEmails = process.env.ADMIN_EMAILS?.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isEnvAdmin = Boolean(
    adminEmails?.length && adminEmails.includes(email.toLowerCase())
  );

  if (isEnvAdmin && role !== "super_admin") {
    await prisma.user.update({
      where: { id: userId },
      data: { platformRole: "super_admin" },
    });
    role = "super_admin";
  }

  return role;
}

export async function resolveWorkspaceRoleForUser(
  userId: string,
  workspaceId?: string | null
): Promise<{
  workspaceId: string | null;
  workspaceRole: WorkspaceRole | null;
  isWorkspaceOwner: boolean;
}> {
  const wsId = workspaceId ?? (await getActiveWorkspaceIdForUser(userId));
  if (!wsId) return { workspaceId: null, workspaceRole: null, isWorkspaceOwner: false };

  const workspace = await prisma.workspace.findFirst({
    where: { id: wsId },
    select: { ownerId: true },
  });

  if (!workspace) return { workspaceId: wsId, workspaceRole: null, isWorkspaceOwner: false };

  if (workspace.ownerId === userId) {
    return { workspaceId: wsId, workspaceRole: "team_admin", isWorkspaceOwner: true };
  }

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: wsId, userId } },
    select: { role: true },
  });

  if (!member) return { workspaceId: wsId, workspaceRole: null, isWorkspaceOwner: false };

  return {
    workspaceId: wsId,
    workspaceRole: normalizeWorkspaceRole(member.role),
    isWorkspaceOwner: false,
  };
}

export async function getAuthContext(workspaceId?: string | null): Promise<AuthContext | null> {
  const session = await getSession();
  if (!session) return null;

  const platformRole = await loadPlatformRole(session.id, session.email);
  const { workspaceId: wsId, workspaceRole, isWorkspaceOwner } =
    await resolveWorkspaceRoleForUser(session.id, workspaceId);
  const effectiveRole = resolveEffectiveRole(platformRole, workspaceRole, isWorkspaceOwner);

  return {
    user: { ...session, platformRole },
    platformRole,
    workspaceId: wsId,
    workspaceRole,
    effectiveRole,
  };
}

export type AuthGuardResult =
  | { ok: true; ctx: AuthContext }
  | { ok: false; response: NextResponse };

export async function requireAuth(): Promise<AuthGuardResult> {
  const ctx = await getAuthContext();
  if (!ctx) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, ctx };
}

export async function requirePermission(
  permission: Permission,
  workspaceId?: string | null
): Promise<AuthGuardResult> {
  const ctx = await getAuthContext(workspaceId);
  if (!ctx) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!hasPermission(ctx.effectiveRole, permission)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Forbidden",
          message: `Your role (${ctx.effectiveRole}) cannot perform this action.`,
          required: permission,
        },
        { status: 403 }
      ),
    };
  }

  return { ok: true, ctx };
}

export async function requireAdmin(): Promise<AuthGuardResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  if (!canAccessAdmin(auth.ctx.platformRole)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
    };
  }

  return auth;
}

export async function requireWorkspaceMember(
  workspaceId: string
): Promise<AuthGuardResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  if (auth.ctx.platformRole === "super_admin") return auth;

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId },
    select: { ownerId: true },
  });

  if (!workspace) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Workspace not found" }, { status: 404 }),
    };
  }

  if (workspace.ownerId === auth.ctx.user.id) return auth;

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId: auth.ctx.user.id },
    },
  });

  if (!member) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Workspace access denied" }, { status: 403 }),
    };
  }

  return auth;
}

export function permissionsForRole(role: Role): Permission[] {
  const all: Permission[] = [
    "platform:admin",
    "platform:billing",
    "workspace:manage",
    "workspace:invite",
    "workspace:switch",
    "content:read",
    "content:write",
    "content:delete",
    "ai:generate",
    "settings:brand",
    "settings:team",
    "settings:white_label",
  ];
  return all.filter((p) => hasPermission(role, p));
}
