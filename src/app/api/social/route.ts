import { NextResponse } from "next/server";
import { generateSocialPosts } from "@/lib/ai";
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
    const gate = await gateCredits("content_generation");
    if (!gate.ok) return gate.response;

    const body = await req.json();
    const brandRow = await getBrandKitForUser(gate.userId);
    const brand = brandRow ? mapBrand(brandRow) : undefined;
    const content = await generateSocialPosts({ ...body, brand });
    await chargeAfterGate(gate, "content_generation");
    return NextResponse.json({ content });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
