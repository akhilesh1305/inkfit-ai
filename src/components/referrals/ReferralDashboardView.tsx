"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ReferralLinkCard } from "@/components/referrals/ReferralLinkCard";
import { ReferralStatsCards } from "@/components/referrals/ReferralStatsCards";
import { InvitedUsersTable } from "@/components/referrals/InvitedUsersTable";
import { RewardsPanel } from "@/components/referrals/RewardsPanel";
import { ReferralLeaderboard } from "@/components/referrals/ReferralLeaderboard";
import type {
  ReferralStats,
  ReferralInvite,
  ReferralReward,
  LeaderboardEntry,
} from "@/lib/referrals";

export function ReferralDashboardView() {
  const [code, setCode] = useState("");
  const [link, setLink] = useState("");
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [invites, setInvites] = useState<ReferralInvite[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/referrals");
    if (res.ok) {
      const data = await res.json();
      setCode(data.code ?? "");
      setLink(data.link ?? "");
      setStats(data.stats ?? null);
      setInvites(data.invites ?? []);
      setRewards(data.rewards ?? []);
      setLeaderboard(data.leaderboard ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCopyTrack() {
    await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "copy-track" }),
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Users className="h-7 w-7 text-brand-400" />
            Referral Dashboard
          </span>
        }
        description="Grow InkFit AI with your network — track clicks, signups, and earn rewards."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          Partner program active
        </span>
      </PageHeader>

      <div className="mb-6">
        <ReferralLinkCard link={link} code={code} onCopy={handleCopyTrack} />
      </div>

      {stats && (
        <div className="mb-6">
          <ReferralStatsCards stats={stats} />
        </div>
      )}

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InvitedUsersTable invites={invites} />
        </div>
        <RewardsPanel rewards={rewards} />
      </div>

      <ReferralLeaderboard entries={leaderboard} />
    </div>
  );
}
