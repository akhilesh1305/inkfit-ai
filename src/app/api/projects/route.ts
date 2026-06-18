import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DEMO_CAMPAIGNS,
  demoItems,
  type Campaign,
  type CampaignItem,
} from "@/lib/campaigns";

function mapCampaign(row: {
  id: string;
  name: string;
  description: string;
  goal: string;
  status: string;
  dueDate: string | null;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}): Campaign {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    goal: row.goal,
    status: row.status as Campaign["status"],
    dueDate: row.dueDate ?? undefined,
    color: row.color,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapItem(row: {
  id: string;
  campaignId: string;
  title: string;
  type: string;
  column: string;
  body: string;
  dueDate: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): CampaignItem {
  return {
    id: row.id,
    campaignId: row.campaignId,
    title: row.title,
    type: row.type as CampaignItem["type"],
    column: row.column as CampaignItem["column"],
    body: row.body,
    dueDate: row.dueDate ?? undefined,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function seedForUser(userId: string) {
  const count = await prisma.campaign.count({ where: { userId } });
  if (count > 0) return;

  const campaignIds: string[] = [];
  for (const c of DEMO_CAMPAIGNS) {
    const created = await prisma.campaign.create({
      data: { userId, ...c, dueDate: c.dueDate ?? null },
    });
    campaignIds.push(created.id);
  }

  const items = demoItems(campaignIds);
  for (const item of items) {
    await prisma.campaignItem.create({
      data: {
        userId,
        campaignId: item.campaignId,
        title: item.title,
        type: item.type,
        column: item.column,
        body: item.body,
        sortOrder: item.sortOrder,
      },
    });
  }
}

function demoFallback() {
  const now = new Date().toISOString();
  const campaigns: Campaign[] = DEMO_CAMPAIGNS.map((c, i) => ({
    id: `demo-campaign-${i}`,
    ...c,
    createdAt: now,
    updatedAt: now,
  }));
  const items = demoItems(campaigns.map((c) => c.id));
  return { campaigns, items };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await seedForUser(session.id);

    const [campaigns, items] = await Promise.all([
      prisma.campaign.findMany({
        where: { userId: session.id },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.campaignItem.findMany({
        where: { userId: session.id },
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      }),
    ]);

    return NextResponse.json({
      campaigns: campaigns.map(mapCampaign),
      items: items.map(mapItem),
    });
  } catch {
    return NextResponse.json(demoFallback());
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "create-campaign") {
      const campaign = await prisma.campaign.create({
        data: {
          userId: session.id,
          name: String(body.name || "Untitled Campaign").trim(),
          description: String(body.description || "").trim(),
          goal: String(body.goal || "").trim(),
          status: "active",
          dueDate: body.dueDate || null,
          color: body.color || "#6366f1",
        },
      });
      return NextResponse.json({ campaign: mapCampaign(campaign) });
    }

    if (body.action === "update-campaign") {
      const existing = await prisma.campaign.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const campaign = await prisma.campaign.update({
        where: { id: body.id },
        data: {
          name: body.name !== undefined ? String(body.name).trim() : undefined,
          description: body.description !== undefined ? String(body.description) : undefined,
          goal: body.goal !== undefined ? String(body.goal) : undefined,
          status: body.status,
          dueDate: body.dueDate === null ? null : body.dueDate,
          color: body.color,
        },
      });
      return NextResponse.json({ campaign: mapCampaign(campaign) });
    }

    if (body.action === "delete-campaign") {
      const existing = await prisma.campaign.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      await prisma.campaignItem.deleteMany({ where: { campaignId: body.id } });
      await prisma.campaign.delete({ where: { id: body.id } });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "create-item") {
      const campaign = await prisma.campaign.findFirst({
        where: { id: body.campaignId, userId: session.id },
      });
      if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
      }
      const item = await prisma.campaignItem.create({
        data: {
          userId: session.id,
          campaignId: body.campaignId,
          title: String(body.title || "Untitled").trim(),
          type: body.type || "blog",
          column: body.column || "ideas",
          body: String(body.body || ""),
          dueDate: body.dueDate || null,
        },
      });
      return NextResponse.json({ item: mapItem(item) });
    }

    if (body.action === "update-item") {
      const existing = await prisma.campaignItem.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const item = await prisma.campaignItem.update({
        where: { id: body.id },
        data: {
          title: body.title !== undefined ? String(body.title).trim() : undefined,
          type: body.type,
          column: body.column,
          body: body.body !== undefined ? String(body.body) : undefined,
          dueDate: body.dueDate === null ? null : body.dueDate,
          sortOrder: body.sortOrder,
        },
      });
      return NextResponse.json({ item: mapItem(item) });
    }

    if (body.action === "delete-item") {
      const existing = await prisma.campaignItem.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      await prisma.campaignItem.delete({ where: { id: body.id } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
