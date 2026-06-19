"use client";

import { motion } from "framer-motion";
import {
  FileDown,
  ClipboardList,
  Target,
  Filter,
  Share2,
  Search,
  Lightbulb,
  FileText,
  Briefcase,
} from "lucide-react";
import type { MarketingStrategyOutput } from "@/lib/marketing-strategy";
import { formatStrategyForExport } from "@/lib/marketing-strategy";
import { exportToPDF } from "@/lib/export";
import { cn } from "@/lib/utils";

const SECTION_ICONS: Record<string, typeof FileText> = {
  "marketing-plan": ClipboardList,
  "content-strategy": FileText,
  "funnel-strategy": Filter,
  "social-media-plan": Share2,
  "seo-plan": Search,
  "lead-generation": Lightbulb,
};

const SECTION_ACCENTS: Record<string, string> = {
  "marketing-plan": "border-brand-500/50",
  "content-strategy": "border-accent-blue/50",
  "funnel-strategy": "border-accent-cyan/50",
  "social-media-plan": "border-emerald-500/50",
  "seo-plan": "border-amber-500/50",
  "lead-generation": "border-pink-500/50",
};

interface StrategyReportProps {
  output: MarketingStrategyOutput | null;
  loading: boolean;
  inputs?: {
    industry: string;
    businessType: string;
    targetAudience: string;
    goals: string;
    monthlyBudget: string;
  };
}

function renderMarkdownish(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h4 key={i} className="mb-2 mt-4 text-sm font-bold text-content first:mt-0">
          {line.replace(/^##\s*/, "")}
        </h4>
      );
    }
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <p key={i} className="mb-1 text-sm font-semibold text-content">
          {line.replace(/\*\*/g, "")}
        </p>
      );
    }
    if (line.startsWith("|")) {
      return (
        <p key={i} className="font-mono text-xs text-content-muted">
          {line}
        </p>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={i} className="ml-4 list-disc text-sm leading-relaxed text-content-muted">
          {line.replace(/^- /, "").replace(/\*\*/g, "")}
        </li>
      );
    }
    if (/^\d+\./.test(line)) {
      return (
        <li key={i} className="ml-4 list-decimal text-sm leading-relaxed text-content-muted">
          {line.replace(/^\d+\.\s*/, "").replace(/\*\*/g, "")}
        </li>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return (
      <p key={i} className="text-sm leading-relaxed text-content-muted">
        {line.replace(/\*\*/g, "")}
      </p>
    );
  });
}

export function StrategyReport({ output, loading, inputs }: StrategyReportProps) {
  if (loading) {
    return (
      <div className="card flex min-h-[640px] flex-col items-center justify-center">
        <div className="relative">
          <div className="h-14 w-14 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
          <Briefcase className="absolute inset-0 m-auto h-6 w-6 text-brand-400" />
        </div>
        <p className="mt-5 text-sm font-medium text-content-muted">
          Building your marketing strategy...
        </p>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="card flex min-h-[640px] flex-col items-center justify-center border-dashed text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15">
          <Briefcase className="h-7 w-7 text-brand-400" />
        </div>
        <p className="mt-4 font-medium text-content">Your strategy report will appear here</p>
        <p className="mt-1 max-w-sm text-sm text-content-subtle">
          Complete the brief on the left and generate a full consulting-style marketing plan.
        </p>
      </div>
    );
  }

  function handleExport() {
    if (!output) return;
    void exportToPDF(output.title, formatStrategyForExport(output));
  }

  const reportDate = new Date(output.generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-ink-surface/80 shadow-card"
    >
      {/* Report header */}
      <div className="border-b border-white/10 bg-gradient-to-r from-brand-600/10 via-accent-blue/5 to-transparent px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-400">
              Confidential Strategy Report
            </p>
            <h2 className="mt-1 text-xl font-bold text-content">{output.title}</h2>
            <p className="mt-1 text-xs text-content-subtle">Prepared {reportDate}</p>
          </div>
          <button type="button" onClick={handleExport} className="btn-primary !px-4 !py-2 text-xs">
            <FileDown className="h-3.5 w-3.5" />
            Export PDF
          </button>
        </div>

        {inputs && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Industry", value: inputs.industry },
              { label: "Business Type", value: inputs.businessType },
              { label: "Audience", value: inputs.targetAudience },
              { label: "Goals", value: inputs.goals },
              { label: "Budget", value: inputs.monthlyBudget },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
                  {item.label}
                </p>
                <p className="mt-0.5 truncate text-xs text-content-muted">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Executive summary */}
      <div className="border-b border-white/10 bg-white/[0.02] px-6 py-5">
        <div className="flex items-center gap-2 border-l-2 border-brand-500 pl-3">
          <Target className="h-4 w-4 text-brand-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
            Executive Summary
          </span>
        </div>
        <p className="mt-3 text-[15px] leading-[1.8] text-content-muted">
          {output.executiveSummary}
        </p>
      </div>

      {/* Table of contents */}
      <div className="border-b border-white/10 px-6 py-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
          Contents
        </p>
        <div className="flex flex-wrap gap-2">
          {output.sections.map((s, i) => (
            <a
              key={s.id}
              href={`#section-${s.id}`}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-content-muted transition hover:border-brand-500/30 hover:text-brand-300"
            >
              {i + 1}. {s.title}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="max-h-[70vh] space-y-0 overflow-y-auto">
        {output.sections.map((section, index) => {
          const Icon = SECTION_ICONS[section.id] ?? FileText;
          const accent = SECTION_ACCENTS[section.id] ?? "border-brand-500/40";

          return (
            <section
              key={section.id}
              id={`section-${section.id}`}
              className={cn(
                "border-b border-white/[0.06] px-6 py-6 last:border-0",
                index % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"
              )}
            >
              <div className={cn("mb-4 flex items-center gap-3 border-l-2 pl-3", accent)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05]">
                  <Icon className="h-4 w-4 text-content-subtle" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-content-subtle">
                    Section {index + 1}
                  </span>
                  <h3 className="text-base font-bold text-content">{section.title}</h3>
                </div>
              </div>
              <div className="space-y-1">{renderMarkdownish(section.content)}</div>
            </section>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 bg-white/[0.02] px-6 py-3 text-center">
        <p className="text-[10px] text-content-subtle">
          Generated by InkFit AI Marketing Strategist · {output.sections.length} sections
        </p>
      </div>
    </motion.div>
  );
}
