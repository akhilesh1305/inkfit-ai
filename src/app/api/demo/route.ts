import { NextResponse } from "next/server";
import { generateDemoContent } from "@/lib/ai";
import { DEMO_OUTPUTS, detectOutputType, type DemoOutputType } from "@/lib/demo-content";

export async function POST(req: Request) {
  try {
    const { prompt, type: typeHint } = await req.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const type = (typeHint as DemoOutputType) || detectOutputType(prompt);
    const meta = DEMO_OUTPUTS[type];
    const result = await generateDemoContent(prompt, type);

    if (result.live) {
      return NextResponse.json({
        type,
        label: meta.label,
        content: result.content,
        live: true,
      });
    }

    return NextResponse.json({
      type,
      label: meta.label,
      content: meta.content,
      live: false,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
