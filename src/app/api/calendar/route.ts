import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoCalendarEvents } from "@/lib/ai";

export async function GET() {
  try {
    const events = await prisma.calendarEvent.findMany({ orderBy: { date: "asc" } });
    if (events.length === 0) {
      const demo = getDemoCalendarEvents();
      for (const e of demo) {
        await prisma.calendarEvent.create({
          data: { title: e.title, type: e.type, date: e.date, status: e.status, platform: e.platform },
        });
      }
      const seeded = await prisma.calendarEvent.findMany({ orderBy: { date: "asc" } });
      return NextResponse.json({
        events: seeded.map((e) => ({ id: e.id, title: e.title, type: e.type, date: e.date, status: e.status, platform: e.platform ?? undefined })),
      });
    }
    return NextResponse.json({
      events: events.map((e) => ({ id: e.id, title: e.title, type: e.type, date: e.date, status: e.status, platform: e.platform ?? undefined })),
    });
  } catch (e) {
    return NextResponse.json({ events: getDemoCalendarEvents() });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "plan" && Array.isArray(body.items)) {
      await prisma.calendarEvent.deleteMany();
      for (const item of body.items) {
        await prisma.calendarEvent.create({
          data: {
            id: item.id,
            title: item.topic,
            type: mapContentType(item.contentType),
            date: item.date,
            status: mapStatus(item.status),
            platform: item.platformId,
          },
        });
      }
      return NextResponse.json({ ok: true });
    }

    const { events } = body;
    await prisma.calendarEvent.deleteMany();
    for (const e of events) {
      await prisma.calendarEvent.create({
        data: { id: e.id, title: e.title, type: e.type, date: e.date, status: e.status, platform: e.platform, content: e.content },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function mapContentType(contentType: string): string {
  const map: Record<string, string> = {
    blog: "blog",
    carousel: "carousel",
    thread: "social",
    reel: "image",
    "thought-leadership": "linkedin",
    educational: "linkedin",
    story: "social",
    "case-study": "blog",
  };
  return map[contentType] ?? "social";
}

function mapStatus(status: string): string {
  if (status === "in-progress") return "scheduled";
  return status;
}
