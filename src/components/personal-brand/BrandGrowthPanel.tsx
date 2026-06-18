"use client";

import { motion } from "framer-motion";
import { TrendingUp, Zap, ArrowRight } from "lucide-react";
import type { GrowthRecommendation } from "@/lib/personal-brand";
import { cn } from "@/lib/utils";

const IMPACT_STYLES = {
  high: "border-red-500/25 bg-red-500/10 text-red-300",
  medium: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  low: "border-white/10 bg-white/5 text-content-muted",
};

const CATEGORY_LABELS = {
  consistency: "Consistency",
  "thought-leadership": "Thought Leadership",
  "content-quality": "Content Quality",
  engagement: "Engagement",
};

interface BrandGrowthPanelProps {
  recommendations: GrowthRecommendation[];
}

export function BrandGrowthPanel({ recommendations }: BrandGrowthPanelProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/5 via-transparent to-brand-500/5 shadow-card">
      <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
        <TrendingUp className="h-4 w-4 text-emerald-400" />
        <h3 className="font-semibold text-white">Growth Recommendations</h3>
        <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
          {recommendations.length} actions
        </span>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                  IMPACT_STYLES[rec.impact]
                )}
              >
                {rec.impact} impact
              </span>
              <span className="text-[10px] text-content-muted">
                {CATEGORY_LABELS[rec.category]}
              </span>
            </div>
            <h4 className="font-semibold text-white">{rec.title}</h4>
            <p className="mt-1 text-xs leading-relaxed text-content-muted">{rec.description}</p>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-brand-500/20 bg-brand-500/5 px-3 py-2">
              <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
              <p className="text-xs text-brand-200/90">{rec.action}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-white/[0.06] px-6 py-3 text-center">
        <p className="flex items-center justify-center gap-1 text-[10px] text-content-muted">
          Focus on high-impact actions first
          <ArrowRight className="h-3 w-3" />
          track score weekly
        </p>
      </div>
    </div>
  );
}
