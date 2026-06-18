"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  Building2,
  Users,
  Target,
  Mic2,
  Wand2,
  Check,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import {
  AUDIENCE_TYPES,
  BRAND_VOICE_OPTIONS,
  COMPANY_SIZES,
  CONTENT_GOALS,
  DEFAULT_ONBOARDING_FORM,
  ONBOARDING_STEPS,
  type ContentGoalId,
  type OnboardingBrandVoice,
  type OnboardingFormData,
  type GeneratedOnboardingProfile,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OnboardingFormData>(DEFAULT_ONBOARDING_FORM);
  const [generated, setGenerated] = useState<GeneratedOnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/onboarding")
      .then((r) => r.json())
      .then((data) => {
        if (data.completed) {
          router.replace("/dashboard");
          return;
        }
        setForm({
          businessName: data.businessName ?? "",
          websiteUrl: data.websiteUrl ?? "",
          industry: data.industry ?? "",
          companySize: data.companySize ?? "",
          audienceType: data.audienceType ?? "",
          goals: data.goals ?? "",
          mainChallenges: data.mainChallenges ?? "",
          contentGoals: data.contentGoals ?? [],
          brandVoice: data.brandVoice ?? "professional",
        });
        if (data.generated) setGenerated(data.generated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  function patch(p: Partial<OnboardingFormData>) {
    setForm((prev) => ({ ...prev, ...p }));
  }

  function toggleGoal(id: ContentGoalId) {
    setForm((prev) => ({
      ...prev,
      contentGoals: prev.contentGoals.includes(id)
        ? prev.contentGoals.filter((g) => g !== id)
        : [...prev.contentGoals, id],
    }));
  }

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return form.businessName.trim().length >= 2 && form.industry.trim().length >= 2;
      case 2:
        return !!form.audienceType && form.goals.trim().length >= 5;
      case 3:
        return form.contentGoals.length > 0;
      case 4:
        return !!form.brandVoice;
      default:
        return true;
    }
  }

  async function handleNext() {
    if (step === 4) {
      setSubmitting(true);
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", form }),
      });
      const data = await res.json();
      setSubmitting(false);
      if (data.generated) {
        setGenerated(data.generated);
        setStep(5);
      }
      return;
    }
    if (step < 5) setStep((s) => s + 1);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-bg">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-bg">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-brand-600/10 via-transparent to-cyan-500/5" />
      <div className="relative mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="mb-8 flex justify-center">
          <Logo size="md" href={null} />
        </div>

        <OnboardingStepper currentStep={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="card"
          >
            {step === 1 && (
              <StepShell icon={Building2} title="Business Information">
                <Field label="Business Name" id="ob-name">
                  <input
                    id="ob-name"
                    className="input-field"
                    value={form.businessName}
                    onChange={(e) => patch({ businessName: e.target.value })}
                    placeholder="Acme Inc."
                  />
                </Field>
                <Field label="Website URL" id="ob-url">
                  <input
                    id="ob-url"
                    className="input-field"
                    value={form.websiteUrl}
                    onChange={(e) => patch({ websiteUrl: e.target.value })}
                    placeholder="https://acme.com"
                  />
                </Field>
                <Field label="Industry" id="ob-industry">
                  <input
                    id="ob-industry"
                    className="input-field"
                    value={form.industry}
                    onChange={(e) => patch({ industry: e.target.value })}
                    placeholder="B2B SaaS, Marketing, E-commerce…"
                  />
                </Field>
                <Field label="Company Size" id="ob-size">
                  <select
                    id="ob-size"
                    className="input-field"
                    value={form.companySize}
                    onChange={(e) => patch({ companySize: e.target.value as OnboardingFormData["companySize"] })}
                  >
                    <option value="">Select size</option>
                    {COMPANY_SIZES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </StepShell>
            )}

            {step === 2 && (
              <StepShell icon={Users} title="Target Audience">
                <Field label="Audience Type">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {AUDIENCE_TYPES.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => patch({ audienceType: a.id })}
                        className={cn(
                          "rounded-xl border p-3 text-left transition",
                          form.audienceType === a.id
                            ? "border-brand-500/50 bg-brand-500/10"
                            : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <p className="font-semibold text-white">{a.label}</p>
                        <p className="text-xs text-content-muted">{a.description}</p>
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Goals" id="ob-goals">
                  <textarea
                    id="ob-goals"
                    className="input-field min-h-[80px] resize-y"
                    value={form.goals}
                    onChange={(e) => patch({ goals: e.target.value })}
                    placeholder="What does your audience want to achieve?"
                  />
                </Field>
                <Field label="Main Challenges" id="ob-challenges">
                  <textarea
                    id="ob-challenges"
                    className="input-field min-h-[80px] resize-y"
                    value={form.mainChallenges}
                    onChange={(e) => patch({ mainChallenges: e.target.value })}
                    placeholder="What pain points or obstacles do they face?"
                  />
                </Field>
              </StepShell>
            )}

            {step === 3 && (
              <StepShell icon={Target} title="Content Goals">
                <p className="mb-4 text-sm text-content-muted">Select all that apply</p>
                <div className="space-y-2">
                  {CONTENT_GOALS.map((goal) => {
                    const selected = form.contentGoals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => toggleGoal(goal.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition",
                          selected
                            ? "border-brand-500/50 bg-brand-500/10"
                            : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                            selected
                              ? "border-brand-500 bg-brand-600"
                              : "border-white/20"
                          )}
                        >
                          {selected && <Check className="h-3 w-3 text-white" />}
                        </span>
                        <div>
                          <p className="font-semibold text-white">{goal.label}</p>
                          <p className="text-xs text-content-muted">{goal.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            )}

            {step === 4 && (
              <StepShell icon={Mic2} title="Brand Voice">
                <div className="grid gap-3 sm:grid-cols-2">
                  {BRAND_VOICE_OPTIONS.map((voice) => (
                    <button
                      key={voice.id}
                      type="button"
                      onClick={() => patch({ brandVoice: voice.id as OnboardingBrandVoice })}
                      className={cn(
                        "rounded-xl border p-4 text-left transition",
                        form.brandVoice === voice.id
                          ? "border-brand-500/50 bg-brand-500/10 shadow-glow"
                          : "border-white/10 hover:border-white/20"
                      )}
                    >
                      <p className="font-semibold text-white">{voice.label}</p>
                      <p className="mt-1 text-xs text-content-muted">{voice.description}</p>
                    </button>
                  ))}
                </div>
              </StepShell>
            )}

            {step === 5 && generated && (
              <StepShell icon={Wand2} title="Your AI Brand Profile">
                <div className="space-y-5">
                  <Section title="Content Pillars">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {generated.contentPillars.map((p, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
                        >
                          <p className="text-sm font-semibold text-white">{p.title}</p>
                          <p className="mt-1 text-xs text-content-muted">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section title="Brand Voice">
                    <div className="space-y-2 text-xs text-content-muted">
                      <p>
                        <strong className="text-brand-300">Tone:</strong>{" "}
                        {generated.brandVoiceSummary.tone}
                      </p>
                      <p>
                        <strong className="text-brand-300">Vocabulary:</strong>{" "}
                        {generated.brandVoiceSummary.vocabulary}
                      </p>
                    </div>
                  </Section>

                  <Section title="Suggested Strategy">
                    <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-white/[0.02] p-3 font-mono text-[10px] leading-relaxed text-content-muted">
                      {generated.suggestedStrategy}
                    </pre>
                  </Section>

                  <Section title="Initial Content Calendar">
                    <div className="divide-y divide-white/[0.06] rounded-lg border border-white/[0.06]">
                      {generated.initialCalendar.map((item, i) => (
                        <div key={i} className="flex gap-3 px-3 py-2 text-xs">
                          <span className="w-20 shrink-0 font-medium text-white">{item.day}</span>
                          <span className="text-content-muted">{item.title}</span>
                          <span className="ml-auto shrink-0 text-brand-400">{item.platform}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>
              </StepShell>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || submitting}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {step < 5 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={handleNext}
              disabled={!canProceed() || submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : step === 4 ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate profile
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={() => router.push("/dashboard")}
            >
              Go to dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-content-subtle">
          Step {step} of {ONBOARDING_STEPS.length}
        </p>
      </div>
    </div>
  );
}

function StepShell({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Building2;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15">
          <Icon className="h-5 w-5 text-brand-400" />
        </div>
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>
      {children}
    </div>
  );
}
