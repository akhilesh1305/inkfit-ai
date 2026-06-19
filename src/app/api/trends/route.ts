import { NextResponse } from "next/server";
import { gateAuth } from "@/lib/credit-api";
import { prisma } from "@/lib/prisma";
import {
  getTrendDiscoveryData,
  buildContentPrompt,
  type TrendCategory,
} from "@/lib/trend-discovery";

export async function GET(req: Request) {
  try {
    const auth = await gateAuth("content:read");
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(req.url);
    const category = (searchParams.get("category") ?? "all") as TrendCategory | "all";
    const data = getTrendDiscoveryData(category);

    return NextResponse.json(data);
  } catch {
    const data = getTrendDiscoveryData("all");
    return NextResponse.json(data);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await gateAuth("content:write");
    if (!auth.ok) return auth.response;
    const userId = auth.ctx.user.id;

    const body = await req.json();

    if (body.action === "generate-content") {
      const prompt = buildContentPrompt({
        title: body.title,
        description: body.description,
        angle: body.angle,
        format: body.format,
        relatedTopic: body.relatedTopic,
      });

      const item = await prisma.workspaceContent.create({
        data: {
          userId,
          title: String(body.title).slice(0, 120),
          body: prompt,
          type: body.contentType ?? "linkedin",
          status: "draft",
          tags: JSON.stringify(["trend-discovery", body.category ?? "marketing"]),
          favorite: false,
        },
      });

      return NextResponse.json({
        ok: true,
        workspaceId: item.id,
        prompt,
        route: "/dashboard/linkedin",
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
