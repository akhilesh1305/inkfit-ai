"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisRecommendation } from "@/lib/content-analyzer";

interface RecommendationsPanelProps {
  recommendations: AnalysisRecommendation[];
}

const IMPACT_STYLES = {
  high: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  medium: "bg-brand-500/15 text-brand-300 border-brand-500/25",
  low: "bg-white/[0.04] text-content-subtle border-white/[0.06]",
};

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#12121a] via-[#0c0c0e] to-[#0a0a0a] p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-content">
        <Sparkles className="h-4 w-4 text-brand-400" />
        Improvement Recommendations
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-brand-500/20 hover:bg-white/[0.04]"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-content">{rec.title}</h4>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-content-subtle opacity-0 transition group-hover:opacity-100" />
            </div>
            <p className="text-xs leading-relaxed text-content-muted">{rec.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
                  IMPACT_STYLES[rec.impact]
                )}
              >
                {rec.impact} impact
              </span>
              <span className="text-[10px] text-content-subtle">{rec.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
