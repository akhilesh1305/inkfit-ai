"use client";

import { motion } from "framer-motion";
import type { CreditSummary } from "@/lib/credits";
import { CREDIT_CATEGORIES } from "@/lib/credits";
import { AnimatedCounter } from "@/components/analytics/AnimatedCounter";

interface CreditBreakdownPanelProps {
  summary: CreditSummary;
}

export function CreditBreakdownPanel({ summary }: CreditBreakdownPanelProps) {
  const items =
    summary.breakdown.length > 0
      ? summary.breakdown
      : CREDIT_CATEGORIES.map((c) => ({
          id: c.id,
          label: c.label,
          count: 0,
          credits: 0,
          color: c.color,
        }));

  const totalCredits = items.reduce((s, i) => s + i.credits, 0);

  return (
    <div className="card">
      <h3 className="section-title">Usage by Category</h3>
      <p className="mt-1 text-xs text-content-muted">
        Credit cost per action type this month
      </p>
      <div className="mt-5 space-y-4">
        {CREDIT_CATEGORIES.map((cat, i) => {
          const row = items.find((b) => b.id === cat.id);
          const credits = row?.credits ?? 0;
          const count = row?.count ?? 0;
          const pct = totalCredits > 0 ? Math.round((credits / totalCredits) * 100) : 0;

          return (
            <div key={cat.id}>
              <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                <div>
                  <span className="text-content-muted">{cat.label}</span>
                  <span className="ml-2 text-[10px] text-content-subtle">
                    {cat.cost} cr/{cat.id === "ai_image" ? "image" : "use"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-white">
                    <AnimatedCounter value={credits} /> cr
                  </span>
                  <span className="ml-1 text-[10px] text-content-subtle">({count}×)</span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
