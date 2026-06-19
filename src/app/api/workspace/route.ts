import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { getActiveWorkspaceIdForUser } from "@/lib/workspace-context";
import {
  DEMO_CONTENT,
  DEMO_FOLDERS,
  parseTags,
  type WorkspaceFolder,
  type WorkspaceItem,
} from "@/lib/workspace";

function mapItem(row: {
  id: string;
  title: string;
  body: string;
  type: string;
  status: string;
  folderId: string | null;
  tags: string;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}): WorkspaceItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type as WorkspaceItem["type"],
    status: row.status as WorkspaceItem["status"],
    folderId: row.folderId ?? undefined,
    tags: parseTags(row.tags),
    favorite: row.favorite,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapFolder(row: { id: string; name: string; color: string }): WorkspaceFolder {
  return { id: row.id, name: row.name, color: row.color };
}

function demoResponse(userId: string) {
  const now = new Date().toISOString();
  const folders: WorkspaceFolder[] = DEMO_FOLDERS.map((f, i) => ({
    id: `demo-folder-${i}`,
    ...f,
  }));
  const items: WorkspaceItem[] = DEMO_CONTENT.map((item, i) => ({
    id: `demo-item-${i}`,
    ...item,
    folderId: i < 2 ? folders[0]?.id : i < 4 ? folders[1]?.id : folders[2]?.id,
    createdAt: now,
    updatedAt: now,
  }));
  return { folders, items, userId };
}

async function seedForUser(userId: string, workspaceId: string) {
  const existing = await prisma.workspaceContent.count({
    where: { userId, workspaceId },
  });
  if (existing > 0) return;

  const folders: WorkspaceFolder[] = [];
  for (const f of DEMO_FOLDERS) {
    const created = await prisma.workspaceFolder.create({
      data: { userId, workspaceId, name: f.name, color: f.color },
    });
    folders.push(mapFolder(created));
  }

  for (let i = 0; i < DEMO_CONTENT.length; i++) {
    const item = DEMO_CONTENT[i];
    await prisma.workspaceContent.create({
      data: {
        userId,
        workspaceId,
        title: item.title,
        body: item.body,
        type: item.type,
        status: item.status,
        folderId: i < 2 ? folders[0]?.id : i < 4 ? folders[1]?.id : folders[2]?.id,
        tags: JSON.stringify(item.tags),
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

    const workspaceId = await getActiveWorkspaceIdForUser(session.id);
    if (!workspaceId) {
      return NextResponse.json({ folders: [], items: [] });
    }

    await seedForUser(session.id, workspaceId);

    const [folders, items] = await Promise.all([
      prisma.workspaceFolder.findMany({
        where: { userId: session.id, workspaceId },
        orderBy: { name: "asc" },
      }),
      prisma.workspaceContent.findMany({
        where: { userId: session.id, workspaceId },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      folders: folders.map(mapFolder),
      items: items.map(mapItem),
    });
  } catch {
    const session = await getSession();
    return NextResponse.json(demoResponse(session?.id ?? "demo"));
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = await getActiveWorkspaceIdForUser(session.id);
    if (!workspaceId) {
      return NextResponse.json({ error: "No active workspace" }, { status: 400 });
    }

    const body = await req.json();

    if (body.action === "delete") {
      const auth = await requirePermission("content:delete", workspaceId);
      if (!auth.ok) return auth.response;
    } else {
      const auth = await requirePermission("content:write", workspaceId);
      if (!auth.ok) return auth.response;
    }

    if (body.action === "create") {
      const item = await prisma.workspaceContent.create({
        data: {
          userId: session.id,
          workspaceId,
          title: String(body.title || "Untitled").trim(),
          body: String(body.body || ""),
          type: body.type || "blog",
          status: body.status || "draft",
          folderId: body.folderId || null,
          tags: JSON.stringify(body.tags || []),
          favorite: Boolean(body.favorite),
        },
      });
      return NextResponse.json({ item: mapItem(item) });
    }

    if (body.action === "update") {
      const existing = await prisma.workspaceContent.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const item = await prisma.workspaceContent.update({
        where: { id: body.id },
        data: {
          title: body.title !== undefined ? String(body.title).trim() : undefined,
          body: body.body !== undefined ? String(body.body) : undefined,
          type: body.type,
          status: body.status,
          folderId: body.folderId === null ? null : body.folderId,
          tags: body.tags !== undefined ? JSON.stringify(body.tags) : undefined,
          favorite: body.favorite,
        },
      });
      return NextResponse.json({ item: mapItem(item) });
    }

    if (body.action === "duplicate") {
      const source = await prisma.workspaceContent.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!source) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const item = await prisma.workspaceContent.create({
        data: {
          userId: session.id,
          workspaceId,
          title: `${source.title} (Copy)`,
          body: source.body,
          type: source.type,
          status: "draft",
          folderId: source.folderId,
          tags: source.tags,
          favorite: false,
        },
      });
      return NextResponse.json({ item: mapItem(item) });
    }

    if (body.action === "delete") {
      const existing = await prisma.workspaceContent.findFirst({
        where: { id: body.id, userId: session.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      await prisma.workspaceContent.delete({ where: { id: body.id } });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "create-folder") {
      const folder = await prisma.workspaceFolder.create({
        data: {
          userId: session.id,
          workspaceId,
          name: String(body.name || "New Folder").trim(),
          color: body.color || "#7C3AED",
        },
      });
      return NextResponse.json({ folder: mapFolder(folder) });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
