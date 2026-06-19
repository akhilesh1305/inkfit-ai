"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, TrendingUp, Users, Zap } from "lucide-react";
import { formatCredits } from "@/lib/credits";

interface DashboardStats {
  generations: string;
  generationsSub: string;
  scheduled: string;
  scheduledSub: string;
  seoScore: string;
  seoSub: string;
  brandKit: string;
  brandSub: string;
}

const EMPTY: DashboardStats = {
  generations: "0",
  generationsSub: "No usage yet",
  scheduled: "0",
  scheduledSub: "Nothing scheduled",
  seoScore: "—",
  seoSub: "Generate SEO content",
  brandKit: "Not set",
  brandSub: "Configure brand",
};

export function DashboardHomeStats() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY);

  useEffect(() => {
    async function load() {
      try {
        const [creditsRes, calendarRes, brandRes] = await Promise.all([
          fetch("/api/credits"),
          fetch("/api/calendar"),
          fetch("/api/brand"),
        ]);

        const next = { ...EMPTY };

        if (creditsRes.ok) {
          const { credits, planId } = await creditsRes.json();
          next.generations = String(credits.creditsUsed ?? 0);
          next.generationsSub =
            credits.creditsLimit === "unlimited"
              ? "Unlimited plan"
              : `${formatCredits(credits.creditsRemaining)} remaining · ${planId} plan`;
        }

        if (calendarRes.ok) {
          const cal = await calendarRes.json();
          const events = cal.events ?? [];
          const scheduled = events.filter(
            (e: { status?: string }) => e.status === "scheduled" || e.status === "draft"
          );
          const weekAhead = new Date();
          weekAhead.setDate(weekAhead.getDate() + 7);
          const thisWeek = scheduled.filter((e: { date?: string }) => {
            if (!e.date) return false;
            const d = new Date(e.date);
            return d <= weekAhead;
          });
          next.scheduled = String(scheduled.length);
          next.scheduledSub =
            thisWeek.length > 0 ? `${thisWeek.length} this week` : "Nothing this week";
        }

        if (brandRes.ok) {
          const brand = await brandRes.json();
          if (brand.companyName) {
            next.brandKit = "Active";
            next.brandSub = brand.companyName;
          } else {
            next.brandKit = "Not set";
            next.brandSub = "Configure in Brand Kit";
          }
        }

        setStats(next);
      } catch {
        setStats(EMPTY);
      }
    }
    void load();
  }, []);

  const cards = [
    { label: "Credits Used This Month", value: stats.generations, icon: Zap, change: stats.generationsSub },
    { label: "Scheduled Content", value: stats.scheduled, icon: Calendar, change: stats.scheduledSub },
    { label: "Avg. SEO Score", value: stats.seoScore, icon: TrendingUp, change: stats.seoSub },
    { label: "Brand Kit", value: stats.brandKit, icon: Users, change: stats.brandSub },
  ];

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((stat) => (
        <div key={stat.label} className="card">
          <div className="flex items-center justify-between">
            <stat.icon className="h-5 w-5 text-brand-600" />
            <span className="text-xs font-medium text-content-muted">{stat.change}</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-content">{stat.value}</p>
          <p className="text-sm text-content-subtle">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
