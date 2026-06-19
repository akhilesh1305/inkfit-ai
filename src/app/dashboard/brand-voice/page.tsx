"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { WizardStepper } from "@/components/brand-voice/WizardStepper";
import { StepBrandInfo } from "@/components/brand-voice/StepBrandInfo";
import { StepWritingStyle } from "@/components/brand-voice/StepWritingStyle";
import { StepTrainingData } from "@/components/brand-voice/StepTrainingData";
import { StepProfile } from "@/components/brand-voice/StepProfile";
import {
  type BrandVoiceFormData,
  type GeneratedBrandProfile,
  type WritingStyleId,
  generateBrandProfile,
  loadBrandVoiceProfile,
  saveBrandVoiceProfile,
} from "@/lib/brand-voice";

const INITIAL: BrandVoiceFormData = {
  brandName: "",
  industry: "",
  targetAudience: "",
  writingStyle: "professional",
  trainingSamples: "",
};

export default function BrandVoicePage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BrandVoiceFormData>(INITIAL);
  const [profile, setProfile] = useState<GeneratedBrandProfile | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/brand-voice");
        const data = await res.json();
        if (data.profile) {
          const p = data.profile;
          setForm({
            brandName: p.brandName,
            industry: p.industry,
            targetAudience: p.targetAudience,
            writingStyle: p.writingStyle,
            trainingSamples: p.trainingSamples,
          });
          setProfile(p.profile);
        } else {
          const existing = loadBrandVoiceProfile();
          if (existing) {
            setForm({
              brandName: existing.brandName,
              industry: existing.industry,
              targetAudience: existing.targetAudience,
              writingStyle: existing.writingStyle,
              trainingSamples: existing.trainingSamples,
            });
            setProfile(existing.profile);
          }
        }
      } catch {
        const existing = loadBrandVoiceProfile();
        if (existing) {
          setForm({
            brandName: existing.brandName,
            industry: existing.industry,
            targetAudience: existing.targetAudience,
            writingStyle: existing.writingStyle,
            trainingSamples: existing.trainingSamples,
          });
          setProfile(existing.profile);
        }
      }
    }
    load();
  }, []);

  function patch(p: Partial<BrandVoiceFormData>) {
    setForm((prev) => ({ ...prev, ...p }));
    setSaved(false);
  }

  function canNext(): boolean {
    if (step === 1) return Boolean(form.brandName.trim() && form.targetAudience.trim());
    if (step === 3) return form.trainingSamples.trim().length >= 30;
    return true;
  }

  async function handleGenerate() {
    setGenerating(true);
    setSaved(false);
    try {
      const res = await fetch("/api/brand-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", form }),
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
      } else {
        setProfile(generateBrandProfile(form));
      }
    } catch {
      setProfile(generateBrandProfile(form));
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!profile) return;
    saveBrandVoiceProfile({
      ...form,
      profile,
      savedAt: new Date().toISOString(),
    });
    try {
      await fetch("/api/brand-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", form, profile }),
      });
    } catch {
      /* local save still works */
    }
    setSaved(true);
  }

  return (
    <div>
      <PageHeader
        title="Brand Voice Training"
        description="Teach InkFit AI how your brand writes — tone, vocabulary, and style across every format."
      />

      <WizardStepper current={step} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepBrandInfo key="s1" data={form} onChange={patch} />
        )}
        {step === 2 && (
          <StepWritingStyle
            key="s2"
            data={form}
            onChange={(style: WritingStyleId) => patch({ writingStyle: style })}
          />
        )}
        {step === 3 && (
          <StepTrainingData key="s3" data={form} onChange={patch} />
        )}
        {step === 4 && (
          <StepProfile
            key="s4"
            profile={profile}
            generating={generating}
            saved={saved}
            onGenerate={handleGenerate}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <div className="mt-6 flex justify-between gap-4">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        {step < 4 ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
