import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runWorkflowById } from "@/lib/workflow-executor";
import {
  createStarterWorkflow,
  parseWorkflowGraph,
  serializeWorkflowGraph,
  type WorkflowGraph,
  type WorkflowSummary,
} from "@/lib/workflows";

function mapSummary(row: {
  id: string;
  name: string;
  description: string | null;
  status: string;
  nodes: string;
  lastRunAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): WorkflowSummary {
  let nodeCount = 0;
  try {
    nodeCount = (JSON.parse(row.nodes) as unknown[]).length;
  } catch {
    nodeCount = 0;
  }
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status,
    nodeCount,
    lastRunAt: row.lastRunAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapWorkflow(row: {
  id: string;
  name: string;
  description: string | null;
  nodes: string;
  edges: string;
  input: string;
  status: string;
  lastRunAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status,
    lastRunAt: row.lastRunAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    graph: parseWorkflowGraph(row.nodes, row.edges, row.input),
  };
}

async function seedDemoWorkflow(userId: string) {
  const graph = createStarterWorkflow();
  const serialized = serializeWorkflowGraph(graph);
  await prisma.workflow.create({
    data: {
      userId,
      name: "Blog → LinkedIn → Image → Schedule",
      description: "Generate blog, repurpose to LinkedIn, create image, and schedule",
      ...serialized,
      status: "active",
    },
  });
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
      const row = await prisma.workflow.findFirst({
        where: { id, userId: session.id },
      });
      if (!row) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ workflow: mapWorkflow(row) });
    }

    let rows = await prisma.workflow.findMany({
      where: { userId: session.id },
      orderBy: { updatedAt: "desc" },
      take: 30,
    });

    if (rows.length === 0) {
      await seedDemoWorkflow(session.id);
      rows = await prisma.workflow.findMany({
        where: { userId: session.id },
        orderBy: { updatedAt: "desc" },
      });
    }

    return NextResponse.json({
      workflows: rows.map(mapSummary),
    });
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
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    const planId = user?.plan ?? session.plan ?? "free";

    if (body.action === "create") {
      const graph = (body.graph as WorkflowGraph) ?? createStarterWorkflow();
      const serialized = serializeWorkflowGraph(graph);

      const row = await prisma.workflow.create({
        data: {
          userId: session.id,
          name: String(body.name ?? "Untitled Workflow").trim() || "Untitled Workflow",
          description: body.description ? String(body.description) : null,
          ...serialized,
          status: "draft",
        },
      });

      return NextResponse.json({ workflow: mapWorkflow(row) });
    }

    if (body.action === "save") {
      const id = String(body.id ?? "");
      const existing = await prisma.workflow.findFirst({
        where: { id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const graph = body.graph as WorkflowGraph;
      const serialized = serializeWorkflowGraph(graph);

      const row = await prisma.workflow.update({
        where: { id },
        data: {
          name: body.name ? String(body.name).trim() : existing.name,
          description:
            body.description !== undefined
              ? body.description
                ? String(body.description)
                : null
              : existing.description,
          ...serialized,
        },
      });

      return NextResponse.json({ workflow: mapWorkflow(row) });
    }

    if (body.action === "delete") {
      const id = String(body.id ?? "");
      const existing = await prisma.workflow.findFirst({
        where: { id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      await prisma.workflow.delete({ where: { id } });
      await prisma.workflowRun.deleteMany({ where: { workflowId: id, userId: session.id } });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "duplicate") {
      const id = String(body.id ?? "");
      const existing = await prisma.workflow.findFirst({
        where: { id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const row = await prisma.workflow.create({
        data: {
          userId: session.id,
          name: `${existing.name} (copy)`,
          description: existing.description,
          nodes: existing.nodes,
          edges: existing.edges,
          input: existing.input,
          status: "draft",
        },
      });

      return NextResponse.json({ workflow: mapWorkflow(row) });
    }

    if (body.action === "run") {
      const id = String(body.id ?? "");
      const result = await runWorkflowById(session.id, planId, id);
      return NextResponse.json({ run: result });
    }

    if (body.action === "run-status") {
      const runId = String(body.runId ?? "");
      const run = await prisma.workflowRun.findFirst({
        where: { id: runId, userId: session.id },
      });
      if (!run) {
        return NextResponse.json({ error: "Run not found" }, { status: 404 });
      }

      return NextResponse.json({
        run: {
          runId: run.id,
          status: run.status,
          steps: JSON.parse(run.steps),
          error: run.error ?? undefined,
        },
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("Insufficient credits") || message.includes("credits")) {
      return NextResponse.json({ error: message }, { status: 402 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
