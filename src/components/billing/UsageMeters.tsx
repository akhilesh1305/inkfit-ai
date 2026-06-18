"use client";

import { motion } from "framer-motion";
import type { BillingUsage } from "@/lib/billing";
import { AnimatedCounter } from "@/components/analytics/AnimatedCounter";

interface UsageMetersProps {
  usage: BillingUsage;
}

export function UsageMeters({ usage }: UsageMetersProps) {
  const total = usage.breakdown.reduce((s, b) => s + b.count, 0);

  return (
    <div className="card">
      <h3 className="section-title">Usage Statistics</h3>
      <p className="mt-1 text-xs text-content-subtle">
        AI generations by content type this month
      </p>
      <div className="mt-5 space-y-4">
        {usage.breakdown.map((item, i) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-content-muted">{item.label}</span>
                <span className="font-semibold text-content">
                  <AnimatedCounter value={item.count} />
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
