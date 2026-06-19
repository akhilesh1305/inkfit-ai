import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import {
  DEFAULT_TEAM_SETTINGS,
  avatarColorForEmail,
  normalizeTeamRole,
  type TeamRole,
  type TeamMemberStatus,
} from "@/lib/team";
import { DEMO_TEAM_WORKSPACE } from "@/lib/workspaces";
import { canInviteTeamMember } from "@/lib/billing-service";

async function getOrCreateTeamWorkspace(userId: string) {
  let workspace = await prisma.workspace.findFirst({
    where: { ownerId: userId, type: "team" },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        ownerId: userId,
        ...DEMO_TEAM_WORKSPACE,
        description: DEMO_TEAM_WORKSPACE.description,
      },
    });

    await prisma.workspaceMember.create({
      data: { workspaceId: workspace.id, userId, role: "team_admin" },
    });
  }

  return workspace;
}

function mapMember(row: {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamMemberStatus;
  avatarColor: string;
}) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    avatarColor: row.avatarColor,
  };
}

async function listTeamMembers(userId: string, workspaceId: string) {
  const owner = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  const memberRows = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "asc" },
  });

  const userIds = memberRows.map((m) => m.userId);
  const users =
    userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  const rows: {
    id: string;
    name: string;
    email: string;
    role: TeamRole;
    status: TeamMemberStatus;
    avatarColor: string;
  }[] = [];

  if (owner) {
    rows.push({
      id: `owner-${owner.id}`,
      name: owner.name,
      email: owner.email,
      role: "team_admin",
      status: "active",
      avatarColor: avatarColorForEmail(owner.email),
    });
  }

  for (const member of memberRows) {
    if (member.userId === userId) continue;
    const user = userMap.get(member.userId);
    if (!user) continue;
    rows.push({
      id: member.id,
      name: user.name,
      email: user.email,
      role: normalizeTeamRole(member.role),
      status: "active",
      avatarColor: avatarColorForEmail(user.email),
    });
  }

  return rows;
}

export async function GET() {
  try {
    const auth = await requirePermission("settings:team");
    if (!auth.ok) return auth.response;

    const userId = auth.ctx.user.id;
    const workspace = await getOrCreateTeamWorkspace(userId);
    const members = await listTeamMembers(userId, workspace.id);

    return NextResponse.json({
      members: members.map(mapMember),
      settings: {
        name: workspace.name,
        allowInvites: DEFAULT_TEAM_SETTINGS.allowInvites,
        defaultRole: DEFAULT_TEAM_SETTINGS.defaultRole,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requirePermission("settings:team");
    if (!auth.ok) return auth.response;

    const userId = auth.ctx.user.id;
    const body = await req.json();
    const workspace = await getOrCreateTeamWorkspace(userId);

    if (body.action === "invite") {
      const seatCheck = await canInviteTeamMember(userId);
      if (!seatCheck.ok) {
        return NextResponse.json(
          { error: seatCheck.reason, upgradeUrl: "/dashboard/billing" },
          { status: 402 }
        );
      }

      const email = String(body.email).trim().toLowerCase();
      const invitee = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true },
      });
      if (!invitee) {
        return NextResponse.json(
          { error: "User must have an InkFit account. Ask them to register first." },
          { status: 400 }
        );
      }

      if (invitee.id === userId) {
        return NextResponse.json({ error: "You are already the workspace owner" }, { status: 400 });
      }

      const existing = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: workspace.id, userId: invitee.id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Member already exists" }, { status: 400 });
      }

      const role = normalizeTeamRole((body.role as string) || DEFAULT_TEAM_SETTINGS.defaultRole);
      const member = await prisma.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: invitee.id,
          role,
        },
      });

      return NextResponse.json({
        member: mapMember({
          id: member.id,
          name: invitee.name,
          email: invitee.email,
          role,
          status: "active",
          avatarColor: avatarColorForEmail(invitee.email),
        }),
      });
    }

    if (body.action === "update") {
      const member = await prisma.workspaceMember.findFirst({
        where: { id: body.id, workspaceId: workspace.id },
      });
      if (!member) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }

      const memberUser = await prisma.user.findUnique({
        where: { id: member.userId },
        select: { name: true, email: true },
      });
      if (!memberUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const updated = await prisma.workspaceMember.update({
        where: { id: member.id },
        data: {
          ...(body.role && { role: normalizeTeamRole(body.role) }),
        },
      });

      return NextResponse.json({
        member: mapMember({
          id: updated.id,
          name: memberUser.name,
          email: memberUser.email,
          role: normalizeTeamRole(updated.role),
          status: "active",
          avatarColor: avatarColorForEmail(memberUser.email),
        }),
      });
    }

    if (body.action === "remove") {
      const deleted = await prisma.workspaceMember.deleteMany({
        where: { id: body.id, workspaceId: workspace.id },
      });
      if (deleted.count === 0) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    }

    if (body.action === "settings") {
      const updated = await prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          ...(body.name !== undefined && { name: String(body.name).trim() || workspace.name }),
        },
      });
      return NextResponse.json({
        settings: {
          name: updated.name,
          allowInvites: DEFAULT_TEAM_SETTINGS.allowInvites,
          defaultRole: (body.defaultRole as TeamRole) ?? DEFAULT_TEAM_SETTINGS.defaultRole,
        },
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
