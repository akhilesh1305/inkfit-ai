import { NextResponse } from "next/server";
import { gateAuth } from "@/lib/credit-api";
import { loadCalendarPlan, syncCalendarPlan } from "@/lib/persistence";
import { getDemoCalendarEvents } from "@/lib/ai";

export async function GET() {
  try {
    const auth = await gateAuth("content:read");
    if (!auth.ok) return auth.response;

    const items = await loadCalendarPlan(auth.ctx.user.id);
    if (items.length > 0) {
      return NextResponse.json({ items });
    }

    const demo = getDemoCalendarEvents();
    return NextResponse.json({
      items: demo.map((e) => ({
        id: e.id,
        topic: e.title,
        date: e.date,
        contentType: e.type,
        platformId: e.platform?.toLowerCase(),
        status: e.status,
      })),
    });
  } catch (e) {
    return NextResponse.json({ items: [], error: String(e) });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await gateAuth("content:write");
    if (!auth.ok) return auth.response;

    const body = await req.json();

    if (body.action === "plan" && Array.isArray(body.items)) {
      await syncCalendarPlan(auth.ctx.user.id, body.items);
      return NextResponse.json({ ok: true });
    }

    if (Array.isArray(body.items)) {
      await syncCalendarPlan(auth.ctx.user.id, body.items);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
