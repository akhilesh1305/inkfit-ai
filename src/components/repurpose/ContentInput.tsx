"use client";

import { motion } from "framer-motion";

interface ContentInputProps {
  value: string;
  onChange: (value: string) => void;
  maxChars?: number;
}

export function ContentInput({ value, onChange, maxChars = 15000 }: ContentInputProps) {
  const count = value.length;
  const pct = Math.min((count / maxChars) * 100, 100);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <h2 className="section-title">Input Content</h2>
      <p className="mt-1 text-sm text-content-muted">
        Paste your blog, transcript, article, or any raw text to repurpose.
      </p>
      <textarea
        className="input-field mt-4 min-h-[220px] resize-y"
        placeholder="Paste your blog, transcript, article, or content here..."
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
      />
      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-blue transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-xs text-content-subtle">
          {count.toLocaleString()} / {maxChars.toLocaleString()} characters
        </span>
      </div>
    </motion.section>
  );
}
