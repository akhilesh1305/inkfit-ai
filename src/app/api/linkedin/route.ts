import { NextResponse } from "next/server";
import { generateLinkedInCarousel, generateCommentSuggestions, generateViralIdeas } from "@/lib/ai";
import { AIEngine } from "@/lib/ai/engine";
import { generateLinkedInPostAI } from "@/lib/ai/generations";
import { getBrandKit } from "@/lib/ai/context";
import { saveGeneratedContent } from "@/lib/persistence";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "carousel") {
      const result = await AIEngine.runForRoute("content_generation", 1, async (gate) => {
        const brand = await getBrandKit(gate.userId);
        const content = await generateLinkedInCarousel(
          { topic: body.topic, slides: body.slides ?? 7, brand },
          gate.userId
        );
        return { data: { content } };
      });
      if (!result.ok) return result.response;
      return NextResponse.json(result.data);
    }

    if (action === "comments") {
      const result = await AIEngine.runForRoute("content_generation", 1, async (gate) => {
        const brand = await getBrandKit(gate.userId);
        const content = await generateCommentSuggestions(body.post, brand, gate.userId);
        return { data: { content } };
      });
      if (!result.ok) return result.response;
      return NextResponse.json(result.data);
    }

    if (action === "viral") {
      const result = await AIEngine.runForRoute("content_generation", 1, async (gate) => {
        const brand = await getBrandKit(gate.userId);
        const content = await generateViralIdeas(body.niche, brand, gate.userId);
        return { data: { content } };
      });
      if (!result.ok) return result.response;
      return NextResponse.json(result.data);
    }

    if (action === "post") {
      const result = await AIEngine.runForRoute("content_generation", 1, async (gate) => {
        const post = await generateLinkedInPostAI(
          {
            topic: body.topic,
            targetAudience: body.targetAudience,
            contentType: body.contentType as import("@/lib/linkedin-content").LinkedInContentType,
          },
          { userId: gate.userId }
        );
        const full = `${post.hook}\n\n${post.mainContent}\n\n${post.cta}`;
        const saved = await saveGeneratedContent({
          userId: gate.userId,
          feature: "linkedin",
          title: body.topic,
          body: full,
          metadata: { post, live: post.live },
        });
        return { data: { post, contentId: saved.id }, live: post.live };
      });
      if (!result.ok) return result.response;
      return NextResponse.json(result.data);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
