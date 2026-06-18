"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Coins, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CreditsMeter, CreditsWarningBanner } from "@/components/credits/CreditsMeter";
import { CreditBreakdownPanel } from "@/components/credits/CreditBreakdownPanel";
import { CREDIT_CATEGORIES, type CreditSummary } from "@/lib/credits";
import { cn } from "@/lib/utils";

export function CreditsDashboardView() {
  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/credits");
    if (res.ok) {
      const data = await res.json();
      setSummary(data.credits);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Coins className="h-7 w-7 text-brand-400" />
            AI Credits
          </span>
        }
        description="Track your monthly AI usage across content, images, SEO, marketing plans, and agent requests."
      >
        <Link href="/dashboard/billing" className="btn-secondary">
          Upgrade plan
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </PageHeader>

      <CreditsWarningBanner summary={summary} />

      <CreditsMeter summary={summary} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CreditBreakdownPanel summary={summary} />

        <div className="card">
          <h3 className="section-title">Credit costs</h3>
          <p className="mt-1 text-xs text-content-muted">How actions consume credits</p>
          <ul className="mt-4 space-y-3">
            {CREDIT_CATEGORIES.map((cat) => (
              <li
                key={cat.id}
                className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
              >
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white">{cat.label}</p>
                    <span className="rounded-md bg-brand-500/15 px-2 py-0.5 text-xs font-bold text-brand-300">
                      {cat.cost} credits
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-content-muted">{cat.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { plan: "Free", credits: "100 / mo" },
          { plan: "Creator", credits: "2,000 / mo" },
          { plan: "Pro", credits: "10,000 / mo" },
          { plan: "Agency", credits: "Unlimited" },
        ].map((tier) => (
          <div
            key={tier.plan}
            className={cn(
              "rounded-xl border px-4 py-3 text-center",
              summary.planName === tier.plan
                ? "border-brand-500/40 bg-brand-500/10"
                : "border-white/[0.06] bg-white/[0.02]"
            )}
          >
            <p className="text-sm font-semibold text-white">{tier.plan}</p>
            <p className="text-xs text-content-muted">{tier.credits}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
