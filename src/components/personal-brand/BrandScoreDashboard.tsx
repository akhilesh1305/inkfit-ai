"use client";

import { motion } from "framer-motion";
import { Award, Sparkles } from "lucide-react";
import type { PersonalBrandMetrics, PersonalBrandOutput } from "@/lib/personal-brand";
import { getScoreLabel, METRIC_CONFIG } from "@/lib/personal-brand";
import { AnimatedCounter } from "@/components/analytics/AnimatedCounter";
import {
  BrandMetricsRadar,
  BrandScoreTrendChart,
  BrandMetricBreakdownChart,
} from "@/components/personal-brand/BrandAnalyticsCharts";
import { cn } from "@/lib/utils";

interface BrandScoreDashboardProps {
  output: PersonalBrandOutput | null;
}

export function BrandScoreDashboard({ output }: BrandScoreDashboardProps) {
  const metrics = output?.metrics ?? null;

  if (!metrics) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card flex min-h-[280px] items-center justify-center border-dashed">
          <p className="text-sm text-content-subtle">
            Analyze your profile to unlock brand analytics
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {METRIC_CONFIG.map((m) => (
            <div key={m.key} className="card h-28 animate-pulse bg-white/[0.02]" />
          ))}
        </div>
      </div>
    );
  }

  const scoreColor =
    metrics.personalBrandScore >= 85
      ? "text-emerald-400"
      : metrics.personalBrandScore >= 70
        ? "text-brand-400"
        : metrics.personalBrandScore >= 55
          ? "text-cyan-400"
          : "text-amber-400";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-12">
        {/* Main score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-600/15 via-accent-blue/10 to-transparent p-6 shadow-card xl:col-span-4"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-brand-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
                  Personal Brand Score
                </span>
              </div>
              {output?.live && (
                <span className="flex items-center gap-1 rounded-full bg-brand-500/15 px-2 py-0.5 text-[9px] font-semibold text-brand-300">
                  <Sparkles className="h-3 w-3" /> AI enhanced
                </span>
              )}
            </div>
            <p className={cn("mt-4 text-5xl font-bold", scoreColor)}>
              <AnimatedCounter value={metrics.personalBrandScore} />
            </p>
            <p className="mt-1 text-sm text-content-muted">
              {getScoreLabel(metrics.personalBrandScore)}
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics.personalBrandScore}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-brand-600 via-accent-blue to-emerald-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Metric cards */}
        <div className="grid gap-3 sm:grid-cols-2 xl:col-span-5">
          {METRIC_CONFIG.map((config, i) => {
            const value = metrics[config.key];
            return (
              <motion.div
                key={config.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="card relative overflow-hidden"
              >
                <div
                  className="absolute right-0 top-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full opacity-20 blur-2xl"
                  style={{ backgroundColor: config.color }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-content-subtle">{config.label}</p>
                    <span className="text-lg font-bold" style={{ color: config.color }}>
                      <AnimatedCounter value={value} />
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.08 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-content-subtle">{config.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Radar */}
        <div className="card xl:col-span-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-content-subtle">
            Score breakdown
          </p>
          <BrandMetricsRadar metrics={metrics} />
        </div>
      </div>

      {/* Charts row */}
      {output && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card">
            <p className="mb-3 text-sm font-semibold text-white">8-week growth trend</p>
            <BrandScoreTrendChart data={output.scoreHistory} />
          </div>
          <div className="card">
            <p className="mb-4 text-sm font-semibold text-white">Current metric levels</p>
            <BrandMetricBreakdownChart data={output.scoreHistory} />
          </div>
        </div>
      )}
    </div>
  );
}
