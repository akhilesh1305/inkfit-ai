"use client";

import { useState } from "react";
import { Loader2, Copy, Check, FileText, FileDown } from "lucide-react";
import { exportToPDF, exportToWord } from "@/lib/export";
import { PageHeader } from "@/components/PageHeader";

export default function BlogPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium (800 words)");
  const [keywords, setKeywords] = useState("");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, length, keywords, audience }),
      });
      const data = await res.json();
      setResult(data.content ?? data.error ?? "Generation failed.");
    } catch {
      setResult("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const title = result.match(/^#\s+(.+)/m)?.[1] ?? topic;

  return (
    <div>
      <PageHeader
        title="AI Blog Writer"
        description="SEO-friendly blog posts with structured headings. Uses your Brand Kit for consistency."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleGenerate} className="card space-y-4">
          <div>
            <label className="label" htmlFor="topic">Topic *</label>
            <input id="topic" className="input-field" placeholder="e.g. AI content marketing for SaaS" value={topic} onChange={(e) => setTopic(e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="tone">Tone</label>
              <select id="tone" className="input-field" value={tone} onChange={(e) => setTone(e.target.value)}>
                <option>Professional</option>
                <option>Casual</option>
                <option>Marketing</option>
                <option>Authoritative</option>
                <option>Inspirational</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="length">Length</label>
              <select id="length" className="input-field" value={length} onChange={(e) => setLength(e.target.value)}>
                <option>Short (400 words)</option>
                <option>Medium (800 words)</option>
                <option>Long (1500 words)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="audience">Target Audience</label>
            <input id="audience" className="input-field" placeholder="Uses Brand Kit if empty" value={audience} onChange={(e) => setAudience(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="keywords">SEO Keywords</label>
            <input id="keywords" className="input-field" placeholder="content marketing, AI tools" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><FileText className="h-4 w-4" /> Generate Blog Post</>}
          </button>
        </form>

        <div className="card flex flex-col">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-heading">Generated Content</h2>
            {result && (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={async () => { await navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="btn-secondary py-1.5 text-xs">
                  {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                </button>
                <button type="button" onClick={() => exportToWord(title, result)} className="btn-secondary py-1.5 text-xs">
                  <FileDown className="h-3 w-3" /> Word
                </button>
                <button type="button" onClick={() => exportToPDF(title, result)} className="btn-secondary py-1.5 text-xs">
                  <FileDown className="h-3 w-3" /> PDF
                </button>
              </div>
            )}
          </div>
          <div className="output-panel">
            {loading ? (
              <div className="flex h-full min-h-[360px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              </div>
            ) : result || <p className="text-content-subtle">Your SEO-optimized blog post will appear here.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
