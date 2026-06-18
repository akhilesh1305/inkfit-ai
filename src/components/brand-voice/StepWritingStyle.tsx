"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WRITING_STYLES, type BrandVoiceFormData, type WritingStyleId } from "@/lib/brand-voice";

interface StepWritingStyleProps {
  data: BrandVoiceFormData;
  onChange: (style: WritingStyleId) => void;
}

export function StepWritingStyle({ data, onChange }: StepWritingStyleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card"
    >
      <div className="mb-5">
        <h2 className="section-title">Writing Style</h2>
        <p className="mt-1 text-sm text-content-muted">
          Choose the voice that best matches how your brand communicates.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {WRITING_STYLES.map((style) => {
          const selected = data.writingStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id)}
              className={cn(
                "card card-hover relative p-4 text-left transition-all",
                selected && "border-brand-500/40 shadow-glow"
              )}
            >
              {selected && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600">
                  <Check className="h-3 w-3 text-white" />
                </span>
              )}
              <p className="font-semibold text-content">{style.label}</p>
              <p className="mt-1 text-xs text-content-muted">{style.description}</p>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
