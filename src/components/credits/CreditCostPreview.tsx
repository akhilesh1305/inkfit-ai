"use client";

import Link from "next/link";
import { Coins } from "lucide-react";
import { estimateEmployeeRunCredits } from "@/lib/employee-credits";
import type { EmployeeRunMode } from "@/lib/marketing-employee";
import { formatCredits } from "@/lib/credits";

interface CreditCostPreviewProps {
  mode: EmployeeRunMode;
  planId?: string;
  creditsRemaining?: number | "unlimited";
}

export function CreditCostPreview({ mode, planId, creditsRemaining }: CreditCostPreviewProps) {
  const cost = estimateEmployeeRunCredits(mode);
  const insufficient =
    creditsRemaining !== undefined &&
    creditsRemaining !== "unlimited" &&
    creditsRemaining < cost;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${
        insufficient
          ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
          : "border-white/[0.08] bg-white/[0.03] text-content-muted"
      }`}
    >
      <span className="flex items-center gap-1.5">
        <Coins className="h-3.5 w-3.5" />
        {mode === "autonomous"
          ? `Full autonomous run uses ~${formatCredits(cost)} credits`
          : `Guided mode starts at ${formatCredits(cost)} credits (strategy step)`}
      </span>
      {insufficient && (
        <Link href="/dashboard/billing" className="font-semibold text-amber-300 hover:underline">
          Upgrade for more credits
        </Link>
      )}
      {planId === "free" && mode === "autonomous" && (
        <Link href="/dashboard/billing?upgrade=creator" className="font-semibold text-brand-300 hover:underline">
          Creator plan required
        </Link>
      )}
    </div>
  );
}
