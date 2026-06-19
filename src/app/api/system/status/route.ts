import { NextResponse } from "next/server";
import { hasAnyAIProvider } from "@/lib/ai/providers";

export async function GET() {
  const aiLive = hasAnyAIProvider();
  return NextResponse.json({
    aiLive,
    demoMode: !aiLive,
    message: aiLive
      ? "Live AI providers connected"
      : "Demo mode — outputs use templates until API keys are configured",
  });
}
