"use client";

import { motion } from "framer-motion";
import {
  Copy,
  Check,
  FileDown,
  FileText,
  Sparkles,
  Search,
  Hash,
  HelpCircle,
  AlignLeft,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SEOArticleOutput } from "@/lib/seo-content";
import {
  formatSEOArticleForCopy,
  formatSEOArticleForExport,
  recalculateSEOScore,
} from "@/lib/seo-content";
import { exportToPDF, exportToWord } from "@/lib/export";

interface EditorSectionProps {
  label: string;
  icon: typeof Search;
  accent: string;
  children: React.ReactNode;
  charCount?: number;
  maxChars?: number;
}

function EditorSection({
  label,
  icon: Icon,
  accent,
  children,
  charCount,
  maxChars,
}: EditorSectionProps) {
  return (
    <div>
      <div className={cn("mb-2 flex items-center justify-between border-l-2 pl-3", accent)}>
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
        {charCount !== undefined && maxChars !== undefined && (
          <span
            className={cn(
              "text-[10px]",
              charCount > maxChars ? "text-amber-400" : "text-content-subtle"
            )}
          >
            {charCount}/{maxChars}
          </span>
        )}
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
        {children}
      </div>
    </div>
  );
}

interface SEOArticleEditorProps {
  output: SEOArticleOutput | null;
  loading: boolean;
  topic: string;
  targetKeyword: string;
  audience?: string;
  onUpdate: (output: SEOArticleOutput) => void;
}

export function SEOArticleEditor({
  output,
  loading,
  topic,
  targetKeyword,
  audience,
  onUpdate,
}: SEOArticleEditorProps) {
  const [copied, setCopied] = useState(false);

  function update(next: SEOArticleOutput) {
    onUpdate(
      recalculateSEOScore(
        { topic, targetKeyword, audience },
        next
      )
    );
  }

  async function copyAll() {
    if (!output) return;
    await navigator.clipboard.writeText(formatSEOArticleForCopy(output));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function exportPdf() {
    if (!output) return;
    exportToPDF(output.seoTitle, formatSEOArticleForExport(output));
  }

  function exportWord() {
    if (!output) return;
    exportToWord(output.seoTitle, formatSEOArticleForExport(output));
  }

  if (loading) {
    return (
      <div className="card flex min-h-[600px] flex-col items-center justify-center">
        <div className="relative">
          <div className="h-14 w-14 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
          <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-emerald-400" />
        </div>
        <p className="mt-5 text-sm font-medium text-content-muted">
          Optimizing your SEO article...
        </p>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="card flex min-h-[600px] flex-col items-center justify-center border-dashed text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15">
          <Search className="h-7 w-7 text-emerald-400" />
        </div>
        <p className="mt-4 font-medium text-content">Your SEO content will appear here</p>
        <p className="mt-1 max-w-xs text-sm text-content-subtle">
          Enter a topic and target keyword, then generate a fully optimized article.
        </p>
      </div>
    );
  }

  const scoreColor =
    output.seoScore >= 85
      ? "text-emerald-400"
      : output.seoScore >= 70
        ? "text-brand-400"
        : "text-amber-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-ink-surface/80 shadow-card"
    >
      {/* Editor chrome */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <span className="ml-2 text-xs text-content-subtle">SEO Article Editor</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copyAll} className="btn-primary !px-3 !py-1.5 text-xs">
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy All
              </>
            )}
          </button>
          <button type="button" onClick={exportPdf} className="btn-secondary !px-3 !py-1.5 text-xs">
            <FileDown className="h-3.5 w-3.5" />
            Export PDF
          </button>
          <button type="button" onClick={exportWord} className="btn-secondary !px-3 !py-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" />
            Export Word
          </button>
        </div>
      </div>

      {/* SEO Score meter */}
      <div className="border-b border-white/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-content-subtle">
              SEO Score
            </p>
            <p className={cn("mt-1 text-4xl font-bold", scoreColor)}>{output.seoScore}</p>
            <p className="mt-1 text-xs text-content-subtle">
              {output.seoScore >= 85
                ? "Excellent — ready to publish"
                : output.seoScore >= 70
                  ? "Good — minor tweaks recommended"
                  : "Fair — review meta length and keywords"}
            </p>
          </div>
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${output.seoScore}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-brand-500 to-accent-blue"
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-content-subtle">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-h-[70vh] space-y-6 overflow-y-auto p-5 sm:p-6">
        <EditorSection
          label="SEO Title"
          icon={Search}
          accent="border-emerald-500/50"
          charCount={output.seoTitle.length}
          maxChars={60}
        >
          <input
            className="w-full bg-transparent text-[15px] font-semibold text-content outline-none"
            value={output.seoTitle}
            onChange={(e) => update({ ...output, seoTitle: e.target.value })}
          />
        </EditorSection>

        <EditorSection
          label="Meta Description"
          icon={AlignLeft}
          accent="border-brand-500/40"
          charCount={output.metaDescription.length}
          maxChars={160}
        >
          <textarea
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-content-muted outline-none"
            rows={3}
            value={output.metaDescription}
            onChange={(e) => update({ ...output, metaDescription: e.target.value })}
          />
        </EditorSection>

        <EditorSection label="Keywords" icon={Hash} accent="border-accent-blue/40">
          <div className="flex flex-wrap gap-2">
            {output.keywords.map((kw, i) => (
              <span
                key={kw}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-content-muted"
              >
                {kw}
              </span>
            ))}
          </div>
        </EditorSection>

        <EditorSection label="FAQ Section" icon={HelpCircle} accent="border-amber-500/40">
          <div className="space-y-4">
            {output.faq.map((item, i) => (
              <div key={i} className="border-b border-white/[0.06] pb-4 last:border-0 last:pb-0">
                <input
                  className="mb-2 w-full bg-transparent text-sm font-semibold text-content outline-none"
                  value={item.question}
                  onChange={(e) => {
                    const faq = [...output.faq];
                    faq[i] = { ...faq[i], question: e.target.value };
                    update({ ...output, faq });
                  }}
                />
                <textarea
                  className="w-full resize-none bg-transparent text-sm leading-relaxed text-content-muted outline-none"
                  rows={2}
                  value={item.answer}
                  onChange={(e) => {
                    const faq = [...output.faq];
                    faq[i] = { ...faq[i], answer: e.target.value };
                    update({ ...output, faq });
                  }}
                />
              </div>
            ))}
          </div>
        </EditorSection>

        <EditorSection label="Full Article" icon={FileText} accent="border-brand-500/40">
          <textarea
            className="w-full min-h-[320px] resize-y bg-transparent font-mono text-sm leading-relaxed text-content-muted outline-none"
            value={output.fullArticle}
            onChange={(e) => update({ ...output, fullArticle: e.target.value })}
          />
        </EditorSection>
      </div>
    </motion.div>
  );
}
