"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Loader2, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CurrentPlanCard } from "@/components/billing/CurrentPlanCard";
import { UsageMeters } from "@/components/billing/UsageMeters";
import { PricingCards } from "@/components/billing/PricingCards";
import { BillingTables } from "@/components/billing/BillingTables";
import { TeamBillingPanel } from "@/components/billing/TeamBillingPanel";
import { ManageSubscriptionButton } from "@/components/billing/ManageSubscriptionButton";
import type { BillingSummary } from "@/lib/billing";
import { CREDIT_PACK } from "@/lib/billing";

export default function BillingPageContent() {
  const [data, setData] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [buyingCredits, setBuyingCredits] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const upgradeStarted = useRef(false);

  const loadBilling = useCallback(async () => {
    const res = await fetch("/api/billing");
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBilling();
    if (searchParams.get("success")) {
      setToast("Payment successful! Your plan has been updated.");
      void fetch("/api/auth/refresh", { method: "POST" }).then(() => loadBilling());
    }
    if (searchParams.get("credits")) {
      setToast(`+${CREDIT_PACK.credits} bonus credits added to your account.`);
      void loadBilling();
    }
  }, [loadBilling, searchParams]);

  useEffect(() => {
    const upgradePlan = searchParams.get("upgrade");
    if (!upgradePlan || !data || upgrading || upgradeStarted.current) return;
    if (!["creator", "pro", "agency"].includes(upgradePlan)) return;
    if (data.currentPlan.id === upgradePlan) return;
    upgradeStarted.current = true;
    void handleUpgrade(upgradePlan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, searchParams, upgrading]);

  async function handleUpgrade(planId: string) {
    if (planId === "free") {
      setUpgrading("free");
      await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "downgrade", planId: "free" }),
      });
      setToast("Downgraded to Free plan.");
      await loadBilling();
      setUpgrading(null);
      return;
    }

    setUpgrading(planId);
    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "checkout", planId }),
    });
    const result = await res.json();

    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
      return;
    }

    if (result.success) {
      setToast(
        result.mode === "demo"
          ? `Upgraded to ${planId} plan (demo mode).`
          : "Plan upgraded successfully!"
      );
      await loadBilling();
    }
    setUpgrading(null);
  }

  async function handleBuyCredits() {
    setBuyingCredits(true);
    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "buy_credits" }),
    });
    const result = await res.json();

    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
      return;
    }

    if (result.success) {
      setToast(
        result.mode === "demo"
          ? `Added ${result.credits} bonus credits (demo mode).`
          : `Added ${result.credits} bonus credits.`
      );
      await loadBilling();
    } else if (result.error) {
      setToast(result.error);
    }
    setBuyingCredits(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card py-12 text-center text-content-subtle">
        Unable to load billing data. Please sign in and try again.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-brand-400" />
            Subscription & Billing
          </span>
        }
        description="Manage your plan, track usage, and view invoices."
      >
        {data.subscription.stripeEnabled && (
          <ManageSubscriptionButton
            stripeCustomerId={data.subscription.stripeCustomerId}
            stripeEnabled={data.subscription.stripeEnabled}
          />
        )}
      </PageHeader>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {toast}
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-auto text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <CurrentPlanCard data={data} />

      <div className="grid gap-6 lg:grid-cols-2">
        <UsageMeters usage={data.usage} />
        <div className="card flex flex-col justify-center">
          <h3 className="section-title">Credits Overview</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <p className="text-3xl font-bold text-brand-400">
                {data.usage.creditsRemaining === "unlimited"
                  ? "∞"
                  : data.usage.creditsRemaining}
              </p>
              <p className="mt-1 text-xs text-content-subtle">Credits Remaining</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <p className="text-3xl font-bold text-content">{data.usage.percentUsed}%</p>
              <p className="mt-1 text-xs text-content-subtle">Plan Used</p>
            </div>
          </div>
          {data.subscription.stripeCustomerId && (
            <p className="mt-4 text-xs text-content-subtle">
              Stripe Customer: {data.subscription.stripeCustomerId}
            </p>
          )}
          {data.usage.creditsRemaining !== "unlimited" && (
            <button
              type="button"
              onClick={() => void handleBuyCredits()}
              disabled={buyingCredits}
              className="btn-secondary mt-4 w-full text-sm"
            >
              {buyingCredits
                ? "Starting checkout…"
                : `Buy ${CREDIT_PACK.credits} credits — ₹${CREDIT_PACK.priceInr}`}
            </button>
          )}
        </div>
      </div>

      <PricingCards
        currentPlanId={data.subscription.planId}
        onUpgrade={handleUpgrade}
        upgrading={upgrading}
        stripeEnabled={data.subscription.stripeEnabled}
      />

      {data.teamBilling && <TeamBillingPanel team={data.teamBilling} />}

      <BillingTables invoices={data.invoices} billingHistory={data.billingHistory} />
    </div>
  );
}
