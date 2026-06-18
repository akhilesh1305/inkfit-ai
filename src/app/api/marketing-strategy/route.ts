import { NextResponse } from "next/server";
import { generateMarketingStrategy } from "@/lib/marketing-strategy";
import type { BusinessType } from "@/lib/marketing-strategy";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const strategy = generateMarketingStrategy({
      industry: body.industry,
      businessType: body.businessType as BusinessType,
      targetAudience: body.targetAudience,
      goals: body.goals,
      monthlyBudget: body.monthlyBudget,
    });
    return NextResponse.json({ strategy });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
