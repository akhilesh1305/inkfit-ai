"use client";

import { Download, Pin, LogIn, Link2, Wand2 } from "lucide-react";
import { INSTALL_STEPS } from "@/lib/extensions";

const STEP_ICONS = [Download, Pin, LogIn, Link2, Wand2];

export function InstallGuidePanel() {
  return (
    <div className="card overflow-hidden border-brand-500/20 bg-gradient-to-br from-brand-500/5 to-transparent">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h3 className="font-semibold text-white">Installation guide</h3>
        <p className="mt-0.5 text-xs text-content-muted">
          Set up the InkFit Chrome extension in under 5 minutes
        </p>
      </div>
      <ol className="divide-y divide-white/[0.06]">
        {INSTALL_STEPS.map((step, i) => {
          const Icon = STEP_ICONS[i] ?? Download;
          return (
            <li key={step.step} className="flex gap-4 px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-sm font-bold text-brand-400">
                {step.step}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-brand-400" />
                  <p className="font-medium text-white">{step.title}</p>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-content-muted">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-5 py-3">
        <p className="font-mono text-[10px] text-content-subtle">
          Protocol v1.0.0 · Extension manifest v3 · postMessage bridge ready
        </p>
      </div>
    </div>
  );
}
