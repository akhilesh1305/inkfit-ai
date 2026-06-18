"use client";

import { FileText, CalendarClock, ListOrdered, CheckCircle2, Eye, Heart } from "lucide-react";
import type { LinkedInPublishStats } from "@/lib/linkedin-publishing";
import { formatNumber } from "@/lib/publishing";
import { cn } from "@/lib/utils";

interface LinkedInStatsBarProps {
  stats: LinkedInPublishStats;
  activeTab?: string;
  onTabClick?: (tab: string) => void;
}

const STAT_ITEMS = [
  { key: "drafts", label: "Drafts", icon: FileText, color: "text-zinc-400" },
  { key: "scheduled", label: "Scheduled", icon: CalendarClock, color: "text-brand-300" },
  { key: "queued", label: "Queue", icon: ListOrdered, color: "text-amber-400" },
  { key: "published", label: "Published", icon: CheckCircle2, color: "text-emerald-400" },
] as const;

export function LinkedInStatsBar({ stats, activeTab, onTabClick }: LinkedInStatsBarProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {STAT_ITEMS.map((item) => {
        const value = stats[item.key as keyof LinkedInPublishStats] as number;
        const isActive = activeTab === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onTabClick?.(item.key)}
            className={cn(
              "rounded-xl border p-4 text-left transition",
              isActive
                ? "border-[#0A66C2]/40 bg-[#0A66C2]/10"
                : "border-white/[0.06] bg-white/[0.02] hover:border-white/15",
              onTabClick && "cursor-pointer"
            )}
          >
            <div className="flex items-center gap-2">
              <item.icon className={cn("h-4 w-4", item.color)} />
              <span className="text-[11px] font-medium text-content-muted">{item.label}</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          </button>
        );
      })}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:col-span-1 lg:col-span-1">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-cyan-400" />
          <span className="text-[11px] font-medium text-content-muted">Impressions</span>
        </div>
        <p className="mt-1 text-2xl font-bold text-white">
          {formatNumber(stats.totalImpressions)}
        </p>
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:col-span-1 lg:col-span-1">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-pink-400" />
          <span className="text-[11px] font-medium text-content-muted">Engagements</span>
        </div>
        <p className="mt-1 text-2xl font-bold text-white">
          {formatNumber(stats.totalEngagements)}
        </p>
      </div>
    </div>
  );
}
