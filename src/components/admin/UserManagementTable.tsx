"use client";

import { useState } from "react";
import { MoreHorizontal, Ban, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/lib/admin";

interface UserManagementTableProps {
  users: AdminUser[];
  onUpdatePlan: (userId: string, plan: string) => void;
}

const PLANS = ["free", "creator", "pro", "agency"];

export function UserManagementTable({ users, onUpdatePlan }: UserManagementTableProps) {
  const [menuId, setMenuId] = useState<string | null>(null);

  if (users.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-content-subtle">No users in database yet</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-content-subtle">
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Plan</th>
            <th className="px-4 py-3 font-medium">Content</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 font-medium">Last active</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-white/[0.03] transition hover:bg-white/[0.02]"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-600/20 to-orange-600/20 text-xs font-bold text-red-300">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-content">{user.name}</p>
                    <p className="text-xs text-content-subtle">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <select
                  value={user.plan}
                  onChange={(e) => onUpdatePlan(user.id, e.target.value)}
                  className="rounded-lg border border-white/[0.08] bg-black/30 px-2 py-1 text-xs capitalize text-content"
                >
                  {PLANS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 tabular-nums text-content-muted">{user.contentCount}</td>
              <td className="px-4 py-3 text-xs text-content-subtle">
                {new Date(user.joinedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-xs text-content-subtle">
                {new Date(user.lastActive).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuId(menuId === user.id ? null : user.id)}
                    className="rounded-lg p-1.5 text-content-subtle hover:bg-white/[0.06] hover:text-content"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {menuId === user.id && (
                    <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-white/10 bg-[#12121a] py-1 shadow-xl">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-content-muted hover:bg-white/[0.04]"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email user
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        Suspend
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
