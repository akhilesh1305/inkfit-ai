import { NextResponse } from "next/server";
import { optimizeSEO } from "@/lib/ai";
import { generateSEOArticleAI } from "@/lib/ai/generations";
import { gateCredits, chargeAfterGate } from "@/lib/credit-api";
import { getBrandKit } from "@/lib/ai/context";
import { saveGeneratedContent } from "@/lib/persistence";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "write") {
      const gate = await gateCredits("seo_article");
      if (!gate.ok) return gate.response;

      const brandKit = await getBrandKit(gate.userId);
      const article = await generateSEOArticleAI(
        {
          topic: body.topic,
          targetKeyword: body.targetKeyword,
          audience: body.audience || brandKit?.targetAudience,
        },
        { userId: gate.userId }
      );
      const saved = await saveGeneratedContent({
        userId: gate.userId,
        feature: "seo",
        title: article.seoTitle,
        body: article.fullArticle,
        metadata: { article, live: article.live },
      });
      if (article.live) await chargeAfterGate(gate, "seo_article");
      return NextResponse.json({ article, contentId: saved.id });
    }

    const gate = await gateCredits("content_generation");
    if (!gate.ok) return gate.response;

    const brandKit = await getBrandKit(gate.userId);
    const result = await optimizeSEO(
      {
        content: body.content,
        targetKeyword: body.targetKeyword,
        brand: brandKit,
      },
      gate.userId
    );
    await chargeAfterGate(gate, "content_generation");
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
