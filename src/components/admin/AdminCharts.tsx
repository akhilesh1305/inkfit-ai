"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { CHART_COLORS } from "@/lib/analytics-data";
import type {
  RevenuePoint,
  UserGrowthPoint,
  ContentGenPoint,
  PlanBreakdown,
} from "@/lib/admin";

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
          {typeof entry.value === "number" && entry.name.toLowerCase().includes("revenue")
            ? `₹${entry.value.toLocaleString()}`
            : entry.value}
        </p>
      ))}
    </div>
  );
}

export function AdminRevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS.emerald} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminUserGrowthChart({ data }: { data: UserGrowthPoint[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} iconType="circle" iconSize={8} />
          <Line
            type="monotone"
            dataKey="users"
            name="Total users"
            stroke={CHART_COLORS.violet}
            strokeWidth={2.5}
            dot={{ fill: CHART_COLORS.violet, r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="signups"
            name="New signups"
            stroke={CHART_COLORS.cyan}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminContentChart({ data }: { data: ContentGenPoint[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} iconType="circle" iconSize={8} />
          <Bar dataKey="linkedin" name="LinkedIn" stackId="a" fill={CHART_COLORS.blue} />
          <Bar dataKey="blog" name="Blog" stackId="a" fill={CHART_COLORS.cyan} />
          <Bar dataKey="seo" name="SEO" stackId="a" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminPlanPieChart({ data }: { data: PlanBreakdown[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="plan"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.plan} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
