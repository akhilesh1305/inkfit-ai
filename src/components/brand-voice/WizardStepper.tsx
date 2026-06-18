"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Brand Info" },
  { id: 2, label: "Writing Style" },
  { id: 3, label: "Training Data" },
  { id: 4, label: "Brand Profile" },
];

interface WizardStepperProps {
  current: number;
}

export function WizardStepper({ current }: WizardStepperProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between gap-2">
        {STEPS.map((step, i) => {
          const done = current > step.id;
          const active = current === step.id;
          return (
            <li key={step.id} className="flex flex-1 items-center">
              <div className="flex w-full flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition",
                    done && "border-brand-500 bg-brand-600 text-white",
                    active && "border-brand-500 bg-brand-600/20 text-brand-300 shadow-glow",
                    !done && !active && "border-white/10 bg-white/5 text-content-subtle"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span
                  className={cn(
                    "hidden text-center text-xs font-medium sm:block",
                    active ? "text-content" : "text-content-subtle"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 hidden h-px flex-1 sm:block",
                    done ? "bg-brand-500" : "bg-white/10"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
