"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/types";
import { formatPrice } from "@/lib/billing";
import { cn } from "@/lib/utils";

interface PricingCardsProps {
  currentPlanId: string;
  onUpgrade: (planId: string) => Promise<void>;
  upgrading: string | null;
  stripeEnabled?: boolean;
}

export function PricingCards({
  currentPlanId,
  onUpgrade,
  upgrading,
  stripeEnabled,
}: PricingCardsProps) {
  return (
    <div>
      <h3 className="section-title mb-1">Upgrade Your Plan</h3>
      <p className="mb-6 text-xs text-content-subtle">
        {stripeEnabled
          ? "Secure checkout powered by Stripe. Manage billing anytime from this page."
          : "Demo mode — upgrades apply instantly. Add Stripe keys for live billing."}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => {
          const planIndex = PLANS.findIndex((p) => p.id === plan.id);
          const currentIndex = PLANS.findIndex((p) => p.id === currentPlanId);
          const isCurrent = plan.id === currentPlanId;
          const loading = upgrading === plan.id;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-5 transition",
                plan.popular
                  ? "border-brand-500/50 bg-brand-500/5 shadow-glow"
                  : "border-white/10 bg-white/[0.02]",
                isCurrent && "ring-2 ring-emerald-500/40"
              )}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600 to-accent-blue px-3 py-0.5 text-[10px] font-semibold text-white">
                  Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute right-3 top-3 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  Current
                </span>
              )}

              <h4 className="text-lg font-bold text-content">{plan.name}</h4>
              <p className="mt-2 text-2xl font-extrabold text-content">
                {formatPrice(plan.price)}
                {plan.price > 0 && (
                  <span className="text-sm font-normal text-content-subtle">/mo</span>
                )}
              </p>
              <p className="mt-2 text-xs text-brand-400">
                {plan.generations === "unlimited"
                  ? "Unlimited credits"
                  : `${plan.generations} credits/mo`}
              </p>
              <p className="mt-2 text-xs text-content-subtle line-clamp-2">
                {plan.description}
              </p>

              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2 text-xs text-content-muted">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={isCurrent || loading}
                onClick={() => onUpgrade(plan.id)}
                className={cn(
                  "mt-5 w-full py-2.5 text-sm",
                  plan.popular && !isCurrent ? "btn-primary" : "btn-secondary",
                  isCurrent && "opacity-50"
                )}
              >
                {loading ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : isCurrent ? (
                  "Current Plan"
                ) : planIndex > currentIndex ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Upgrade
                  </>
                ) : planIndex < currentIndex ? (
                  "Downgrade"
                ) : (
                  "Select"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
