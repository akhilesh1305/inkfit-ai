import { NextResponse } from "next/server";
import { researchKeywords } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    const brand = await prisma.brandKit.findFirst({ orderBy: { updatedAt: "desc" } });
    const keywords = await researchKeywords(topic, brand ? {
      companyName: brand.companyName,
      primaryColor: brand.primaryColor,
      secondaryColor: brand.secondaryColor,
      accentColor: brand.accentColor,
      targetAudience: brand.targetAudience,
      writingStyle: brand.writingStyle,
      tone: brand.tone,
      industry: brand.industry ?? undefined,
    } : undefined);
    return NextResponse.json({ keywords });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
