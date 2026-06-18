import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_CLIENTS } from "@/lib/clients";

function mapClient(c: {
  id: string;
  name: string;
  industry: string;
  website: string | null;
  brandColor: string;
  contentCreated: number;
  projects: number;
  brandVoiceReady: boolean;
  calendarItems: number;
}) {
  return {
    id: c.id,
    name: c.name,
    industry: c.industry,
    website: c.website ?? undefined,
    brandColor: c.brandColor,
    contentCreated: c.contentCreated,
    projects: c.projects,
    brandVoiceReady: c.brandVoiceReady,
    calendarItems: c.calendarItems,
  };
}

async function seedIfEmpty() {
  const count = await prisma.agencyClient.count();
  if (count > 0) return;

  for (const client of DEMO_CLIENTS) {
    await prisma.agencyClient.create({ data: client });
  }
}

export async function GET() {
  try {
    await seedIfEmpty();
    const clients = await prisma.agencyClient.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ clients: clients.map(mapClient) });
  } catch {
    return NextResponse.json({
      clients: DEMO_CLIENTS.map((c, i) => ({ id: `demo-${i}`, ...c })),
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "create") {
      const client = await prisma.agencyClient.create({
        data: {
          name: String(body.name).trim(),
          industry: String(body.industry).trim(),
          website: body.website?.trim() || null,
          brandColor: body.brandColor || "#7C3AED",
          contentCreated: 0,
          projects: 1,
          brandVoiceReady: false,
          calendarItems: 0,
        },
      });
      return NextResponse.json({ client: mapClient(client) });
    }

    if (body.action === "delete") {
      await prisma.agencyClient.delete({ where: { id: body.id } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
