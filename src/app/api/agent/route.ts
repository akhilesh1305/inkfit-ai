import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gateAuth, gateCredits, chargeAfterGate } from "@/lib/credit-api";
import { saveGeneratedContent } from "@/lib/persistence";
import { generateAgentResponse, conversationTitle } from "@/lib/content-agent";
import { generateText } from "@/lib/ai/providers";
import { formatBrandContext, buildAIContext } from "@/lib/ai/context";
import { SYSTEM_ROLES } from "@/lib/ai/prompts";

function mapConversation(row: {
  id: string;
  title: string;
  updatedAt: Date;
  messages: { id: string; role: string; content: string; createdAt: Date }[];
}) {
  return {
    id: row.id,
    title: row.title,
    updatedAt: row.updatedAt.toISOString(),
    messages: row.messages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
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
      const conv = await prisma.agentConversation.findFirst({
        where: { id, userId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
      if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ conversation: mapConversation(conv) });
    }

    const [conversations, savedPrompts] = await Promise.all([
      prisma.agentConversation.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 50,
        include: { messages: { orderBy: { createdAt: "asc" }, take: 1 } },
      }),
      prisma.savedAgentPrompt.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      conversations: conversations.map((c) => mapConversation(c)),
      savedPrompts: savedPrompts.map((p) => p.prompt),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

async function generateAgentReply(prompt: string, userId: string): Promise<string> {
  const ctx = await buildAIContext(userId);
  const brandCtx = formatBrandContext(ctx);

  try {
    const { text, live } = await generateText({
      system: `${SYSTEM_ROLES.copywriter} You are InkFit AI Content Agent — a marketing employee that delivers actionable content plans, posts, and strategies.`,
      user: prompt,
      maxTokens: 2000,
      brandContext: brandCtx,
      userId,
      feature: "agent",
    });
    if (live && text.trim()) return text.trim();
  } catch {
    /* fallback */
  }

  return generateAgentResponse(prompt);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "delete") {
      const auth = await gateAuth("content:delete");
      if (!auth.ok) return auth.response;
      const userId = auth.ctx.user.id;

      await prisma.agentConversation.deleteMany({
        where: { id: body.conversationId, userId },
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "save-prompt") {
      const auth = await gateAuth("content:write");
      if (!auth.ok) return auth.response;
      const userId = auth.ctx.user.id;

      const prompt = String(body.prompt ?? "").trim();
      if (!prompt) {
        return NextResponse.json({ error: "Prompt required" }, { status: 400 });
      }
      await prisma.savedAgentPrompt.upsert({
        where: { userId_prompt: { userId, prompt } },
        create: { userId, prompt },
        update: {},
      });
      const saved = await prisma.savedAgentPrompt.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return NextResponse.json({ savedPrompts: saved.map((p) => p.prompt) });
    }

    if (body.action === "remove-prompt") {
      const auth = await gateAuth("content:write");
      if (!auth.ok) return auth.response;
      const userId = auth.ctx.user.id;

      await prisma.savedAgentPrompt.deleteMany({
        where: { userId, prompt: String(body.prompt) },
      });
      const saved = await prisma.savedAgentPrompt.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return NextResponse.json({ savedPrompts: saved.map((p) => p.prompt) });
    }

    const prompt = String(body.prompt ?? "").trim();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    const gate = await gateCredits("agent_request");
    if (!gate.ok) return gate.response;
    const userId = gate.userId;

    let conversationId = body.conversationId as string | undefined;

    if (!conversationId) {
      const conv = await prisma.agentConversation.create({
        data: {
          userId,
          title: conversationTitle(prompt),
        },
      });
      conversationId = conv.id;
    } else {
      const existing = await prisma.agentConversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (!existing) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }
    }

    await prisma.agentMessage.create({
      data: {
        conversationId,
        role: "user",
        content: prompt,
      },
    });

    const response = await generateAgentReply(prompt, userId);

    await prisma.agentMessage.create({
      data: {
        conversationId,
        role: "assistant",
        content: response,
      },
    });

    await prisma.agentConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    await saveGeneratedContent({
      userId,
      feature: "agent",
      title: conversationTitle(prompt),
      body: response,
      metadata: { conversationId, userPrompt: prompt },
    });

    const conversation = await prisma.agentConversation.findFirst({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    await chargeAfterGate(gate, "agent_request");
    return NextResponse.json({
      response,
      conversation: conversation ? mapConversation(conversation) : null,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
