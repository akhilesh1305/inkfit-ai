"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Youtube,
  Mic,
  Smartphone,
  Film,
  Zap,
  Megaphone,
  Copy,
  Check,
  Clock,
  Hash,
  Sparkles,
} from "lucide-react";
import type { VideoScriptId, VideoStudioOutput } from "@/lib/video-studio";
import { formatDuration, SCRIPT_META } from "@/lib/video-studio";
import { cn } from "@/lib/utils";

const SCRIPT_ICONS: Record<VideoScriptId, typeof Youtube> = {
  youtube: Youtube,
  podcast: Mic,
  shorts: Smartphone,
  reel: Film,
  hook: Zap,
  cta: Megaphone,
};

const FIT_STYLES = {
  excellent: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  good: "bg-brand-500/15 text-brand-300 border-brand-500/25",
  fair: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

interface VideoResultsPanelProps {
  output: VideoStudioOutput | null;
  loading: boolean;
}

export function VideoResultsPanel({ output, loading }: VideoResultsPanelProps) {
  const [tab, setTab] = useState<VideoScriptId>("youtube");
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="card flex min-h-[400px] flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
        <p className="text-sm text-content-muted">Writing scripts for every platform…</p>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="card flex min-h-[400px] items-center justify-center border-dashed">
        <p className="max-w-sm text-center text-sm text-content-subtle">
          Paste your source content and generate YouTube, podcast, Shorts, and Reel scripts.
        </p>
      </div>
    );
  }

  const active = output.scripts.find((s) => s.id === tab) ?? output.scripts[0];

  async function copyActive() {
    await navigator.clipboard.writeText(active.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const totalWords = output.scripts.reduce((s, x) => s + x.wordCount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Stats bar */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Source words", value: output.sourceWordCount, icon: Hash },
          {
            label: "Script words",
            value: totalWords,
            icon: Hash,
          },
          {
            label: "YouTube duration",
            value: formatDuration(
              output.scripts.find((s) => s.id === "youtube")?.estimatedSeconds ?? 0
            ),
            icon: Clock,
          },
          {
            label: "Shorts duration",
            value: formatDuration(
              output.scripts.find((s) => s.id === "shorts")?.estimatedSeconds ?? 0
            ),
            icon: Clock,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card flex items-center gap-3 border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent py-3"
          >
            <stat.icon className="h-4 w-4 text-brand-400" />
            <div>
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-content-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {output.live && (
        <div className="flex items-center gap-2 rounded-lg border border-brand-500/20 bg-brand-500/5 px-3 py-2 text-xs text-brand-200/90">
          <Sparkles className="h-3.5 w-3.5 text-brand-400" />
          AI-enhanced scripts grounded in your source material
        </div>
      )}

      {/* Script viewer */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-surface/60 shadow-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-3">
          {output.scripts.map((script) => {
            const Icon = SCRIPT_ICONS[script.id];
            return (
              <button
                key={script.id}
                type="button"
                onClick={() => setTab(script.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition sm:text-xs",
                  tab === script.id
                    ? "bg-brand-600 text-white"
                    : "text-content-muted hover:bg-white/[0.05] hover:text-white"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {SCRIPT_META[script.id].label.replace(" Script", "")}
              </button>
            );
          })}
          <button
            type="button"
            onClick={copyActive}
            className="btn-ghost ml-auto !px-2 !py-1.5 text-xs"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy
          </button>
        </div>

        <div className="border-b border-white/[0.06] bg-white/[0.02] px-4 py-2 flex flex-wrap gap-4 text-[10px] text-content-muted">
          <span>
            <strong className="text-white">{active.wordCount}</strong> words
          </span>
          <span>
            Est. <strong className="text-white">{formatDuration(active.estimatedSeconds)}</strong>
          </span>
          <span>{SCRIPT_META[active.id].description}</span>
        </div>

        <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap p-5 font-mono text-xs leading-relaxed text-content-muted">
          {active.content}
        </pre>
      </div>

      {/* Platform recommendations */}
      <div className="card">
        <h3 className="mb-4 font-semibold text-white">Platform recommendations</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {output.platformRecommendations.map((rec) => (
            <div
              key={rec.platform}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-white">{rec.platform}</p>
                <span
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase",
                    FIT_STYLES[rec.fit]
                  )}
                >
                  {rec.fit}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-content-muted">{rec.reason}</p>
              <p className="mt-2 text-[10px] text-brand-300/90">
                Suggested: {rec.suggestedFormat}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
