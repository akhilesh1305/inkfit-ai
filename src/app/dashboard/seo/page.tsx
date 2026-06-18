"use client";

import { useState } from "react";
import { Loader2, Search, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SEOArticleEditor } from "@/components/seo/SEOArticleEditor";
import {
  generateSEOArticle,
  type SEOArticleOutput,
} from "@/lib/seo-content";

export default function SEOPage() {
  const [topic, setTopic] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [audience, setAudience] = useState("");
  const [output, setOutput] = useState<SEOArticleOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const canGenerate = topic.trim().length >= 3 && targetKeyword.trim().length >= 2;

  async function handleGenerate() {
    if (!canGenerate || loading) return;
    setLoading(true);
    setOutput(null);

    const req = {
      topic: topic.trim(),
      targetKeyword: targetKeyword.trim(),
      audience: audience.trim() || undefined,
    };

    try {
      const res = await fetch("/api/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "write", ...req }),
      });
      const data = await res.json();
      if (data.article) {
        setOutput(data.article);
      } else {
        setOutput(generateSEOArticle(req));
      }
    } catch {
      setOutput(generateSEOArticle(req));
    } finally {
      setLoading(false);
    }
  }

  function handleUpdate(next: SEOArticleOutput) {
    setOutput(next);
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Search className="h-7 w-7 text-emerald-400" />
            SEO Writer
          </span>
        }
        description="Generate SEO-optimized titles, meta descriptions, keywords, FAQs, and full articles with a live score."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <h2 className="section-title">Article Details</h2>
          <div>
            <label className="label" htmlFor="topic">
              Topic
            </label>
            <input
              id="topic"
              className="input-field"
              placeholder="e.g. AI content marketing for SaaS"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="keyword">
              Target Keyword
            </label>
            <input
              id="keyword"
              className="input-field"
              placeholder="e.g. content marketing strategy"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="audience">
              Target Audience <span className="text-content-subtle">(optional)</span>
            </label>
            <input
              id="audience"
              className="input-field"
              placeholder="e.g. B2B marketers and startup founders"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className="btn-primary w-full py-3.5"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate SEO Article
              </>
            )}
          </button>
        </div>

        <SEOArticleEditor
          output={output}
          loading={loading}
          topic={topic.trim()}
          targetKeyword={targetKeyword.trim()}
          audience={audience.trim() || undefined}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}
