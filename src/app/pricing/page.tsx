import { Check } from "lucide-react";
import { PLANS } from "@/lib/types";
import { MarketingHeader } from "@/components/MarketingHeader";
import { PricingPlanCta } from "@/components/billing/PricingPlanCta";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-ink-bg">
      <MarketingHeader ctaLabel="Dashboard" />

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-section font-bold text-content sm:text-5xl">Simple, transparent pricing</h1>
          <p className="mt-5 text-body-lg text-content-muted">
            Start free. Upgrade when you&apos;re ready. Pay via Stripe or Razorpay.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`card card-hover relative flex flex-col ${plan.popular ? "card-popular" : ""}`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-4 py-1 text-xs font-semibold text-white shadow-glow">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-content">{plan.name}</h3>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-content">
                  {plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString("en-IN")}`}
                </span>
                {plan.price > 0 && <span className="text-content-subtle">/month</span>}
              </div>
              <p className="mt-3 text-sm text-content-muted">{plan.description}</p>
              <p className="mt-3 text-xs font-medium text-brand-400">
                {plan.generations === "unlimited" ? "Unlimited generations" : `${plan.generations} generations/mo`}
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-content-muted">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
              <PricingPlanCta
                planId={plan.id}
                popular={plan.popular}
                label={plan.price === 0 ? "Get Started Free" : `Subscribe — ₹${plan.price}`}
              />
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-content-subtle">
          Agency plan includes white-label exports and API access. Contact us for custom enterprise pricing.
        </p>
      </div>
    </div>
  );
}
