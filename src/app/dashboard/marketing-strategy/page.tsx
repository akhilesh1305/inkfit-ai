"use client";

import { useState } from "react";
import { Briefcase, Loader2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StrategyReport } from "@/components/marketing/StrategyReport";
import {
  BUSINESS_TYPES,
  generateMarketingStrategy,
  type BusinessType,
  type MarketingStrategyOutput,
} from "@/lib/marketing-strategy";

const BUDGET_PRESETS = ["$1,000", "$3,000", "$5,000", "$10,000", "$25,000"];

export default function MarketingStrategyPage() {
  const [industry, setIndustry] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("b2b-saas");
  const [targetAudience, setTargetAudience] = useState("");
  const [goals, setGoals] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("$5,000");
  const [output, setOutput] = useState<MarketingStrategyOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const canGenerate =
    industry.trim().length >= 2 &&
    targetAudience.trim().length >= 3 &&
    goals.trim().length >= 5 &&
    monthlyBudget.trim().length >= 1;

  const bizLabel = BUSINESS_TYPES.find((b) => b.id === businessType)?.label ?? businessType;

  async function handleGenerate() {
    if (!canGenerate || loading) return;
    setLoading(true);
    setOutput(null);

    const req = {
      industry: industry.trim(),
      businessType,
      targetAudience: targetAudience.trim(),
      goals: goals.trim(),
      monthlyBudget: monthlyBudget.trim(),
    };

    try {
      const res = await fetch("/api/marketing-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      setOutput(data.strategy ?? generateMarketingStrategy(req));
    } catch {
      setOutput(generateMarketingStrategy(req));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-brand-400" />
            AI Marketing Strategist
          </span>
        }
        description="Generate a consulting-grade marketing plan tailored to your industry, audience, and budget."
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="card space-y-4">
          <div>
            <h2 className="section-title">Strategy Brief</h2>
            <p className="mt-1 text-xs text-content-subtle">
              Tell us about your business to generate a custom plan.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="industry">
              Industry
            </label>
            <input
              id="industry"
              className="input-field"
              placeholder="e.g. FinTech, Fitness, Real Estate"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="business-type">
              Business Type
            </label>
            <select
              id="business-type"
              className="input-field"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value as BusinessType)}
            >
              {BUSINESS_TYPES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="audience">
              Target Audience
            </label>
            <input
              id="audience"
              className="input-field"
              placeholder="e.g. SMB founders, HR directors"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="goals">
              Goals
            </label>
            <textarea
              id="goals"
              className="input-field min-h-[88px] resize-y"
              placeholder="e.g. Generate 50 qualified leads per month, build thought leadership"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="budget">
              Monthly Budget
            </label>
            <input
              id="budget"
              className="input-field"
              placeholder="e.g. $5,000"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {BUDGET_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMonthlyBudget(preset)}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                    monthlyBudget === preset
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-300"
                      : "border-white/10 text-content-subtle hover:border-white/20"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
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
                Generating Strategy...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Strategy
              </>
            )}
          </button>
        </div>

        <StrategyReport
          output={output}
          loading={loading}
          inputs={
            output
              ? {
                  industry,
                  businessType: bizLabel,
                  targetAudience,
                  goals,
                  monthlyBudget,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
