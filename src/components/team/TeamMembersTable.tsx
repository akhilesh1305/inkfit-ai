"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import {
  getInitials,
  getStatusLabel,
  TEAM_ROLES,
  TEAM_STATUSES,
  type TeamMember,
  type TeamRole,
  type TeamMemberStatus,
} from "@/lib/team";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

interface TeamMembersTableProps {
  members: TeamMember[];
  onRoleChange: (id: string, role: TeamRole) => void;
  onRemove: (id: string) => void;
}

export function TeamMembersTable({ members, onRoleChange, onRemove }: TeamMembersTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<TeamRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TeamMemberStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return members.filter((m) => {
      const matchesSearch =
        !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || m.role === roleFilter;
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const statusStyles: Record<TeamMemberStatus, string> = {
    active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    invited: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    suspended: "bg-red-500/15 text-red-300 border-red-500/25",
  };

  const roleStyles: Record<TeamRole, string> = {
    admin: "bg-brand-500/15 text-brand-300 border-brand-500/25",
    editor: "bg-accent-blue/15 text-blue-300 border-accent-blue/25",
    viewer: "bg-white/10 text-content-muted border-white/10",
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-surface/60 shadow-card">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
          <input
            className="input-field !py-2 !pl-10 text-sm"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-content-subtle" />
          <select
            className="input-field !w-auto !py-2 text-sm"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as TeamRole | "all");
              setPage(1);
            }}
          >
            <option value="all">All Roles</option>
            {TEAM_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            className="input-field !w-auto !py-2 text-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as TeamMemberStatus | "all");
              setPage(1);
            }}
          >
            <option value="all">All Status</option>
            {TEAM_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
              <th className="px-5 py-3">Member</th>
              <th className="hidden px-5 py-3 sm:table-cell">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-content-subtle">
                  No members match your filters.
                </td>
              </tr>
            ) : (
              paginated.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-white/[0.06] transition hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {getInitials(member.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-content">{member.name}</p>
                        <p className="truncate text-xs text-content-subtle sm:hidden">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-content-muted sm:table-cell">
                    {member.email}
                  </td>
                  <td className="px-5 py-4">
                    <select
                      className={cn(
                        "rounded-lg border bg-transparent px-2.5 py-1 text-xs font-medium outline-none",
                        roleStyles[member.role]
                      )}
                      value={member.role}
                      onChange={(e) => onRoleChange(member.id, e.target.value as TeamRole)}
                    >
                      {TEAM_ROLES.map((r) => (
                        <option key={r.id} value={r.id} className="bg-ink-surface text-content">
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium",
                        statusStyles[member.status]
                      )}
                    >
                      {getStatusLabel(member.status)}
                    </span>
                  </td>
                  <td className="relative px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setMenuOpen(menuOpen === member.id ? null : member.id)}
                      className="btn-ghost !rounded-lg !p-2"
                      aria-label="Member actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {menuOpen === member.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpen(null)}
                        />
                        <div className="absolute right-5 top-12 z-20 min-w-[140px] rounded-xl border border-white/10 bg-ink-surface py-1 shadow-card">
                          <button
                            type="button"
                            onClick={() => {
                              onRemove(member.id);
                              setMenuOpen(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
        <p className="text-xs text-content-subtle">
          Showing {(currentPage - 1) * PAGE_SIZE + 1}–
          {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-ghost !rounded-lg !p-2 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 text-xs text-content-muted">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn-ghost !rounded-lg !p-2 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
