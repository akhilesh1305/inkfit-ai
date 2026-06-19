import { NextResponse } from "next/server";
import { gateAuth, gateCredits, chargeAfterGate } from "@/lib/credit-api";
import { getAttributionDashboard, syncAttributionFromSources } from "@/lib/attribution/engine";
import { generateAttributionInsights } from "@/lib/attribution/insights";

export async function GET(req: Request) {
  try {
    const auth = await gateAuth("content:read");
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(req.url);
    const withInsights = searchParams.get("insights") === "1";

    const dashboard = await getAttributionDashboard(auth.ctx.user.id);

    if (withInsights) {
      const gate = await gateCredits("content_generation");
      if (!gate.ok) return gate.response;
      const insights = await generateAttributionInsights(gate.userId, dashboard);
      await chargeAfterGate(gate, "content_generation");
      return NextResponse.json({ dashboard, insights });
    }

    return NextResponse.json({ dashboard, insights: null });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await gateAuth("content:write");
    if (!auth.ok) return auth.response;

    const body = await req.json();

    if (body.action === "sync") {
      await syncAttributionFromSources(auth.ctx.user.id);
      const dashboard = await getAttributionDashboard(auth.ctx.user.id);
      return NextResponse.json({ dashboard });
    }

    if (body.action === "insights") {
      const gate = await gateCredits("content_generation");
      if (!gate.ok) return gate.response;

      const dashboard = await getAttributionDashboard(gate.userId);
      const insights = await generateAttributionInsights(gate.userId, dashboard);
      await chargeAfterGate(gate, "content_generation");
      return NextResponse.json({ insights, dashboard });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
