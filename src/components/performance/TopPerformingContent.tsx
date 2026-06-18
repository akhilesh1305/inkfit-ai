"use client";

import { Trophy, TrendingUp } from "lucide-react";
import type { ContentPerformanceItem } from "@/lib/content-performance";
import { CONTENT_TYPE_META, formatMetric } from "@/lib/content-performance";
import { cn } from "@/lib/utils";

interface TopPerformingContentProps {
  items: ContentPerformanceItem[];
}

export function TopPerformingContent({ items }: TopPerformingContentProps) {
  if (items.length === 0) return null;

  const [top, ...rest] = items;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/[0.06] p-5">
        <Trophy className="h-5 w-5 text-amber-400" />
        <div>
          <h3 className="section-title">Top performing content</h3>
          <p className="text-xs text-content-muted">Highest engagement across all channels</p>
        </div>
      </div>

      <div className="p-5">
        <TopCard item={top} rank={1} featured />

        {rest.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {rest.map((item, i) => (
              <TopCard key={item.id} item={item} rank={i + 2} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TopCard({
  item,
  rank,
  featured,
}: {
  item: ContentPerformanceItem;
  rank: number;
  featured?: boolean;
}) {
  const meta = CONTENT_TYPE_META[item.contentType];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border transition",
        featured
          ? "border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#0c0c0e] to-transparent p-5"
          : "border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/15"
      )}
    >
      {featured && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
              rank === 1 && "bg-amber-500/20 text-amber-400",
              rank === 2 && "bg-zinc-500/20 text-zinc-300",
              rank === 3 && "bg-orange-700/20 text-orange-400",
              rank > 3 && "bg-white/5 text-content-muted"
            )}
          >
            #{rank}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
              >
                {meta.label}
              </span>
              {item.platform && (
                <span className="text-[10px] text-content-subtle capitalize">{item.platform}</span>
              )}
            </div>
            <h4
              className={cn(
                "mt-1 font-semibold text-white",
                featured ? "text-base" : "text-sm truncate"
              )}
            >
              {item.title}
            </h4>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-emerald-400">
          <TrendingUp className="h-3.5 w-3.5" />
          <span className="text-xs font-bold">{item.engagementRate}%</span>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 grid gap-2",
          featured ? "grid-cols-5" : "grid-cols-3"
        )}
      >
        <MetricPill label="Views" value={formatMetric(item.views)} />
        <MetricPill label="Engagement" value={formatMetric(item.engagements)} />
        {featured && (
          <>
            <MetricPill label="CTR" value={`${item.ctr}%`} />
            <MetricPill label="Shares" value={formatMetric(item.shares)} />
            <MetricPill label="Comments" value={formatMetric(item.comments)} />
          </>
        )}
        {!featured && <MetricPill label="CTR" value={`${item.ctr}%`} />}
      </div>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-black/20 px-2 py-1.5 text-center">
      <p className="text-xs font-semibold text-white">{value}</p>
      <p className="text-[9px] text-content-subtle">{label}</p>
    </div>
  );
}
