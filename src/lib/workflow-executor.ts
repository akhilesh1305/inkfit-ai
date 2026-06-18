import { addDays, format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { generateBlog, generateImage, generateLinkedInCarousel } from "@/lib/ai";
import { getPlanById } from "@/lib/billing";
import { requireCredits } from "@/lib/credit-service";
import type { CreditActionType } from "@/lib/credits";
import { getKnowledgeContextForUser } from "@/lib/knowledge-context";
import { generateLinkedInPost, type LinkedInContentType } from "@/lib/linkedin-content";
import { generateSEOArticle } from "@/lib/seo-content";
import type { BrandKit } from "@/lib/brand";
import {
  getExecutionOrder,
  parseWorkflowGraph,
  WORKFLOW_NODE_META,
  type WorkflowGraph,
  type WorkflowNode,
  type WorkflowRunResult,
  type WorkflowStepResult,
} from "@/lib/workflows";

export interface WorkflowContext {
  topic: string;
  audience: string;
  targetKeyword: string;
  blog?: string;
  seoArticle?: string;
  linkedin?: string;
  carousel?: string;
  imageUrl?: string;
  imagePrompt?: string;
  calendarEventId?: string;
  scheduledPostId?: string;
}

async function getBrand(): Promise<BrandKit | undefined> {
  const brand = await prisma.brandKit.findFirst({ orderBy: { updatedAt: "desc" } });
  if (!brand) return undefined;
  return {
    companyName: brand.companyName,
    primaryColor: brand.primaryColor,
    secondaryColor: brand.secondaryColor,
    accentColor: brand.accentColor,
    targetAudience: brand.targetAudience,
    writingStyle: brand.writingStyle,
    tone: brand.tone,
    industry: brand.industry ?? undefined,
  };
}

async function gateStep(
  userId: string,
  planId: string,
  action: CreditActionType
): Promise<{ ok: true } | { ok: false; error: string }> {
  const plan = getPlanById(planId);
  const result = await requireCredits(userId, planId, plan.name, action);
  if (!result.ok) {
    return { ok: false, error: result.error ?? "Insufficient credits" };
  }
  return { ok: true };
}

function truncate(text: string, max = 200): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max)}…`;
}

async function executeNode(
  node: WorkflowNode,
  ctx: WorkflowContext,
  userId: string,
  planId: string,
  knowledgeContext?: string
): Promise<{ output: string; preview: string }> {
  const brand = await getBrand();
  const meta = WORKFLOW_NODE_META[node.type];
  const topic = node.config.topic || ctx.topic;
  const audience = ctx.audience || brand?.targetAudience || "professionals";

  switch (node.type) {
    case "blog_generator": {
      const gate = await gateStep(userId, planId, "content_generation");
      if (!gate.ok) throw new Error(gate.error);

      const content = await generateBlog({
        topic,
        tone: node.config.tone ?? "professional",
        length: node.config.length ?? "medium",
        audience,
        brand,
        knowledgeContext,
      });
      ctx.blog = content;
      return { output: content, preview: truncate(content) };
    }

    case "seo_writer": {
      const gate = await gateStep(userId, planId, "seo_article");
      if (!gate.ok) throw new Error(gate.error);

      const keyword = node.config.targetKeyword || ctx.targetKeyword || topic;
      const article = generateSEOArticle({ topic, targetKeyword: keyword, audience });
      const full = article.fullArticle;
      ctx.seoArticle = full;
      ctx.targetKeyword = keyword;
      return {
        output: full,
        preview: `${article.seoTitle} · Score ${article.seoScore}/100`,
      };
    }

    case "linkedin_generator": {
      const gate = await gateStep(userId, planId, "content_generation");
      if (!gate.ok) throw new Error(gate.error);

      const sourceTopic = ctx.blog ? truncate(ctx.blog, 120) : topic;
      const post = generateLinkedInPost({
        topic: sourceTopic,
        targetAudience: audience,
        contentType:
          (node.config.contentType as LinkedInContentType) ?? "thought-leadership",
      });
      const full = `${post.hook}\n\n${post.mainContent}\n\n${post.cta}`;
      ctx.linkedin = full;
      return {
        output: full,
        preview: `${post.hook} (Hook score: ${post.hookScore})`,
      };
    }

    case "carousel_generator": {
      const gate = await gateStep(userId, planId, "content_generation");
      if (!gate.ok) throw new Error(gate.error);

      const content = await generateLinkedInCarousel({
        topic: ctx.blog ? truncate(ctx.blog, 80) : topic,
        slides: node.config.slides ?? 7,
        brand,
      });
      ctx.carousel = content;
      return { output: content, preview: truncate(content) };
    }

    case "image_studio": {
      const gate = await gateStep(userId, planId, "ai_image");
      if (!gate.ok) throw new Error(gate.error);

      const prompt =
        ctx.blog?.split("\n")[0]?.replace(/^#+\s*/, "") ||
        ctx.linkedin?.split("\n")[0] ||
        topic;
      const styleId = (node.config.imageStyle ?? "modern-saas") as
        | "modern-saas"
        | "corporate"
        | "minimal";
      const aspectRatio = (node.config.aspectRatio ?? "1:1") as "1:1" | "16:9";

      const result = await generateImage({
        prompt,
        style: styleId,
        styleId,
        size: aspectRatio === "16:9" ? "1792x1024" : "1024x1024",
        aspectRatio,
      });

      ctx.imageUrl = result.url;
      ctx.imagePrompt = prompt;

      await prisma.imageStudioItem.create({
        data: {
          userId,
          prompt,
          style: styleId,
          aspectRatio,
          url: result.url,
          favorite: false,
        },
      });

      return {
        output: result.url,
        preview: `Image generated: "${truncate(prompt, 60)}"`,
      };
    }

    case "calendar": {
      const title =
        ctx.linkedin?.split("\n")[0] ||
        ctx.blog?.split("\n")[0]?.replace(/^#+\s*/, "") ||
        topic;
      const content = ctx.linkedin || ctx.blog || ctx.seoArticle || topic;
      const days = node.config.daysFromNow ?? 3;
      const eventDate = format(addDays(new Date(), days), "yyyy-MM-dd");
      const platform = node.config.platform ?? "linkedin";
      const action = node.config.calendarAction ?? "schedule_post";

      const event = await prisma.calendarEvent.create({
        data: {
          title: truncate(title, 80),
          type: "linkedin",
          date: eventDate,
          status: action === "schedule_post" ? "scheduled" : "draft",
          platform,
          content: truncate(content, 500),
        },
      });
      ctx.calendarEventId = event.id;

      if (action === "schedule_post") {
        const scheduledAt = addDays(new Date(), days);
        scheduledAt.setHours(9, 0, 0, 0);

        const post = await prisma.scheduledPost.create({
          data: {
            userId,
            platform,
            title: truncate(title, 80),
            content: truncate(content, 2000),
            status: "scheduled",
            scheduledAt,
          },
        });
        ctx.scheduledPostId = post.id;

        return {
          output: JSON.stringify({ eventId: event.id, postId: post.id, date: eventDate }),
          preview: `Scheduled for ${format(scheduledAt, "MMM d, yyyy 'at' h:mm a")}`,
        };
      }

      return {
        output: JSON.stringify({ eventId: event.id, date: eventDate }),
        preview: `Added to calendar: ${eventDate}`,
      };
    }

    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

export async function runWorkflow(
  userId: string,
  planId: string,
  graph: WorkflowGraph,
  runId: string
): Promise<WorkflowRunResult> {
  const order = getExecutionOrder(graph.nodes, graph.edges);
  const knowledgeContext = await getKnowledgeContextForUser(userId);

  const ctx: WorkflowContext = {
    topic: graph.input.topic || "Content marketing",
    audience: graph.input.audience || "professionals",
    targetKeyword: graph.input.targetKeyword || graph.input.topic || "content marketing",
  };

  const steps: WorkflowStepResult[] = order.map((node) => ({
    nodeId: node.id,
    type: node.type,
    label: WORKFLOW_NODE_META[node.type].label,
    status: "pending" as const,
  }));

  await prisma.workflowRun.update({
    where: { id: runId },
    data: { steps: JSON.stringify(steps) },
  });

  for (let i = 0; i < order.length; i++) {
    const node = order[i];
    const started = Date.now();

    steps[i].status = "running";
    await prisma.workflowRun.update({
      where: { id: runId },
      data: { steps: JSON.stringify(steps) },
    });

    try {
      const { output, preview } = await executeNode(
        node,
        ctx,
        userId,
        planId,
        knowledgeContext
      );
      steps[i] = {
        ...steps[i],
        status: "completed",
        output,
        preview,
        durationMs: Date.now() - started,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      steps[i] = {
        ...steps[i],
        status: "failed",
        error: message,
        durationMs: Date.now() - started,
      };

      await prisma.workflowRun.update({
        where: { id: runId },
        data: {
          status: "failed",
          error: message,
          steps: JSON.stringify(steps),
          completedAt: new Date(),
        },
      });

      return { runId, status: "failed", steps, error: message };
    }

    await prisma.workflowRun.update({
      where: { id: runId },
      data: { steps: JSON.stringify(steps) },
    });
  }

  await prisma.workflowRun.update({
    where: { id: runId },
    data: {
      status: "completed",
      steps: JSON.stringify(steps),
      completedAt: new Date(),
    },
  });

  return { runId, status: "completed", steps };
}

export async function runWorkflowById(
  userId: string,
  planId: string,
  workflowId: string
): Promise<WorkflowRunResult> {
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId },
  });
  if (!workflow) throw new Error("Workflow not found");

  const graph = parseWorkflowGraph(workflow.nodes, workflow.edges, workflow.input);

  const run = await prisma.workflowRun.create({
    data: {
      userId,
      workflowId,
      status: "running",
      steps: "[]",
    },
  });

  await prisma.workflow.update({
    where: { id: workflowId },
    data: { lastRunAt: new Date(), status: "active" },
  });

  return runWorkflow(userId, planId, graph, run.id);
}
