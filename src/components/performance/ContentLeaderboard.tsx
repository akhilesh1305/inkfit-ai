"use client";

import { Medal, Eye, Heart, MousePointerClick, Share2, MessageCircle } from "lucide-react";
import type { ContentPerformanceItem } from "@/lib/content-performance";
import { CONTENT_TYPE_META, formatMetric } from "@/lib/content-performance";
import { cn } from "@/lib/utils";

interface ContentLeaderboardProps {
  items: ContentPerformanceItem[];
}

const RANK_STYLES = [
  { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  { bg: "bg-zinc-400/15", text: "text-zinc-300", border: "border-zinc-400/30" },
  { bg: "bg-orange-600/15", text: "text-orange-400", border: "border-orange-600/30" },
];

export function ContentLeaderboard({ items }: ContentLeaderboardProps) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/[0.06] p-5">
        <Medal className="h-5 w-5 text-brand-400" />
        <div>
          <h3 className="section-title">Content leaderboard</h3>
          <p className="text-xs text-content-muted">Ranked by performance score</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
              <th className="px-5 py-3 w-12">#</th>
              <th className="px-3 py-3">Content</th>
              <th className="px-3 py-3 text-right">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3 w-3" /> Views
                </span>
              </th>
              <th className="px-3 py-3 text-right">
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Eng.
                </span>
              </th>
              <th className="px-3 py-3 text-right">
                <span className="inline-flex items-center gap-1">
                  <MousePointerClick className="h-3 w-3" /> CTR
                </span>
              </th>
              <th className="px-3 py-3 text-right">
                <span className="inline-flex items-center gap-1">
                  <Share2 className="h-3 w-3" /> Shares
                </span>
              </th>
              <th className="px-3 py-3 text-right">
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> Comments
                </span>
              </th>
              <th className="px-5 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const rank = index + 1;
              const meta = CONTENT_TYPE_META[item.contentType];
              const rankStyle = RANK_STYLES[index];

              return (
                <tr
                  key={item.id}
                  className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-3.5">
                    {rank <= 3 ? (
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold",
                          rankStyle?.bg,
                          rankStyle?.text,
                          rankStyle?.border
                        )}
                      >
                        {rank}
                      </span>
                    ) : (
                      <span className="inline-flex h-7 w-7 items-center justify-center text-xs font-medium text-content-subtle">
                        {rank}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: meta.color }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{item.title}</p>
                        <p className="text-[10px] text-content-subtle">
                          {meta.label}
                          {item.platform ? ` · ${item.platform}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-right text-sm text-content-muted">
                    {formatMetric(item.views)}
                  </td>
                  <td className="px-3 py-3.5 text-right text-sm text-cyan-400">
                    {formatMetric(item.engagements)}
                  </td>
                  <td className="px-3 py-3.5 text-right text-sm text-pink-400">{item.ctr}%</td>
                  <td className="px-3 py-3.5 text-right text-sm text-emerald-400">
                    {formatMetric(item.shares)}
                  </td>
                  <td className="px-3 py-3.5 text-right text-sm text-amber-400">
                    {formatMetric(item.comments)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="rounded-md bg-brand-500/15 px-2 py-0.5 text-xs font-bold text-brand-300">
                      {item.score.toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
