"use client";

import { useState } from "react";
import { LayoutTemplate, Loader2, Sparkles, Eye, Code2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { LandingPagePreview } from "@/components/landing-pages/LandingPagePreview";
import { LandingPageExportBar } from "@/components/landing-pages/LandingPageExportBar";
import { generateLandingPage, type LandingPageOutput } from "@/lib/landing-page";
import { cn } from "@/lib/utils";

type ViewMode = "preview" | "split";

export function LandingPageView() {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [offer, setOffer] = useState("");
  const [output, setOutput] = useState<LandingPageOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");

  const canGenerate =
    businessName.trim().length >= 2 &&
    industry.trim().length >= 2 &&
    targetAudience.trim().length >= 3 &&
    offer.trim().length >= 3;

  async function handleGenerate() {
    if (!canGenerate || loading) return;
    setLoading(true);
    setOutput(null);

    const req = {
      businessName: businessName.trim(),
      industry: industry.trim(),
      targetAudience: targetAudience.trim(),
      offer: offer.trim(),
    };

    try {
      const res = await fetch("/api/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      setOutput(data.output ?? generateLandingPage(req));
    } catch {
      setOutput(generateLandingPage(req));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <LayoutTemplate className="h-7 w-7 text-brand-400" />
            Landing Page Generator
          </span>
        }
        description="Build conversion-ready landing pages — hero, features, testimonials, FAQ, and CTA with live preview."
      />

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        {/* Builder panel */}
        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="card space-y-4">
            <div>
              <h2 className="section-title">Page inputs</h2>
              <p className="mt-0.5 text-xs text-content-muted">
                We&apos;ll generate all sections for your offer.
              </p>
            </div>

            <div>
              <label className="label" htmlFor="lp-name">
                Business Name
              </label>
              <input
                id="lp-name"
                className="input-field"
                placeholder="InkFit AI"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="lp-industry">
                Industry
              </label>
              <input
                id="lp-industry"
                className="input-field"
                placeholder="B2B SaaS, Marketing, E-commerce…"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="lp-audience">
                Target Audience
              </label>
              <input
                id="lp-audience"
                className="input-field"
                placeholder="Founders, marketers, agencies…"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="lp-offer">
                Offer
              </label>
              <input
                id="lp-offer"
                className="input-field"
                placeholder="Free 14-day trial, AI content studio, etc."
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
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
                  Building page…
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate landing page
                </>
              )}
            </button>
          </div>

          {output && <LandingPageExportBar output={output} />}
        </div>

        {/* Preview area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-brand-400" />
              <span className="text-sm font-semibold text-white">Live preview</span>
              {output?.live && (
                <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[9px] font-semibold text-brand-300">
                  AI enhanced
                </span>
              )}
            </div>
            <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
              {(
                [
                  { id: "split" as const, label: "Split", icon: LayoutTemplate },
                  { id: "preview" as const, label: "Preview", icon: Eye },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setViewMode(m.id)}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-medium",
                    viewMode === m.id
                      ? "bg-brand-600 text-white"
                      : "text-content-muted hover:text-white"
                  )}
                >
                  <m.icon className="h-3 w-3" />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="card flex min-h-[500px] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-500" />
                <p className="mt-3 text-sm text-content-muted">Assembling sections…</p>
              </div>
            </div>
          ) : output ? (
            <div
              className={cn(
                "grid gap-4",
                viewMode === "split" && "lg:grid-cols-2"
              )}
            >
              <LandingPagePreview output={output} />
              {viewMode === "split" && (
                <div className="card max-h-[640px] overflow-auto p-0">
                  <div className="sticky top-0 flex items-center gap-2 border-b border-white/[0.06] bg-ink-surface px-4 py-2">
                    <Code2 className="h-3.5 w-3.5 text-content-muted" />
                    <span className="text-xs font-medium text-content-muted">Section editor</span>
                  </div>
                  <div className="space-y-4 p-4 text-xs">
                    <SectionBlock title="Hero" content={JSON.stringify(output.hero, null, 2)} />
                    <SectionBlock
                      title="Features"
                      content={output.features.map((f) => `• ${f.title}: ${f.description}`).join("\n")}
                    />
                    <SectionBlock
                      title="Benefits"
                      content={output.benefits.map((b) => `• ${b.title}: ${b.description}`).join("\n")}
                    />
                    <SectionBlock
                      title="Testimonials"
                      content={output.testimonials
                        .map((t) => `"${t.quote}" — ${t.author}, ${t.role}`)
                        .join("\n\n")}
                    />
                    <SectionBlock
                      title="FAQ"
                      content={output.faq.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}
                    />
                    <SectionBlock title="CTA" content={JSON.stringify(output.cta, null, 2)} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card flex min-h-[500px] flex-col items-center justify-center border-dashed text-center">
              <LayoutTemplate className="mb-4 h-12 w-12 text-content-subtle" />
              <p className="text-sm font-medium text-content-muted">
                Your landing page preview appears here
              </p>
              <p className="mt-1 max-w-xs text-xs text-content-subtle">
                Fill in business details and generate to see hero, features, testimonials, and more.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="mb-2 font-semibold text-brand-300">{title}</p>
      <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-content-muted">
        {content}
      </pre>
    </div>
  );
}
