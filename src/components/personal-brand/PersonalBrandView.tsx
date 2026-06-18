"use client";

import { useCallback, useEffect, useState } from "react";
import { UserCircle, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BrandScoreDashboard } from "@/components/personal-brand/BrandScoreDashboard";
import { BrandContentPanel } from "@/components/personal-brand/BrandContentPanel";
import { BrandGrowthPanel } from "@/components/personal-brand/BrandGrowthPanel";
import {
  generatePersonalBrand,
  type PersonalBrandOutput,
  type PersonalBrandProfile,
} from "@/lib/personal-brand";
import { cn } from "@/lib/utils";

export function PersonalBrandView() {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [platform, setPlatform] = useState("LinkedIn");
  const [output, setOutput] = useState<PersonalBrandOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/personal-brand");
    if (res.ok) {
      const data = await res.json();
      const profile = data.profile as PersonalBrandProfile | null;
      if (profile) {
        setName(profile.name);
        setIndustry(profile.industry);
        setTargetAudience(profile.targetAudience);
        setPlatform(profile.platform);
        if (profile.output) setOutput(profile.output);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const canGenerate =
    name.trim().length >= 2 &&
    industry.trim().length >= 2 &&
    targetAudience.trim().length >= 3;

  async function handleGenerate() {
    if (!canGenerate || generating) return;
    setGenerating(true);

    const req = {
      name: name.trim(),
      industry: industry.trim(),
      targetAudience: targetAudience.trim(),
      platform,
    };

    try {
      const res = await fetch("/api/personal-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      setOutput(data.brand ?? generatePersonalBrand(req));
    } catch {
      setOutput(generatePersonalBrand(req));
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <UserCircle className="h-7 w-7 text-brand-400" />
            Personal Brand Manager
          </span>
        }
        description="Premium analytics for your personal brand — score, growth trends, and AI-generated content plans."
      >
        {output && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="btn-secondary"
          >
            <RefreshCw className={cn("h-4 w-4", generating && "animate-spin")} />
            Refresh analysis
          </button>
        )}
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <div className="card space-y-4 xl:sticky xl:top-6 xl:self-start">
          <h2 className="section-title">Your Profile</h2>
          <div>
            <label className="label" htmlFor="pb-name">
              Name / Brand
            </label>
            <input
              id="pb-name"
              className="input-field"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="pb-industry">
              Industry / Niche
            </label>
            <input
              id="pb-industry"
              className="input-field"
              placeholder="e.g. B2B marketing"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="pb-audience">
              Target Audience
            </label>
            <input
              id="pb-audience"
              className="input-field"
              placeholder="e.g. Startup founders"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="pb-platform">
              Primary Platform
            </label>
            <select
              id="pb-platform"
              className="input-field"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option>LinkedIn</option>
              <option>Instagram</option>
              <option>X (Twitter)</option>
              <option>Newsletter</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || generating}
            className="btn-primary w-full py-3.5"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                {output ? "Regenerate Plan" : "Analyze & Generate"}
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          <BrandScoreDashboard output={output} />
          {output && <BrandGrowthPanel recommendations={output.growthRecommendations} />}
          <BrandContentPanel output={output} loading={generating} />
        </div>
      </div>
    </div>
  );
}
