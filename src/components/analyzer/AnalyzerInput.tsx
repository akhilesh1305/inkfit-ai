"use client";

import { useState } from "react";
import { Loader2, ScanSearch, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTENT_TYPES, SAMPLE_CONTENT, type ContentType } from "@/lib/content-analyzer";

interface AnalyzerInputProps {
  onAnalyze: (data: {
    content: string;
    contentType: ContentType;
    keyword: string;
  }) => void;
  loading: boolean;
}

export function AnalyzerInput({ onAnalyze, loading }: AnalyzerInputProps) {
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<ContentType>("general");
  const [keyword, setKeyword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;
    onAnalyze({ content: content.trim(), contentType, keyword: keyword.trim() });
  }

  function loadSample() {
    setContent(SAMPLE_CONTENT[contentType]);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-cyan-500">
          <ScanSearch className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-content">Analyze content</h2>
          <p className="text-xs text-content-subtle">Paste generated or draft copy</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="label">Content type</label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setContentType(t.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                contentType === t.id
                  ? "border-brand-500/50 bg-brand-500/10 text-brand-300"
                  : "border-white/[0.06] text-content-muted hover:text-content"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="label mb-0">Content</label>
          <button
            type="button"
            onClick={loadSample}
            className="text-[11px] font-medium text-brand-400 hover:text-brand-300"
          >
            Load sample
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your blog post, LinkedIn caption, email, or social copy here…"
          rows={12}
          className="input-field w-full resize-none font-mono text-sm leading-relaxed"
          required
        />
        <p className="mt-1 text-right text-[10px] text-content-subtle">
          {content.split(/\s+/).filter(Boolean).length} words
        </p>
      </div>

      <div className="mb-5">
        <label className="label">Target keyword (optional)</label>
        <input
          className="input-field"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="e.g. content marketing strategy"
        />
      </div>

      <button
        type="submit"
        disabled={!content.trim() || loading}
        className="btn-primary w-full py-3 shadow-glow"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing…
          </>
        ) : (
          <>
            <Wand2 className="h-5 w-5" />
            Analyze content
          </>
        )}
      </button>
    </form>
  );
}
