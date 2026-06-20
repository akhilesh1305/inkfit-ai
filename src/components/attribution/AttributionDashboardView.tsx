"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, Loader2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AttributionInsightsPanel } from "@/components/attribution/AttributionInsightsPanel";
import { BestPerformersSection } from "@/components/attribution/BestPerformersSection";
import {
  LazyAttributionFunnel,
  LazyAttributionSummaryCards,
  LazyAttributionTrendChart,
} from "@/components/charts/lazy-charts";
import type {
  AttributionDashboard,
  AttributionInsightView,
} from "@/lib/attribution/types";

export function AttributionDashboardView() {
  const [dashboard, setDashboard] = useState<AttributionDashboard | null>(null);
  const [insights, setInsights] = useState<AttributionInsightView | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async (withInsights = true) => {
    setLoadError(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/attribution?insights=${withInsights ? "1" : "0"}`);
      if (res.ok) {
        const data = await res.json();
        setDashboard(data.dashboard);
        if (data.insights) setInsights(data.insights);
      } else {
        setLoadError(true);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/attribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      if (res.ok) {
        const data = await res.json();
        setDashboard(data.dashboard);
      }
    } finally {
      setSyncing(false);
    }
  }

  async function handleRefreshInsights() {
    setInsightsLoading(true);
    try {
      const res = await fetch("/api/attribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "insights" }),
      });
      if (res.ok) {
        const data = await res.json();
        setInsights(data.insights);
        if (data.dashboard) setDashboard(data.dashboard);
      }
    } finally {
      setInsightsLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="card flex min-h-[40vh] flex-col items-center justify-center gap-4 py-12 text-center">
        <p className="text-content-muted">
          {loadError ? "Could not load attribution data." : "No attribution data yet."}
        </p>
        <button type="button" className="btn-primary" onClick={() => void load()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-brand-400" />
            Content Attribution
          </span>
        }
        description="Track generated → published → engagement. Discover what topics, hooks, and CTAs perform best."
      >
        <button
          type="button"
          className="btn-secondary flex items-center gap-2"
          disabled={syncing}
          onClick={handleSync}
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          Sync data
        </button>
      </PageHeader>

      <LazyAttributionSummaryCards summary={dashboard.summary} />

      <AttributionInsightsPanel
        insight={insights}
        loading={insightsLoading}
        onRefresh={handleRefreshInsights}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LazyAttributionTrendChart data={dashboard.trend} />
        </div>
        <LazyAttributionFunnel funnel={dashboard.funnel} />
      </div>

      <BestPerformersSection
        bestContent={dashboard.bestContent}
        bestTopics={dashboard.bestTopics}
        bestHooks={dashboard.bestHooks}
        bestCtas={dashboard.bestCtas}
      />
    </div>
  );
}
