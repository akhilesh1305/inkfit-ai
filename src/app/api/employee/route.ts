import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gateAuth } from "@/lib/credit-api";
import { AIEngine } from "@/lib/ai/engine";
import { resolveBillingContext } from "@/lib/billing-service";
import { getEmployeeStepCredit } from "@/lib/employee-credits";
import { executeEmployeeStepAI } from "@/lib/ai/generations";
import { persistApprovedEmployeeRun } from "@/lib/employee-persistence";
import {
  computeGenerationProgress,
  computeProgress,
  createInitialSteps,
  employeeApprovedMessage,
  employeeAutonomousCompleteMessage,
  employeeIntroMessage,
  employeeStepCompleteMessage,
  getNextPendingStep,
  getStepsAwaitingReview,
  EMPLOYEE_STEPS,
  type EmployeeMessage,
  type EmployeeRun,
  type EmployeeRunMode,
  type EmployeeStep,
  type EmployeeStepId,
} from "@/lib/marketing-employee";

function parseMessages(json: string): EmployeeMessage[] {
  try {
    return JSON.parse(json) as EmployeeMessage[];
  } catch {
    return [];
  }
}

function parseSteps(json: string): EmployeeStep[] {
  try {
    return JSON.parse(json) as EmployeeStep[];
  } catch {
    return createInitialSteps();
  }
}

function newMessage(
  role: EmployeeMessage["role"],
  content: string,
  stepId?: EmployeeStepId
): EmployeeMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
    stepId,
  };
}

