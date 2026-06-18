"use client";

import { useCallback, useState } from "react";
import { Send, Loader2, Sparkles, Briefcase } from "lucide-react";
import { EmployeeChat } from "@/components/employee/EmployeeChat";
import {
  EmployeeProgressPanel,
  EmployeeStepCard,
} from "@/components/employee/EmployeeStepCard";
import {
  GOAL_STARTERS,
  type EmployeeRun,
  type EmployeeStepId,
} from "@/lib/marketing-employee";
import { cn } from "@/lib/utils";

export function MarketingEmployeeView() {
  const [run, setRun] = useState<EmployeeRun | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  async function apiPost(body: Record<string, unknown>) {
    const res = await fetch("/api/employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { res, data: await res.json() };
  }

  async function handleStart(goal: string) {
    const trimmed = goal.trim();
    if (!trimmed || loading) return;

    setInput("");
    setLoading(true);

    const { res, data } = await apiPost({ action: "start", goal: trimmed });
    setLoading(false);

    if (res.status === 402) {
      showToast(data.error ?? "Insufficient credits");
      return;
    }
    if (res.ok && data.run) {
      setRun(data.run);
    }
  }

  async function handleStepAction(
    action: "approve" | "reject" | "regenerate",
    stepId: EmployeeStepId
  ) {
    if (!run || actionLoading) return;
    setActionLoading(true);

    const { res, data } = await apiPost({ action, runId: run.id, stepId });
    setActionLoading(false);

    if (res.status === 402) {
      showToast(data.error ?? "Insufficient credits");
      return;
    }
    if (res.ok && data.run) {
      setRun(data.run);
      if (action === "approve" && data.run.status === "completed") {
        showToast("Marketing package complete!");
      }
    }
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col lg:h-[calc(100vh-5rem)]">
      {/* Header */}
      <header className="mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 via-violet-600 to-cyan-600 shadow-lg">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a0a0c] bg-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Marketing Employee</h1>
            <p className="text-sm text-content-muted">
              {run ? `Working on: ${run.goal}` : "Hire your autonomous marketing manager"}
            </p>
          </div>
          {run && (
            <span
              className={cn(
                "ml-auto rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide",
                run.status === "completed"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : run.status === "paused"
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-brand-500/15 text-brand-300"
              )}
            >
              {run.status}
            </span>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#08080a] shadow-2xl lg:grid lg:grid-cols-[1fr_400px]">
        {/* Chat panel */}
        <div className="flex min-h-0 flex-col border-r border-white/[0.06]">
          <EmployeeChat messages={run?.messages ?? []} loading={loading} />

          {!run && (
            <div className="border-t border-white/[0.06] px-4 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
                Try a goal
              </p>
              <div className="flex flex-wrap gap-2">
                {GOAL_STARTERS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleStart(g)}
                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-content-muted transition hover:border-brand-500/30 hover:text-white"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-white/[0.06] p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!run) handleStart(input);
              }}
              className="flex gap-2"
            >
              <input
                className="input-field flex-1 !rounded-xl"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  run
                    ? "Mission in progress — approve steps on the right →"
                    : 'e.g. "Get more leads" or "Grow on LinkedIn"'
                }
                disabled={!!run || loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || !!run}
                className="btn-primary !rounded-xl !px-4"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
            {!run && (
              <p className="mt-2 flex items-center gap-1 text-[10px] text-content-subtle">
                <Sparkles className="h-3 w-3" />
                Consumes 1 agent credit per step
              </p>
            )}
          </div>
        </div>

        {/* Deliverables panel */}
        <div className="hidden min-h-0 flex-col overflow-y-auto bg-gradient-to-b from-white/[0.02] to-transparent p-4 lg:flex">
          <h2 className="mb-1 text-sm font-semibold text-white">Deliverables</h2>
          <p className="mb-4 text-[11px] text-content-muted">
            Review, approve, or regenerate each output
          </p>

          {run ? (
            <>
              <EmployeeProgressPanel steps={run.steps} progress={run.progress} />
              <div className="mt-4 space-y-3">
                {run.steps.map((step, i) => (
                  <EmployeeStepCard
                    key={step.id}
                    step={step}
                    index={i}
                    busy={actionLoading}
                    onApprove={(id) => handleStepAction("approve", id)}
                    onReject={(id) => handleStepAction("reject", id)}
                    onRegenerate={(id) => handleStepAction("regenerate", id)}
                  />
                ))}
              </div>
              {run.status === "completed" && (
                <button
                  type="button"
                  onClick={() => setRun(null)}
                  className="btn-secondary mt-4 w-full"
                >
                  Start new mission
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-6 text-center">
              <Briefcase className="h-10 w-10 text-content-subtle" />
              <p className="mt-3 text-sm text-content-muted">
                Your deliverables will appear here as your marketing employee works through each step.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile deliverables strip */}
      {run && (
        <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-3 lg:hidden">
          <EmployeeProgressPanel steps={run.steps} progress={run.progress} />
          <div className="mt-3 space-y-2">
            {run.steps
              .filter((s) => s.status !== "pending")
              .map((step, i) => (
                <EmployeeStepCard
                  key={step.id}
                  step={step}
                  index={i}
                  busy={actionLoading}
                  onApprove={(id) => handleStepAction("approve", id)}
                  onReject={(id) => handleStepAction("reject", id)}
                  onRegenerate={(id) => handleStepAction("regenerate", id)}
                />
              ))}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-brand-500/30 bg-[#121214] px-4 py-2.5 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
