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
import { BarChart3, MousePointerClick, PenLine, Sparkles, TrendingUp } from "lucide-react";
import type { ExtensionUsageSummary } from "@/lib/extensions";
import { AnimatedCounter } from "@/components/analytics/AnimatedCounter";

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
    <div className="rounded-xl border border-white/10 bg-[#0c0c0e]/95 px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs font-semibold text-white">{label}</p>
      {payload.map((e) => (
        <p key={e.name} className="text-xs text-content-muted">
          <span style={{ color: e.color }}>{e.name}: </span>
          {e.value}
        </p>
      ))}
    </div>
  );
}

interface UsageStatisticsPanelProps {
  usage: ExtensionUsageSummary;
}

export function UsageStatisticsPanel({ usage }: UsageStatisticsPanelProps) {
  const stats = [
    { label: "Content captures", value: usage.totalCaptures, icon: MousePointerClick, color: "#7C3AED" },
    { label: "Content inserts", value: usage.totalInserts, icon: PenLine, color: "#06B6D4" },
    { label: "AI assists", value: usage.totalAiAssists, icon: Sparkles, color: "#10B981" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card flex items-center gap-4 border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent"
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                <AnimatedCounter value={stat.value} />
              </p>
              <p className="text-xs text-content-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-400" />
            <h3 className="font-semibold text-white">Weekly usage</h3>
          </div>
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />+{usage.weeklyChange}% vs last week
          </span>
        </div>
        <div className="h-[220px] w-full min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            <BarChart data={usage.history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: "#a1a1aa" }} iconSize={8} />
              <Bar dataKey="captures" name="Captures" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inserts" name="Inserts" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="aiAssists" name="AI assists" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {usage.byPlatform.length > 0 && (
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <p className="mb-2 text-xs font-medium text-content-muted">Usage by integration</p>
            <div className="flex flex-wrap gap-2">
              {usage.byPlatform.map((item) => (
                <span
                  key={item.platform}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-content-muted"
                >
                  <span className="font-medium capitalize text-white">
                    {item.platform.replace("-", " ")}
                  </span>
                  {" · "}
                  {item.count} actions
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
