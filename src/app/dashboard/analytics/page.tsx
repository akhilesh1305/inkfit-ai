"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Linkedin,
  FileText,
  Search,
  Layers,
  Zap,
  TrendingUp,
  Clock,
  Coins,
  BarChart3,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AnimatedCounter } from "@/components/analytics/AnimatedCounter";
import {
  ContentTrendLineChart,
  WeeklyUsageBarChart,
  ContentTypePieChart,
  MonthlyBreakdownBarChart,
} from "@/components/analytics/AnalyticsCharts";
import {
  ANALYTICS_SUMMARY,
  CONTENT_METRICS,
  CHART_COLORS,
} from "@/lib/analytics-data";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  sparkles: Sparkles,
  linkedin: Linkedin,
  file: FileText,
  search: Search,
  layers: Layers,
  zap: Zap,
};

export default function AnalyticsPage() {
  const usagePercent = Math.round(
    (ANALYTICS_SUMMARY.monthlyUsage / ANALYTICS_SUMMARY.monthlyLimit) * 100
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-brand-400" />
            Analytics
          </span>
        }
        description="Track content output, AI usage, and team productivity across your workspace."
      />

      {/* Hero metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Growth",
            value: ANALYTICS_SUMMARY.growthPercent,
            suffix: "%",
            prefix: "+",
            decimals: 1,
            icon: TrendingUp,
            desc: "vs last month",
            gradient: "from-emerald-600/20 to-emerald-500/5",
            accent: "text-emerald-400",
          },
          {
            label: "Time Saved",
            value: ANALYTICS_SUMMARY.timeSavedHours,
            suffix: " hrs",
            decimals: 1,
            icon: Clock,
            desc: "estimated this month",
            gradient: "from-brand-600/20 to-accent-blue/5",
            accent: "text-brand-400",
          },
          {
            label: "AI Credits Used",
            value: ANALYTICS_SUMMARY.aiCreditsUsed,
            suffix: ` / ${ANALYTICS_SUMMARY.monthlyLimit}`,
            icon: Coins,
            desc: `${usagePercent}% of monthly plan`,
            gradient: "from-accent-blue/20 to-accent-cyan/5",
            accent: "text-cyan-400",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-5 shadow-card",
              stat.gradient
            )}
          >
            <div className="flex items-center justify-between">
              <stat.icon className={cn("h-5 w-5", stat.accent)} />
              <span className={cn("text-xs font-semibold", stat.accent)}>{stat.desc}</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-content">
              <AnimatedCounter
                value={stat.value}
                decimals={stat.decimals}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
            </p>
            <p className="mt-1 text-sm text-content-subtle">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Content metrics grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONTENT_METRICS.map((metric, i) => {
          const Icon = ICON_MAP[metric.icon as keyof typeof ICON_MAP];
          const suffix = "suffix" in metric ? metric.suffix : "";
          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.45 }}
              className="card group relative overflow-hidden"
            >
              <div
                className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full opacity-20 blur-2xl transition group-hover:opacity-30"
                style={{ backgroundColor: metric.color }}
              />
              <div className="relative flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${metric.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: metric.color }} />
                </div>
              </div>
              <p className="relative mt-4 text-3xl font-bold text-content">
                <AnimatedCounter value={metric.value} suffix={suffix} />
              </p>
              <p className="relative mt-1 text-sm text-content-subtle">{metric.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Monthly usage bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="section-title">Monthly Usage</h2>
            <p className="text-xs text-content-subtle">AI credits consumed per week</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-blue"
              />
            </div>
            <span className="text-xs font-medium text-content-muted">{usagePercent}%</span>
          </div>
        </div>
        <WeeklyUsageBarChart />
      </motion.div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="card"
        >
          <h2 className="section-title">Content Generated</h2>
          <p className="mb-4 text-xs text-content-subtle">6-month trend by content type</p>
          <ContentTrendLineChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h2 className="section-title">Content Mix</h2>
          <p className="mb-4 text-xs text-content-subtle">Distribution by format</p>
          <ContentTypePieChart />
        </motion.div>
      </div>

      {/* Stacked bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="card"
      >
        <h2 className="section-title">Monthly Breakdown</h2>
        <p className="mb-4 text-xs text-content-subtle">
          LinkedIn, blogs, SEO articles, and carousels per month
        </p>
        <MonthlyBreakdownBarChart />
      </motion.div>

      {/* Legend strip */}
      <div className="flex flex-wrap gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
        {Object.entries(CHART_COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs capitalize text-content-subtle">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
