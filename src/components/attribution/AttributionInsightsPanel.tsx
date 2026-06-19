"use client";

import { Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttributionInsightView } from "@/lib/attribution/types";

interface AttributionInsightsPanelProps {
  insight: AttributionInsightView | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export function AttributionInsightsPanel({
  insight,
  loading,
  onRefresh,
}: AttributionInsightsPanelProps) {
  if (!insight && !loading) return null;

  return (
    <div className="card relative overflow-hidden border-brand-500/20 bg-gradient-to-br from-brand-600/10 via-ink-surface to-accent-blue/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20">
            <Sparkles className="h-4 w-4 text-brand-300" />
          </div>
          <div>
            <h2 className="section-title">What is working and why</h2>
            <p className="text-xs text-content-subtle">AI attribution insights</p>
          </div>
        </div>
        {onRefresh && (
          <button
            type="button"
            className="btn-ghost flex items-center gap-1.5 text-xs"
            disabled={loading}
            onClick={onRefresh}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        )}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-content-muted">Generating insights…</p>
      ) : insight ? (
        <div className="mt-4 space-y-4">
          <h3 className="text-lg font-semibold text-white">{insight.headline}</h3>
          <p className="text-sm leading-relaxed text-content-muted whitespace-pre-line">
            {insight.body}
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {insight.highlights.map((h) => (
              <li
                key={h}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-content-muted"
              >
                {h}
              </li>
            ))}
          </ul>
          {!insight.live && (
            <p className="text-[11px] text-content-subtle">
              Template insights — connect OpenAI or Gemini for live analysis.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
