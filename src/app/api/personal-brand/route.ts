import { NextResponse } from "next/server";
import { generatePersonalBrand } from "@/lib/personal-brand";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const brand = generatePersonalBrand({
      name: body.name,
      industry: body.industry,
      targetAudience: body.targetAudience,
      platform: body.platform,
    });
    return NextResponse.json({ brand });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
