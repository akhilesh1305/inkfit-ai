"use client";

import { motion } from "framer-motion";
import {
  Copy,
  Check,
  FileDown,
  FileText,
  Home,
  Users,
  Briefcase,
  Zap,
  HelpCircle,
  Mail,
  Globe,
} from "lucide-react";
import { useState } from "react";
import type { WebsiteContentOutput, WebsitePage } from "@/lib/website-content";
import {
  formatWebsiteForCopy,
  formatWebsiteForExport,
} from "@/lib/website-content";
import { exportToPDF, exportToWord } from "@/lib/export";
import { cn } from "@/lib/utils";

const PAGE_ICONS: Record<string, typeof Home> = {
  homepage: Home,
  "about-us": Users,
  services: Briefcase,
  features: Zap,
  faq: HelpCircle,
  contact: Mail,
};

const PAGE_ACCENTS: Record<string, string> = {
  homepage: "border-brand-500/50",
  "about-us": "border-accent-blue/50",
  services: "border-accent-cyan/50",
  features: "border-emerald-500/50",
  faq: "border-amber-500/50",
  contact: "border-pink-500/50",
};

interface WebsiteContentEditorProps {
  output: WebsiteContentOutput | null;
  loading: boolean;
  onUpdate: (output: WebsiteContentOutput) => void;
}

export function WebsiteContentEditor({
  output,
  loading,
  onUpdate,
}: WebsiteContentEditorProps) {
  const [activePageId, setActivePageId] = useState("homepage");
  const [copied, setCopied] = useState(false);
  const [copiedPage, setCopiedPage] = useState(false);

  if (loading) {
    return (
      <div className="card flex min-h-[640px] flex-col items-center justify-center">
        <div className="relative">
          <div className="h-14 w-14 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
          <Globe className="absolute inset-0 m-auto h-6 w-6 text-brand-400" />
        </div>
        <p className="mt-5 text-sm font-medium text-content-muted">
          Generating website copy...
        </p>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="card flex min-h-[640px] flex-col items-center justify-center border-dashed text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15">
          <Globe className="h-7 w-7 text-brand-400" />
        </div>
        <p className="mt-4 font-medium text-content">Your website content will appear here</p>
        <p className="mt-1 max-w-xs text-sm text-content-subtle">
          Enter your business details and generate a full site copy package.
        </p>
      </div>
    );
  }

  const data = output;
  const activePage =
    data.pages.find((p) => p.id === activePageId) ?? data.pages[0];

  function updatePageContent(pageId: string, content: string) {
    onUpdate({
      ...data,
      pages: data.pages.map((p) =>
        p.id === pageId ? { ...p, content } : p
      ),
    });
  }

  async function copyAll() {
    await navigator.clipboard.writeText(formatWebsiteForCopy(data));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyPage(page: WebsitePage) {
    await navigator.clipboard.writeText(page.content);
    setCopiedPage(true);
    setTimeout(() => setCopiedPage(false), 2000);
  }

  function exportPdf() {
    void exportToPDF(
      `${data.businessName} Website Content`,
      formatWebsiteForExport(data)
    );
  }

  function exportWord() {
    exportToWord(
      `${data.businessName} Website Content`,
      formatWebsiteForExport(data)
    );
  }

  const ActiveIcon = PAGE_ICONS[activePage.id] ?? FileText;

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
          <span className="ml-2 text-xs text-content-subtle">
            Website Content Editor · {data.pages.length} pages
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => copyPage(activePage)}
            className="btn-secondary !px-3 !py-1.5 text-xs"
          >
            {copiedPage ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Page
              </>
            )}
          </button>
          <button type="button" onClick={copyAll} className="btn-secondary !px-3 !py-1.5 text-xs">
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied All
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy All
              </>
            )}
          </button>
          <button type="button" onClick={exportPdf} className="btn-primary !px-3 !py-1.5 text-xs">
            <FileDown className="h-3.5 w-3.5" />
            Export PDF
          </button>
          <button type="button" onClick={exportWord} className="btn-secondary !px-3 !py-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" />
            Export Word
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Page nav */}
        <nav className="border-b border-white/10 bg-white/[0.02] lg:w-52 lg:border-b-0 lg:border-r">
          <p className="hidden px-4 pt-4 text-[10px] font-semibold uppercase tracking-wider text-content-subtle lg:block">
            Pages
          </p>
          <div className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible lg:p-3">
            {data.pages.map((page) => {
              const Icon = PAGE_ICONS[page.id] ?? FileText;
              const active = page.id === activePage.id;
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => setActivePageId(page.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition lg:w-full",
                    active
                      ? "bg-brand-500/15 font-medium text-brand-300"
                      : "text-content-muted hover:bg-white/[0.04] hover:text-content"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{page.title}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Editor area */}
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "border-b border-white/10 px-5 py-4",
              PAGE_ACCENTS[activePage.id] ?? "border-brand-500/40",
              "border-l-2"
            )}
          >
            <div className="flex items-center gap-2">
              <ActiveIcon className="h-4 w-4 text-content-subtle" />
              <h3 className="font-semibold text-content">{activePage.title}</h3>
            </div>
            <p className="mt-0.5 text-xs text-content-subtle">
              Edit content below — changes save automatically
            </p>
          </div>
          <div className="p-5">
            <textarea
              className="min-h-[480px] w-full resize-y rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 font-mono text-sm leading-relaxed text-content-muted outline-none transition focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20"
              value={activePage.content}
              onChange={(e) => updatePageContent(activePage.id, e.target.value)}
            />
            <p className="mt-2 text-right text-[10px] text-content-subtle">
              {activePage.content.length.toLocaleString()} characters
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
