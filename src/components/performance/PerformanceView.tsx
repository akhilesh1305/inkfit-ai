"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, LineChart } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PerformanceMetricCards } from "@/components/performance/PerformanceMetricCards";
import { PerformanceCharts } from "@/components/performance/PerformanceCharts";
import { TopPerformingContent } from "@/components/performance/TopPerformingContent";
import { ContentLeaderboard } from "@/components/performance/ContentLeaderboard";
import type {
  ChartPeriod,
  ContentPerformanceItem,
  PerformanceChartPoint,
  PerformanceSummary,
} from "@/lib/content-performance";

export function PerformanceView() {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<ContentPerformanceItem[]>([]);
  const [topPerforming, setTopPerforming] = useState<ContentPerformanceItem[]>([]);
  const [chartData, setChartData] = useState<PerformanceChartPoint[]>([]);
  const [period, setPeriod] = useState<ChartPeriod>("daily");
  const [chartsCache, setChartsCache] = useState<Record<ChartPeriod, PerformanceChartPoint[]> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: ChartPeriod) => {
    const res = await fetch(`/api/performance?period=${p}`);
    if (res.ok) {
      const data = await res.json();
      setSummary(data.summary);
      setLeaderboard(data.leaderboard ?? []);
      setTopPerforming(data.topPerforming ?? []);
      setChartData(data.chart ?? []);
      if (data.charts) {
        setChartsCache(data.charts);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(period);
  }, [load, period]);

  function handlePeriodChange(next: ChartPeriod) {
    setPeriod(next);
    if (chartsCache?.[next]) {
      setChartData(chartsCache[next]);
    }
  }

  if (loading || !summary) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <LineChart className="h-7 w-7 text-brand-400" />
            Content Performance Center
          </span>
        }
        description="Track generated content performance — views, engagement, CTR, shares, and comments."
      />

      <PerformanceMetricCards summary={summary} />

      <PerformanceCharts
        data={chartData}
        period={period}
        onPeriodChange={handlePeriodChange}
      />

      <TopPerformingContent items={topPerforming} />

      <ContentLeaderboard items={leaderboard} />
    </div>
  );
}
