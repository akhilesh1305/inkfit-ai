"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COMPETITION_META,
  scoreColor,
  scoreBarGradient,
  getCategoryMeta,
  type TrendTopic,
  type TrendKeyword,
  type ContentOpportunity,
} from "@/lib/trend-discovery";

interface ScorePillsProps {
  trendScore: number;
  opportunityScore: number;
  competition: keyof typeof COMPETITION_META;
}

export function ScorePills({ trendScore, opportunityScore, competition }: ScorePillsProps) {
  const comp = COMPETITION_META[competition];
  return (
    <div className="flex flex-wrap gap-2">
      <ScorePill label="Trend" value={trendScore} />
      <ScorePill label="Opportunity" value={opportunityScore} />
      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", comp.bg, comp.color)}>
        {comp.label} competition
      </span>
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1">
      <span className="text-[9px] uppercase text-content-subtle">{label}</span>
      <span className={cn("text-xs font-bold tabular-nums", scoreColor(value))}>{value}</span>
      <div className="h-1 w-8 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r", scoreBarGradient(value))}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function TopicCard({
  topic,
  onGenerate,
  generating,
}: {
  topic: TrendTopic;
  onGenerate: () => void;
  generating: boolean;
}) {
  const cat = getCategoryMeta(topic.category);
  return (
    <article className="rounded-xl border border-white/[0.06] bg-[#0c0c0e] p-4 transition hover:border-white/10">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={cn(
            "rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-semibold text-white",
            cat.gradient
          )}
        >
          {cat.label}
        </span>
        <span className="text-[10px] text-emerald-400">{topic.growth}</span>
      </div>
      <h3 className="text-sm font-semibold text-content">{topic.title}</h3>
      <p className="mt-1 text-xs text-content-muted">{topic.description}</p>
      <p className="mt-2 text-[10px] text-content-subtle">{topic.volume} search volume</p>
      <div className="mt-3">
        <ScorePills
          trendScore={topic.trendScore}
          opportunityScore={topic.opportunityScore}
          competition={topic.competition}
        />
      </div>
      <button
        type="button"
        disabled={generating}
        onClick={onGenerate}
        className="btn-primary mt-4 w-full py-2 text-xs"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Generate content from trend
      </button>
    </article>
  );
}

export function KeywordRow({
  keyword,
  onGenerate,
}: {
  keyword: TrendKeyword;
  onGenerate: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-mono text-sm font-medium text-content">{keyword.keyword}</p>
        <p className="text-[10px] text-content-subtle">
          Vol {keyword.volume} · Difficulty {keyword.difficulty}
        </p>
      </div>
      <ScorePills
        trendScore={keyword.trendScore}
        opportunityScore={keyword.opportunityScore}
        competition={keyword.competition}
      />
      <button type="button" onClick={onGenerate} className="btn-secondary shrink-0 py-1.5 text-xs">
        <Sparkles className="h-3 w-3" />
        Generate
      </button>
    </div>
  );
}

export function OpportunityCard({
  opportunity,
  onGenerate,
  generating,
}: {
  opportunity: ContentOpportunity;
  onGenerate: () => void;
  generating: boolean;
}) {
  return (
    <div className="rounded-xl border border-brand-500/20 bg-gradient-to-br from-brand-500/[0.06] to-transparent p-4">
      <p className="text-[10px] font-medium text-brand-300">{opportunity.format}</p>
      <h3 className="mt-1 text-sm font-semibold text-content">{opportunity.title}</h3>
      <p className="mt-1 text-xs text-content-muted">{opportunity.angle}</p>
      <div className="mt-3">
        <ScorePills
          trendScore={opportunity.trendScore}
          opportunityScore={opportunity.opportunityScore}
          competition={opportunity.competition}
        />
      </div>
      <button
        type="button"
        disabled={generating}
        onClick={onGenerate}
        className="btn-primary mt-3 w-full py-2 text-xs"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Generate content from trend
      </button>
    </div>
  );
}
