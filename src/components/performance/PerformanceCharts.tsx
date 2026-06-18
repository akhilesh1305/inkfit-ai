"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Area,
} from "recharts";
import type { ChartPeriod, PerformanceChartPoint } from "@/lib/content-performance";
import { PERFORMANCE_CHART_COLORS } from "@/lib/content-performance";
import { cn } from "@/lib/utils";

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
    <div className="rounded-xl border border-white/10 bg-[#0c0c0e]/95 px-3 py-2.5 shadow-xl backdrop-blur-xl">
      <p className="mb-1.5 text-xs font-semibold text-white">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs text-content-muted">
          <span style={{ color: entry.color }}>{entry.name}: </span>
          {entry.name === "CTR" ? `${entry.value}%` : entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

interface PerformanceChartsProps {
  data: PerformanceChartPoint[];
  period: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
}

const PERIODS: { id: ChartPeriod; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

export function PerformanceCharts({ data, period, onPeriodChange }: PerformanceChartsProps) {
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] p-5">
        <div>
          <h3 className="section-title">Performance trends</h3>
          <p className="mt-0.5 text-xs text-content-muted">Views, engagement, shares & comments</p>
        </div>
        <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPeriodChange(p.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                period === p.id
                  ? "bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-sm"
                  : "text-content-muted hover:text-white"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
            Views & engagement
          </p>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="views"
                  name="Views"
                  fill={PERFORMANCE_CHART_COLORS.views}
                  fillOpacity={0.12}
                  stroke={PERFORMANCE_CHART_COLORS.views}
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="engagements"
                  name="Engagement"
                  stroke={PERFORMANCE_CHART_COLORS.engagements}
                  strokeWidth={2.5}
                  dot={{ fill: PERFORMANCE_CHART_COLORS.engagements, r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
            Shares, comments & CTR
          </p>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  dataKey="shares"
                  name="Shares"
                  fill={PERFORMANCE_CHART_COLORS.shares}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="comments"
                  name="Comments"
                  fill={PERFORMANCE_CHART_COLORS.comments}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-5 pb-5">
        <p className="mb-3 pt-4 text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
          Click-through rate
        </p>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="ctr"
                name="CTR"
                stroke={PERFORMANCE_CHART_COLORS.ctr}
                strokeWidth={2.5}
                dot={{ fill: PERFORMANCE_CHART_COLORS.ctr, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
