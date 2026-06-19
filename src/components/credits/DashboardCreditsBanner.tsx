"use client";

import { CreditsWarningBanner } from "@/components/credits/CreditsMeter";
import { useCredits } from "@/hooks/use-dashboard-queries";

export function DashboardCreditsBanner() {
  const { data } = useCredits();
  const summary = data?.credits;

  if (!summary || summary.warningLevel === "none" || summary.isUnlimited) {
    return null;
  }

  return (
    <div className="mb-6">
      <CreditsWarningBanner summary={summary} />
    </div>
  );
}
