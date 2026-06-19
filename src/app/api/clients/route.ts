import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gateAuth } from "@/lib/credit-api";
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

async function seedForUser(userId: string) {
  const count = await prisma.agencyClient.count({ where: { userId } });
  if (count > 0) return;

  for (const client of DEMO_CLIENTS) {
    await prisma.agencyClient.create({ data: { ...client, userId } });
  }
}

export async function GET() {
  try {
    const auth = await gateAuth("content:read");
    if (!auth.ok) return auth.response;

    const userId = auth.ctx.user.id;
    await seedForUser(userId);

    const clients = await prisma.agencyClient.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ clients: clients.map(mapClient) });
  } catch {
    return NextResponse.json({ clients: [] });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await gateAuth("workspace:manage");
    if (!auth.ok) return auth.response;

    const userId = auth.ctx.user.id;
    const body = await req.json();

    if (body.action === "create") {
      const client = await prisma.agencyClient.create({
        data: {
          userId,
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
      const deleted = await prisma.agencyClient.deleteMany({
        where: { id: body.id, userId },
      });
      if (deleted.count === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
