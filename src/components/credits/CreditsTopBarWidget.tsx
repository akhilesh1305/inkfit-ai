"use client";

import Link from "next/link";
import { CreditsMeter } from "@/components/credits/CreditsMeter";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { useCredits } from "@/hooks/use-dashboard-queries";

export function CreditsTopBarWidget() {
  const { data } = useCredits();
  const summary = data?.credits;

  if (!summary) return null;

  const showUpgrade =
    summary.warningLevel === "critical" ||
    summary.warningLevel === "depleted" ||
    (summary.planId === "free" && summary.percentUsed > 50);

  return (
    <div className="hidden items-center gap-2 xl:flex">
      <Link
        href="/dashboard/credits"
        className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 transition hover:border-brand-500/30"
      >
        <CreditsMeter summary={summary} compact />
      </Link>
      {showUpgrade && <UpgradePrompt compact />}
    </div>
  );
}
