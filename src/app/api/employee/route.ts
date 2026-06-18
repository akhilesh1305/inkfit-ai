import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gateCredits } from "@/lib/credit-api";
import {
  computeProgress,
  createInitialSteps,
  employeeApprovedMessage,
  employeeIntroMessage,
  employeeStepCompleteMessage,
  executeEmployeeStep,
  getNextPendingStep,
  type EmployeeMessage,
  type EmployeeRun,
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
  messages: string;
  steps: string;
  currentStepId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): EmployeeRun {
  const steps = parseSteps(row.steps);
  return {
    id: row.id,
    goal: row.goal,
    status: row.status as EmployeeRun["status"],
    messages: parseMessages(row.messages),
    steps,
    currentStepId: row.currentStepId as EmployeeStepId | null,
    progress: computeProgress(steps),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function runStep(
  steps: EmployeeStep[],
  stepId: EmployeeStepId,
  goal: string
): Promise<EmployeeStep[]> {
  const now = new Date().toISOString();
  const running = steps.map((s) =>
    s.id === stepId ? { ...s, status: "running" as const, startedAt: now } : s
  );

  await new Promise((r) => setTimeout(r, 800));

  const { output, preview } = executeEmployeeStep(stepId, goal);
  const completed = now;

  return running.map((s) =>
    s.id === stepId
      ? {
          ...s,
          status: "awaiting_approval" as const,
          output,
          preview,
          completedAt: completed,
        }
      : s
  );
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const row = await prisma.marketingEmployeeRun.findFirst({
        where: { id, userId: session.id },
      });
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ run: mapRun(row) });
    }

    const rows = await prisma.marketingEmployeeRun.findMany({
      where: { userId: session.id },
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
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "start") {
      const gate = await gateCredits("agent_request");
      if (!gate.ok) return gate.response;

      const goal = String(body.goal ?? "").trim();
      if (!goal) {
        return NextResponse.json({ error: "Goal is required" }, { status: 400 });
      }

      const steps = createInitialSteps();
      const firstStepId: EmployeeStepId = "strategy";
      const executedSteps = await runStep(steps, firstStepId, goal);

      const messages: EmployeeMessage[] = [
        newMessage("user", goal),
        newMessage("employee", employeeIntroMessage(goal)),
        newMessage("employee", employeeStepCompleteMessage(firstStepId), firstStepId),
      ];

      const row = await prisma.marketingEmployeeRun.create({
        data: {
          userId: session.id,
          goal,
          status: "active",
          messages: JSON.stringify(messages),
          steps: JSON.stringify(executedSteps),
          currentStepId: firstStepId,
        },
      });

      return NextResponse.json({ run: mapRun(row) });
    }

    const runId = String(body.runId ?? "");
    const row = await prisma.marketingEmployeeRun.findFirst({
      where: { id: runId, userId: session.id },
    });
    if (!row) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    let steps = parseSteps(row.steps);
    let messages = parseMessages(row.messages);
    const goal = row.goal;

    if (body.action === "approve") {
      const stepId = body.stepId as EmployeeStepId;
      const step = steps.find((s) => s.id === stepId);
      if (!step || step.status !== "awaiting_approval") {
        return NextResponse.json({ error: "Step not awaiting approval" }, { status: 400 });
      }

      steps = steps.map((s) =>
        s.id === stepId ? { ...s, status: "approved" as const } : s
      );
      messages = [...messages, newMessage("employee", employeeApprovedMessage(stepId), stepId)];

      const next = getNextPendingStep(steps);
      if (next) {
        const gate = await gateCredits("agent_request");
        if (!gate.ok) return gate.response;

        steps = await runStep(steps, next.id, goal);
        messages = [
          ...messages,
          newMessage("employee", employeeStepCompleteMessage(next.id), next.id),
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

    if (body.action === "reject") {
      const stepId = body.stepId as EmployeeStepId;
      steps = steps.map((s) =>
        s.id === stepId ? { ...s, status: "rejected" as const } : s
      );
      messages = [
        ...messages,
        newMessage(
          "employee",
          `Noted — **${stepId.replace(/_/g, " ")}** marked for revision. Regenerate when you're ready, or approve a new version.`,
          stepId
        ),
      ];

      const updated = await prisma.marketingEmployeeRun.update({
        where: { id: runId },
        data: {
          steps: JSON.stringify(steps),
          messages: JSON.stringify(messages),
          status: "paused",
        },
      });
      return NextResponse.json({ run: mapRun(updated) });
    }

    if (body.action === "regenerate") {
      const stepId = body.stepId as EmployeeStepId;
      const gate = await gateCredits("agent_request");
      if (!gate.ok) return gate.response;

      steps = steps.map((s) =>
        s.id === stepId
          ? { ...s, status: "pending" as const, output: undefined, preview: undefined }
          : s
      );
      steps = await runStep(steps, stepId, goal);
      messages = [
        ...messages,
        newMessage("employee", `Regenerated **${stepId.replace(/_/g, " ")}** — review the updated version.`, stepId),
      ];

      const updated = await prisma.marketingEmployeeRun.update({
        where: { id: runId },
        data: {
          steps: JSON.stringify(steps),
          messages: JSON.stringify(messages),
          currentStepId: stepId,
          status: "active",
        },
      });
      return NextResponse.json({ run: mapRun(updated) });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
