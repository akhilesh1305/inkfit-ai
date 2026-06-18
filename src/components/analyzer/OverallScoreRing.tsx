"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { scoreBarColor, scoreColor } from "@/lib/content-analyzer";

interface OverallScoreRingProps {
  score: number;
  grade: string;
  gradeColor: string;
}

export function OverallScoreRing({ score, grade, gradeColor }: OverallScoreRingProps) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="h-44 w-44 -rotate-90" viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-white/[0.06]"
        />
        <motion.circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={cn("text-4xl font-bold", scoreColor(score))}
        >
          {score}
        </motion.span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">
          Overall
        </span>
        <span className={cn("mt-1 text-sm font-semibold", gradeColor)}>{grade}</span>
      </div>
    </div>
  );
}
