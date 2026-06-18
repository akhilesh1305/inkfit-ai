import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generate, hasGeminiKey, hasOpenAIKey } from "@/lib/ai";
import { getKnowledgeContextForUser } from "@/lib/knowledge-context";
import {
  generateMarketingOS,
  getSectionMeta,
  parseMarketingOSData,
  type MarketingOSOutput,
  type MarketingOSSection,
} from "@/lib/marketing-os";

async function enhanceWithAI(
  goal: string,
  base: MarketingOSOutput,
  knowledgeContext?: string
): Promise<MarketingOSOutput> {
  if (!hasGeminiKey() && !hasOpenAIKey()) return base;

  try {
    const raw = await generate(
      "Marketing strategist. Return ONLY valid JSON: { executiveSummary: string, sections: [{ id, title, content }] }. Use markdown in content fields.",
      `Create a complete marketing system for this goal: "${goal}"

Include these section ids exactly: marketing-strategy, content-strategy, content-pillars, audience-personas, funnel-strategy, seo-plan, linkedin-strategy, blog-strategy, content-calendar, weekly-action-plan.

Be specific, actionable, consulting-grade. Content calendar = 30 days table.`,
      4000,
      knowledgeContext
    );
    const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, ""));
    if (parsed.sections?.length >= 5) {
      return {
        ...base,
        executiveSummary: parsed.executiveSummary ?? base.executiveSummary,
        sections: parsed.sections.map((s: MarketingOSSection) => ({
          id: s.id,
          title: s.title ?? getSectionMeta(s.id).title,
          content: s.content,
        })),
        live: true,
      };
    }
  } catch {
    /* use template */
  }
  return base;
}

async function regenerateSectionAI(
  goal: string,
  sectionId: string,
  current: string,
  knowledgeContext?: string
): Promise<string> {
  const meta = getSectionMeta(sectionId);
  const base = generateMarketingOS(goal);
  const fallback = base.sections.find((s) => s.id === sectionId)?.content ?? current;

  if (!hasGeminiKey() && !hasOpenAIKey()) return fallback;

  try {
    const raw = await generate(
      "Marketing strategist. Return ONLY the section content in markdown, no JSON.",
      `Regenerate "${meta.title}" for goal: "${goal}". Previous version:\n${current.slice(0, 1500)}\n\nMake it more specific and actionable.`,
      1500,
      knowledgeContext
    );
    return raw.trim() || fallback;
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saved = await prisma.marketingOSPlan.findMany({
      where: { userId: session.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { id: true, goal: true, title: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ saved });
  } catch {
    return NextResponse.json({ saved: [] });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "generate") {
      const goal = String(body.goal ?? "").trim();
      if (!goal) {
        return NextResponse.json({ error: "Goal is required" }, { status: 400 });
      }

      const base = generateMarketingOS(goal);
      const kb = await getKnowledgeContextForUser(session.id);
      const system = await enhanceWithAI(goal, base, kb);
      return NextResponse.json({ system });
    }

    if (body.action === "regenerate-section") {
      const goal = String(body.goal ?? "").trim();
      const sectionId = String(body.sectionId);
      const current = String(body.content ?? "");
      const kb = await getKnowledgeContextForUser(session.id);
      const content = await regenerateSectionAI(goal, sectionId, current, kb);

      return NextResponse.json({
        section: {
          id: sectionId,
          title: getSectionMeta(sectionId).title,
          content,
        },
        live: hasGeminiKey() || hasOpenAIKey(),
      });
    }

    if (body.action === "save") {
      const data = body.system as MarketingOSOutput;
      if (!data?.goal || !data?.sections) {
        return NextResponse.json({ error: "Invalid system data" }, { status: 400 });
      }

      const payload = JSON.stringify(data);

      if (body.id) {
        const existing = await prisma.marketingOSPlan.findFirst({
          where: { id: body.id, userId: session.id },
        });
        if (!existing) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        const row = await prisma.marketingOSPlan.update({
          where: { id: body.id },
          data: {
            goal: data.goal,
            title: data.title,
            data: payload,
          },
        });
        return NextResponse.json({ id: row.id, saved: true });
      }

      const row = await prisma.marketingOSPlan.create({
        data: {
          userId: session.id,
          goal: data.goal,
          title: data.title,
          data: payload,
        },
      });
      return NextResponse.json({ id: row.id, saved: true });
    }

    if (body.action === "load") {
      const row = await prisma.marketingOSPlan.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!row) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const system = parseMarketingOSData(row.data);
      if (!system) {
        return NextResponse.json({ error: "Invalid stored data" }, { status: 500 });
      }
      return NextResponse.json({ system: { ...system, id: row.id } });
    }

    if (body.action === "delete") {
      await prisma.marketingOSPlan.deleteMany({
        where: { id: body.id, userId: session.id },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
