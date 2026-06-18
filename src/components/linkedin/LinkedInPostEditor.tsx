"use client";

import { motion } from "framer-motion";
import {
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { LinkedInPostOutput } from "@/lib/linkedin-content";
import { formatLinkedInPost } from "@/lib/linkedin-content";

interface ScoreBadgeProps {
  label: string;
  score: number;
  icon: typeof Zap;
}

function ScoreBadge({ label, score, icon: Icon }: ScoreBadgeProps) {
  const color =
    score >= 85 ? "text-emerald-400" : score >= 70 ? "text-brand-400" : "text-amber-400";

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-medium text-content-subtle">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className={cn("mt-1 text-2xl font-bold", color)}>{score}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-blue"
        />
      </div>
    </div>
  );
}

interface EditorSectionProps {
  label: string;
  children: string;
  accent?: string;
}

function EditorSection({ label, children, accent = "border-brand-500/40" }: EditorSectionProps) {
  return (
    <div className="group">
      <div className={cn("mb-2 flex items-center gap-2 border-l-2 pl-3", accent)}>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
          {label}
        </span>
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
        <p className="whitespace-pre-wrap text-[15px] leading-[1.75] text-content-muted">
          {children}
        </p>
      </div>
    </div>
  );
}

interface LinkedInPostEditorProps {
  output: LinkedInPostOutput | null;
  loading: boolean;
  onRegenerate: () => void;
}

export function LinkedInPostEditor({ output, loading, onRegenerate }: LinkedInPostEditorProps) {
  const [copied, setCopied] = useState(false);

  async function copyAll() {
    if (!output) return;
    await navigator.clipboard.writeText(formatLinkedInPost(output));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="card flex min-h-[520px] flex-col items-center justify-center">
        <div className="relative">
          <div className="h-14 w-14 animate-spin rounded-full border-2 border-[#0A66C2]/30 border-t-[#0A66C2]" />
          <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-brand-400" />
        </div>
        <p className="mt-5 text-sm font-medium text-content-muted">Crafting your LinkedIn post...</p>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="card flex min-h-[520px] flex-col items-center justify-center border-dashed text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A66C2]/15">
          <Sparkles className="h-7 w-7 text-[#0A66C2]" />
        </div>
        <p className="mt-4 font-medium text-content">Your post will appear here</p>
        <p className="mt-1 max-w-xs text-sm text-content-subtle">
          Fill in the topic, audience, and content type — then hit Generate.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-ink-surface/80 shadow-card"
    >
      {/* Editor chrome */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <span className="ml-2 text-xs text-content-subtle">LinkedIn Post Editor</span>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onRegenerate} className="btn-secondary !px-3 !py-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Regenerate
          </button>
          <button type="button" onClick={copyAll} className="btn-primary !px-3 !py-1.5 text-xs">
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3 border-b border-white/10 p-5">
        <ScoreBadge label="Hook Score" score={output.hookScore} icon={Zap} />
        <ScoreBadge label="Engagement Score" score={output.engagementScore} icon={TrendingUp} />
      </div>

      {/* Content sections */}
      <div className="space-y-6 p-5 sm:p-6">
        <EditorSection label="Hook" accent="border-[#0A66C2]">
          {output.hook}
        </EditorSection>
        <EditorSection label="Main Content" accent="border-brand-500/40">
          {output.mainContent}
        </EditorSection>
        <EditorSection label="Call to Action" accent="border-emerald-500/40">
          {output.cta}
        </EditorSection>
      </div>

      {/* Preview footer */}
      <div className="border-t border-white/10 bg-white/[0.02] px-5 py-3">
        <p className="text-center text-[11px] text-content-subtle">
          {formatLinkedInPost(output).length.toLocaleString()} characters · optimized for LinkedIn feed
        </p>
      </div>
    </motion.div>
  );
}
