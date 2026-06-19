import { NextResponse } from "next/server";
import { analyzeCompetitorSite } from "@/lib/competitor-analysis";
import { gateAuth } from "@/lib/credit-api";

export async function POST(req: Request) {
  try {
    const auth = await gateAuth("content:read");
    if (!auth.ok) return auth.response;

    const { url } = await req.json();
    if (!url?.trim()) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    const analysis = analyzeCompetitorSite(url.trim());
    return NextResponse.json({ analysis });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
