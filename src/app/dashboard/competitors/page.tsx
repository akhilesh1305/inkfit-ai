"use client";

import { useState } from "react";
import { BarChart3, Loader2, Globe, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CompetitorResults } from "@/components/competitors/CompetitorResults";
import type { CompetitorAnalysis } from "@/lib/competitor-analysis";
import { analyzeCompetitorSite } from "@/lib/competitor-analysis";

export default function CompetitorsPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompetitorAnalysis | null>(null);

  const canAnalyze = url.trim().length >= 4;

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!canAnalyze || loading) return;
    setLoading(true);
    setResult(null);

    const trimmed = url.trim();

    try {
      const res = await fetch("/api/competitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (data.analysis) {
        setResult(data.analysis);
      } else {
        setResult(analyzeCompetitorSite(trimmed));
      }
    } catch {
      setResult(analyzeCompetitorSite(trimmed));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-brand-400" />
            Competitor Analysis
          </span>
        }
        description="Analyze competitor websites to find content gaps, keyword opportunities, and SEO weaknesses."
      />

      <form onSubmit={handleAnalyze} className="card">
        <label className="label" htmlFor="competitor-url">
          Competitor Website URL
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
            <input
              id="competitor-url"
              className="input-field !pl-10"
              placeholder="https://competitor.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={!canAnalyze || loading} className="btn-primary sm:px-8">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Analyze Competitor
              </>
            )}
          </button>
        </div>
      </form>

      <CompetitorResults data={result} loading={loading} />
    </div>
  );
}
