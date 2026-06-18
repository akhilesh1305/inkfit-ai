"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  MONTHLY_TREND,
  CONTENT_DISTRIBUTION,
  WEEKLY_USAGE,
  CHART_COLORS,
} from "@/lib/analytics-data";

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
    <div className="rounded-xl border border-white/10 bg-ink-surface/95 px-3 py-2 shadow-card backdrop-blur-xl">
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

export function ContentTrendLineChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={MONTHLY_TREND} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="total"
            name="Total"
            stroke={CHART_COLORS.violet}
            strokeWidth={2.5}
            dot={{ fill: CHART_COLORS.violet, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="linkedin"
            name="LinkedIn"
            stroke={CHART_COLORS.blue}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="carousels"
            name="Carousels"
            stroke={CHART_COLORS.amber}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyUsageBarChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={WEEKLY_USAGE} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="week" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="generations"
            name="Generations"
            fill={CHART_COLORS.blue}
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
          <Bar
            dataKey="credits"
            name="AI Credits"
            fill={CHART_COLORS.violet}
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ContentTypePieChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={CONTENT_DISTRIBUTION}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            stroke="transparent"
          >
            {CONTENT_DISTRIBUTION.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyBreakdownBarChart() {
  const data = MONTHLY_TREND.map((m) => ({
    month: m.month,
    Blogs: m.blogs,
    SEO: m.seo,
    LinkedIn: m.linkedin,
    Carousels: m.carousels,
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="LinkedIn" stackId="a" fill={CHART_COLORS.blue} />
          <Bar dataKey="Carousels" stackId="a" fill={CHART_COLORS.violet} />
          <Bar dataKey="Blogs" stackId="a" fill={CHART_COLORS.cyan} />
          <Bar dataKey="SEO" stackId="a" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
