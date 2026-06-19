/**
 * Role-based access control for InkFit AI.
 *
 * Platform roles (User.platformRole): super_admin, agency_owner
 * Workspace roles (WorkspaceMember.role): team_admin, editor, viewer
 *
 * Agency owners who own workspaces effectively have team_admin powers in their workspaces.
 */

export const PLATFORM_ROLES = [
  "super_admin",
  "agency_owner",
  "team_admin",
  "editor",
  "viewer",
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const WORKSPACE_ROLES = ["team_admin", "editor", "viewer"] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export type Role = PlatformRole | WorkspaceRole;

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  agency_owner: "Agency Owner",
  team_admin: "Team Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const ROLE_RANK: Record<Role, number> = {
  super_admin: 100,
  agency_owner: 80,
  team_admin: 60,
  editor: 40,
  viewer: 20,
};

export type Permission =
  | "platform:admin"
  | "platform:billing"
  | "workspace:manage"
  | "workspace:invite"
  | "workspace:switch"
  | "content:read"
  | "content:write"
  | "content:delete"
  | "ai:generate"
  | "settings:brand"
  | "settings:team"
  | "settings:white_label";

const PERMISSION_ROLES: Record<Permission, Role[]> = {
  "platform:admin": ["super_admin"],
  "platform:billing": ["super_admin", "agency_owner"],
  "workspace:manage": ["super_admin", "agency_owner", "team_admin"],
  "workspace:invite": ["super_admin", "agency_owner", "team_admin"],
  "workspace:switch": ["super_admin", "agency_owner", "team_admin", "editor", "viewer"],
  "content:read": ["super_admin", "agency_owner", "team_admin", "editor", "viewer"],
  "content:write": ["super_admin", "agency_owner", "team_admin", "editor"],
  "content:delete": ["super_admin", "agency_owner", "team_admin", "editor"],
  "ai:generate": ["super_admin", "agency_owner", "team_admin", "editor"],
  "settings:brand": ["super_admin", "agency_owner", "team_admin"],
  "settings:team": ["super_admin", "agency_owner", "team_admin"],
  "settings:white_label": ["super_admin", "agency_owner"],
};

export function normalizePlatformRole(role: string | null | undefined): PlatformRole {
  if (role === "super_admin") return "super_admin";
  if (role === "agency_owner") return "agency_owner";
  if (role === "team_admin") return "team_admin";
  if (role === "editor") return "editor";
  if (role === "viewer") return "viewer";
  return "agency_owner";
}

export function normalizeWorkspaceRole(role: string | null | undefined): WorkspaceRole {
  if (role === "team_admin" || role === "admin" || role === "owner") return "team_admin";
  if (role === "viewer") return "viewer";
  return "editor";
}

export function roleRank(role: Role): number {
  return ROLE_RANK[role] ?? 0;
}

export function highestRole(...roles: (Role | null | undefined)[]): Role {
  let best: Role = "viewer";
  let bestRank = 0;
  for (const r of roles) {
    if (!r) continue;
    const rank = roleRank(r);
    if (rank > bestRank) {
      best = r;
      bestRank = rank;
    }
  }
  return best;
}

export function resolveEffectiveRole(
  platformRole: PlatformRole,
  workspaceRole?: WorkspaceRole | null,
  isWorkspaceOwner = false
): Role {
  if (platformRole === "super_admin") return "super_admin";
  if (isWorkspaceOwner) return highestRole(platformRole, "team_admin");
  if (workspaceRole) {
    if (platformRole === "agency_owner") return workspaceRole;
    return highestRole(platformRole, workspaceRole);
  }
  return platformRole;
}

export function hasPermission(
  effectiveRole: Role,
  permission: Permission
): boolean {
  const allowed = PERMISSION_ROLES[permission];
  return allowed.includes(effectiveRole);
}

export function canAccessAdmin(platformRole: PlatformRole): boolean {
  return hasPermission(platformRole, "platform:admin");
}

export function isReadOnlyRole(role: Role): boolean {
  return role === "viewer";
}

export const DEFAULT_PLATFORM_ROLE: PlatformRole = "agency_owner";

export const ADMIN_ONLY_PATHS = ["/admin"];

export const VIEWER_BLOCKED_WRITE_PATHS = [
  "/dashboard/brand",
  "/dashboard/brand-voice",
  "/dashboard/team",
  "/dashboard/workspaces",
  "/dashboard/billing",
  "/dashboard/white-label",
];
