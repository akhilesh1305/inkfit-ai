import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gateCredits, chargeAfterGate } from "@/lib/credit-api";
import { generate, hasGeminiKey, hasOpenAIKey } from "@/lib/ai";
import { getKnowledgeContextForUser } from "@/lib/knowledge-context";
import {
  generatePersonalBrand,
  parsePersonalBrandOutput,
  type PersonalBrandOutput,
  type PersonalBrandRequest,
} from "@/lib/personal-brand";

async function enhanceWithAI(
  req: PersonalBrandRequest,
  base: PersonalBrandOutput,
  knowledgeContext?: string
): Promise<PersonalBrandOutput> {
  if (!hasGeminiKey() && !hasOpenAIKey()) return base;

  try {
    const raw = await generate(
      `Personal brand strategist. Return ONLY valid JSON matching this shape:
{
  "linkedInPostIdeas": [{ "hook", "angle", "format", "cta" }],
  "storyIdeas": [{ "title", "arc", "emotion" }],
  "industryCommentary": [{ "topic", "stance", "talkingPoints": string[] }],
  "growthRecommendations": [{ "id", "title", "description", "impact": "high"|"medium"|"low", "category", "action" }]
}
Provide 4 items each for posts/stories/commentary, 5 growth recommendations. Be specific to the person's niche.`,
      `Name: ${req.name}
Industry: ${req.industry}
Audience: ${req.targetAudience}
Platform: ${req.platform ?? "LinkedIn"}`,
      3000,
      knowledgeContext
    );

    const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, ""));
    return {
      ...base,
      linkedInPostIdeas: parsed.linkedInPostIdeas?.length
        ? parsed.linkedInPostIdeas
        : base.linkedInPostIdeas,
      storyIdeas: parsed.storyIdeas?.length ? parsed.storyIdeas : base.storyIdeas,
      industryCommentary: parsed.industryCommentary?.length
        ? parsed.industryCommentary
        : base.industryCommentary,
      growthRecommendations: parsed.growthRecommendations?.length
        ? parsed.growthRecommendations
        : base.growthRecommendations,
      live: true,
    };
  } catch {
    return base;
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const row = await prisma.personalBrandProfile.findUnique({
      where: { userId: session.id },
    });

    if (!row) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({
      profile: {
        name: row.name,
        industry: row.industry,
        targetAudience: row.targetAudience,
        platform: row.platform,
        output: row.outputData ? parsePersonalBrandOutput(row.outputData) : null,
      },
    });
  } catch {
    return NextResponse.json({ profile: null });
  }
}

export async function POST(req: Request) {
  try {
    const gate = await gateCredits("content_generation");
    if (!gate.ok) return gate.response;

    const body = await req.json();
    const request: PersonalBrandRequest = {
      name: String(body.name ?? "").trim(),
      industry: String(body.industry ?? "").trim(),
      targetAudience: String(body.targetAudience ?? "").trim(),
      platform: body.platform ?? "LinkedIn",
    };

    if (request.name.length < 2 || request.industry.length < 2) {
      return NextResponse.json({ error: "Name and industry required" }, { status: 400 });
    }

    const base = generatePersonalBrand(request);
    const kb = await getKnowledgeContextForUser(gate.userId);
    const brand = await enhanceWithAI(request, base, kb);

    const payload = JSON.stringify(brand);

    await prisma.personalBrandProfile.upsert({
      where: { userId: gate.userId },
      create: {
        userId: gate.userId,
        name: request.name,
        industry: request.industry,
        targetAudience: request.targetAudience,
        platform: request.platform ?? "LinkedIn",
        outputData: payload,
      },
      update: {
        name: request.name,
        industry: request.industry,
        targetAudience: request.targetAudience,
        platform: request.platform ?? "LinkedIn",
        outputData: payload,
      },
    });

    if (brand.live) await chargeAfterGate(gate, "content_generation");
    return NextResponse.json({ brand });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
