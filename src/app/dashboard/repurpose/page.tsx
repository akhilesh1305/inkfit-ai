"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ContentInput } from "@/components/repurpose/ContentInput";
import { OutputSelector } from "@/components/repurpose/OutputSelector";
import { ThinkingLoader } from "@/components/repurpose/ThinkingLoader";
import { RepurposeResultsPanel } from "@/components/repurpose/RepurposeResults";
import {
  generateAllRepurpose,
  REPURPOSE_OUTPUTS,
  type RepurposeOutputId,
  type RepurposeResults,
} from "@/lib/repurpose-content";

const DEFAULT_SELECTED: RepurposeOutputId[] = [
  "linkedin",
  "twitter",
  "instagram",
  "newsletter",
];

export default function RepurposePage() {
  const [source, setSource] = useState("");
  const [selected, setSelected] = useState<RepurposeOutputId[]>(DEFAULT_SELECTED);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RepurposeResults>({});

  const canGenerate = source.trim().length >= 50 && selected.length > 0;

  async function handleGenerate() {
    if (!canGenerate || loading) return;
    setLoading(true);
    setResults({});
    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, outputs: selected }),
      });
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      } else {
        const generated = await generateAllRepurpose(source, selected);
        setResults(generated);
      }
    } catch {
      const generated = await generateAllRepurpose(source, selected);
      setResults(generated);
    } finally {
      setLoading(false);
    }
  }

  function updateResult(id: RepurposeOutputId, content: string) {
    setResults((prev) => ({ ...prev, [id]: content }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Repurposer"
        description="Paste one piece of content and instantly transform it into LinkedIn posts, threads, emails, and more."
      />

      <ContentInput value={source} onChange={setSource} />

      <OutputSelector selected={selected} onChange={setSelected} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5 }}
      >
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate || loading}
          className="btn-primary w-full py-3.5 text-base sm:w-auto sm:px-10"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Content
            </>
          )}
        </button>
        {source.trim().length > 0 && source.trim().length < 50 && (
          <p className="mt-2 text-xs text-amber-400">
            Add at least 50 characters of source content to generate.
          </p>
        )}
        {selected.length === 0 && (
          <p className="mt-2 text-xs text-amber-400">Select at least one output format.</p>
        )}
      </motion.div>

      {loading && <ThinkingLoader />}

      {!loading && Object.keys(results).length > 0 && (
        <RepurposeResultsPanel
          results={results}
          source={source}
          onUpdateResult={updateResult}
        />
      )}

      {!loading && Object.keys(results).length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card border-dashed py-12 text-center"
        >
          <p className="text-sm text-content-muted">
            Generated content will appear here across {REPURPOSE_OUTPUTS.length} possible formats.
          </p>
        </motion.div>
      )}
    </div>
  );
}
