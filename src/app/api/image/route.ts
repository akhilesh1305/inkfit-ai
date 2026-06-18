import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateImage } from "@/lib/ai";
import { DEMO_GALLERY, getAspectSize, type GalleryImage, type ImageStyleId, type AspectRatioId } from "@/lib/image-studio";

function mapItem(row: {
  id: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  url: string;
  favorite: boolean;
  createdAt: Date;
}): GalleryImage {
  return {
    id: row.id,
    prompt: row.prompt,
    style: row.style as ImageStyleId,
    aspectRatio: row.aspectRatio as AspectRatioId,
    url: row.url,
    favorite: row.favorite,
    createdAt: row.createdAt.toISOString(),
  };
}

async function seedForUser(userId: string) {
  const count = await prisma.imageStudioItem.count({ where: { userId } });
  if (count > 0) return;

  for (const item of DEMO_GALLERY) {
    await prisma.imageStudioItem.create({
      data: {
        userId,
        prompt: item.prompt,
        style: item.style,
        aspectRatio: item.aspectRatio,
        url: item.url,
        favorite: item.favorite,
      },
    });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await seedForUser(session.id);

    const items = await prisma.imageStudioItem.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items: items.map(mapItem) });
  } catch {
    const now = new Date().toISOString();
    return NextResponse.json({
      items: DEMO_GALLERY.map((item, i) => ({
        id: `demo-${i}`,
        ...item,
        createdAt: now,
      })),
    });
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
      const styleId = body.styleId as ImageStyleId;
      const aspectRatio = body.aspectRatio as AspectRatioId;
      const size = getAspectSize(aspectRatio);

      const result = await generateImage({
        prompt: body.prompt,
        style: styleId,
        styleId,
        size,
        aspectRatio,
      });

      const item = await prisma.imageStudioItem.create({
        data: {
          userId: session.id,
          prompt: String(body.prompt).trim(),
          style: styleId,
          aspectRatio,
          url: result.url,
          favorite: false,
        },
      });

      return NextResponse.json({
        item: mapItem(item),
        live: result.live,
      });
    }

    if (body.action === "favorite") {
      const existing = await prisma.imageStudioItem.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const item = await prisma.imageStudioItem.update({
        where: { id: body.id },
        data: { favorite: Boolean(body.favorite) },
      });
      return NextResponse.json({ item: mapItem(item) });
    }

    if (body.action === "delete") {
      const existing = await prisma.imageStudioItem.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      await prisma.imageStudioItem.delete({ where: { id: body.id } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
