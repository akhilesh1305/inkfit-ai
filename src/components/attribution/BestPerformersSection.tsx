"use client";

import { Trophy, Hash, Zap, MessageCircle } from "lucide-react";
import { formatMetric } from "@/lib/content-performance";
import type { AttributionRecord, RankedItem } from "@/lib/attribution/types";

function RankList({
  title,
  icon: Icon,
  items,
  accent,
}: {
  title: string;
  icon: typeof Trophy;
  items: RankedItem[];
  accent: string;
}) {
  return (
    <div className="card flex flex-col">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: accent }} />
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-content-subtle">Not enough data yet.</p>
      ) : (
        <ol className="space-y-3">
          {items.slice(0, 5).map((item, i) => (
            <li
              key={item.key}
              className="flex gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                style={{ backgroundColor: `${accent}22`, color: accent }}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm text-white">{item.label}</p>
                <p className="mt-1 text-[11px] text-content-subtle">
                  {item.count} piece{item.count !== 1 ? "s" : ""} ·{" "}
                  {item.avgEngagementRate}% eng · score {item.avgScore}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ContentList({ items }: { items: AttributionRecord[] }) {
  return (
    <div className="card">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-amber-400" />
        <h3 className="font-semibold text-white">Best Performing Content</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-content-subtle">Publish content to see rankings.</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 6).map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.05] px-3 py-2.5"
            >
              <span className="text-xs font-bold text-amber-400/80">#{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{item.title}</p>
                <p className="text-[11px] text-content-subtle">
                  {item.feature}
                  {item.platform ? ` · ${item.platform}` : ""}
                </p>
              </div>
              <div className="text-right text-xs">
                <p className="font-semibold text-emerald-400">{item.engagementRate}%</p>
                <p className="text-content-subtle">{formatMetric(item.views)} views</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BestPerformersSection({
  bestContent,
  bestTopics,
  bestHooks,
  bestCtas,
}: {
  bestContent: AttributionRecord[];
  bestTopics: RankedItem[];
  bestHooks: RankedItem[];
  bestCtas: RankedItem[];
}) {
  return (
    <div className="space-y-4">
      <ContentList items={bestContent} />
      <div className="grid gap-4 lg:grid-cols-3">
        <RankList title="Best Topics" icon={Hash} items={bestTopics} accent="#06B6D4" />
        <RankList title="Best Hooks" icon={Zap} items={bestHooks} accent="#8B5CF6" />
        <RankList title="Best CTAs" icon={MessageCircle} items={bestCtas} accent="#10B981" />
      </div>
    </div>
  );
}
