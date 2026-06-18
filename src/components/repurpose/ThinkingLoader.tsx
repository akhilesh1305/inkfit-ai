"use client";

import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";

interface ThinkingLoaderProps {
  label?: string;
}

export function ThinkingLoader({ label = "InkFit AI is repurposing your content..." }: ThinkingLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card flex flex-col items-center justify-center py-16"
    >
      <div className="relative">
        <div className="h-14 w-14 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
        <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-brand-400" />
      </div>
      <p className="mt-5 text-sm font-medium text-content-muted">{label}</p>
      <div className="mt-4 flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-brand-500"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.9, 1.1, 0.9] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15 }}
          />
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {["Analyzing tone", "Adapting formats", "Optimizing hooks"].map((step, i) => (
          <motion.span
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.3 }}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-content-subtle"
          >
            <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
            {step}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
