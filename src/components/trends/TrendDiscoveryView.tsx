"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  TrendingUp,
  Flame,
  Target,
  BarChart3,
  Hash,
  Lightbulb,
  Globe,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TrendInterestChart, OpportunityBarChart } from "@/components/trends/TrendCharts";
import { TopicCard, KeywordRow, OpportunityCard } from "@/components/trends/TrendCards";
import { cn } from "@/lib/utils";
import {
  TREND_CATEGORIES,
  type TrendCategory,
  type TrendDiscoveryData,
} from "@/lib/trend-discovery";

type TabId = "topics" | "keywords" | "industry" | "opportunities";

export function TrendDiscoveryView() {
  const router = useRouter();
  const [category, setCategory] = useState<TrendCategory | "all">("all");
  const [tab, setTab] = useState<TabId>("topics");
  const [data, setData] = useState<TrendDiscoveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/trends?category=${category}`);
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleGenerate(payload: {
    id: string;
    title: string;
    description?: string;
    angle?: string;
    format?: string;
    relatedTopic?: string;
    category?: string;
  }) {
    setGeneratingId(payload.id);
    const res = await fetch("/api/trends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate-content",
        ...payload,
        contentType: "linkedin",
      }),
    });
    const result = await res.json();
    setGeneratingId(null);

    if (result.ok) {
      if (typeof window !== "undefined" && result.prompt) {
        sessionStorage.setItem(
          "inkfit-template",
          JSON.stringify({ title: payload.title, body: result.prompt })
        );
      }
      showToast("Draft created — opening LinkedIn Studio");
      router.push(result.route ?? "/dashboard/workspace");
    }
  }

  const chartBarData =
    data?.topics.slice(0, 5).map((t) => ({
      name: t.title.slice(0, 18) + (t.title.length > 18 ? "…" : ""),
      opportunity: t.opportunityScore,
      trend: t.trendScore,
    })) ?? [];

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-brand-400" />
            Trend Discovery
          </span>
        }
        description="Discover trending topics, keywords, and content opportunities before your competitors."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          <Flame className="h-3.5 w-3.5" />
          Updated daily
        </span>
      </PageHeader>

      {toast && (
        <div className="mb-4 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-2.5 text-sm text-brand-200">
          {toast}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
          All industries
        </FilterChip>
        {TREND_CATEGORIES.map((c) => (
          <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </FilterChip>
        ))}
      </div>

      {loading || !data ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            <SummaryCard
              icon={TrendingUp}
              label="Avg trend score"
              value={String(data.summary.avgTrendScore)}
              gradient="from-violet-600 to-purple-700"
            />
            <SummaryCard
              icon={Target}
              label="Avg opportunity"
              value={String(data.summary.avgOpportunity)}
              gradient="from-emerald-600 to-teal-700"
            />
            <SummaryCard
              icon={Flame}
              label="Hot opportunities"
              value={String(data.summary.hotCount)}
              gradient="from-orange-500 to-red-600"
            />
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0e] p-5">
              <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-content">
                <BarChart3 className="h-4 w-4 text-brand-400" />
                Interest vs content volume
              </h3>
              <p className="mb-4 text-xs text-content-subtle">6-week trend momentum</p>
              <TrendInterestChart data={data.chartData} />
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0e] p-5">
              <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-content">
                <Target className="h-4 w-4 text-emerald-400" />
                Top opportunity scores
              </h3>
              <p className="mb-4 text-xs text-content-subtle">Highest-potential topics</p>
              <OpportunityBarChart data={chartBarData} />
            </div>
          </div>

          <div className="mb-4 flex gap-1 overflow-x-auto border-b border-white/[0.06] pb-px">
            {(
              [
                { id: "topics", label: "Trending topics", icon: Flame },
                { id: "keywords", label: "Trending keywords", icon: Hash },
                { id: "industry", label: "Industry trends", icon: Globe },
                { id: "opportunities", label: "Content opportunities", icon: Lightbulb },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition",
                  tab === t.id
                    ? "border-brand-500 text-brand-300"
                    : "border-transparent text-content-subtle hover:text-content"
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          {tab === "topics" && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.topics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  generating={generatingId === topic.id}
                  onGenerate={() =>
                    handleGenerate({
                      id: topic.id,
                      title: topic.title,
                      description: topic.description,
                      category: topic.category,
                    })
                  }
                />
              ))}
            </div>
          )}

          {tab === "keywords" && (
            <div className="space-y-2">
              {data.keywords.map((kw) => (
                <KeywordRow
                  key={kw.id}
                  keyword={kw}
                  onGenerate={() =>
                    handleGenerate({
                      id: kw.id,
                      title: `Content targeting: ${kw.keyword}`,
                      description: `SEO keyword — volume ${kw.volume}, difficulty ${kw.difficulty}`,
                      category: kw.category,
                    })
                  }
                />
              ))}
            </div>
          )}

          {tab === "industry" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.industryTrends.map((trend) => (
                <div
                  key={trend.id}
                  className="rounded-xl border border-white/[0.06] bg-[#0c0c0e] p-5"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                        trend.impact === "rising"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : trend.impact === "emerging"
                            ? "bg-brand-500/15 text-brand-300"
                            : "bg-zinc-500/15 text-zinc-400"
                      )}
                    >
                      {trend.impact}
                    </span>
                    <span className="text-lg font-bold text-brand-300">{trend.trendScore}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-content">{trend.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-content-muted">{trend.summary}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "opportunities" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.opportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  generating={generatingId === opp.id}
                  onGenerate={() =>
                    handleGenerate({
                      id: opp.id,
                      title: opp.title,
                      angle: opp.angle,
                      format: opp.format,
                      relatedTopic: opp.relatedTopic,
                      category: opp.category,
                    })
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-brand-500/40 bg-brand-500/15 text-brand-300"
          : "border-white/[0.06] text-content-subtle hover:text-content"
      )}
    >
      {children}
    </button>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0e] p-4">
      <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br", gradient)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-2xl font-bold tabular-nums text-content">{value}</p>
      <p className="text-xs text-content-subtle">{label}</p>
    </div>
  );
}
