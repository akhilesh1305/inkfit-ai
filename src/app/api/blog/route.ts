import { NextResponse } from "next/server";
import { generateBlog } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { gateCredits } from "@/lib/credit-api";
import { getKnowledgeContextForUser } from "@/lib/knowledge-context";
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
    const session = await getSession();
    const knowledgeContext = session
      ? await getKnowledgeContextForUser(session.id)
      : undefined;
    const content = await generateBlog({
      ...body,
      brand,
      audience: body.audience || brand?.targetAudience,
      knowledgeContext,
    });
    return NextResponse.json({ content });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
