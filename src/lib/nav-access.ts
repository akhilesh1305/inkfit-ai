import type { Permission } from "@/lib/rbac";

/** Minimum permission required to see a dashboard nav link. */
export const NAV_PERMISSIONS: Record<string, Permission> = {
  "/dashboard/workspaces": "workspace:manage",
  "/dashboard/team": "settings:team",
  "/dashboard/brand": "settings:brand",
  "/dashboard/brand-voice": "settings:brand",
  "/dashboard/white-label": "settings:white_label",
  "/dashboard/billing": "platform:billing",
  "/dashboard/linkedin": "content:write",
  "/dashboard/carousel": "content:write",
  "/dashboard/blog": "content:write",
  "/dashboard/social": "content:write",
  "/dashboard/repurpose": "content:write",
  "/dashboard/website-generator": "content:write",
  "/dashboard/landing-pages": "content:write",
  "/dashboard/images": "content:write",
  "/dashboard/video": "content:write",
  "/dashboard/seo": "content:write",
  "/dashboard/analyzer": "content:write",
  "/dashboard/marketing-strategy": "content:write",
  "/dashboard/competitors": "content:write",
  "/dashboard/marketing-os": "ai:generate",
  "/dashboard/agent": "ai:generate",
  "/dashboard/employee": "ai:generate",
  "/dashboard/publish": "content:write",
  "/dashboard/integrations": "content:write",
  "/dashboard/publish/linkedin": "content:write",
};

export function canAccessNav(href: string, permissions: Permission[]): boolean {
  const required = NAV_PERMISSIONS[href];
  if (!required) return true;
  return permissions.includes(required);
}
