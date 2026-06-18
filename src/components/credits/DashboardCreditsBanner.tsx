"use client";

import { useEffect, useState } from "react";
import type { CreditSummary } from "@/lib/credits";
import { CreditsWarningBanner } from "@/components/credits/CreditsMeter";

export function DashboardCreditsBanner() {
  const [summary, setSummary] = useState<CreditSummary | null>(null);

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((d) => setSummary(d.credits))
      .catch(() => {});
  }, []);

  if (!summary || summary.warningLevel === "none" || summary.isUnlimited) {
    return null;
  }

  return (
    <div className="mb-6">
      <CreditsWarningBanner summary={summary} />
    </div>
  );
}
