import { NextResponse } from "next/server";
import { suggestTopics } from "@/lib/ai";
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

export async function GET() {
  try {
    const gate = await gateCredits("seo_article");
    if (!gate.ok) return gate.response;

    const brandRow = await getBrandKitForUser(gate.userId);
    const brand = brandRow ? mapBrand(brandRow) : undefined;
    const topics = await suggestTopics(brand);
    await chargeAfterGate(gate, "seo_article");
    return NextResponse.json({ topics });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
