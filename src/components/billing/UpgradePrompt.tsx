"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreditsWarningBanner } from "@/components/credits/CreditsMeter";
import { useBillingStatus } from "@/hooks/use-dashboard-queries";

export function UpgradeBanner() {
  const { data: status } = useBillingStatus();
  const [dismissed, setDismissed] = useState(false);

  if (!status || dismissed) return null;

  if (status.credits.warningLevel !== "none" && !status.credits.isUnlimited) {
    return (
      <div className="relative">
        <button
          type="button"
          className="absolute right-2 top-2 z-10 rounded-lg p-1 text-content-subtle hover:bg-white/10"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
        <CreditsWarningBanner summary={status.credits} />
      </div>
    );
  }

  if (status.planId === "free" && status.showUpgradePrompt) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-500/25 bg-gradient-to-r from-brand-600/15 to-accent-blue/10 px-4 py-3"
        )}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-brand-400" />
          <div>
            <p className="text-sm font-semibold text-white">
              Unlock more with {status.recommendedPlan === "creator" ? "Creator" : "Pro"}
            </p>
            <p className="text-xs text-content-muted">
              You&apos;re on the Free plan ({status.credits.creditsUsed}/
              {status.credits.creditsLimit} credits used). Upgrade for higher limits and team features.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost text-xs" onClick={() => setDismissed(true)}>
            Later
          </button>
          <Link href="/dashboard/billing" className="btn-primary !px-3 !py-1.5 text-xs">
            View plans
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

interface UpgradePromptProps {
  title?: string;
  message?: string;
  className?: string;
  compact?: boolean;
}

export function UpgradePrompt({
  title = "Upgrade your plan",
  message = "Get more credits, team seats, and publishing integrations.",
  className,
  compact,
}: UpgradePromptProps) {
  if (compact) {
    return (
      <Link
        href="/dashboard/billing"
        className={cn(
          "inline-flex items-center gap-1 rounded-lg border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-300 transition hover:bg-brand-500/20",
          className
        )}
      >
        Upgrade
        <ArrowUpRight className="h-3 w-3" />
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-brand-500/20 bg-brand-500/5 p-4 text-center",
        className
      )}
    >
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-content-muted">{message}</p>
      <Link href="/dashboard/billing" className="btn-primary mt-3 inline-flex text-sm">
        View plans
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
