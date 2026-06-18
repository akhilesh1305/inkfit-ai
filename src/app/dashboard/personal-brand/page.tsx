"use client";

import { useState } from "react";
import { UserCircle, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BrandScoreDashboard } from "@/components/personal-brand/BrandScoreDashboard";
import { BrandContentPanel } from "@/components/personal-brand/BrandContentPanel";
import {
  generatePersonalBrand,
  type PersonalBrandOutput,
} from "@/lib/personal-brand";
import { cn } from "@/lib/utils";

export default function PersonalBrandPage() {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [platform, setPlatform] = useState("LinkedIn");
  const [output, setOutput] = useState<PersonalBrandOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const canGenerate =
    name.trim().length >= 2 &&
    industry.trim().length >= 2 &&
    targetAudience.trim().length >= 3;

  async function handleGenerate() {
    if (!canGenerate || loading) return;
    setLoading(true);

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
      setLoading(false);
    }
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
        description="Track your brand score, get content ideas, and follow a weekly growth plan."
      >
        {output && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="btn-secondary"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
        )}
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <div className="card space-y-4">
          <h2 className="section-title">Your Profile</h2>
          <div>
            <label className="label" htmlFor="name">
              Name / Brand
            </label>
            <input
              id="name"
              className="input-field"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="industry">
              Industry / Niche
            </label>
            <input
              id="industry"
              className="input-field"
              placeholder="e.g. B2B marketing, fitness coaching"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="audience">
              Target Audience
            </label>
            <input
              id="audience"
              className="input-field"
              placeholder="e.g. Startup founders, HR leaders"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="platform">
              Primary Platform
            </label>
            <select
              id="platform"
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
            disabled={!canGenerate || loading}
            className="btn-primary w-full py-3.5"
          >
            {loading ? (
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
          <BrandScoreDashboard metrics={output?.metrics ?? null} />
          <BrandContentPanel output={output} loading={loading} />
        </div>
      </div>
    </div>
  );
}
