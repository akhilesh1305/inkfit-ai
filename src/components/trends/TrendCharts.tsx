"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CHART_COLORS } from "@/lib/analytics-data";
import type { TrendChartPoint } from "@/lib/trend-discovery";

const axisStyle = { fill: "#71717a", fontSize: 11 };
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
      <p className="mb-1.5 text-xs font-semibold text-content">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs text-content-muted">
          <span style={{ color: entry.color }}>{entry.name}: </span>
          {entry.value}
        </p>
      ))}
    </div>
  );
}

export function TrendInterestChart({ data }: { data: TrendChartPoint[] }) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="week" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={[40, 100]} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} iconType="circle" iconSize={8} />
          <Line
            type="monotone"
            dataKey="interest"
            name="Search interest"
            stroke={CHART_COLORS.violet}
            strokeWidth={2.5}
            dot={{ fill: CHART_COLORS.violet, r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="content"
            name="Content volume"
            stroke={CHART_COLORS.cyan}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OpportunityBarChart({
  data,
}: {
  data: { name: string; opportunity: number; trend: number }[];
}) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="opportunity" name="Opportunity" fill={CHART_COLORS.emerald} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
