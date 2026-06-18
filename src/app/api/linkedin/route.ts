import { NextResponse } from "next/server";
import { generateLinkedInCarousel, generateCommentSuggestions, generateViralIdeas } from "@/lib/ai";
import { gateCredits } from "@/lib/credit-api";
import { generateLinkedInPost } from "@/lib/linkedin-content";
import type { LinkedInContentType } from "@/lib/linkedin-content";
import { prisma } from "@/lib/prisma";
import type { BrandKit } from "@/lib/brand";

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

export async function POST(req: Request) {
  try {
    const gate = await gateCredits("content_generation");
    if (!gate.ok) return gate.response;

    const body = await req.json();
    const brand = await getBrand();
    const { action } = body;

    if (action === "carousel") {
      const content = await generateLinkedInCarousel({ topic: body.topic, slides: body.slides ?? 7, brand });
      return NextResponse.json({ content });
    }
    if (action === "comments") {
      const content = await generateCommentSuggestions(body.post, brand);
      return NextResponse.json({ content });
    }
    if (action === "viral") {
      const content = await generateViralIdeas(body.niche, brand);
      return NextResponse.json({ content });
    }
    if (action === "post") {
      const post = generateLinkedInPost({
        topic: body.topic,
        targetAudience: body.targetAudience,
        contentType: body.contentType as LinkedInContentType,
      });
      return NextResponse.json({ post });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
