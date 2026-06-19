"use client";

import { Shield } from "lucide-react";
import { ROLE_LABELS, type Role } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/hooks/use-dashboard-queries";

const ROLE_STYLES: Record<string, string> = {
  super_admin: "bg-red-500/15 text-red-300 border-red-500/30",
  agency_owner: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  team_admin: "bg-brand-500/15 text-brand-300 border-brand-500/30",
  editor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  viewer: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export function RoleBadge() {
  const { data } = useAuthContext();
  const role = (data?.effectiveRole as Role | undefined) ?? null;

  if (!role) return null;

  return (
    <span
      className={cn(
        "hidden items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:inline-flex",
        ROLE_STYLES[role] ?? ROLE_STYLES.editor
      )}
      title={`Effective role: ${ROLE_LABELS[role]}`}
    >
      <Shield className="h-3 w-3" />
      {ROLE_LABELS[role]}
    </span>
  );
}
