export type TeamRole = "admin" | "editor" | "viewer";

export type TeamMemberStatus = "active" | "invited" | "suspended";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamMemberStatus;
  avatarColor?: string;
}

export interface TeamSettings {
  name: string;
  allowInvites: boolean;
  defaultRole: TeamRole;
}

export const TEAM_ROLES: { id: TeamRole; label: string; description: string }[] = [
  {
    id: "admin",
    label: "Admin",
    description: "Full access — invite, manage roles, and workspace settings",
  },
  {
    id: "editor",
    label: "Editor",
    description: "Create and edit content across all tools",
  },
  {
    id: "viewer",
    label: "Viewer",
    description: "Read-only access to content and calendars",
  },
];

export const TEAM_STATUSES: { id: TeamMemberStatus; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "invited", label: "Invited" },
  { id: "suspended", label: "Suspended" },
];

const AVATAR_COLORS = [
  "#7C3AED",
  "#3B82F6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#14B8A6",
];

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function avatarColorForEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getRoleLabel(role: TeamRole): string {
  return TEAM_ROLES.find((r) => r.id === role)?.label ?? role;
}

export function getStatusLabel(status: TeamMemberStatus): string {
  return TEAM_STATUSES.find((s) => s.id === status)?.label ?? status;
}

export const DEMO_MEMBERS: Omit<TeamMember, "id">[] = [
  {
    name: "Akhil Sharma",
    email: "akhil@inkfit.ai",
    role: "admin",
    status: "active",
    avatarColor: "#7C3AED",
  },
  {
    name: "Priya Mehta",
    email: "priya@agency.com",
    role: "editor",
    status: "active",
    avatarColor: "#3B82F6",
  },
  {
    name: "James Chen",
    email: "james@clientco.com",
    role: "editor",
    status: "active",
    avatarColor: "#06B6D4",
  },
  {
    name: "Sarah Williams",
    email: "sarah@clientco.com",
    role: "viewer",
    status: "invited",
    avatarColor: "#10B981",
  },
  {
    name: "Marcus Johnson",
    email: "marcus@agency.com",
    role: "viewer",
    status: "invited",
    avatarColor: "#F59E0B",
  },
  {
    name: "Elena Rodriguez",
    email: "elena@startup.io",
    role: "editor",
    status: "suspended",
    avatarColor: "#EC4899",
  },
];

export const DEFAULT_TEAM_SETTINGS: TeamSettings = {
  name: "InkFit Workspace",
  allowInvites: true,
  defaultRole: "editor",
};
