"use client";

import { motion } from "framer-motion";
import {
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Calendar,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import type { PersonalBrandOutput } from "@/lib/personal-brand";
import { cn } from "@/lib/utils";

const TYPE_STYLES = {
  post: "bg-brand-500/15 text-brand-300 border-brand-500/25",
  story: "bg-accent-cyan/15 text-cyan-300 border-accent-cyan/25",
  engage: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  repurpose: "bg-amber-500/15 text-amber-300 border-amber-500/25",
};

interface BrandContentPanelProps {
  output: PersonalBrandOutput | null;
  loading: boolean;
}

function CopyList({ items, title }: { items: string[]; title: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(items.map((item, i) => `${i + 1}. ${item}`).join("\n\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-content">{title}</h3>
        <button type="button" onClick={copy} className="btn-ghost !rounded-lg !px-2 !py-1 text-xs">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-content-muted"
          >
            <span className="mr-2 font-semibold text-brand-400">{i + 1}.</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BrandContentPanel({ output, loading }: BrandContentPanelProps) {
  if (loading) {
    return (
      <div className="card flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
      </div>
    );
  }

  if (!output) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Weekly recommendations */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-surface/60 shadow-card">
        <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
          <Calendar className="h-4 w-4 text-brand-400" />
          <h3 className="font-semibold text-content">Weekly Recommendations</h3>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {output.weeklyRecommendations.map((rec, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-4 px-6 py-4 transition hover:bg-white/[0.02]"
            >
              <span className="w-24 shrink-0 text-sm font-semibold text-content">{rec.day}</span>
              <span
                className={cn(
                  "shrink-0 rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase",
                  TYPE_STYLES[rec.type]
                )}
              >
                {rec.type}
              </span>
              <p className="min-w-0 flex-1 text-sm text-content-muted">{rec.action}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CopyList items={output.contentIdeas} title="Content Ideas" />
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-accent-blue" />
            <h3 className="font-semibold text-content">Post Suggestions</h3>
          </div>
          <div className="space-y-3">
            {output.postSuggestions.map((post, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-content-muted">
                  {post}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CopyList items={output.storyTopics} title="Story Topics" />
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="font-semibold text-content">Industry Trends</h3>
          </div>
          <ul className="space-y-2">
            {output.industryTrends.map((trend, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-content-muted"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                {trend}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
