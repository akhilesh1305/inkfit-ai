"use client";

import { BarChart3, Eye, Heart, MousePointerClick, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  aggregateAnalytics,
  formatNumber,
  PUBLISH_PLATFORMS,
  getPlatformById,
  type ScheduledPost,
} from "@/lib/publishing";

interface AnalyticsPreviewProps {
  posts: ScheduledPost[];
}

export function AnalyticsPreview({ posts }: AnalyticsPreviewProps) {
  const stats = aggregateAnalytics(posts);
  const published = posts.filter((p) => p.status === "published");

  const byPlatform = PUBLISH_PLATFORMS.map((platform) => {
    const platformPosts = published.filter((p) => p.platform === platform.id);
    const impressions = platformPosts.reduce((s, p) => s + p.impressions, 0);
    return { platform, impressions, count: platformPosts.length };
  }).filter((p) => p.count > 0);

  const maxImpressions = Math.max(...byPlatform.map((p) => p.impressions), 1);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Eye}
          label="Total impressions"
          value={formatNumber(stats.impressions)}
          accent="from-brand-600 to-cyan-600"
        />
        <StatCard
          icon={Heart}
          label="Engagements"
          value={formatNumber(stats.engagements)}
          accent="from-pink-600 to-rose-600"
        />
        <StatCard
          icon={MousePointerClick}
          label="Link clicks"
          value={formatNumber(stats.clicks)}
          accent="from-violet-600 to-purple-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Engagement rate"
          value={stats.engagementRate}
          accent="from-emerald-600 to-teal-600"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0e] p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-content">By platform</h3>
          </div>
          {byPlatform.length === 0 ? (
            <p className="text-sm text-content-subtle">Publish content to see platform breakdown</p>
          ) : (
            <div className="space-y-3">
              {byPlatform.map(({ platform, impressions, count }) => (
                <div key={platform.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-content-muted">
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br text-[9px] font-bold text-white",
                          platform.gradient
                        )}
                      >
                        {platform.icon}
                      </span>
                      {platform.name}
                      <span className="text-content-subtle">({count})</span>
                    </span>
                    <span className="font-medium text-content">{formatNumber(impressions)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r", platform.gradient)}
                      style={{ width: `${(impressions / maxImpressions) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0e] p-5">
          <h3 className="mb-4 text-sm font-semibold text-content">Publishing overview</h3>
          <div className="grid grid-cols-3 gap-3">
            <OverviewStat label="Scheduled" value={stats.scheduledCount} />
            <OverviewStat label="Drafts" value={stats.draftCount} />
            <OverviewStat label="Published" value={stats.postCount} />
          </div>
          {published.length > 0 && (
            <div className="mt-4 border-t border-white/[0.06] pt-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-content-subtle">
                Top performer
              </p>
              {(() => {
                const top = [...published].sort((a, b) => b.engagements - a.engagements)[0];
                const platform = getPlatformById(top.platform);
                return (
                  <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                    <p className="text-xs font-semibold text-content">{top.title}</p>
                    <p className="mt-1 text-[11px] text-content-subtle">
                      {platform.name} · {formatNumber(top.engagements)} engagements
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0e] p-4">
      <div className={cn("mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br", accent)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-2xl font-bold text-content">{value}</p>
      <p className="text-xs text-content-subtle">{label}</p>
    </div>
  );
}

function OverviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 text-center">
      <p className="text-xl font-bold text-content">{value}</p>
      <p className="text-[10px] text-content-subtle">{label}</p>
    </div>
  );
}
