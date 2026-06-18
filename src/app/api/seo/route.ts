import { NextResponse } from "next/server";
import { optimizeSEO } from "@/lib/ai";
import { generateSEOArticle } from "@/lib/seo-content";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const brand = await prisma.brandKit.findFirst({ orderBy: { updatedAt: "desc" } });
    const brandKit = brand
      ? {
          companyName: brand.companyName,
          primaryColor: brand.primaryColor,
          secondaryColor: brand.secondaryColor,
          accentColor: brand.accentColor,
          targetAudience: brand.targetAudience,
          writingStyle: brand.writingStyle,
          tone: brand.tone,
          industry: brand.industry ?? undefined,
        }
      : undefined;

    if (body.action === "write") {
      const article = generateSEOArticle({
        topic: body.topic,
        targetKeyword: body.targetKeyword,
        audience: body.audience || brandKit?.targetAudience,
      });
      return NextResponse.json({ article });
    }

    const result = await optimizeSEO({
      ...body,
      brand: brandKit,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
