import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  DEMO_MEMBERS,
  DEFAULT_TEAM_SETTINGS,
  avatarColorForEmail,
  type TeamRole,
  type TeamMemberStatus,
} from "@/lib/team";

async function getOrCreateWorkspace() {
  let workspace = await prisma.teamWorkspace.findFirst();
  if (!workspace) {
    workspace = await prisma.teamWorkspace.create({
      data: {
        name: DEFAULT_TEAM_SETTINGS.name,
        allowInvites: DEFAULT_TEAM_SETTINGS.allowInvites,
        defaultRole: DEFAULT_TEAM_SETTINGS.defaultRole,
      },
    });
  }
  return workspace;
}

async function seedMembersIfEmpty() {
  const count = await prisma.teamMember.count();
  if (count > 0) return;

  for (const m of DEMO_MEMBERS) {
    await prisma.teamMember.create({
      data: {
        name: m.name,
        email: m.email,
        role: m.role,
        status: m.status,
        avatarColor: m.avatarColor ?? avatarColorForEmail(m.email),
      },
    });
  }
}

function mapMember(m: {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatarColor: string | null;
}) {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role as TeamRole,
    status: m.status as TeamMemberStatus,
    avatarColor: m.avatarColor ?? avatarColorForEmail(m.email),
  };
}

export async function GET() {
  try {
    await seedMembersIfEmpty();
    const workspace = await getOrCreateWorkspace();
    const members = await prisma.teamMember.findMany({ orderBy: { createdAt: "asc" } });

    return NextResponse.json({
      members: members.map(mapMember),
      settings: {
        name: workspace.name,
        allowInvites: workspace.allowInvites,
        defaultRole: workspace.defaultRole as TeamRole,
      },
    });
  } catch {
    return NextResponse.json({
      members: DEMO_MEMBERS.map((m, i) => ({
        id: `demo-${i}`,
        ...m,
        avatarColor: m.avatarColor ?? avatarColorForEmail(m.email),
      })),
      settings: DEFAULT_TEAM_SETTINGS,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const workspace = await getOrCreateWorkspace();

    if (body.action === "invite") {
      const email = String(body.email).trim().toLowerCase();
      const existing = await prisma.teamMember.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "Member already exists" }, { status: 400 });
      }

      const member = await prisma.teamMember.create({
        data: {
          name: String(body.name).trim(),
          email,
          role: (body.role as TeamRole) || workspace.defaultRole,
          status: "invited",
          avatarColor: avatarColorForEmail(email),
        },
      });
      return NextResponse.json({ member: mapMember(member) });
    }

    if (body.action === "update") {
      const member = await prisma.teamMember.update({
        where: { id: body.id },
        data: {
          ...(body.role && { role: body.role }),
          ...(body.status && { status: body.status }),
          ...(body.name && { name: body.name }),
        },
      });
      return NextResponse.json({ member: mapMember(member) });
    }

    if (body.action === "remove") {
      await prisma.teamMember.delete({ where: { id: body.id } });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "settings") {
      const updated = await prisma.teamWorkspace.update({
        where: { id: workspace.id },
        data: {
          ...(body.name !== undefined && { name: body.name }),
          ...(body.allowInvites !== undefined && { allowInvites: body.allowInvites }),
          ...(body.defaultRole !== undefined && { defaultRole: body.defaultRole }),
        },
      });
      return NextResponse.json({
        settings: {
          name: updated.name,
          allowInvites: updated.allowInvites,
          defaultRole: updated.defaultRole as TeamRole,
        },
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
