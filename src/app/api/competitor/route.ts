import { NextResponse } from "next/server";
import { analyzeCompetitorSite } from "@/lib/competitor-analysis";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url?.trim()) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    await prisma.brandKit.findFirst({ orderBy: { updatedAt: "desc" } });

    const analysis = analyzeCompetitorSite(url.trim());
    return NextResponse.json({ analysis });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
