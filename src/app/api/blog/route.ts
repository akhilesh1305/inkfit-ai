import { NextResponse } from "next/server";
import { generateBlog } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { AIEngine } from "@/lib/ai/engine";
import { getKnowledgeContextForUser } from "@/lib/knowledge-context";
import { getBrandKit } from "@/lib/ai/context";
import { saveGeneratedContent } from "@/lib/persistence";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await AIEngine.runForRoute("content_generation", 1, async (gate) => {
      const brand = await getBrandKit(gate.userId);
      const session = await getSession();
      const knowledgeContext = session
        ? await getKnowledgeContextForUser(session.id)
        : undefined;
      const content = await generateBlog(
        {
          ...body,
          brand,
          audience: body.audience || brand?.targetAudience,
          knowledgeContext,
        },
        gate.userId
      );

      const saved = await saveGeneratedContent({
        userId: gate.userId,
        feature: "blog",
        title: body.topic ?? "Blog post",
        body: content,
        metadata: { topic: body.topic, tone: body.tone, length: body.length },
      });

      return { data: { content, contentId: saved.id } };
    });

    if (!result.ok) return result.response;
    return NextResponse.json(result.data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
