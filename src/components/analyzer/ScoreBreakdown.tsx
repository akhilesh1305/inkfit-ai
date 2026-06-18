"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  SCORE_DIMENSIONS,
  scoreBarColor,
  scoreColor,
  type AnalyzerScores,
} from "@/lib/content-analyzer";

interface ScoreBreakdownProps {
  scores: AnalyzerScores;
}

export function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
      {SCORE_DIMENSIONS.map((dim, i) => {
        const value = scores[dim.key];
        return (
          <motion.div
            key={dim.key}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-white/[0.06] bg-[#0c0c0e] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-lg leading-none">{dim.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-content">{dim.label}</p>
                  <p className="mt-0.5 text-[11px] text-content-subtle">{dim.description}</p>
                </div>
              </div>
              <span className={cn("text-xl font-bold tabular-nums", scoreColor(value))}>
                {value}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.9, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={cn("h-full rounded-full bg-gradient-to-r", scoreBarColor(value))}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
