export type WorkspaceType = "personal" | "team" | "client";

export const ACTIVE_WORKSPACE_KEY = "inkfit-active-workspace-id";
export const WORKSPACE_CHANGE_EVENT = "inkfit-workspace-change";

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  type: WorkspaceType;
  description?: string;
  icon: string;
  color: string;
  clientId?: string;
  clientName?: string;
  isDefault: boolean;
  memberCount: number;
  contentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceTypeMeta {
  id: WorkspaceType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const WORKSPACE_TYPES: WorkspaceTypeMeta[] = [
  {
    id: "personal",
    label: "Personal",
    description: "Your private content and drafts",
    icon: "👤",
    color: "#7C3AED",
  },
  {
    id: "team",
    label: "Team",
    description: "Collaborate with your team members",
    icon: "👥",
    color: "#3B82F6",
  },
  {
    id: "client",
    label: "Client",
    description: "Dedicated space for client deliverables",
    icon: "💼",
    color: "#06B6D4",
  },
];

export function getWorkspaceTypeMeta(type: WorkspaceType): WorkspaceTypeMeta {
  return WORKSPACE_TYPES.find((t) => t.id === type) ?? WORKSPACE_TYPES[0];
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "workspace";
}

export function getActiveWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_WORKSPACE_KEY);
}

export function setActiveWorkspaceId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
  window.dispatchEvent(new CustomEvent(WORKSPACE_CHANGE_EVENT, { detail: { id } }));
}

export function clearActiveWorkspaceId() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
  window.dispatchEvent(new CustomEvent(WORKSPACE_CHANGE_EVENT));
}

export const DEFAULT_PERSONAL_WORKSPACE = {
  name: "Personal",
  slug: "personal",
  type: "personal" as const,
  icon: "👤",
  color: "#7C3AED",
  description: "Your private workspace",
  isDefault: true,
};

export const DEMO_TEAM_WORKSPACE = {
  name: "InkFit Team",
  slug: "inkfit-team",
  type: "team" as const,
  icon: "👥",
  color: "#3B82F6",
  description: "Shared team content and campaigns",
};

export const DEMO_CLIENT_WORKSPACE = {
  name: "Acme SaaS",
  slug: "acme-saas",
  type: "client" as const,
  icon: "💼",
  color: "#10B981",
  description: "Client deliverables and brand content",
};
