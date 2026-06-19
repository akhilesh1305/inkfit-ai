"use client";

import { CheckCheck, Calendar, Loader2, Send } from "lucide-react";
import { getStepsAwaitingReview } from "@/lib/marketing-employee";

interface EmployeeApprovalWorkflowProps {
  steps: import("@/lib/marketing-employee").EmployeeStep[];
  status: string;
  publishedAt: string | null;
  busy: boolean;
  onApproveAll: () => void;
  onPublish: () => void;
}

export function EmployeeApprovalWorkflow({
  steps,
  status,
  publishedAt,
  busy,
  onApproveAll,
  onPublish,
}: EmployeeApprovalWorkflowProps) {
  const awaiting = getStepsAwaitingReview(steps);
  const approvedCount = steps.filter((s) => s.status === "approved").length;
  const showReview = status === "review" || awaiting.length > 0;
  const allApproved = approvedCount === steps.length;

  if (!showReview && !allApproved) return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-amber-200">Approval Workflow</p>
          <p className="mt-0.5 text-xs text-content-muted">
            {allApproved
              ? "All deliverables approved. Publish to sync your calendar and save drafts."
              : `${awaiting.length} deliverable${awaiting.length === 1 ? "" : "s"} ready for review. Approve individually below or approve everything at once.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {awaiting.length > 0 && (
            <button
              type="button"
              disabled={busy}
              onClick={onApproveAll}
              className="btn-primary !px-3 !py-1.5 text-xs"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              Approve All ({awaiting.length})
            </button>
          )}
          {(allApproved || status === "completed") && !publishedAt && (
            <button
              type="button"
              disabled={busy}
              onClick={onPublish}
              className="btn-secondary !px-3 !py-1.5 text-xs"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Calendar className="h-3.5 w-3.5" />
              )}
              Publish Schedule
            </button>
          )}
          {publishedAt && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-300">
              <Send className="h-3 w-3" />
              Published
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
