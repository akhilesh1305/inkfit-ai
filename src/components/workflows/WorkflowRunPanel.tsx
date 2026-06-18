"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  XCircle,
  Circle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import type { WorkflowRunResult, WorkflowStepResult } from "@/lib/workflows";
import { cn } from "@/lib/utils";

interface WorkflowRunPanelProps {
  run: WorkflowRunResult | null;
  running: boolean;
}

export function WorkflowRunPanel({ run, running }: WorkflowRunPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (!run && !running) return null;

  const steps = run?.steps ?? [];
  const completed = steps.filter((s) => s.status === "completed").length;
  const total = steps.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-white/[0.08] bg-[#0a0a0c]/95 backdrop-blur-xl"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
          ) : run?.status === "completed" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : run?.status === "failed" ? (
            <XCircle className="h-4 w-4 text-red-400" />
          ) : (
            <Circle className="h-4 w-4 text-content-subtle" />
          )}
          <div>
            <p className="text-sm font-semibold text-white">
              {running ? "Running workflow…" : run?.status === "completed" ? "Workflow completed" : "Workflow failed"}
            </p>
            <p className="text-[11px] text-content-muted">
              {running ? `${completed} of ${total} steps` : run?.error ?? `${completed}/${total} steps done`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!running && total > 0 && (
            <span className="text-xs font-medium text-brand-300">{progress}%</span>
          )}
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-content-muted" />
          ) : (
            <ChevronUp className="h-4 w-4 text-content-muted" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 px-4 pb-4">
              {steps.map((step, i) => (
                <StepRow key={step.nodeId} step={step} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StepRow({ step, index }: { step: WorkflowStepResult; index: number }) {
  const [showOutput, setShowOutput] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5",
        step.status === "completed" && "border-emerald-500/20 bg-emerald-500/5",
        step.status === "running" && "border-brand-500/30 bg-brand-500/5",
        step.status === "failed" && "border-red-500/20 bg-red-500/5",
        step.status === "pending" && "border-white/[0.06] bg-white/[0.02]"
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/5 text-[10px] font-bold text-content-muted">
          {index + 1}
        </span>
        {step.status === "completed" ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        ) : step.status === "running" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-400" />
        ) : step.status === "failed" ? (
          <XCircle className="h-3.5 w-3.5 text-red-400" />
        ) : (
          <Circle className="h-3.5 w-3.5 text-content-subtle" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-white">{step.label}</p>
          {step.preview && (
            <p className="truncate text-[10px] text-content-muted">{step.preview}</p>
          )}
          {step.error && <p className="text-[10px] text-red-400">{step.error}</p>}
        </div>
        {step.durationMs != null && (
          <span className="text-[10px] text-content-subtle">{(step.durationMs / 1000).toFixed(1)}s</span>
        )}
        {step.output && (
          <button
            type="button"
            onClick={() => setShowOutput((v) => !v)}
            className="text-[10px] text-brand-400 hover:underline"
          >
            {showOutput ? "Hide" : "View"}
          </button>
        )}
      </div>
      {showOutput && step.output && (
        <pre className="mt-2 max-h-32 overflow-auto rounded bg-black/30 p-2 text-[10px] text-content-muted whitespace-pre-wrap">
          {step.output.slice(0, 1500)}
        </pre>
      )}
    </div>
  );
}
