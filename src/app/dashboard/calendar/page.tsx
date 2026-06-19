"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarRange, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PlanGenerator } from "@/components/calendar/PlanGenerator";
import { ContentCalendar } from "@/components/calendar/ContentCalendar";
import {
  generate30DayPlan,
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
  const [syncing, setSyncing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/calendar");
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items as CalendarPlanItem[]);
          setCurrentMonth(new Date(data.items[0].date));
        }
      } catch {
        /* ignore */
      } finally {
        setHydrated(true);
      }
    }
    load();
  }, []);

  const persistItems = useCallback(async (next: CalendarPlanItem[]) => {
    setSyncing(true);
    try {
      await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "plan", items: next }),
      });
    } catch {
      /* offline */
    } finally {
      setSyncing(false);
    }
  }, []);

  function handleItemsChange(next: CalendarPlanItem[]) {
    setItems(next);
    persistItems(next);
  }

  async function handleGenerate() {
    setLoading(true);
    const plan = generate30DayPlan({ industry, goals, platforms });
    setItems(plan);
    setCurrentMonth(new Date(plan[0].date));
    await persistItems(plan);
    setLoading(false);
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
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
            {syncing && (
              <span className="text-xs font-normal text-content-subtle">Saving…</span>
            )}
          </span>
        }
        description="Plan, schedule, and manage your content across platforms."
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
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          onItemsChange={handleItemsChange}
        />
      </div>
    </div>
  );
}
