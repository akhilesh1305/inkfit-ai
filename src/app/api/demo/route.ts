import { NextResponse } from "next/server";
import { DEMO_OUTPUTS, detectOutputType, type DemoOutputType } from "@/lib/demo-content";

/**
 * Public landing-page demo — static samples only.
 * Never calls live AI providers (prevents unauthenticated COGS leak).
 */
export async function POST(req: Request) {
  try {
    const { prompt, type: typeHint } = await req.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const type = (typeHint as DemoOutputType) || detectOutputType(prompt);
    const meta = DEMO_OUTPUTS[type] ?? DEMO_OUTPUTS.linkedin;

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
