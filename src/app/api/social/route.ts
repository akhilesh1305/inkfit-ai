import { NextResponse } from "next/server";
import { generateSocialPosts } from "@/lib/ai";
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
    const body = await req.json();
    const brand = await getBrand();
    const content = await generateSocialPosts({ ...body, brand });
    return NextResponse.json({ content });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
