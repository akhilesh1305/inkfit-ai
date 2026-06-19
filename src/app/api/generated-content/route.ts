import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gateAuth } from "@/lib/credit-api";
import { getActiveWorkspaceId } from "@/lib/persistence";

function mapRow(row: {
  id: string;
  feature: string;
  title: string;
  body: string;
  metadata: string;
  status: string;
  workspaceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  let metadata: Record<string, unknown> = {};
  try {
    metadata = JSON.parse(row.metadata) as Record<string, unknown>;
  } catch {
    /* ignore */
  }
  return {
    id: row.id,
    feature: row.feature,
    title: row.title,
    body: row.body,
    metadata,
    status: row.status,
    workspaceId: row.workspaceId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET(req: Request) {
  try {
    const auth = await gateAuth("content:read");
    if (!auth.ok) return auth.response;
    const userId = auth.ctx.user.id;

    const { searchParams } = new URL(req.url);
    const feature = searchParams.get("feature");
    const id = searchParams.get("id");
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

    if (id) {
      const row = await prisma.generatedContent.findFirst({
        where: { id, userId },
      });
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ item: mapRow(row) });
    }

    const workspaceId = await getActiveWorkspaceId(userId);
    const rows = await prisma.generatedContent.findMany({
      where: {
        userId,
        ...(feature ? { feature } : {}),
        ...(workspaceId ? { OR: [{ workspaceId }, { workspaceId: null }] } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ items: rows.map(mapRow) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "delete") {
      const auth = await gateAuth("content:delete");
      if (!auth.ok) return auth.response;
      await prisma.generatedContent.deleteMany({
        where: { id: body.id, userId: auth.ctx.user.id },
      });
      return NextResponse.json({ ok: true });
    }

    const auth = await gateAuth(body.action === "update" ? "content:write" : "content:write");
    if (!auth.ok) return auth.response;
    const userId = auth.ctx.user.id;

    if (body.action === "update") {
      const existing = await prisma.generatedContent.findFirst({
        where: { id: body.id, userId },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const row = await prisma.generatedContent.update({
        where: { id: body.id },
        data: {
          ...(body.title !== undefined ? { title: String(body.title) } : {}),
          ...(body.body !== undefined ? { body: String(body.body) } : {}),
          ...(body.status !== undefined ? { status: String(body.status) } : {}),
          ...(body.metadata !== undefined
            ? { metadata: JSON.stringify(body.metadata) }
            : {}),
        },
      });
      return NextResponse.json({ item: mapRow(row) });
    }

    const workspaceId = await getActiveWorkspaceId(userId);
    const row = await prisma.generatedContent.create({
      data: {
        userId,
        workspaceId,
        feature: String(body.feature ?? "other"),
        title: String(body.title ?? "Untitled").slice(0, 500),
        body: String(body.body ?? ""),
        metadata: JSON.stringify(body.metadata ?? {}),
        status: String(body.status ?? "draft"),
      },
    });

    return NextResponse.json({ item: mapRow(row) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
