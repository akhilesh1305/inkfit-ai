import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_BRAND } from "@/lib/brand";
import { analyzeContent, type ContentAnalysisResult } from "@/lib/content-analyzer";
import { hasGeminiKey, hasOpenAIKey, generate } from "@/lib/ai";
import { getKnowledgeContextForUser } from "@/lib/knowledge-context";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const content = String(body.content ?? "").trim();
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    let brandTone = body.brandTone as string | undefined;
    let targetAudience = body.targetAudience as string | undefined;

    if (!brandTone || !targetAudience) {
      try {
        const brand = await prisma.brandKit.findFirst({ orderBy: { updatedAt: "desc" } });
        brandTone = brandTone ?? brand?.tone ?? DEFAULT_BRAND.tone;
        targetAudience = targetAudience ?? brand?.targetAudience ?? DEFAULT_BRAND.targetAudience;
      } catch {
        brandTone = brandTone ?? DEFAULT_BRAND.tone;
        targetAudience = targetAudience ?? DEFAULT_BRAND.targetAudience;
      }
    }

    const result = analyzeContent({
      content,
      contentType: body.contentType,
      keyword: body.keyword,
      brandTone,
      targetAudience,
    });

    if (hasGeminiKey() || hasOpenAIKey()) {
      const kb = await getKnowledgeContextForUser(session.id);
      const enhanced = await enhanceWithAI(content, result, kb);
      return NextResponse.json({ analysis: enhanced });
    }

    return NextResponse.json({ analysis: result });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

async function enhanceWithAI(
  content: string,
  base: ContentAnalysisResult,
  knowledgeContext?: string
): Promise<ContentAnalysisResult> {
  try {
    const raw = await generate(
      "Content analyst. Return ONLY valid JSON: { suggestions: string[], recommendations: [{ title, description, impact }] }",
      `Analyze this content and provide 3 extra suggestions and 2 recommendations beyond heuristic analysis.
Scores: readability ${base.scores.readability}, seo ${base.scores.seo}, engagement ${base.scores.engagement}, brand ${base.scores.brandVoice}, virality ${base.scores.virality}.

Content:
${content.slice(0, 2500)}`,
      800,
      knowledgeContext
    );
    const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, ""));
    const extraSuggestions = (parsed.suggestions ?? []).slice(0, 3).map((text: string) => ({
      text,
      category: "general" as const,
      priority: "medium" as const,
    }));
    const extraRecs = (parsed.recommendations ?? []).slice(0, 2).map(
      (r: { title: string; description: string; impact: string }) => ({
        title: r.title,
        description: r.description,
        impact: (r.impact === "high" || r.impact === "low" ? r.impact : "medium") as
          | "high"
          | "medium"
          | "low",
        category: "engagement" as const,
      })
    );

    return {
      ...base,
      suggestions: [...base.suggestions, ...extraSuggestions].slice(0, 10),
      recommendations: [...base.recommendations, ...extraRecs].slice(0, 8),
      live: true,
    };
  } catch {
    return base;
  }
}
