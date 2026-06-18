"use client";

import { motion } from "framer-motion";
import { CreditCard, Zap, Calendar, TrendingUp } from "lucide-react";
import type { BillingSummary } from "@/lib/billing";
import { formatPrice } from "@/lib/billing";
import { AnimatedCounter } from "@/components/analytics/AnimatedCounter";
import { cn } from "@/lib/utils";

interface CurrentPlanCardProps {
  data: BillingSummary;
}

export function CurrentPlanCard({ data }: CurrentPlanCardProps) {
  const { currentPlan, usage, subscription } = data;
  const credits =
    usage.creditsRemaining === "unlimited"
      ? "∞"
      : usage.creditsRemaining.toLocaleString();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-600/15 via-accent-blue/10 to-transparent shadow-card">
      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-brand-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
              Current Plan
            </span>
          </div>
          <h2 className="mt-2 text-3xl font-bold text-content">{currentPlan.name}</h2>
          <p className="mt-1 text-sm text-content-muted">{currentPlan.description}</p>
          <p className="mt-3 text-2xl font-bold text-brand-300">
            {formatPrice(currentPlan.price)}
            {currentPlan.price > 0 && (
              <span className="text-sm font-normal text-content-subtle">/month</span>
            )}
          </p>
          <span
            className={cn(
              "mt-3 inline-block rounded-lg border px-2.5 py-1 text-xs font-medium capitalize",
              subscription.status === "active"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300"
            )}
          >
            {subscription.status}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          {[
            {
              label: "Credits Remaining",
              value: credits,
              icon: Zap,
              sub:
                usage.generationsLimit === "unlimited"
                  ? "Unlimited plan"
                  : `of ${usage.generationsLimit} monthly`,
            },
            {
              label: "Used This Month",
              value: usage.generationsUsed,
              icon: TrendingUp,
              sub: `${usage.percentUsed}% of limit`,
              animate: true,
            },
            {
              label: "Resets On",
              value: new Date(usage.resetDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              icon: Calendar,
              sub: "Billing cycle",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
            >
              <stat.icon className="h-4 w-4 text-content-subtle" />
              <p className="mt-2 text-2xl font-bold text-content">
                {stat.animate && typeof stat.value === "number" ? (
                  <AnimatedCounter value={stat.value} />
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-xs font-medium text-content">{stat.label}</p>
              <p className="text-[10px] text-content-subtle">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-4">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-content-subtle">Monthly usage</span>
          <span className="font-medium text-content">
            {usage.generationsUsed}
            {usage.generationsLimit !== "unlimited" && ` / ${usage.generationsLimit}`}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${usage.percentUsed}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-brand-600 via-accent-blue to-cyan-500"
          />
        </div>
      </div>
    </div>
  );
}
