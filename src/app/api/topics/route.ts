import { NextResponse } from "next/server";
import { suggestTopics } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const brand = await prisma.brandKit.findFirst({ orderBy: { updatedAt: "desc" } });
    const topics = await suggestTopics(brand ? {
      companyName: brand.companyName,
      primaryColor: brand.primaryColor,
      secondaryColor: brand.secondaryColor,
      accentColor: brand.accentColor,
      targetAudience: brand.targetAudience,
      writingStyle: brand.writingStyle,
      tone: brand.tone,
      industry: brand.industry ?? undefined,
    } : undefined);
    return NextResponse.json({ topics });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
