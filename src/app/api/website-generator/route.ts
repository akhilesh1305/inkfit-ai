import { NextResponse } from "next/server";
import { generateWebsiteContent } from "@/lib/website-content";
import type { WebsiteTone } from "@/lib/website-content";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const content = generateWebsiteContent({
      businessName: body.businessName,
      industry: body.industry,
      targetAudience: body.targetAudience,
      tone: body.tone as WebsiteTone,
    });
    return NextResponse.json({ content });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
