import { NextResponse } from "next/server";
import { generateAgentResponse } from "@/lib/content-agent";
import { gateCredits } from "@/lib/credit-api";

export async function POST(req: Request) {
  try {
    const gate = await gateCredits("agent_request");
    if (!gate.ok) return gate.response;

    const { prompt } = await req.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }
    const response = generateAgentResponse(prompt.trim());
    return NextResponse.json({ response });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
