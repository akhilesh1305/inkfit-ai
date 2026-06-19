"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { AttributionSummary, AttributionTrendPoint } from "@/lib/attribution/types";
import { formatMetric } from "@/lib/content-performance";

const gridStroke = "rgba(255,255,255,0.06)";
const axisStyle = { fill: "#71717a", fontSize: 11 };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-ink-surface/95 px-3 py-2 shadow-card">
      <p className="mb-1 text-xs font-semibold text-content">{label}</p>
      {payload.map((e) => (
        <p key={e.name} className="text-xs text-content-muted">
          <span style={{ color: e.color }}>{e.name}: </span>
          {e.value}
        </p>
      ))}
    </div>
  );
}

export function AttributionSummaryCards({ summary }: { summary: AttributionSummary }) {
  const cards = [
    { label: "Generated", value: summary.totalGenerated, accent: "text-brand-300" },
    { label: "Published", value: summary.totalPublished, accent: "text-cyan-300" },
    { label: "Total Views", value: formatMetric(summary.totalViews), accent: "text-white" },
    {
      label: "Engagement Rate",
      value: `${summary.avgEngagementRate}%`,
      accent: "text-emerald-300",
    },
    { label: "Publish Rate", value: `${summary.publishRate}%`, accent: "text-amber-300" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="card py-4">
          <p className={`text-2xl font-bold ${c.accent}`}>{c.value}</p>
          <p className="mt-1 text-xs text-content-subtle">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

export function AttributionTrendChart({ data }: { data: AttributionTrendPoint[] }) {
  return (
    <div className="card">
      <h2 className="section-title">Attribution Trend</h2>
      <p className="mb-4 text-xs text-content-subtle">Generated vs published vs engagement</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="generated" name="Generated" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            <Bar dataKey="published" name="Published" fill="#06B6D4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="engagements" name="Engagements" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AttributionFunnel({ funnel }: { funnel: { generated: number; published: number; engaged: number } }) {
  const max = Math.max(funnel.generated, 1);
  const steps = [
    { label: "Generated", value: funnel.generated, pct: 100, color: "#7C3AED" },
    {
      label: "Published",
      value: funnel.published,
      pct: Math.round((funnel.published / max) * 100),
      color: "#06B6D4",
    },
    {
      label: "Engaged",
      value: funnel.engaged,
      pct: Math.round((funnel.engaged / max) * 100),
      color: "#10B981",
    },
  ];

  return (
    <div className="card">
      <h2 className="section-title">Content Funnel</h2>
      <p className="mb-4 text-xs text-content-subtle">Generated → published → engaged</p>
      <div className="space-y-4">
        {steps.map((s) => (
          <div key={s.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-content-muted">{s.label}</span>
              <span className="font-medium text-white">{s.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${s.pct}%`, backgroundColor: s.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
