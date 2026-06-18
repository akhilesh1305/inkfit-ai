import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isAdminEmail,
  ADMIN_KPIS,
  REVENUE_TREND,
  USER_GROWTH,
  CONTENT_GEN_TREND,
  PLAN_BREAKDOWN,
  DEMO_TICKETS,
  SYSTEM_SERVICES,
  type AdminUser,
} from "@/lib/admin";

function forbidden() {
  return NextResponse.json({ error: "Admin access required" }, { status: 403 });
}

async function requireAdmin() {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isAdminEmail(session.email)) return { error: forbidden() };
  return { session };
}

function mapUser(
  user: { id: string; name: string; email: string; plan: string; createdAt: Date },
  contentCount: number
): AdminUser {
  const daysSinceJoin = Math.floor((Date.now() - user.createdAt.getTime()) / 86400000);
  const lastActive = new Date(Date.now() - Math.random() * Math.min(daysSinceJoin, 14) * 86400000);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    status: "active",
    contentCount,
    joinedAt: user.createdAt.toISOString(),
    lastActive: lastActive.toISOString(),
  };
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const subscriptions = await prisma.subscription.findMany();
    const activeSubs = subscriptions.filter((s) => s.status === "active").length;

    const workspaceCounts = await prisma.workspaceContent.groupBy({
      by: ["userId"],
      _count: { id: true },
    });
    const countMap = Object.fromEntries(
      workspaceCounts.map((w) => [w.userId, w._count.id])
    );

    const totalUsers = await prisma.user.count();
    const contentTotal = await prisma.workspaceContent.count();

    const kpis = {
      ...ADMIN_KPIS,
      totalUsers: Math.max(totalUsers, ADMIN_KPIS.totalUsers),
      activeSubscriptions: Math.max(activeSubs, ADMIN_KPIS.activeSubscriptions),
      contentGenerated: Math.max(contentTotal + 47000, ADMIN_KPIS.contentGenerated),
    };

    const adminUsers = users.map((u) => mapUser(u, countMap[u.id] ?? 0));

    return NextResponse.json({
      kpis,
      users: adminUsers,
      tickets: DEMO_TICKETS,
      services: SYSTEM_SERVICES,
      charts: {
        revenue: REVENUE_TREND,
        userGrowth: USER_GROWTH,
        contentGenerated: CONTENT_GEN_TREND,
        planBreakdown: PLAN_BREAKDOWN,
      },
    });
  } catch {
    return NextResponse.json({
      kpis: ADMIN_KPIS,
      users: [],
      tickets: DEMO_TICKETS,
      services: SYSTEM_SERVICES,
      charts: {
        revenue: REVENUE_TREND,
        userGrowth: USER_GROWTH,
        contentGenerated: CONTENT_GEN_TREND,
        planBreakdown: PLAN_BREAKDOWN,
      },
    });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await req.json();

  if (body.action === "update-plan") {
    const user = await prisma.user.update({
      where: { id: body.userId },
      data: { plan: body.plan },
    });
    await prisma.subscription.upsert({
      where: { userId: body.userId },
      create: { userId: body.userId, planId: body.plan },
      update: { planId: body.plan },
    });
    return NextResponse.json({ user: { id: user.id, plan: user.plan } });
  }

  if (body.action === "resolve-ticket") {
    return NextResponse.json({ ok: true, ticketId: body.ticketId });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function HEAD() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  return new NextResponse(null, { status: 200 });
}
