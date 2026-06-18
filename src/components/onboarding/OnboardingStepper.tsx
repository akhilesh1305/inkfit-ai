"use client";

import { Check } from "lucide-react";
import { ONBOARDING_STEPS } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

interface OnboardingStepperProps {
  currentStep: number;
}

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {ONBOARDING_STEPS.map((step, i) => {
          const done = currentStep > step.id;
          const active = currentStep === step.id;
          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                    done && "border-brand-500 bg-brand-600 text-white",
                    active && "border-brand-500 bg-brand-500/20 text-brand-300 shadow-glow",
                    !done && !active && "border-white/15 text-content-muted"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span
                  className={cn(
                    "hidden text-[10px] font-medium sm:block",
                    active ? "text-white" : "text-content-muted"
                  )}
                >
                  {step.title}
                </span>
              </div>
              {i < ONBOARDING_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded-full transition-colors sm:mx-2",
                    done ? "bg-brand-500" : "bg-white/10"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm text-content-muted">
        {ONBOARDING_STEPS.find((s) => s.id === currentStep)?.subtitle}
      </p>
    </div>
  );
}
