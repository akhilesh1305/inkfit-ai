import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { gateCredits, chargeAfterGate } from "@/lib/credit-api";
import { generate, hasGeminiKey, hasOpenAIKey } from "@/lib/ai";
import { getKnowledgeContextForUser } from "@/lib/knowledge-context";
import {
  generateLandingPage,
  type LandingPageOutput,
  type LandingPageRequest,
} from "@/lib/landing-page";

async function enhanceWithAI(
  req: LandingPageRequest,
  base: LandingPageOutput,
  knowledgeContext?: string
): Promise<LandingPageOutput> {
  if (!hasGeminiKey() && !hasOpenAIKey()) return base;

  try {
    const raw = await generate(
      `Landing page copywriter. Return ONLY valid JSON:
{
  "hero": { "badge", "headline", "subheadline", "primaryCta", "secondaryCta" },
  "features": [{ "title", "description" }] (6 items),
  "benefits": [{ "title", "description" }] (4 items),
  "testimonials": [{ "quote", "author", "role" }] (3 items),
  "faq": [{ "question", "answer" }] (5 items),
  "cta": { "headline", "subtext", "buttonText" }
}
Conversion-focused, specific to business. No generic filler.`,
      `Business: ${req.businessName}
Industry: ${req.industry}
Audience: ${req.targetAudience}
Offer: ${req.offer}`,
      3500,
      knowledgeContext
    );

    const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, ""));

    return {
      ...base,
      hero: { ...base.hero, ...parsed.hero },
      features: parsed.features?.length >= 4 ? parsed.features : base.features,
      benefits: parsed.benefits?.length >= 3 ? parsed.benefits : base.benefits,
      testimonials:
        parsed.testimonials?.length >= 2 ? parsed.testimonials : base.testimonials,
      faq: parsed.faq?.length >= 3 ? parsed.faq : base.faq,
      cta: { ...base.cta, ...parsed.cta },
      live: true,
    };
  } catch {
    return base;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const request: LandingPageRequest = {
      businessName: String(body.businessName ?? "").trim(),
      industry: String(body.industry ?? "").trim(),
      targetAudience: String(body.targetAudience ?? "").trim(),
      offer: String(body.offer ?? "").trim(),
    };

    if (
      request.businessName.length < 2 ||
      request.industry.length < 2 ||
      request.offer.length < 3
    ) {
      return NextResponse.json({ error: "Fill in all required fields" }, { status: 400 });
    }

    const gate = await gateCredits("content_generation");
    if (!gate.ok) return gate.response;

    const base = generateLandingPage(request);
    const session = await getSession();
    const kb = session ? await getKnowledgeContextForUser(session.id) : undefined;
    const output = await enhanceWithAI(request, base, kb);

    await chargeAfterGate(gate, "content_generation");
    return NextResponse.json({ output });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
