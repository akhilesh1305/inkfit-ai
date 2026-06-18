"use client";

import { useState } from "react";
import { Globe, Loader2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { WebsiteContentEditor } from "@/components/website/WebsiteContentEditor";
import {
  WEBSITE_TONES,
  generateWebsiteContent,
  type WebsiteContentOutput,
  type WebsiteTone,
} from "@/lib/website-content";

export default function WebsiteGeneratorPage() {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState<WebsiteTone>("Professional");
  const [output, setOutput] = useState<WebsiteContentOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const canGenerate =
    businessName.trim().length >= 2 &&
    industry.trim().length >= 2 &&
    targetAudience.trim().length >= 3;

  async function handleGenerate() {
    if (!canGenerate || loading) return;
    setLoading(true);
    setOutput(null);

    const req = {
      businessName: businessName.trim(),
      industry: industry.trim(),
      targetAudience: targetAudience.trim(),
      tone,
    };

    try {
      const res = await fetch("/api/website-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      setOutput(data.content ?? generateWebsiteContent(req));
    } catch {
      setOutput(generateWebsiteContent(req));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Globe className="h-7 w-7 text-brand-400" />
            Website Content Generator
          </span>
        }
        description="Generate complete website copy — homepage, about, services, features, FAQ, and contact."
      />

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="card space-y-4">
          <div>
            <h2 className="section-title">Business Details</h2>
            <p className="mt-1 text-xs text-content-subtle">
              We will generate 6 pages tailored to your brand.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="business-name">
              Business Name
            </label>
            <input
              id="business-name"
              className="input-field"
              placeholder="e.g. Acme Digital"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="industry">
              Industry
            </label>
            <input
              id="industry"
              className="input-field"
              placeholder="e.g. Marketing SaaS, Healthcare"
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
              placeholder="e.g. Small business owners, HR teams"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="tone">
              Tone
            </label>
            <select
              id="tone"
              className="input-field"
              value={tone}
              onChange={(e) => setTone(e.target.value as WebsiteTone)}
            >
              {WEBSITE_TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
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
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Website Content
              </>
            )}
          </button>
        </div>

        <WebsiteContentEditor
          output={output}
          loading={loading}
          onUpdate={setOutput}
        />
      </div>
    </div>
  );
}
