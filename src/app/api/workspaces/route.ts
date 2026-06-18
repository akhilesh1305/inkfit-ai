import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PERSONAL_WORKSPACE,
  DEMO_CLIENT_WORKSPACE,
  DEMO_TEAM_WORKSPACE,
  slugify,
  type WorkspaceType,
} from "@/lib/workspaces";
import {
  getActiveWorkspaceIdForUser,
  getWorkspaceStats,
  mapWorkspace,
  setActiveWorkspaceForUser,
} from "@/lib/workspace-context";

async function seedWorkspaces(userId: string) {
  const count = await prisma.workspace.count({ where: { ownerId: userId } });
  if (count > 0) return;

  const personal = await prisma.workspace.create({
    data: {
      ownerId: userId,
      ...DEFAULT_PERSONAL_WORKSPACE,
      description: DEFAULT_PERSONAL_WORKSPACE.description,
      isDefault: true,
    },
  });

  await prisma.workspaceMember.create({
    data: { workspaceId: personal.id, userId, role: "owner" },
  });

  const team = await prisma.workspace.create({
    data: {
      ownerId: userId,
      ...DEMO_TEAM_WORKSPACE,
      description: DEMO_TEAM_WORKSPACE.description,
    },
  });

  await prisma.workspaceMember.create({
    data: { workspaceId: team.id, userId, role: "owner" },
  });

  const client = await prisma.agencyClient.findFirst({ orderBy: { createdAt: "asc" } });
  const clientWs = await prisma.workspace.create({
    data: {
      ownerId: userId,
      name: client?.name ?? DEMO_CLIENT_WORKSPACE.name,
      slug: slugify(client?.name ?? DEMO_CLIENT_WORKSPACE.slug),
      type: "client",
      icon: DEMO_CLIENT_WORKSPACE.icon,
      color: client?.brandColor ?? DEMO_CLIENT_WORKSPACE.color,
      description: DEMO_CLIENT_WORKSPACE.description,
      clientId: client?.id ?? null,
    },
  });

  await prisma.workspaceMember.create({
    data: { workspaceId: clientWs.id, userId, role: "owner" },
  });

  await setActiveWorkspaceForUser(userId, personal.id);

  await prisma.workspaceContent.updateMany({
    where: { userId, workspaceId: null },
    data: { workspaceId: personal.id },
  });
  await prisma.workspaceFolder.updateMany({
    where: { userId, workspaceId: null },
    data: { workspaceId: personal.id },
  });
}

async function buildWorkspaceList(userId: string) {
  const rows = await prisma.workspace.findMany({
    where: { ownerId: userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  const clientIds = rows.map((r) => r.clientId).filter(Boolean) as string[];
  const clients =
    clientIds.length > 0
      ? await prisma.agencyClient.findMany({ where: { id: { in: clientIds } } })
      : [];

  const workspaces = await Promise.all(
    rows.map(async (row) => {
      const stats = await getWorkspaceStats(row.id);
      const client = clients.find((c) => c.id === row.clientId);
      return mapWorkspace(row, stats, client?.name);
    })
  );

  return workspaces;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await seedWorkspaces(session.id);

    const [workspaces, activeId] = await Promise.all([
      buildWorkspaceList(session.id),
      getActiveWorkspaceIdForUser(session.id),
    ]);

    const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0] ?? null;

    return NextResponse.json({ workspaces, active });
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
      const name = String(body.name ?? "New Workspace").trim();
      const type = (body.type as WorkspaceType) ?? "personal";
      let slug = slugify(body.slug ?? name);
      const existingSlug = await prisma.workspace.findUnique({
        where: { ownerId_slug: { ownerId: session.id, slug } },
      });
      if (existingSlug) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

      const meta = type === "team"
        ? { icon: "👥", color: "#3B82F6" }
        : type === "client"
          ? { icon: "💼", color: "#06B6D4" }
          : { icon: "👤", color: "#7C3AED" };

      const row = await prisma.workspace.create({
        data: {
          ownerId: session.id,
          name,
          slug,
          type,
          description: body.description ? String(body.description) : null,
          icon: body.icon ?? meta.icon,
          color: body.color ?? meta.color,
          clientId: body.clientId ?? null,
          isDefault: false,
        },
      });

      await prisma.workspaceMember.create({
        data: { workspaceId: row.id, userId: session.id, role: "owner" },
      });

      const workspace = mapWorkspace(row, { memberCount: 1, contentCount: 0 });
      return NextResponse.json({ workspace });
    }

    if (body.action === "switch") {
      const workspaceId = String(body.workspaceId);
      const ws = await prisma.workspace.findFirst({
        where: { id: workspaceId, ownerId: session.id },
      });
      if (!ws) {
        return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
      }

      await setActiveWorkspaceForUser(session.id, workspaceId);
      const stats = await getWorkspaceStats(workspaceId);
      let clientName: string | undefined;
      if (ws.clientId) {
        const client = await prisma.agencyClient.findUnique({ where: { id: ws.clientId } });
        clientName = client?.name;
      }

      return NextResponse.json({
        active: mapWorkspace(ws, stats, clientName),
      });
    }

    if (body.action === "delete") {
      const workspaceId = String(body.workspaceId);
      const ws = await prisma.workspace.findFirst({
        where: { id: workspaceId, ownerId: session.id },
      });
      if (!ws) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (ws.isDefault) {
        return NextResponse.json(
          { error: "Cannot delete your default personal workspace" },
          { status: 400 }
        );
      }

      const pref = await prisma.userWorkspacePreference.findUnique({
        where: { userId: session.id },
      });
      if (pref?.activeWorkspaceId === workspaceId) {
        const fallback = await prisma.workspace.findFirst({
          where: { ownerId: session.id, isDefault: true },
        });
        if (fallback) await setActiveWorkspaceForUser(session.id, fallback.id);
      }

      await prisma.workspaceContent.deleteMany({ where: { workspaceId } });
      await prisma.workspaceFolder.deleteMany({ where: { workspaceId } });
      await prisma.workspaceMember.deleteMany({ where: { workspaceId } });
      await prisma.workspace.delete({ where: { id: workspaceId } });

      const workspaces = await buildWorkspaceList(session.id);
      const activeId = await getActiveWorkspaceIdForUser(session.id);
      const active = workspaces.find((w) => w.id === activeId) ?? null;

      return NextResponse.json({ ok: true, workspaces, active });
    }

    if (body.action === "update") {
      const workspaceId = String(body.workspaceId);
      const ws = await prisma.workspace.findFirst({
        where: { id: workspaceId, ownerId: session.id },
      });
      if (!ws) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const row = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          name: body.name !== undefined ? String(body.name).trim() : undefined,
          description:
            body.description !== undefined
              ? body.description
                ? String(body.description)
                : null
              : undefined,
          icon: body.icon,
          color: body.color,
        },
      });

      const stats = await getWorkspaceStats(workspaceId);
      return NextResponse.json({ workspace: mapWorkspace(row, stats) });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
