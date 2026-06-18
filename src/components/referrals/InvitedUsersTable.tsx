"use client";

import { cn } from "@/lib/utils";
import {
  INVITE_STATUS_META,
  maskEmail,
  type ReferralInvite,
} from "@/lib/referrals";

interface InvitedUsersTableProps {
  invites: ReferralInvite[];
}

export function InvitedUsersTable({ invites }: InvitedUsersTableProps) {
  if (invites.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-content-subtle">
        No invited users yet — share your link to get started
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c0e]">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h3 className="text-sm font-semibold text-content">Invited users</h3>
        <p className="text-xs text-content-subtle">{invites.length} total referrals</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.04] text-[11px] uppercase tracking-wider text-content-subtle">
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Reward</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((invite) => {
              const meta = INVITE_STATUS_META[invite.status];
              return (
                <tr
                  key={invite.id}
                  className="border-b border-white/[0.03] transition hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-600/30 to-cyan-600/30 text-xs font-bold text-brand-300">
                        {invite.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-content">{invite.name}</p>
                        <p className="text-xs text-content-subtle">{maskEmail(invite.email)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                        meta.bg,
                        meta.color
                      )}
                    >
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium tabular-nums text-content">
                    {invite.rewardCredits > 0 ? (
                      <span className="text-emerald-400">+{invite.rewardCredits} cr</span>
                    ) : (
                      <span className="text-content-subtle">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-content-subtle">
                    {new Date(invite.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
