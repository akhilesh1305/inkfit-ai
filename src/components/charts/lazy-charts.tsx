"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

function ChartSkeleton() {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
    </div>
  );
}

export const LazyPerformanceCharts = dynamic(
  () =>
    import("@/components/performance/PerformanceCharts").then((m) => ({
      default: m.PerformanceCharts,
    })),
  { ssr: false, loading: ChartSkeleton }
);

export const LazyAttributionFunnel = dynamic(
  () =>
    import("@/components/attribution/AttributionCharts").then((m) => ({
      default: m.AttributionFunnel,
    })),
  { ssr: false, loading: ChartSkeleton }
);

export const LazyAttributionTrendChart = dynamic(
  () =>
    import("@/components/attribution/AttributionCharts").then((m) => ({
      default: m.AttributionTrendChart,
    })),
  { ssr: false, loading: ChartSkeleton }
);

export const LazyAttributionSummaryCards = dynamic(
  () =>
    import("@/components/attribution/AttributionCharts").then((m) => ({
      default: m.AttributionSummaryCards,
    })),
  { ssr: false, loading: ChartSkeleton }
);

export const LazyBrandMetricsRadar = dynamic(
  () =>
    import("@/components/personal-brand/BrandAnalyticsCharts").then((m) => ({
      default: m.BrandMetricsRadar,
    })),
  { ssr: false, loading: ChartSkeleton }
);

export const LazyBrandScoreTrendChart = dynamic(
  () =>
    import("@/components/personal-brand/BrandAnalyticsCharts").then((m) => ({
      default: m.BrandScoreTrendChart,
    })),
  { ssr: false, loading: ChartSkeleton }
);

export const LazyBrandMetricBreakdownChart = dynamic(
  () =>
    import("@/components/personal-brand/BrandAnalyticsCharts").then((m) => ({
      default: m.BrandMetricBreakdownChart,
    })),
  { ssr: false, loading: ChartSkeleton }
);
