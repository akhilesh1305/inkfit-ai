"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanLine,
  Zap,
  Clock,
  FileText,
  AlignLeft,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AnalyzerInput } from "@/components/analyzer/AnalyzerInput";
import { OverallScoreRing } from "@/components/analyzer/OverallScoreRing";
import { ScoreBreakdown } from "@/components/analyzer/ScoreBreakdown";
import { SuggestionsPanel } from "@/components/analyzer/SuggestionsPanel";
import { RecommendationsPanel } from "@/components/analyzer/RecommendationsPanel";
import type { ContentAnalysisResult, ContentType } from "@/lib/content-analyzer";

export function ContentAnalyzerView() {
  const [analysis, setAnalysis] = useState<ContentAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(data: {
    content: string;
    contentType: ContentType;
    keyword: string;
  }) {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/analyzer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(result.error ?? "Analysis failed");
      return;
    }
    setAnalysis(result.analysis);
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <ScanLine className="h-7 w-7 text-brand-400" />
            Content Analyzer
          </span>
        }
        description="Score readability, SEO, engagement, brand voice, and virality — with actionable improvements."
      >
        {analysis?.live && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
            <Zap className="h-3.5 w-3.5" />
            AI-enhanced
          </span>
        )}
      </PageHeader>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[400px_1fr]">
        <AnalyzerInput onAnalyze={handleAnalyze} loading={loading} />

        <div>
          <AnimatePresence mode="wait">
            {!analysis && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[480px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-center"
              >
                <ScanLine className="h-14 w-14 text-content-subtle" />
                <p className="mt-4 text-lg font-medium text-content">Ready to analyze</p>
                <p className="mt-1 max-w-sm text-sm text-content-subtle">
                  Paste content from Workspace, LinkedIn Studio, or any generator to get instant scores and recommendations.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[480px] flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0c0c0e]"
              >
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-400" />
                  <ScanLine className="absolute inset-0 m-auto h-7 w-7 text-brand-400" />
                </div>
                <p className="mt-5 text-sm font-medium text-content-muted">Scoring your content…</p>
              </motion.div>
            )}

            {analysis && !loading && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#12121a] to-[#0c0c0e] p-6">
                    <OverallScoreRing
                      score={analysis.overall}
                      grade={analysis.grade}
                      gradeColor={analysis.gradeColor}
                    />
                    <div className="mt-4 grid w-full grid-cols-3 gap-2 border-t border-white/[0.06] pt-4">
                      <Stat icon={FileText} label="Words" value={String(analysis.wordCount)} />
                      <Stat icon={AlignLeft} label="Sentences" value={String(analysis.sentenceCount)} />
                      <Stat icon={Clock} label="Read time" value={`${analysis.readingTimeMin}m`} />
                    </div>
                  </div>
                  <ScoreBreakdown scores={analysis.scores} />
                </div>

                <SuggestionsPanel suggestions={analysis.suggestions} />
                <RecommendationsPanel recommendations={analysis.recommendations} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <div className="text-center">
      <Icon className="mx-auto h-3.5 w-3.5 text-content-subtle" />
      <p className="mt-1 text-sm font-semibold text-content">{value}</p>
      <p className="text-[10px] text-content-subtle">{label}</p>
    </div>
  );
}
