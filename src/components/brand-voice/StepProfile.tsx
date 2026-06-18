"use client";

import { motion } from "framer-motion";
import { Sparkles, Mic2, BookOpen, PenLine, Users, Check, Loader2 } from "lucide-react";
import type { GeneratedBrandProfile } from "@/lib/brand-voice";

const PROFILE_SECTIONS = [
  { key: "tone" as const, label: "Tone", icon: Mic2 },
  { key: "vocabulary" as const, label: "Vocabulary", icon: BookOpen },
  { key: "writingPatterns" as const, label: "Writing Patterns", icon: PenLine },
  { key: "audienceStyle" as const, label: "Audience Style", icon: Users },
];

interface StepProfileProps {
  profile: GeneratedBrandProfile | null;
  generating: boolean;
  saved: boolean;
  onGenerate: () => void;
  onSave: () => void;
}

export function StepProfile({ profile, generating, saved, onGenerate, onSave }: StepProfileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="section-title">Generate Brand Profile</h2>
            <p className="mt-1 text-sm text-content-muted">
              InkFit AI analyzes your inputs and creates a reusable voice profile.
            </p>
          </div>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="btn-primary"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Profile
              </>
            )}
          </button>
        </div>
      </div>

      {generating && (
        <div className="card flex flex-col items-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
          <p className="mt-4 text-sm text-content-muted">Training brand voice model...</p>
        </div>
      )}

      {profile && !generating && (
        <div className="grid gap-4 sm:grid-cols-2">
          {PROFILE_SECTIONS.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card card-hover"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="icon-gradient h-8 w-8">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-content">{section.label}</h3>
                </div>
                <p className="text-sm leading-relaxed text-content-muted">{profile[section.key]}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {profile && !generating && (
        <button type="button" onClick={onSave} className="btn-primary w-full py-3 sm:w-auto">
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              Profile Saved Locally
            </>
          ) : (
            "Save Brand Profile"
          )}
        </button>
      )}
    </motion.div>
  );
}
