import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildSummary,
  DEMO_PERFORMANCE_SEED,
  getChartData,
  getLeaderboard,
  getTopPerforming,
  mapPerformanceRow,
  type ChartPeriod,
} from "@/lib/content-performance";

async function seedPerformance(userId: string) {
  const count = await prisma.contentPerformance.count({ where: { userId } });
  if (count > 0) return;

  for (const item of DEMO_PERFORMANCE_SEED) {
    await prisma.contentPerformance.create({
      data: {
        userId,
        title: item.title,
        contentType: item.contentType,
        platform: item.platform,
        views: item.views,
        engagements: item.engagements,
        clicks: item.clicks,
        shares: item.shares,
        comments: item.comments,
        publishedAt: item.publishedAt,
      },
    });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await seedPerformance(session.id);

    const { searchParams } = new URL(req.url);
    const period = (searchParams.get("period") as ChartPeriod) ?? "daily";

    const rows = await prisma.contentPerformance.findMany({
      where: { userId: session.id },
      orderBy: { views: "desc" },
    });

    const items = rows.map(mapPerformanceRow);
    const summary = buildSummary(items);
    const leaderboard = getLeaderboard(items);
    const topPerforming = getTopPerforming(items, 5);

    return NextResponse.json({
      summary,
      items,
      leaderboard,
      topPerforming,
      chart: getChartData(period),
      charts: {
        daily: getChartData("daily"),
        weekly: getChartData("weekly"),
        monthly: getChartData("monthly"),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
