import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { gateCredits, chargeAfterGate } from "@/lib/credit-api";
import { generateRepurposeOutput } from "@/lib/ai/generations";
import { saveGeneratedContent } from "@/lib/persistence";
import type { RepurposeOutputId, RepurposeResults } from "@/lib/repurpose-content";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gate = await gateCredits("content_generation");
    if (!gate.ok) return gate.response;

    const body = await req.json();
    const source = String(body.source ?? "").trim();
    const outputs = (body.outputs ?? []) as RepurposeOutputId[];

    if (!source || outputs.length === 0) {
      return NextResponse.json({ error: "Source and outputs required" }, { status: 400 });
    }

    const results: RepurposeResults = {};
    let anyLive = false;

    for (const id of outputs) {
      const { content, live } = await generateRepurposeOutput(source, id, {
        userId: session.id,
      });
      results[id] = content;
      if (live) anyLive = true;

      await saveGeneratedContent({
        userId: session.id,
        feature: "repurpose",
        title: `${id} — ${source.slice(0, 60)}`,
        body: content,
        metadata: { outputId: id, sourcePreview: source.slice(0, 200), live },
      });
    }

    if (anyLive) await chargeAfterGate(gate, "content_generation");
    return NextResponse.json({ results, live: anyLive });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
