"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, RefreshCw, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  REPURPOSE_OUTPUTS,
  generateMockRepurpose,
  type RepurposeOutputId,
  type RepurposeResults,
} from "@/lib/repurpose-content";

interface ResultCardProps {
  outputId: RepurposeOutputId;
  content: string;
  source: string;
  onRegenerate: (id: RepurposeOutputId, content: string) => void;
}

export function ResultCard({ outputId, content, source, onRegenerate }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const option = REPURPOSE_OUTPUTS.find((o) => o.id === outputId)!;
  const Icon = option.icon;

  async function copy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inkfit-${outputId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function regenerate() {
    setRegenerating(true);
    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, outputs: [outputId] }),
      });
      const data = await res.json();
      if (data.results?.[outputId]) {
        onRegenerate(outputId, data.results[outputId]);
      } else {
        onRegenerate(outputId, generateMockRepurpose(source, outputId));
      }
    } catch {
      onRegenerate(outputId, generateMockRepurpose(source, outputId));
    }
    setRegenerating(false);
  }

  return (
    <div className="card flex flex-col">
      <div className="mb-4 flex items-center gap-3">
        <div className="icon-gradient h-9 w-9">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-content">{option.label}</h3>
          <p className="text-xs text-content-subtle">AI generated</p>
        </div>
      </div>
      <div className="output-panel min-h-[280px] flex-1 text-sm">
        {regenerating ? "Regenerating..." : content}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={copy} className="btn-secondary flex-1 py-2 text-xs sm:flex-none">
          {copied ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
        </button>
        <button type="button" onClick={regenerate} disabled={regenerating} className="btn-secondary flex-1 py-2 text-xs sm:flex-none">
          <RefreshCw className={cn("h-3.5 w-3.5", regenerating && "animate-spin")} />
          Regenerate
        </button>
        <button type="button" onClick={download} className="btn-secondary flex-1 py-2 text-xs sm:flex-none">
          <Download className="h-3.5 w-3.5" />
          Download
        </button>
      </div>
    </div>
  );
}

interface RepurposeResultsPanelProps {
  results: RepurposeResults;
  source: string;
  onUpdateResult: (id: RepurposeOutputId, content: string) => void;
}

export function RepurposeResultsPanel({ results, source, onUpdateResult }: RepurposeResultsPanelProps) {
  const ids = Object.keys(results) as RepurposeOutputId[];
  const [activeTab, setActiveTab] = useState<RepurposeOutputId | null>(ids[0] ?? null);

  if (ids.length === 0) return null;

  const current = activeTab && results[activeTab] ? activeTab : ids[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div>
        <h2 className="section-title">Results</h2>
        <p className="mt-1 text-sm text-content-muted">
          {ids.length} format{ids.length !== 1 ? "s" : ""} generated — copy, regenerate, or download each.
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-white/10 pb-px">
        {ids.map((id) => {
          const opt = REPURPOSE_OUTPUTS.find((o) => o.id === id)!;
          const TabIcon = opt.icon;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition",
                current === id ? "tab-active" : "tab-inactive"
              )}
            >
              <TabIcon className="h-4 w-4" />
              {opt.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {current && results[current] && (
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <ResultCard
              outputId={current}
              content={results[current]!}
              source={source}
              onRegenerate={onUpdateResult}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
