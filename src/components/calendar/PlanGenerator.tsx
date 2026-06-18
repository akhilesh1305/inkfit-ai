"use client";

import { CalendarDays, Loader2, Sparkles } from "lucide-react";
import {
  CALENDAR_PLATFORMS,
  type CalendarPlatformId,
} from "@/lib/calendar-plan";
import { cn } from "@/lib/utils";

interface PlanGeneratorProps {
  industry: string;
  goals: string;
  platforms: CalendarPlatformId[];
  loading: boolean;
  onIndustryChange: (v: string) => void;
  onGoalsChange: (v: string) => void;
  onPlatformsChange: (v: CalendarPlatformId[]) => void;
  onGenerate: () => void;
}

export function PlanGenerator({
  industry,
  goals,
  platforms,
  loading,
  onIndustryChange,
  onGoalsChange,
  onPlatformsChange,
  onGenerate,
}: PlanGeneratorProps) {
  const canGenerate =
    industry.trim().length >= 2 && goals.trim().length >= 5 && platforms.length > 0;

  function togglePlatform(id: CalendarPlatformId) {
    if (platforms.includes(id)) {
      if (platforms.length > 1) {
        onPlatformsChange(platforms.filter((p) => p !== id));
      }
    } else {
      onPlatformsChange([...platforms, id]);
    }
  }

  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600/30 to-accent-blue/30">
          <CalendarDays className="h-5 w-5 text-brand-400" />
        </div>
        <div>
          <h2 className="section-title">30-Day Plan</h2>
          <p className="text-xs text-content-subtle">AI-powered content schedule</p>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="industry">
          Industry
        </label>
        <input
          id="industry"
          className="input-field"
          placeholder="e.g. SaaS, fitness coaching, real estate"
          value={industry}
          onChange={(e) => onIndustryChange(e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="goals">
          Goals
        </label>
        <textarea
          id="goals"
          className="input-field min-h-[88px] resize-y"
          placeholder="e.g. Build thought leadership, generate leads, grow to 10k followers"
          value={goals}
          onChange={(e) => onGoalsChange(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Platforms</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {CALENDAR_PLATFORMS.map((p) => {
            const selected = platforms.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlatform(p.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition duration-300",
                  selected
                    ? "border-brand-500/50 bg-brand-500/10 text-content shadow-glow"
                    : "border-white/10 bg-white/[0.02] text-content-muted hover:border-white/20"
                )}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate || loading}
        className="btn-primary w-full py-3.5"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Building plan...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Generate 30-Day Plan
          </>
        )}
      </button>
    </div>
  );
}
