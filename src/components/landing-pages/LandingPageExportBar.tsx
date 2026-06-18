"use client";

import { useState } from "react";
import { Copy, Check, FileCode, FileText, Download } from "lucide-react";
import type { LandingPageOutput } from "@/lib/landing-page";
import {
  downloadFile,
  landingPageToHtml,
  landingPageToMarkdown,
  landingPageToPlain,
  slugify,
} from "@/lib/landing-page";

interface LandingPageExportBarProps {
  output: LandingPageOutput;
}

export function LandingPageExportBar({ output }: LandingPageExportBarProps) {
  const [copied, setCopied] = useState(false);

  async function copyContent() {
    await navigator.clipboard.writeText(landingPageToPlain(output));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function exportHtml() {
    downloadFile(
      landingPageToHtml(output),
      `${slugify(output.businessName)}.html`,
      "text/html"
    );
  }

  function exportMarkdown() {
    downloadFile(
      landingPageToMarkdown(output),
      `${slugify(output.businessName)}.md`,
      "text/markdown"
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2">
      <span className="px-2 text-xs font-medium text-content-muted">Export</span>
      <button type="button" className="btn-ghost !rounded-lg !px-3 !py-1.5 text-xs" onClick={copyContent}>
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        Copy content
      </button>
      <button type="button" className="btn-ghost !rounded-lg !px-3 !py-1.5 text-xs" onClick={exportMarkdown}>
        <FileText className="h-3.5 w-3.5" />
        Markdown
      </button>
      <button type="button" className="btn-primary !rounded-lg !px-3 !py-1.5 text-xs" onClick={exportHtml}>
        <FileCode className="h-3.5 w-3.5" />
        Download HTML
      </button>
      <span className="ml-auto hidden text-[10px] text-content-subtle sm:inline">
        <Download className="mr-1 inline h-3 w-3" />
        Ready to deploy
      </span>
    </div>
  );
}
