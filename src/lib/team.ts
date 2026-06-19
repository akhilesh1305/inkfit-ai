export type TeamMemberStatus = "active" | "invited" | "suspended";

export type TeamRole = "team_admin" | "editor" | "viewer";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: "active" | "invited" | "suspended";
  avatarColor?: string;
  createdAt: string;
}

export interface TeamWorkspaceSettings {
  name: string;
  allowInvites: boolean;
  defaultRole: TeamRole;
}

export type TeamSettings = TeamWorkspaceSettings;

export const TEAM_ROLES: { id: TeamRole; label: string; description: string }[] = [
  {
    id: "team_admin",
    label: "Team Admin",
    description: "Manage workspace, invite members, and all content",
  },
  {
    id: "editor",
    label: "Editor",
    description: "Create and edit content, run AI tools",
  },
  {
    id: "viewer",
    label: "Viewer",
    description: "Read-only access to workspace content",
  },
];

export function getRoleLabel(role: TeamRole): string {
  return TEAM_ROLES.find((r) => r.id === role)?.label ?? role;
}

export const TEAM_STATUSES: { id: TeamMemberStatus; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "invited", label: "Invited" },
  { id: "suspended", label: "Suspended" },
];

export function getStatusLabel(status: TeamMemberStatus): string {
  return TEAM_STATUSES.find((s) => s.id === status)?.label ?? status;
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function normalizeTeamRole(role: string): TeamRole {
  if (role === "team_admin" || role === "admin" || role === "owner") return "team_admin";
  if (role === "viewer") return "viewer";
  return "editor";
}

export const DEFAULT_TEAM_SETTINGS: TeamWorkspaceSettings = {
  name: "InkFit Workspace",
  allowInvites: true,
  defaultRole: "editor",
};

export function avatarColorForEmail(email: string): string {
  const colors = ["#7C3AED", "#3B82F6", "#06B6D4", "#10B981", "#F59E0B", "#EC4899"];
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export const DEMO_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "Alex Morgan",
    email: "alex@inkfit.ai",
    role: "team_admin",
    status: "active",
    avatarColor: "#7C3AED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Jordan Lee",
    email: "jordan@inkfit.ai",
    role: "editor",
    status: "active",
    avatarColor: "#3B82F6",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Sam Patel",
    email: "sam@inkfit.ai",
    role: "editor",
    status: "active",
    avatarColor: "#06B6D4",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Casey Kim",
    email: "casey@inkfit.ai",
    role: "viewer",
    status: "active",
    avatarColor: "#10B981",
    createdAt: new Date().toISOString(),
  },
];
