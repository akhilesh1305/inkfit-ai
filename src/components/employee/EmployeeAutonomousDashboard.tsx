"use client";

import { Check, Loader2, Zap } from "lucide-react";
import {
  EMPLOYEE_STEPS,
  getStepMeta,
  type EmployeeStep,
} from "@/lib/marketing-employee";
import { cn } from "@/lib/utils";

interface EmployeeAutonomousDashboardProps {
  goal: string;
  steps: EmployeeStep[];
  generationProgress: number;
  autoRunning: boolean;
}

export function EmployeeAutonomousDashboard({
  goal,
  steps,
  generationProgress,
  autoRunning,
}: EmployeeAutonomousDashboardProps) {
  const runningStep = steps.find((s) => s.status === "running");
  const completedCount = steps.filter(
    (s) =>
      s.status === "pending_review" ||
      s.status === "awaiting_approval" ||
      s.status === "approved"
  ).length;

  return (
    <div className="rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-600/10 via-violet-600/5 to-cyan-600/10 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/90">
              Autonomous Mode
            </span>
          </div>
          <h3 className="mt-1 text-sm font-semibold text-white">{goal}</h3>
          <p className="mt-0.5 text-xs text-content-muted">
            {autoRunning
              ? runningStep
                ? `Generating ${getStepMeta(runningStep.id).title}…`
                : "Advancing to next deliverable…"
              : generationProgress >= 100
                ? "Generation complete — awaiting your approval"
                : "Preparing next step…"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-brand-300">{generationProgress}%</p>
          <p className="text-[10px] text-content-subtle">
            {completedCount}/{EMPLOYEE_STEPS.length} done
          </p>
        </div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            autoRunning
              ? "animate-pulse bg-gradient-to-r from-brand-500 via-violet-500 to-cyan-400"
              : "bg-gradient-to-r from-emerald-500 to-brand-500"
          )}
          style={{ width: `${generationProgress}%` }}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {EMPLOYEE_STEPS.map((meta, i) => {
          const step = steps.find((s) => s.id === meta.id);
          const status = step?.status ?? "pending";
          const isRunning = status === "running";
          const isDone =
            status === "pending_review" ||
            status === "awaiting_approval" ||
            status === "approved";
          const isRejected = status === "rejected";

          return (
            <div
              key={meta.id}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition",
                isRunning && "border-brand-500/40 bg-brand-500/10",
                isDone && "border-emerald-500/25 bg-emerald-500/5",
                isRejected && "border-red-500/25 bg-red-500/5",
                !isRunning && !isDone && !isRejected && "border-white/[0.06] bg-black/20"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-bold text-white",
                  meta.gradient
                )}
              >
                {isRunning ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isDone ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  i + 1
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">{meta.title}</p>
                <p className="text-[10px] capitalize text-content-subtle">
                  {isRunning
                    ? "Generating…"
                    : isDone
                      ? "Ready"
                      : isRejected
                        ? "Failed"
                        : "Queued"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