function mapRun(row: {
  id: string;
  goal: string;
  status: string;
  mode: string;
  autoRunStatus: string | null;
  messages: string;
  steps: string;
  currentStepId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): EmployeeRun {
  const steps = parseSteps(row.steps);
  return {
    id: row.id,
    goal: row.goal,
    status: row.status as EmployeeRun["status"],
    mode: (row.mode as EmployeeRunMode) ?? "guided",
    autoRunStatus: row.autoRunStatus as EmployeeRun["autoRunStatus"],
    messages: parseMessages(row.messages),
    steps,
    currentStepId: row.currentStepId as EmployeeStepId | null,
    progress: computeProgress(steps),
    generationProgress: computeGenerationProgress(steps),
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function executeStepWithCredits(
  steps: EmployeeStep[],
  stepId: EmployeeStepId,
  goal: string,
  userId: string,
  mode: EmployeeRunMode
): Promise<{ steps: EmployeeStep[]; error?: NextResponse }> {
  const spec = getEmployeeStepCredit(stepId);
  const now = new Date().toISOString();
  const running = steps.map((s) =>
    s.id === stepId ? { ...s, status: "running" as const, startedAt: now, error: undefined } : s
  );

  const result = await AIEngine.runForRoute(spec.action, spec.quantity, async () => {
    const { output, preview, live } = await executeEmployeeStepAI(stepId, goal, { userId });
    return { data: { output, preview, live } };
  });

  if (!result.ok) {
    return { steps, error: result.response };
  }

  const reviewStatus =
    mode === "autonomous" ? ("pending_review" as const) : ("awaiting_approval" as const);
  const { output, preview } = result.data;

  return {
    steps: running.map((s) =>
      s.id === stepId
        ? { ...s, status: reviewStatus, output, preview, completedAt: now }
        : s
    ),
  };
}

export async function GET(req: Request) {
  try {
    const auth = await gateAuth("content:read");
    if (!auth.ok) return auth.response;
    const userId = auth.ctx.user.id;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const row = await prisma.marketingEmployeeRun.findFirst({
        where: { id, userId },
      });
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ run: mapRun(row) });
    }

    const rows = await prisma.marketingEmployeeRun.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ runs: rows.map(mapRun) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await gateAuth("content:write");
    if (!auth.ok) return auth.response;
    const userId = auth.ctx.user.id;

    const body = await req.json();

    if (body.action === "start") {
      const goal = String(body.goal ?? "").trim();
      if (!goal) {
        return NextResponse.json({ error: "Goal is required" }, { status: 400 });
      }

      const mode = (body.mode === "autonomous" ? "autonomous" : "guided") as EmployeeRunMode;

      if (mode === "autonomous") {
        const billing = await resolveBillingContext(userId);
        if (billing.planId === "free") {
          return NextResponse.json(
            {
              error: "Autonomous mode requires a Creator plan or higher.",
              upgradeUrl: "/dashboard/billing?upgrade=creator",
            },
            { status: 402 }
          );
        }
      }

      const steps = createInitialSteps();
      const firstStepId: EmployeeStepId = "strategy";
      const { steps: executedSteps, error: stepError } = await executeStepWithCredits(
        steps,
        firstStepId,
        goal,
        userId,
        mode
      );
      if (stepError) return stepError;

      const messages: EmployeeMessage[] = [
        newMessage("user", goal),
        newMessage("employee", employeeIntroMessage(goal, mode)),
        newMessage("employee", employeeStepCompleteMessage(firstStepId, mode), firstStepId),
      ];

      const isAutonomous = mode === "autonomous";
      const hasMore = getNextPendingStep(executedSteps);

      const row = await prisma.marketingEmployeeRun.create({
        data: {
          userId,
          goal,
          mode,
          status: isAutonomous && hasMore ? "active" : isAutonomous ? "review" : "active",
          autoRunStatus: isAutonomous ? (hasMore ? "running" : "done") : null,
          messages: JSON.stringify(
            isAutonomous && !hasMore
              ? [...messages, newMessage("employee", employeeAutonomousCompleteMessage())]
              : messages
          ),
          steps: JSON.stringify(executedSteps),
          currentStepId: firstStepId,
        },
      });

      return NextResponse.json({ run: mapRun(row) });
    }

    const runId = String(body.runId ?? "");
    const row = await prisma.marketingEmployeeRun.findFirst({
      where: { id: runId, userId },
    });
    if (!row) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    let steps = parseSteps(row.steps);
    let messages = parseMessages(row.messages);
    const goal = row.goal;
    const mode = (row.mode as EmployeeRunMode) ?? "guided";

    if (body.action === "autonomous_tick") {
      if (mode !== "autonomous" || row.autoRunStatus !== "running") {
        return NextResponse.json({ run: mapRun(row) });
      }

      const next = getNextPendingStep(steps);
      if (!next) {
        const updated = await prisma.marketingEmployeeRun.update({
          where: { id: runId },
          data: {
            status: "review",
            autoRunStatus: "done",
            currentStepId: null,
            messages: JSON.stringify([
              ...messages,
              newMessage("employee", employeeAutonomousCompleteMessage()),
            ]),
          },
        });
        return NextResponse.json({ run: mapRun(updated) });
      }

      const { steps: nextSteps, error: tickError } = await executeStepWithCredits(
        steps,
        next.id,
        goal,
        userId,
        mode
      );
      if (tickError) return tickError;
      steps = nextSteps;
      messages = [
        ...messages,
        newMessage("employee", employeeStepCompleteMessage(next.id, mode), next.id),
      ];

      const stillPending = getNextPendingStep(steps);
      const updated = await prisma.marketingEmployeeRun.update({
        where: { id: runId },
        data: {
          steps: JSON.stringify(steps),
          messages: JSON.stringify(
            stillPending
              ? messages
              : [...messages, newMessage("employee", employeeAutonomousCompleteMessage())]
          ),
          currentStepId: next.id,
          status: stillPending ? "active" : "review",
          autoRunStatus: stillPending ? "running" : "done",
        },
      });
      return NextResponse.json({ run: mapRun(updated) });
    }

    if (body.action === "approve_all") {
      const awaiting = getStepsAwaitingReview(steps);
      if (awaiting.length === 0) {
        return NextResponse.json({ error: "No steps awaiting approval" }, { status: 400 });
      }

      steps = steps.map((s) =>
        s.status === "awaiting_approval" || s.status === "pending_review"
          ? { ...s, status: "approved" as const }
          : s
      );

      const runSnapshot = mapRun({ ...row, steps: JSON.stringify(steps) });
      await persistApprovedEmployeeRun(userId, runSnapshot);

      messages = [
        ...messages,
        newMessage("employee", "All deliverables approved and saved to your workspace."),
      ];

      const updated = await prisma.marketingEmployeeRun.update({
        where: { id: runId },
        data: {
          steps: JSON.stringify(steps),
          messages: JSON.stringify(messages),
          currentStepId: null,
          status: "completed",
        },
      });
      return NextResponse.json({ run: mapRun(updated) });
    }

    if (body.action === "publish") {
      const calendarStep = steps.find((s) => s.id === "calendar" && s.output);
      if (!calendarStep?.output) {
        return NextResponse.json({ error: "No publishing schedule to sync" }, { status: 400 });
      }

      const approvedSteps = steps.map((s) =>
        s.id === "calendar" && s.status !== "approved"
          ? { ...s, status: "approved" as const }
          : s
      );

      const runSnapshot = mapRun({ ...row, steps: JSON.stringify(approvedSteps) });
      await persistApprovedEmployeeRun(userId, runSnapshot);

      const updated = await prisma.marketingEmployeeRun.update({
        where: { id: runId },
        data: {
          steps: JSON.stringify(approvedSteps),
          publishedAt: new Date(),
          messages: JSON.stringify([
            ...messages,
            newMessage(
              "employee",
              "Publishing schedule synced to your content calendar. Posts and images are saved as drafts."
            ),
          ]),
        },
      });
      return NextResponse.json({ run: mapRun(updated) });
    }

    if (body.action === "approve") {
      const stepId = body.stepId as EmployeeStepId;
      const step = steps.find((s) => s.id === stepId);
      if (!step || (step.status !== "awaiting_approval" && step.status !== "pending_review")) {
        return NextResponse.json({ error: "Step not awaiting approval" }, { status: 400 });
      }

      steps = steps.map((s) =>
        s.id === stepId ? { ...s, status: "approved" as const } : s
      );

      if (step.output) {
        const { persistEmployeeStep } = await import("@/lib/employee-persistence");
        await persistEmployeeStep(userId, goal, stepId, step.output);
      }

      messages = [...messages, newMessage("employee", employeeApprovedMessage(stepId), stepId)];

      if (mode === "guided") {
        const next = getNextPendingStep(steps);
        if (next) {
          const { steps: guidedSteps, error: guidedError } = await executeStepWithCredits(
            steps,
            next.id,
            goal,
            userId,
            mode
          );
          if (guidedError) return guidedError;
          steps = guidedSteps;
          messages = [
            ...messages,
            newMessage("employee", employeeStepCompleteMessage(next.id, mode), next.id),
          ];

          const updated = await prisma.marketingEmployeeRun.update({
            where: { id: runId },
            data: {
              steps: JSON.stringify(steps),
              messages: JSON.stringify(messages),
              currentStepId: next.id,
              status: "active",
            },
          });
          return NextResponse.json({ run: mapRun(updated) });
        }
      }

      const allApproved = steps.every((s) => s.status === "approved");
      const updated = await prisma.marketingEmployeeRun.update({
        where: { id: runId },
        data: {
          steps: JSON.stringify(steps),
          messages: JSON.stringify(messages),
          currentStepId: null,
          status: allApproved ? "completed" : mode === "autonomous" ? "review" : "active",
        },
      });
      return NextResponse.json({ run: mapRun(updated) });
    }

    if (body.action === "reject") {
      const stepId = body.stepId as EmployeeStepId;
      steps = steps.map((s) =>
        s.id === stepId ? { ...s, status: "rejected" as const } : s
      );
      messages = [
        ...messages,
        newMessage(
          "employee",
          `Noted — **${getStepMeta(stepId).title}** marked for revision. Regenerate when you're ready.`,
          stepId
        ),
      ];

      const updated = await prisma.marketingEmployeeRun.update({
        where: { id: runId },
        data: {
          steps: JSON.stringify(steps),
          messages: JSON.stringify(messages),
          status: mode === "autonomous" ? "review" : "paused",
          autoRunStatus: mode === "autonomous" ? "done" : row.autoRunStatus,
        },
      });
      return NextResponse.json({ run: mapRun(updated) });
    }

    if (body.action === "regenerate") {
      const stepId = body.stepId as EmployeeStepId;
      steps = steps.map((s) =>
        s.id === stepId
          ? { ...s, status: "pending" as const, output: undefined, preview: undefined, error: undefined }
          : s
      );
      const { steps: regenSteps, error: regenError } = await executeStepWithCredits(
        steps,
        stepId,
        goal,
        userId,
        mode
      );
      if (regenError) return regenError;
      steps = regenSteps;
      messages = [
        ...messages,
        newMessage(
          "employee",
          `Regenerated **${getStepMeta(stepId).title}** — review the updated version.`,
          stepId
        ),
      ];

      const updated = await prisma.marketingEmployeeRun.update({
        where: { id: runId },
        data: {
          steps: JSON.stringify(steps),
          messages: JSON.stringify(messages),
          currentStepId: stepId,
          status: mode === "autonomous" ? "review" : "active",
          autoRunStatus: mode === "autonomous" ? "done" : row.autoRunStatus,
        },
      });
      return NextResponse.json({ run: mapRun(updated) });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function getStepMeta(stepId: EmployeeStepId) {
  return EMPLOYEE_STEPS.find((s) => s.id === stepId) ?? EMPLOYEE_STEPS[0];
}
