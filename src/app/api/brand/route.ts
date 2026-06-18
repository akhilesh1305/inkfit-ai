import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_BRAND } from "@/lib/brand";

export async function GET() {
  try {
    const brand = await prisma.brandKit.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!brand) return NextResponse.json({ brand: DEFAULT_BRAND });
    return NextResponse.json({
      brand: {
        id: brand.id,
        companyName: brand.companyName,
        primaryColor: brand.primaryColor,
        secondaryColor: brand.secondaryColor,
        accentColor: brand.accentColor,
        targetAudience: brand.targetAudience,
        writingStyle: brand.writingStyle,
        tone: brand.tone,
        industry: brand.industry ?? "",
      },
    });
  } catch {
    return NextResponse.json({ brand: DEFAULT_BRAND });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const existing = await prisma.brandKit.findFirst();
    const data = {
      companyName: body.companyName,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      accentColor: body.accentColor,
      targetAudience: body.targetAudience,
      writingStyle: body.writingStyle,
      tone: body.tone,
      industry: body.industry || null,
    };
    const brand = existing
      ? await prisma.brandKit.update({ where: { id: existing.id }, data })
      : await prisma.brandKit.create({ data });
    return NextResponse.json({ brand });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
