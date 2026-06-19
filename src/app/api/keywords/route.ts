import { NextResponse } from "next/server";
import { researchKeywords } from "@/lib/ai";
import { gateCredits, chargeAfterGate } from "@/lib/credit-api";
import { getBrandKitForUser } from "@/lib/persistence";
import type { BrandKit } from "@/lib/brand";

function mapBrand(brand: NonNullable<Awaited<ReturnType<typeof getBrandKitForUser>>>): BrandKit {
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
    const gate = await gateCredits("seo_article");
    if (!gate.ok) return gate.response;

    const { topic } = await req.json();
    const brandRow = await getBrandKitForUser(gate.userId);
    const brand = brandRow ? mapBrand(brandRow) : undefined;
    const keywords = await researchKeywords(topic, brand);
    await chargeAfterGate(gate, "seo_article");
    return NextResponse.json({ keywords });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
