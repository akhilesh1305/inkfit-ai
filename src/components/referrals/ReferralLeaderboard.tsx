"use client";

import { Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEarnings, type LeaderboardEntry } from "@/lib/referrals";

interface ReferralLeaderboardProps {
  entries: LeaderboardEntry[];
}

const RANK_STYLES = [
  "from-amber-400 to-yellow-600",
  "from-zinc-300 to-zinc-500",
  "from-amber-700 to-amber-900",
];

export function ReferralLeaderboard({ entries }: ReferralLeaderboardProps) {
  const top = entries.slice(0, 8);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#12121a] to-[#0c0c0e] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-content">Leaderboard</h3>
        <span className="ml-auto text-[10px] text-content-subtle">This month</span>
      </div>

      <div className="space-y-2">
        {top.map((entry) => (
          <div
            key={`${entry.rank}-${entry.name}`}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition",
              entry.isYou
                ? "border-brand-500/40 bg-brand-500/10"
                : "border-white/[0.04] bg-white/[0.02]"
            )}
          >
            <div className="flex w-8 shrink-0 justify-center">
              {entry.rank <= 3 ? (
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
                    RANK_STYLES[entry.rank - 1]
                  )}
                >
                  {entry.rank}
                </div>
              ) : (
                <span className="text-sm font-semibold text-content-subtle">#{entry.rank}</span>
              )}
            </div>

            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                entry.isYou
                  ? "bg-brand-500/30 text-brand-300"
                  : "bg-white/[0.06] text-content-muted"
              )}
            >
              {entry.avatar}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-content">
                {entry.name}
                {entry.isYou && (
                  <span className="ml-1.5 text-[10px] font-semibold text-brand-400">YOU</span>
                )}
              </p>
              <p className="text-[10px] text-content-subtle">
                {entry.referrals} referrals · {entry.conversions} conversions
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold tabular-nums text-content">
                {formatEarnings(entry.earnings)}
              </p>
              <p className="text-[10px] text-content-subtle">earned</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
        <Medal className="h-4 w-4 text-brand-400" />
        <p className="text-[11px] text-content-muted">
          Top 3 partners earn bonus credits and featured placement each month.
        </p>
      </div>
    </div>
  );
}
