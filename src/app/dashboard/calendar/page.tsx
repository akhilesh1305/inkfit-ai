"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarRange } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PlanGenerator } from "@/components/calendar/PlanGenerator";
import { ContentCalendar } from "@/components/calendar/ContentCalendar";
import {
  generate30DayPlan,
  STORAGE_KEY,
  type CalendarPlanItem,
  type CalendarPlatformId,
} from "@/lib/calendar-plan";

const DEFAULT_PLATFORMS: CalendarPlatformId[] = ["linkedin", "instagram"];

export default function CalendarPage() {
  const [industry, setIndustry] = useState("");
  const [goals, setGoals] = useState("");
  const [platforms, setPlatforms] = useState<CalendarPlatformId[]>(DEFAULT_PLATFORMS);
  const [items, setItems] = useState<CalendarPlanItem[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CalendarPlanItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          setCurrentMonth(new Date(parsed[0].date));
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const persistItems = useCallback(async (next: CalendarPlanItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    try {
      await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "plan",
          items: next,
        }),
      });
    } catch {
      /* offline ok */
    }
  }, []);

  function handleItemsChange(next: CalendarPlanItem[]) {
    setItems(next);
    persistItems(next);
  }

  async function handleGenerate() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const plan = generate30DayPlan({ industry, goals, platforms });
    setItems(plan);
    setCurrentMonth(new Date(plan[0].date));
    persistItems(plan);
    setLoading(false);
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <CalendarRange className="h-7 w-7 text-brand-400" />
            Content Calendar
          </span>
        }
        description="Plan 30 days of content across platforms. Drag and drop to reschedule any item."
      />

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <PlanGenerator
          industry={industry}
          goals={goals}
          platforms={platforms}
          loading={loading}
          onIndustryChange={setIndustry}
          onGoalsChange={setGoals}
          onPlatformsChange={setPlatforms}
          onGenerate={handleGenerate}
        />

        <ContentCalendar
          items={items}
          onItemsChange={handleItemsChange}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
      </div>
    </div>
  );
}
