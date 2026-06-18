"use client";

import { Gift, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCredits, type ReferralReward } from "@/lib/referrals";

interface RewardsPanelProps {
  rewards: ReferralReward[];
}

export function RewardsPanel({ rewards }: RewardsPanelProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0e] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Gift className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-content">Rewards</h3>
      </div>
      <div className="space-y-3">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className={cn(
              "rounded-xl border p-4 transition",
              reward.unlocked
                ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                : "border-white/[0.06] bg-white/[0.02]"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    reward.unlocked
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/[0.04] text-content-subtle"
                  )}
                >
                  {reward.unlocked ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-content">{reward.title}</p>
                  <p className="mt-0.5 text-xs text-content-muted">{reward.description}</p>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 text-sm font-bold tabular-nums",
                  reward.unlocked ? "text-emerald-400" : "text-brand-300"
                )}
              >
                +{formatCredits(reward.credits)}
              </span>
            </div>
            {!reward.unlocked && (
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[10px] text-content-subtle">
                  <span>
                    {reward.progress} / {reward.target} conversions
                  </span>
                  <span>{Math.round((reward.progress / reward.target) * 100)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-500"
                    style={{ width: `${(reward.progress / reward.target) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
