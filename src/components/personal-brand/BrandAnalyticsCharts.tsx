"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from "recharts";
import type { PersonalBrandMetrics, ScoreHistoryPoint } from "@/lib/personal-brand";
import { metricsToRadar } from "@/lib/personal-brand";

const axisStyle = { fill: "#71717a", fontSize: 10 };
const gridStroke = "rgba(255,255,255,0.06)";

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
    <div className="rounded-xl border border-white/10 bg-[#0c0c0e]/95 px-3 py-2 shadow-xl backdrop-blur-xl">
      <p className="mb-1.5 text-xs font-semibold text-white">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs text-content-muted">
          <span style={{ color: entry.color }}>{entry.name}: </span>
          {entry.value}
        </p>
      ))}
    </div>
  );
}

export function BrandScoreTrendChart({ data }: { data: ScoreHistoryPoint[] }) {
  return (
    <div className="h-[220px] w-full min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={220}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="week" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={[40, 100]} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10, color: "#a1a1aa" }} iconType="circle" iconSize={6} />
          <Line
            type="monotone"
            dataKey="score"
            name="Brand score"
            stroke="#7C3AED"
            strokeWidth={2.5}
            dot={{ fill: "#7C3AED", r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="engagementPotential"
            name="Engagement"
            stroke="#06B6D4"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BrandMetricsRadar({ metrics }: { metrics: PersonalBrandMetrics }) {
  const data = metricsToRadar(metrics);

  return (
    <div className="h-[240px] w-full min-h-[240px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={240}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke={gridStroke} />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#a1a1aa", fontSize: 9 }} />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#7C3AED"
            fill="#7C3AED"
            fillOpacity={0.35}
            strokeWidth={2}
          />
          <Tooltip content={<ChartTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BrandMetricBreakdownChart({ data }: { data: ScoreHistoryPoint[] }) {
  const latest = data[data.length - 1];
  if (!latest) return null;

  const barData = [
    { name: "Consistency", value: latest.consistency, fill: "#7C3AED" },
    { name: "Thought Lead.", value: latest.thoughtLeadership, fill: "#3B82F6" },
    { name: "Quality", value: latest.contentQuality, fill: "#10B981" },
    { name: "Engagement", value: latest.engagementPotential, fill: "#06B6D4" },
  ];

  return (
    <div className="space-y-3">
      {barData.map((item) => (
        <div key={item.name}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-content-muted">{item.name}</span>
            <span className="font-semibold" style={{ color: item.fill }}>
              {item.value}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${item.value}%`, backgroundColor: item.fill }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
