import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { gateCredits } from "@/lib/credit-api";
import { generate, hasGeminiKey, hasOpenAIKey } from "@/lib/ai";
import { getKnowledgeContextForUser } from "@/lib/knowledge-context";
import {
  countWords,
  estimateDurationSeconds,
  generateVideoStudio,
  SCRIPT_META,
  type ScriptBlock,
  type VideoInputType,
  type VideoStudioOutput,
  type VideoStudioRequest,
} from "@/lib/video-studio";

async function fetchUrlText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "InkFitAI-VideoStudio/1.0" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error("Could not fetch URL");
  const html = await res.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length < 80) throw new Error("Not enough readable content at URL");
  return text.slice(0, 50000);
}

async function enhanceWithAI(
  req: VideoStudioRequest,
  base: VideoStudioOutput,
  knowledgeContext?: string
): Promise<VideoStudioOutput> {
  if (!hasGeminiKey() && !hasOpenAIKey()) return base;

  try {
    const raw = await generate(
      `Video & podcast scriptwriter. Return ONLY valid JSON:
{
  "topic": string,
  "youtube": string,
  "podcast": string,
  "shorts": string,
  "reel": string,
  "hook": string,
  "cta": string
}
Use markdown section headers in scripts. Be specific to the source content. Hook = 3-5 sec opener. CTA = compelling close.`,
      `Input type: ${req.inputType}
Source (${countWords(req.content)} words):
${req.content.slice(0, 4000)}`,
      4000,
      knowledgeContext
    );

    const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, ""));

    function block(id: ScriptBlock["id"], content: string): ScriptBlock {
      const wc = countWords(content);
      return {
        id,
        label: SCRIPT_META[id].label,
        content,
        wordCount: wc,
        estimatedSeconds: estimateDurationSeconds(wc, SCRIPT_META[id].wpm),
      };
    }

    const scripts: ScriptBlock[] = [
      block("youtube", parsed.youtube ?? base.scripts.find((s) => s.id === "youtube")!.content),
      block("podcast", parsed.podcast ?? base.scripts.find((s) => s.id === "podcast")!.content),
      block("shorts", parsed.shorts ?? base.scripts.find((s) => s.id === "shorts")!.content),
      block("reel", parsed.reel ?? base.scripts.find((s) => s.id === "reel")!.content),
      block("hook", parsed.hook ?? base.hook),
      block("cta", parsed.cta ?? base.cta),
    ];

    return {
      ...base,
      topic: parsed.topic ?? base.topic,
      scripts,
      hook: parsed.hook ?? base.hook,
      cta: parsed.cta ?? base.cta,
      live: true,
    };
  } catch {
    return base;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inputType = (body.inputType ?? "text") as VideoInputType;
    let content = String(body.content ?? "").trim();

    if (inputType === "url") {
      const url = String(body.url ?? content).trim();
      if (!url.startsWith("http")) {
        return NextResponse.json({ error: "Valid URL required" }, { status: 400 });
      }
      try {
        content = await fetchUrlText(url);
      } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 400 });
      }
    }

    if (content.length < 50) {
      return NextResponse.json(
        { error: "Provide at least 50 characters of source content" },
        { status: 400 }
      );
    }

    const gate = await gateCredits("content_generation");
    if (!gate.ok) return gate.response;

    const request: VideoStudioRequest = {
      inputType,
      content,
      url: body.url,
      topic: body.topic,
    };

    const base = generateVideoStudio(request);

    const session = await getSession();
    const kb = session ? await getKnowledgeContextForUser(session.id) : undefined;
    const output = await enhanceWithAI(request, base, kb);

    return NextResponse.json({ output });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
