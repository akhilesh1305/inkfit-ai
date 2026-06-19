import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { gateCredits, chargeAfterGate } from "@/lib/credit-api";
import { generateCarouselAI } from "@/lib/ai/generations";
import { saveGeneratedContent } from "@/lib/persistence";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gate = await gateCredits("content_generation");
    if (!gate.ok) return gate.response;

    const body = await req.json();
    const topic = String(body.topic ?? "").trim();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const carousel = await generateCarouselAI(topic, { userId: session.id });
    const saved = await saveGeneratedContent({
      userId: session.id,
      feature: "carousel",
      title: topic,
      body: JSON.stringify(carousel),
      metadata: { slides: carousel.slides, live: carousel.live },
    });
    await chargeAfterGate(gate, "content_generation");
    return NextResponse.json({ carousel, contentId: saved.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
