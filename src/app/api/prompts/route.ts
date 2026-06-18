import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_COLLECTIONS,
  DEMO_PROMPTS,
  getAllTags,
  getMostUsed,
  getRecentlyUsed,
  parseTags,
  type PromptCategoryId,
  type PromptCollection,
  type PromptItem,
} from "@/lib/prompt-library";

function mapPrompt(row: {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string;
  collectionId: string | null;
  favorite: boolean;
  useCount: number;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): PromptItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category as PromptCategoryId,
    tags: parseTags(row.tags),
    collectionId: row.collectionId,
    favorite: row.favorite,
    useCount: row.useCount,
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapCollection(
  row: { id: string; name: string; icon: string; color: string; createdAt: Date },
  promptCount: number
): PromptCollection {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    promptCount,
    createdAt: row.createdAt.toISOString(),
  };
}

async function seedPromptLibrary(userId: string) {
  const collCount = await prisma.promptCollection.count({ where: { userId } });
  if (collCount === 0) {
    for (const c of DEFAULT_COLLECTIONS) {
      await prisma.promptCollection.create({
        data: { userId, name: c.name, icon: c.icon, color: c.color },
      });
    }
  }

  const promptCount = await prisma.promptLibraryItem.count({ where: { userId } });
  if (promptCount === 0) {
    const collections = await prisma.promptCollection.findMany({ where: { userId } });
    const contentOps = collections.find((c) => c.name === "Content Ops");

    for (let i = 0; i < DEMO_PROMPTS.length; i++) {
      const demo = DEMO_PROMPTS[i];
      await prisma.promptLibraryItem.create({
        data: {
          userId,
          title: demo.title,
          body: demo.body,
          category: demo.category,
          tags: JSON.stringify(demo.tags),
          collectionId: i < 4 && contentOps ? contentOps.id : null,
          favorite: demo.favorite,
          useCount: demo.useCount,
          lastUsedAt: demo.lastUsedAt ? new Date(demo.lastUsedAt) : null,
        },
      });
    }
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await seedPromptLibrary(session.id);

    const [collections, prompts] = await Promise.all([
      prisma.promptCollection.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "asc" },
      }),
      prisma.promptLibraryItem.findMany({
        where: { userId: session.id },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const mapped = prompts.map(mapPrompt);
    const collCounts = new Map<string, number>();
    for (const p of mapped) {
      if (p.collectionId) {
        collCounts.set(p.collectionId, (collCounts.get(p.collectionId) ?? 0) + 1);
      }
    }

    return NextResponse.json({
      collections: collections.map((c) =>
        mapCollection(c, collCounts.get(c.id) ?? 0)
      ),
      prompts: mapped,
      mostUsed: getMostUsed(mapped),
      recentlyUsed: getRecentlyUsed(mapped),
      tags: getAllTags(mapped),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "create") {
      const row = await prisma.promptLibraryItem.create({
        data: {
          userId: session.id,
          title: String(body.title ?? "Untitled prompt").trim(),
          body: String(body.body ?? "").trim(),
          category: (body.category as PromptCategoryId) ?? "linkedin",
          tags: JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
          collectionId: body.collectionId ?? null,
          favorite: Boolean(body.favorite),
        },
      });
      return NextResponse.json({ prompt: mapPrompt(row) });
    }

    if (body.action === "update") {
      const existing = await prisma.promptLibraryItem.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const data: Record<string, unknown> = {};
      if (body.title !== undefined) data.title = String(body.title).trim();
      if (body.body !== undefined) data.body = String(body.body).trim();
      if (body.category !== undefined) data.category = body.category;
      if (body.tags !== undefined) data.tags = JSON.stringify(body.tags);
      if (body.collectionId !== undefined) data.collectionId = body.collectionId;
      if (body.favorite !== undefined) data.favorite = Boolean(body.favorite);

      const row = await prisma.promptLibraryItem.update({
        where: { id: body.id },
        data,
      });
      return NextResponse.json({ prompt: mapPrompt(row) });
    }

    if (body.action === "delete") {
      const existing = await prisma.promptLibraryItem.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      await prisma.promptLibraryItem.delete({ where: { id: body.id } });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "favorite") {
      const existing = await prisma.promptLibraryItem.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const row = await prisma.promptLibraryItem.update({
        where: { id: body.id },
        data: { favorite: Boolean(body.favorite) },
      });
      return NextResponse.json({ prompt: mapPrompt(row) });
    }

    if (body.action === "use") {
      const existing = await prisma.promptLibraryItem.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const row = await prisma.promptLibraryItem.update({
        where: { id: body.id },
        data: {
          useCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });
      return NextResponse.json({ prompt: mapPrompt(row) });
    }

    if (body.action === "create-collection") {
      const row = await prisma.promptCollection.create({
        data: {
          userId: session.id,
          name: String(body.name ?? "New Collection").trim(),
          icon: String(body.icon ?? "📁"),
          color: String(body.color ?? "#7C3AED"),
        },
      });
      return NextResponse.json({
        collection: mapCollection(row, 0),
      });
    }

    if (body.action === "delete-collection") {
      const existing = await prisma.promptCollection.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      await prisma.promptLibraryItem.updateMany({
        where: { userId: session.id, collectionId: body.id },
        data: { collectionId: null },
      });
      await prisma.promptCollection.delete({ where: { id: body.id } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
