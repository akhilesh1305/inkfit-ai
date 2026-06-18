"use client";

import { Lightbulb, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisSuggestion } from "@/lib/content-analyzer";

interface SuggestionsPanelProps {
  suggestions: AnalysisSuggestion[];
}

const PRIORITY_META = {
  high: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  medium: { icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  low: { icon: Info, color: "text-brand-300", bg: "bg-brand-500/10 border-brand-500/20" },
};

export function SuggestionsPanel({ suggestions }: SuggestionsPanelProps) {
  if (suggestions.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0e] p-6 text-center">
        <p className="text-sm text-content-subtle">No suggestions — content looks strong!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0e] p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-content">
        <Lightbulb className="h-4 w-4 text-amber-400" />
        Suggestions
      </h3>
      <div className="space-y-2">
        {suggestions.map((s, i) => {
          const meta = PRIORITY_META[s.priority];
          const Icon = meta.icon;
          return (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-4 py-3",
                meta.bg
              )}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", meta.color)} />
              <div className="min-w-0">
                <p className="text-sm leading-relaxed text-content-muted">{s.text}</p>
                <span className="mt-1 inline-block text-[10px] font-medium uppercase tracking-wider text-content-subtle">
                  {s.priority} · {s.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
