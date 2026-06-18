"use client";

import { Eye, Heart, MousePointerClick, Share2, MessageCircle, FileStack } from "lucide-react";
import { AnimatedCounter } from "@/components/analytics/AnimatedCounter";
import type { PerformanceSummary } from "@/lib/content-performance";
import { cn } from "@/lib/utils";

interface PerformanceMetricCardsProps {
  summary: PerformanceSummary;
}

const METRICS = [
  {
    key: "totalContent" as const,
    label: "Generated Content",
    icon: FileStack,
    gradient: "from-violet-600/20 to-purple-500/5",
    accent: "text-violet-400",
    format: (v: number) => ({ value: v, suffix: "", decimals: 0, prefix: "" }),
  },
  {
    key: "totalViews" as const,
    label: "Views",
    icon: Eye,
    gradient: "from-brand-600/20 to-cyan-500/5",
    accent: "text-brand-400",
    format: (v: number) => ({ value: v, suffix: "", decimals: 0, prefix: "" }),
  },
  {
    key: "totalEngagements" as const,
    label: "Engagement",
    icon: Heart,
    gradient: "from-cyan-600/20 to-blue-500/5",
    accent: "text-cyan-400",
    format: (v: number) => ({ value: v, suffix: "", decimals: 0, prefix: "" }),
  },
  {
    key: "avgCtr" as const,
    label: "CTR",
    icon: MousePointerClick,
    gradient: "from-pink-600/20 to-rose-500/5",
    accent: "text-pink-400",
    format: (v: number) => ({ value: v, suffix: "%", decimals: 1, prefix: "" }),
  },
  {
    key: "totalShares" as const,
    label: "Shares",
    icon: Share2,
    gradient: "from-emerald-600/20 to-teal-500/5",
    accent: "text-emerald-400",
    format: (v: number) => ({ value: v, suffix: "", decimals: 0, prefix: "" }),
  },
  {
    key: "totalComments" as const,
    label: "Comments",
    icon: MessageCircle,
    gradient: "from-amber-600/20 to-orange-500/5",
    accent: "text-amber-400",
    format: (v: number) => ({ value: v, suffix: "", decimals: 0, prefix: "" }),
  },
];

export function PerformanceMetricCards({ summary }: PerformanceMetricCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {METRICS.map((metric) => {
        const Icon = metric.icon;
        const raw = summary[metric.key];
        const fmt = metric.format(raw);

        return (
          <div
            key={metric.key}
            className={cn(
              "relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br p-4",
              metric.gradient
            )}
          >
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4", metric.accent)} />
              <span className="text-[11px] font-medium text-content-muted">{metric.label}</span>
            </div>
            <p className={cn("mt-2 text-2xl font-bold text-white", metric.accent)}>
              <AnimatedCounter
                value={fmt.value}
                decimals={fmt.decimals}
                suffix={fmt.suffix}
                prefix={fmt.prefix}
              />
            </p>
            {metric.key === "totalEngagements" && (
              <p className="mt-0.5 text-[10px] text-content-subtle">
                {summary.avgEngagementRate}% avg rate
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
