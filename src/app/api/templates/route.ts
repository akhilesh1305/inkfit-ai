import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  MARKETPLACE_TEMPLATES,
  mergeTemplateData,
  getTemplateById,
  categoryToWorkspaceType,
  getTrending,
  getMostUsed,
  type TemplateWithMeta,
} from "@/lib/templates-marketplace";

async function seedUseCounts() {
  for (const t of MARKETPLACE_TEMPLATES) {
    await prisma.templateUseCount.upsert({
      where: { templateId: t.id },
      create: { templateId: t.id, count: t.baseUseCount },
      update: {},
    });
  }
}

async function getUseCountMap(): Promise<Record<string, number>> {
  const rows = await prisma.templateUseCount.findMany();
  const map: Record<string, number> = {};
  for (const t of MARKETPLACE_TEMPLATES) {
    map[t.id] = t.baseUseCount;
  }
  for (const row of rows) {
    map[row.templateId] = row.count;
  }
  return map;
}

function buildResponse(
  templates: TemplateWithMeta[],
  favoriteIds: string[]
) {
  return {
    templates,
    favorites: favoriteIds,
    trending: getTrending(templates),
    mostUsed: getMostUsed(templates),
  };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await seedUseCounts();

    const [useCounts, favorites] = await Promise.all([
      getUseCountMap(),
      prisma.templateFavorite.findMany({
        where: { userId: session.id },
        select: { templateId: true },
      }),
    ]);

    const favoriteIds = new Set(favorites.map((f) => f.templateId));
    const templates = mergeTemplateData(
      MARKETPLACE_TEMPLATES,
      useCounts,
      favoriteIds
    );

    return NextResponse.json(
      buildResponse(templates, [...favoriteIds])
    );
  } catch {
    const favoriteIds = new Set<string>();
    const templates = mergeTemplateData(
      MARKETPLACE_TEMPLATES,
      Object.fromEntries(MARKETPLACE_TEMPLATES.map((t) => [t.id, t.baseUseCount])),
      favoriteIds
    );
    return NextResponse.json(buildResponse(templates, []));
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const templateId = String(body.templateId);

    if (body.action === "favorite") {
      const favorite = Boolean(body.favorite);
      if (favorite) {
        await prisma.templateFavorite.upsert({
          where: {
            userId_templateId: { userId: session.id, templateId },
          },
          create: { userId: session.id, templateId },
          update: {},
        });
      } else {
        await prisma.templateFavorite.deleteMany({
          where: { userId: session.id, templateId },
        });
      }

      const favorites = await prisma.templateFavorite.findMany({
        where: { userId: session.id },
        select: { templateId: true },
      });
      return NextResponse.json({
        favorite,
        favorites: favorites.map((f) => f.templateId),
      });
    }

    if (body.action === "use") {
      const template = getTemplateById(templateId);
      if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }

      await prisma.templateUseCount.upsert({
        where: { templateId },
        create: { templateId, count: template.baseUseCount + 1 },
        update: { count: { increment: 1 } },
      });

      const workspaceItem = await prisma.workspaceContent.create({
        data: {
          userId: session.id,
          title: template.title,
          body: template.body,
          type: categoryToWorkspaceType(template.category),
          status: "draft",
          tags: JSON.stringify([...template.tags, "template"]),
          favorite: false,
        },
      });

      const useCounts = await getUseCountMap();
      const count = useCounts[templateId] ?? template.baseUseCount;

      return NextResponse.json({
        ok: true,
        workspaceId: workspaceItem.id,
        route: getCategoryMetaRoute(template.category),
        useCount: count,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function getCategoryMetaRoute(category: string): string {
  const routes: Record<string, string> = {
    linkedin: "/dashboard/linkedin",
    seo: "/dashboard/seo",
    blog: "/dashboard/blog",
    email: "/dashboard/social",
    carousel: "/dashboard/carousel",
  };
  return routes[category] ?? "/dashboard/workspace";
}
