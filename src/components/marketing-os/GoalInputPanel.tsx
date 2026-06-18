"use client";

import { useState } from "react";
import { Loader2, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { GOAL_SUGGESTIONS } from "@/lib/marketing-os";

interface GoalInputPanelProps {
  goal: string;
  onGoalChange: (goal: string) => void;
  onGenerate: () => void;
  loading: boolean;
}

export function GoalInputPanel({
  goal,
  onGoalChange,
  onGenerate,
  loading,
}: GoalInputPanelProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#14141c] via-[#0c0c0e] to-[#08080a] p-6">
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 via-violet-600 to-cyan-500 shadow-glow">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-content">Business goal</h2>
            <p className="text-xs text-content-subtle">Describe what you want to achieve</p>
          </div>
        </div>

        <textarea
          value={goal}
          onChange={(e) => onGoalChange(e.target.value)}
          placeholder="I want to grow my SaaS startup and generate more leads."
          rows={4}
          className="input-field mt-5 w-full resize-none bg-black/40 text-sm leading-relaxed"
        />

        <div className="mt-3 flex flex-wrap gap-1.5">
          {GOAL_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onGoalChange(s)}
              className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] text-content-subtle transition hover:border-brand-500/30 hover:text-brand-300"
            >
              {s.slice(0, 42)}…
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!goal.trim() || loading}
          onClick={onGenerate}
          className={cn(
            "btn-primary mt-5 w-full py-3.5 text-base shadow-glow",
            loading && "opacity-80"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Building your Marketing OS…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Marketing OS
            </>
          )}
        </button>
      </div>
    </div>
  );
}
