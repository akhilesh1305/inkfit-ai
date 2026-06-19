"use client";

import {
  Check,
  X,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import {
  EMPLOYEE_STEPS,
  getStepMeta,
  type EmployeeStep,
  type EmployeeStepId,
  type BlogIdea,
  type ContentPlanOutput,
  type ImageAsset,
  type LinkedInPostDraft,
  type StrategyOutput,
  type CalendarPlanItemExport,
} from "@/lib/marketing-employee";
import { cn } from "@/lib/utils";

interface EmployeeStepCardProps {
  step: EmployeeStep;
  index: number;
  onApprove: (id: EmployeeStepId) => void;
  onReject: (id: EmployeeStepId) => void;
  onRegenerate: (id: EmployeeStepId) => void;
  busy?: boolean;
}

export function EmployeeStepCard({
  step,
  index,
  onApprove,
  onReject,
  onRegenerate,
  busy,
}: EmployeeStepCardProps) {
  const [expanded, setExpanded] = useState(
    step.status === "awaiting_approval" ||
      step.status === "pending_review" ||
      step.status === "running"
  );
  const meta = getStepMeta(step.id);

  const statusColor = {
    pending: "text-content-subtle",
    running: "text-brand-400",
    awaiting_approval: "text-amber-400",
    pending_review: "text-cyan-400",
    approved: "text-emerald-400",
    rejected: "text-red-400",
    completed: "text-emerald-400",
  }[step.status];

  return (
    <div
      className={cn(
        "rounded-xl border transition",
        step.status === "awaiting_approval"
          ? "border-amber-500/30 bg-amber-500/[0.04]"
          : step.status === "pending_review"
            ? "border-cyan-500/30 bg-cyan-500/[0.04]"
            : step.status === "approved"
            ? "border-emerald-500/20 bg-emerald-500/[0.03]"
            : step.status === "running"
              ? "border-brand-500/30 bg-brand-500/[0.04]"
              : "border-white/[0.06] bg-white/[0.02]"
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white",
            meta.gradient
          )}
        >
          {step.status === "running" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : step.status === "approved" ? (
            <Check className="h-4 w-4" />
          ) : (
            index + 1
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{step.title}</p>
          <p className={cn("text-[11px] capitalize", statusColor)}>
            {step.status === "awaiting_approval"
              ? "Ready for review"
              : step.status === "pending_review"
                ? "Generated — pending approval"
                : step.status.replace(/_/g, " ")}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-content-subtle" />
        ) : (
          <ChevronDown className="h-4 w-4 text-content-subtle" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06] px-4 pb-4">
          {step.preview && step.status !== "pending" && (
            <p className="mt-3 text-xs text-content-muted">{step.preview}</p>
          )}

          {step.output != null ? (
            <StepOutput stepId={step.id} output={step.output} />
          ) : null}

          {(step.status === "awaiting_approval" || step.status === "pending_review") && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => onApprove(step.id)}
                className="btn-primary !px-3 !py-1.5 text-xs"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Approve
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onReject(step.id)}
                className="btn-secondary !px-3 !py-1.5 text-xs"
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onRegenerate(step.id)}
                className="btn-ghost !px-3 !py-1.5 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </button>
            </div>
          )}

          {step.status === "rejected" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onRegenerate(step.id)}
              className="btn-secondary mt-4 !px-3 !py-1.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StepOutput({ stepId, output }: { stepId: EmployeeStepId; output: unknown }) {
  switch (stepId) {
    case "strategy": {
      const data = output as StrategyOutput;
      return (
        <div className="mt-3 space-y-2 rounded-lg bg-black/20 p-3 text-xs">
          <p className="text-content-muted leading-relaxed">{data.executiveSummary}</p>
          <p className="font-semibold text-white">Channels</p>
          <p className="text-content-muted">{data.channels.join(" · ")}</p>
        </div>
      );
    }
    case "content_plan": {
      const data = output as ContentPlanOutput;
      return (
        <div className="mt-3 space-y-2">
          {data.weeks.map((w) => (
            <div key={w.week} className="rounded-lg bg-black/20 p-2.5 text-xs">
              <p className="font-semibold text-white">Week {w.week}: {w.theme}</p>
              <p className="text-content-muted">{w.formats.join(", ")}</p>
            </div>
          ))}
        </div>
      );
    }
    case "blog_ideas": {
      const ideas = output as BlogIdea[];
      return (
        <ul className="mt-3 space-y-2">
          {ideas.map((idea, i) => (
            <li key={i} className="rounded-lg bg-black/20 p-2.5 text-xs">
              <p className="font-medium text-white">{idea.title}</p>
              <p className="text-content-subtle">{idea.angle} · {idea.keyword}</p>
            </li>
          ))}
        </ul>
      );
    }
    case "linkedin_posts": {
      const posts = output as LinkedInPostDraft[];
      return (
        <div className="mt-3 space-y-3">
          {posts.map((post, i) => (
            <div key={i} className="rounded-lg bg-black/20 p-3 text-xs">
              <p className="font-semibold text-brand-300">{post.hook}</p>
              <p className="mt-1 whitespace-pre-wrap text-content-muted line-clamp-4">{post.body}</p>
            </div>
          ))}
        </div>
      );
    }
    case "images": {
      const images = output as ImageAsset[];
      return (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={i} className="rounded-lg overflow-hidden border border-white/[0.06]">
              <img src={img.url} alt={img.prompt} className="aspect-square w-full object-cover" />
              <p className="p-1.5 text-[9px] text-content-subtle truncate">{img.prompt}</p>
            </div>
          ))}
        </div>
      );
    }
    case "calendar": {
      const items = output as CalendarPlanItemExport[];
      return (
        <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex gap-2 rounded bg-black/20 px-2 py-1.5 text-[10px]">
              <span className="shrink-0 text-content-subtle">{item.date}</span>
              {item.suggestedTime && (
                <span className="shrink-0 text-cyan-400">{item.suggestedTime}</span>
              )}
              <span className="text-white truncate">{item.topic}</span>
            </div>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
}

export function EmployeeProgressPanel({
  steps,
  progress,
}: {
  steps: EmployeeStep[];
  progress: number;
}) {
  return (
    <div className="space-y-1">
      <div className="mb-4">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-content-muted">Mission progress</span>
          <span className="font-semibold text-brand-300">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 via-violet-500 to-cyan-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] text-content-subtle">
          {steps.filter((s) => s.status === "approved").length} of {EMPLOYEE_STEPS.length} deliverables approved
        </p>
      </div>
    </div>
  );
}
