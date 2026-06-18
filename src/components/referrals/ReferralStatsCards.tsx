"use client";

import { MousePointerClick, UserPlus, TrendingUp, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCredits, type ReferralStats } from "@/lib/referrals";

interface ReferralStatsCardsProps {
  stats: ReferralStats;
}

export function ReferralStatsCards({ stats }: ReferralStatsCardsProps) {
  const cards = [
    {
      label: "Clicks",
      value: stats.clicks.toLocaleString(),
      sub: `${stats.signupRate} click → signup`,
      icon: MousePointerClick,
      gradient: "from-violet-600 to-purple-600",
    },
    {
      label: "Signups",
      value: stats.signups.toLocaleString(),
      sub: "Invited users registered",
      icon: UserPlus,
      gradient: "from-brand-600 to-cyan-600",
    },
    {
      label: "Conversions",
      value: stats.conversions.toLocaleString(),
      sub: `${stats.conversionRate} signup → paid`,
      icon: TrendingUp,
      gradient: "from-emerald-600 to-teal-600",
    },
    {
      label: "Credits earned",
      value: formatCredits(stats.creditsEarned),
      sub: "Lifetime referral rewards",
      icon: Coins,
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-white/[0.06] bg-[#0c0c0e] p-4"
        >
          <div
            className={cn(
              "mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br",
              card.gradient
            )}
          >
            <card.icon className="h-4 w-4 text-white" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-content">{card.value}</p>
          <p className="text-xs font-medium text-content-muted">{card.label}</p>
          <p className="mt-1 text-[10px] text-content-subtle">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
