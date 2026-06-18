"use client";

import { motion } from "framer-motion";
import {
  Target,
  FileText,
  Calendar,
  Search,
  AlertTriangle,
  TrendingUp,
  Hash,
  BarChart3,
} from "lucide-react";
import type { CompetitorAnalysis } from "@/lib/competitor-analysis";
import { AnimatedCounter } from "@/components/analytics/AnimatedCounter";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES = {
  high: "bg-red-500/15 text-red-300 border-red-500/25",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  low: "bg-white/10 text-content-muted border-white/10",
};

const DIFFICULTY_STYLES = {
  Easy: "bg-emerald-500/15 text-emerald-300",
  Medium: "bg-amber-500/15 text-amber-300",
  Hard: "bg-red-500/15 text-red-300",
};

interface CompetitorResultsProps {
  data: CompetitorAnalysis | null;
  loading: boolean;
}

export function CompetitorResults({ data, loading }: CompetitorResultsProps) {
  if (loading) {
    return (
      <div className="card flex min-h-[480px] flex-col items-center justify-center">
        <div className="relative">
          <div className="h-14 w-14 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
          <BarChart3 className="absolute inset-0 m-auto h-6 w-6 text-brand-400" />
        </div>
        <p className="mt-5 text-sm font-medium text-content-muted">
          Scanning competitor content & SEO...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card flex min-h-[480px] flex-col items-center justify-center border-dashed text-center">
        <Target className="h-10 w-10 text-content-subtle" />
        <p className="mt-3 font-medium text-content">Analysis results will appear here</p>
        <p className="mt-1 max-w-sm text-sm text-content-subtle">
          Enter a competitor URL to uncover content gaps, keyword opportunities, and weaknesses.
        </p>
      </div>
    );
  }

  const scoreColor =
    data.opportunityScore >= 80
      ? "text-emerald-400"
      : data.opportunityScore >= 65
        ? "text-brand-400"
        : "text-amber-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header + Opportunity Score */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-surface/60 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-brand-600/10 to-transparent px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
              Competitor
            </p>
            <h2 className="text-xl font-bold text-content">{data.competitorName}</h2>
            <p className="text-xs text-content-subtle">{data.competitorUrl}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
              Opportunity Score
            </p>
            <p className={cn("text-4xl font-bold", scoreColor)}>
              <AnimatedCounter value={data.opportunityScore} />
            </p>
            <p className="text-xs text-content-subtle">
              {data.opportunityScore >= 80
                ? "Strong opportunity to outrank"
                : data.opportunityScore >= 65
                  ? "Good gaps to exploit"
                  : "Moderate opportunity"}
            </p>
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.opportunityScore}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-brand-600 via-accent-blue to-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Analytics cards row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Content Topics",
            value: data.contentTopics.length,
            icon: FileText,
            color: "#7C3AED",
          },
          {
            label: "SEO Opportunities",
            value: data.seoOpportunities.length,
            icon: Search,
            color: "#3B82F6",
          },
          {
            label: "Keyword Gaps",
            value: data.keywordGaps.length,
            icon: Hash,
            color: "#06B6D4",
          },
          {
            label: "Weaknesses Found",
            value: data.contentWeaknesses.length,
            icon: AlertTriangle,
            color: "#F59E0B",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
            </div>
            <p className="mt-3 text-2xl font-bold text-content">
              <AnimatedCounter value={stat.value} />
            </p>
            <p className="text-xs text-content-subtle">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Content Topics */}
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-400" />
            <h3 className="font-semibold text-content">Content Topics</h3>
          </div>
          <ul className="space-y-2">
            {data.contentTopics.map((topic, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-content-muted"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {topic}
              </li>
            ))}
          </ul>
        </div>

        {/* Posting Frequency */}
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accent-blue" />
            <h3 className="font-semibold text-content">Posting Frequency</h3>
          </div>
          <div className="space-y-3">
            {[
              { channel: "Blog", value: data.postingFrequency.blog },
              { channel: "LinkedIn", value: data.postingFrequency.linkedin },
              { channel: "Newsletter", value: data.postingFrequency.newsletter },
              { channel: "Overall", value: data.postingFrequency.overall },
            ].map((item) => (
              <div
                key={item.channel}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <span className="text-sm font-medium text-content">{item.channel}</span>
                <span className="text-sm text-content-muted">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEO Opportunities */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <h3 className="font-semibold text-content">SEO Opportunities</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {data.seoOpportunities.map((opp, i) => (
            <div
              key={i}
              className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-content-muted"
            >
              {opp}
            </div>
          ))}
        </div>
      </div>

      {/* Content Gap Report */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-surface/60 shadow-card">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="font-semibold text-content">Content Gap Report</h3>
          <p className="text-xs text-content-subtle">Areas where you can outperform {data.competitorName}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
                <th className="px-6 py-3">Area</th>
                <th className="px-6 py-3">Gap</th>
                <th className="px-6 py-3">Priority</th>
              </tr>
            </thead>
            <tbody>
              {data.contentGapReport.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                  <td className="px-6 py-4 font-medium text-content">{row.area}</td>
                  <td className="px-6 py-4 text-content-muted">{row.gap}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-xs font-medium capitalize",
                        PRIORITY_STYLES[row.priority]
                      )}
                    >
                      {row.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Keyword Gaps + Recommendations */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <Hash className="h-4 w-4 text-cyan-400" />
            <h3 className="font-semibold text-content">Keyword Gaps</h3>
          </div>
          <div className="space-y-3">
            {data.keywordGaps.map((kw, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-content">{kw.keyword}</p>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                      DIFFICULTY_STYLES[kw.difficulty]
                    )}
                  >
                    {kw.difficulty}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-content-subtle">
                  <span>Vol: {kw.volume}</span>
                </div>
                <p className="mt-2 text-xs text-brand-300">{kw.opportunity}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-brand-400" />
            <h3 className="font-semibold text-content">Keyword Recommendations</h3>
          </div>
          <div className="space-y-3">
            {data.keywordRecommendations.map((rec, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <p className="font-medium text-content">{rec.keyword}</p>
                <span className="mt-1 inline-block rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-content-subtle">
                  {rec.intent}
                </span>
                <p className="mt-2 text-xs leading-relaxed text-content-muted">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Weaknesses */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <h3 className="font-semibold text-content">Content Weaknesses</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {data.contentWeaknesses.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-content-muted"
            >
              <span className="text-amber-400">→</span>
              {w}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
