import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enhanceMarketingOSAI, regenerateMarketingOSSectionAI } from "@/lib/ai/generations";
import { gateCredits, chargeAfterGate } from "@/lib/credit-api";
import {
  generateMarketingOS,
  getSectionMeta,
  parseMarketingOSData,
  type MarketingOSOutput,
} from "@/lib/marketing-os";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saved = await prisma.marketingOSPlan.findMany({
      where: { userId: session.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { id: true, goal: true, title: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ saved });
  } catch {
    return NextResponse.json({ saved: [] });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "generate") {
      const gate = await gateCredits("marketing_plan");
      if (!gate.ok) return gate.response;

      const goal = String(body.goal ?? "").trim();
      if (!goal) {
        return NextResponse.json({ error: "Goal is required" }, { status: 400 });
      }

      const base = generateMarketingOS(goal);
      const system = await enhanceMarketingOSAI(goal, base, { userId: session.id });
      if (system.live) await chargeAfterGate(gate, "marketing_plan");
      return NextResponse.json({ system });
    }

    if (body.action === "regenerate-section") {
      const gate = await gateCredits("content_generation");
      if (!gate.ok) return gate.response;

      const goal = String(body.goal ?? "").trim();
      const sectionId = String(body.sectionId);
      const current = String(body.content ?? "");
      const { content, live } = await regenerateMarketingOSSectionAI(
        goal,
        sectionId,
        current,
        { userId: session.id }
      );

      if (live) await chargeAfterGate(gate, "content_generation");
      return NextResponse.json({
        section: {
          id: sectionId,
          title: getSectionMeta(sectionId).title,
          content,
        },
        live,
      });
    }

    if (body.action === "save") {
      const data = body.system as MarketingOSOutput;
      if (!data?.goal || !data?.sections) {
        return NextResponse.json({ error: "Invalid system data" }, { status: 400 });
      }

      const payload = JSON.stringify(data);

      if (body.id) {
        const existing = await prisma.marketingOSPlan.findFirst({
          where: { id: body.id, userId: session.id },
        });
        if (!existing) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        const row = await prisma.marketingOSPlan.update({
          where: { id: body.id },
          data: {
            goal: data.goal,
            title: data.title,
            data: payload,
          },
        });
        return NextResponse.json({ id: row.id, saved: true });
      }

      const row = await prisma.marketingOSPlan.create({
        data: {
          userId: session.id,
          goal: data.goal,
          title: data.title,
          data: payload,
        },
      });
      return NextResponse.json({ id: row.id, saved: true });
    }

    if (body.action === "load") {
      const row = await prisma.marketingOSPlan.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!row) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const system = parseMarketingOSData(row.data);
      if (!system) {
        return NextResponse.json({ error: "Invalid stored data" }, { status: 500 });
      }
      return NextResponse.json({ system: { ...system, id: row.id } });
    }

    if (body.action === "delete") {
      await prisma.marketingOSPlan.deleteMany({
        where: { id: body.id, userId: session.id },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
