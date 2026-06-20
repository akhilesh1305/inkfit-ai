"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Send, Loader2, Sparkles, Briefcase, Zap, History } from "lucide-react";
import { useBillingStatus } from "@/hooks/use-dashboard-queries";
import { EmployeeChat } from "@/components/employee/EmployeeChat";
import { EmployeeAutonomousDashboard } from "@/components/employee/EmployeeAutonomousDashboard";
import { EmployeeApprovalWorkflow } from "@/components/employee/EmployeeApprovalWorkflow";
import {
  EmployeeProgressPanel,
  EmployeeStepCard,
} from "@/components/employee/EmployeeStepCard";
import { CreditCostPreview } from "@/components/credits/CreditCostPreview";
import { estimateEmployeeRunCredits } from "@/lib/employee-credits";
import {
  GOAL_STARTERS,
  type EmployeeRun,
  type EmployeeRunMode,
  type EmployeeStepId,
} from "@/lib/marketing-employee";
import { cn } from "@/lib/utils";

export function MarketingEmployeeView() {
  const searchParams = useSearchParams();
  const [run, setRun] = useState<EmployeeRun | null>(null);
  const [recentRuns, setRecentRuns] = useState<EmployeeRun[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<EmployeeRunMode>("guided");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const tickInFlight = useRef(false);
  const { data: billingStatus } = useBillingStatus();
  const planId = billingStatus?.planId ?? "free";
  const creditsRemaining = billingStatus?.credits?.creditsRemaining ?? 0;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    if (billingStatus?.planId && billingStatus.planId !== "free") {
      setMode("autonomous");
    }
  }, [billingStatus?.planId]);

  useEffect(() => {
    fetch("/api/employee")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.runs?.length) setRecentRuns(data.runs);
      })
      .catch(() => {});

    const goal = searchParams.get("goal");
    if (goal?.trim()) setInput(goal.trim());
  }, [searchParams]);

  async function apiPost(body: Record<string, unknown>) {
    const res = await fetch("/api/employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    let data: { error?: string; run?: EmployeeRun } = {};
    try {
      data = await res.json();
    } catch {
      data = { error: "Invalid server response" };
    }
    return { res, data };
  }

  function actionError(res: Response, data: { error?: string }) {
    return data.error ?? (res.status === 402 ? "Insufficient credits" : "Request failed. Please try again.");
  }

  const runAutonomousLoop = useCallback(
    async (currentRun: EmployeeRun) => {
      if (tickInFlight.current) return;
      if (currentRun.mode !== "autonomous" || currentRun.autoRunStatus !== "running") {
        setAutoRunning(false);
        return;
      }

      tickInFlight.current = true;
      setAutoRunning(true);

      let active = currentRun;
      try {
        while (active.autoRunStatus === "running") {
          const { res, data } = await apiPost({
            action: "autonomous_tick",
            runId: active.id,
          });

          if (res.status === 402) {
            showToast(data.error ?? "Insufficient credits — autonomous run paused");
            return;
          }

          if (!res.ok || !data.run) {
            showToast(actionError(res, data));
            break;
          }

          active = data.run;
          setRun(active);

          if (active.autoRunStatus !== "running") break;
          await new Promise((r) => setTimeout(r, 400));
        }

        if (active.status === "review") {
          showToast("Autonomous run complete — review your deliverables");
          if (typeof window !== "undefined") {
            window.localStorage.setItem("inkfit-employee-completed", "1");
          }
        }
      } catch {
        showToast("Network error — autonomous run paused");
      } finally {
        setAutoRunning(false);
        tickInFlight.current = false;
      }
    },
    [showToast]
  );

  async function handleStart(goal: string) {
    const trimmed = goal.trim();
    if (!trimmed || loading) return;

    setInput("");
    setLoading(true);
    try {
      const { res, data } = await apiPost({
        action: "start",
        goal: trimmed,
        mode,
      });

      if (res.status === 402) {
        showToast(data.error ?? "Insufficient credits");
        return;
      }
      if (res.ok && data.run) {
        setRun(data.run);
        setRecentRuns((prev) => [data.run!, ...prev.filter((r) => r.id !== data.run!.id)].slice(0, 5));
        if (data.run.mode === "autonomous" && data.run.autoRunStatus === "running") {
          void runAutonomousLoop(data.run);
        }
      } else {
        showToast(actionError(res, data));
      }
    } catch {
      showToast("Could not start mission. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStepAction(
    action: "approve" | "reject" | "regenerate",
    stepId: EmployeeStepId
  ) {
    if (!run || actionLoading) return;
    setActionLoading(true);
    try {
      const { res, data } = await apiPost({ action, runId: run.id, stepId });

      if (res.status === 402) {
        showToast(data.error ?? "Insufficient credits");
        return;
      }
      if (res.ok && data.run) {
        setRun(data.run);
        if (action === "approve" && data.run.status === "completed") {
          showToast("Marketing package complete!");
        }
      } else {
        showToast(actionError(res, data));
      }
    } catch {
      showToast("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApproveAll() {
    if (!run || actionLoading) return;
    setActionLoading(true);
    try {
      const { res, data } = await apiPost({ action: "approve_all", runId: run.id });
      if (res.ok && data.run) {
        setRun(data.run);
        showToast("All deliverables approved and saved!");
      } else {
        showToast(actionError(res, data));
      }
    } catch {
      showToast("Could not approve all steps. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePublish() {
    if (!run || actionLoading) return;
    setActionLoading(true);
    try {
      const { res, data } = await apiPost({ action: "publish", runId: run.id });
      if (res.ok && data.run) {
        setRun(data.run);
        showToast("Publishing schedule synced to calendar!");
      } else {
        showToast(actionError(res, data));
      }
    } catch {
      showToast("Could not sync to calendar. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col lg:h-[calc(100vh-5rem)]">
      <header className="mb-4 shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 via-violet-600 to-cyan-600 shadow-lg shadow-brand-500/20">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0a0a0c] bg-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-white">AI Marketing Employee</h1>
              <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-brand-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                Flagship
              </span>
            </div>
            <p className="text-sm text-content-muted">
              {run
                ? `Mission: ${run.goal}`
                : "Enter a business goal — your autonomous marketing manager handles the rest"}
            </p>
          </div>
          {run && (
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide",
                run.status === "completed"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : run.status === "review"
                    ? "bg-amber-500/15 text-amber-400"
                    : run.status === "paused"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-brand-500/15 text-brand-300"
              )}
            >
              {run.status}
            </span>
          )}
        </div>

        {!run && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (planId === "free") {
                  showToast("Autonomous mode requires Creator plan or higher");
                  return;
                }
                setMode("autonomous");
              }}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
                mode === "autonomous"
                  ? "border-brand-500/50 bg-brand-500/10 text-white"
                  : "border-white/10 text-content-muted hover:border-white/20",
                planId === "free" && "opacity-60"
              )}
            >
              <Zap className="h-4 w-4 text-amber-400" />
              Autonomous
              {planId === "free" && (
                <span className="text-[10px] text-amber-400">Creator+</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMode("guided")}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
                mode === "guided"
                  ? "border-brand-500/50 bg-brand-500/10 text-white"
                  : "border-white/10 text-content-muted hover:border-white/20"
              )}
            >
              <Sparkles className="h-4 w-4" />
              Guided (step-by-step)
            </button>
          </div>
        )}
      </header>

      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#08080a] shadow-2xl lg:grid lg:grid-cols-[1fr_420px]">
        <div className="flex min-h-0 flex-col border-r border-white/[0.06]">
          {run?.mode === "autonomous" && (
            <div className="border-b border-white/[0.06] p-4">
              <EmployeeAutonomousDashboard
                goal={run.goal}
                steps={run.steps}
                generationProgress={run.generationProgress}
                autoRunning={autoRunning}
              />
            </div>
          )}

          <EmployeeChat messages={run?.messages ?? []} loading={loading} />

          {!run && (
            <div className="border-t border-white/[0.06] px-4 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
                Business goals
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
            {!run && (
              <div className="mb-3">
                <CreditCostPreview
                  mode={mode}
                  planId={planId}
                  creditsRemaining={creditsRemaining}
                />
              </div>
            )}
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
                    ? "Mission in progress — review deliverables on the right →"
                    : 'Enter your business goal, e.g. "Get 50 qualified leads per month"'
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
                {mode === "autonomous"
                  ? `Autonomous pipeline — ~${estimateEmployeeRunCredits("autonomous")} credits total`
                  : `Guided mode — starts at ${estimateEmployeeRunCredits("guided")} credits`}
              </p>
            )}
          </div>
        </div>

        <div className="hidden min-h-0 flex-col overflow-y-auto bg-gradient-to-b from-white/[0.02] to-transparent p-4 lg:flex">
          <h2 className="mb-1 text-sm font-semibold text-white">Deliverables</h2>
          <p className="mb-4 text-[11px] text-content-muted">
            Strategy → pillars → posts → images → publishing schedule
          </p>

          {run ? (
            <>
              {(run.status === "review" || run.mode === "autonomous") && (
                <div className="mb-4">
                  <EmployeeApprovalWorkflow
                    steps={run.steps}
                    status={run.status}
                    publishedAt={run.publishedAt}
                    busy={actionLoading}
                    onApproveAll={handleApproveAll}
                    onPublish={handlePublish}
                  />
                </div>
              )}

              {run.mode === "guided" && (
                <EmployeeProgressPanel steps={run.steps} progress={run.progress} />
              )}

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

              {(run.status === "completed" || run.status === "review") && !autoRunning && (
                <div className="mt-4 space-y-2">
                  {run.status === "review" && !run.publishedAt && (
                    <Link
                      href="/dashboard/calendar"
                      className="btn-primary flex w-full items-center justify-center gap-2"
                    >
                      Open content calendar
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setRun(null)}
                    className="btn-secondary w-full"
                  >
                    Start new mission
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-6 text-center">
                <Briefcase className="h-10 w-10 text-content-subtle" />
                <p className="mt-3 text-sm text-content-muted">
                  Your autonomous marketing employee will generate strategy, content pillars,
                  posts, images, and a publishing schedule — all from one business goal.
                </p>
              </div>

              {recentRuns.length > 0 && (
                <div className="mt-4 border-t border-white/[0.06] pt-4">
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
                    <History className="h-3 w-3" />
                    Recent missions
                  </p>
                  <div className="space-y-2">
                    {recentRuns.slice(0, 3).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRun(r)}
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left text-xs transition hover:border-brand-500/30"
                      >
                        <p className="truncate font-medium text-white">{r.goal}</p>
                        <p className="text-[10px] capitalize text-content-subtle">
                          {r.status} · {r.generationProgress}% generated
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {run && (
        <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-3 lg:hidden">
          {run.mode === "autonomous" && (
            <EmployeeAutonomousDashboard
              goal={run.goal}
              steps={run.steps}
              generationProgress={run.generationProgress}
              autoRunning={autoRunning}
            />
          )}
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
