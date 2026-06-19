import { prisma } from "@/lib/prisma";
import {
  buildMetrics,
  estimateEngagementFromImpressions,
  extractAttributionFields,
  parseMetadata,
} from "@/lib/attribution/extract";
import type {
  AttributionDashboard,
  AttributionRecord,
  AttributionSummary,
  AttributionTrendPoint,
  RankedItem,
} from "@/lib/attribution/types";
import { DEMO_PERFORMANCE_SEED } from "@/lib/content-performance";

function mapRow(row: {
  id: string;
  generatedContentId: string | null;
  feature: string;
  title: string;
  topic: string | null;
  hook: string | null;
  cta: string | null;
  platform: string | null;
  status: string;
  impressions: number;
  views: number;
  engagements: number;
  clicks: number;
  shares: number;
  comments: number;
  performanceScore: number;
  publishedAt: Date | null;
  generatedAt: Date;
}): AttributionRecord {
  const metrics = buildMetrics(row);
  return {
    id: row.id,
    generatedContentId: row.generatedContentId,
    feature: row.feature,
    title: row.title,
    topic: row.topic,
    hook: row.hook,
    cta: row.cta,
    platform: row.platform,
    status: row.status as AttributionRecord["status"],
    impressions: row.impressions,
    views: row.views,
    engagements: row.engagements,
    clicks: row.clicks,
    shares: row.shares,
    comments: row.comments,
    engagementRate: metrics.engagementRate,
    ctr: metrics.ctr,
    performanceScore: row.performanceScore || metrics.performanceScore,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    generatedAt: row.generatedAt.toISOString(),
  };
}

function rankByField(
  records: AttributionRecord[],
  field: "topic" | "hook" | "cta",
  minCount = 1
): RankedItem[] {
  const groups = new Map<string, AttributionRecord[]>();

  for (const r of records) {
    const raw = r[field];
    if (!raw || raw.trim().length < 3) continue;
    const key = raw.trim().toLowerCase();
    const list = groups.get(key) ?? [];
    list.push(r);
    groups.set(key, list);
  }

  return [...groups.entries()]
    .filter(([, items]) => items.length >= minCount)
    .map(([key, items]) => {
      const totalViews = items.reduce((s, i) => s + i.views, 0);
      const totalEngagements = items.reduce((s, i) => s + i.engagements, 0);
      const avgScore = items.reduce((s, i) => s + i.performanceScore, 0) / items.length;
      return {
        key,
        label: items[0][field] ?? key,
        count: items.length,
        totalEngagements,
        totalViews,
        avgEngagementRate:
          totalViews > 0 ? Math.round((totalEngagements / totalViews) * 1000) / 10 : 0,
        avgScore: Math.round(avgScore),
        sampleTitle: items[0].title,
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore || b.totalEngagements - a.totalEngagements)
    .slice(0, 10);
}

function buildSummary(records: AttributionRecord[]): AttributionSummary {
  const published = records.filter((r) => r.status === "published").length;
  const totalViews = records.reduce((s, r) => s + r.views, 0);
  const totalEngagements = records.reduce((s, r) => s + r.engagements, 0);

  return {
    totalGenerated: records.length,
    totalPublished: published,
    totalViews,
    totalEngagements,
    avgEngagementRate:
      totalViews > 0 ? Math.round((totalEngagements / totalViews) * 1000) / 10 : 0,
    publishRate:
      records.length > 0 ? Math.round((published / records.length) * 1000) / 10 : 0,
  };
}

function buildTrend(records: AttributionRecord[]): AttributionTrendPoint[] {
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
  const buckets = weeks.map((label) => ({
    label,
    generated: 0,
    published: 0,
    engagements: 0,
  }));

  const now = Date.now();
  for (const r of records) {
    const ts = new Date(r.publishedAt ?? r.generatedAt).getTime();
    const weeksAgo = Math.floor((now - ts) / (7 * 24 * 60 * 60 * 1000));
    const idx = Math.min(Math.max(7 - weeksAgo, 0), 7);
    buckets[idx].generated += 1;
    if (r.status === "published") buckets[idx].published += 1;
    buckets[idx].engagements += r.engagements;
  }

  return buckets;
}

export async function seedAttributionIfEmpty(userId: string) {
  const count = await prisma.contentAttribution.count({ where: { userId } });
  if (count > 0) return;

  const hooks = [
    "I almost gave up on AI content.\n\nThen one workflow changed everything.",
    "Most founders waste hours on content that doesn't convert.",
    "Everyone in our space is talking about content marketing.",
    "3 years ago, I knew nothing about LinkedIn growth.",
    "The SEO landscape is shifting faster than most teams can adapt.",
  ];
  const ctas = [
    "What's one lesson this taught you? Comment below 👇",
    "Follow for more — repost if this helped ♻️",
    "Save this for your next content sprint.",
    "DM me \"PLAYBOOK\" for the full template.",
    "What trends are you seeing? Share below.",
  ];

  for (let i = 0; i < DEMO_PERFORMANCE_SEED.length; i++) {
    const item = DEMO_PERFORMANCE_SEED[i];
    const metrics = buildMetrics({
      views: item.views,
      engagements: item.engagements,
      clicks: item.clicks,
      shares: item.shares,
      comments: item.comments,
    });

    await prisma.contentAttribution.create({
      data: {
        userId,
        feature: item.contentType,
        title: item.title,
        topic: item.title.split("—")[0]?.trim() ?? item.title,
        hook: hooks[i % hooks.length].split("\n")[0],
        cta: ctas[i % ctas.length],
        platform: item.platform,
        status: "published",
        impressions: item.views,
        views: item.views,
        engagements: item.engagements,
        clicks: item.clicks,
        shares: item.shares,
        comments: item.comments,
        performanceScore: metrics.performanceScore,
        publishedAt: item.publishedAt,
        generatedAt: item.publishedAt,
      },
    });
  }
}

export async function syncAttributionFromSources(userId: string) {
  const existingIds = new Set(
    (
      await prisma.contentAttribution.findMany({
        where: { userId, generatedContentId: { not: null } },
        select: { generatedContentId: true },
      })
    )
      .map((r) => r.generatedContentId)
      .filter(Boolean) as string[]
  );

  const generated = await prisma.generatedContent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  for (const row of generated) {
    if (existingIds.has(row.id)) continue;
    const meta = parseMetadata(row.metadata);
    const { topic, hook, cta } = extractAttributionFields(
      row.feature,
      row.title,
      row.body,
      meta
    );
    const metrics = buildMetrics({});

    await prisma.contentAttribution.create({
      data: {
        userId,
        workspaceId: row.workspaceId,
        generatedContentId: row.id,
        feature: row.feature,
        title: row.title,
        topic,
        hook,
        cta,
        status: row.status === "published" ? "published" : "generated",
        performanceScore: metrics.performanceScore,
        generatedAt: row.createdAt,
      },
    });
  }

  const perfRows = await prisma.contentPerformance.findMany({ where: { userId } });
  for (const perf of perfRows) {
    const match = await prisma.contentAttribution.findFirst({
      where: { userId, title: perf.title, status: "published" },
    });
    if (match) {
      const metrics = buildMetrics({
        views: perf.views,
        engagements: perf.engagements,
        clicks: perf.clicks,
        shares: perf.shares,
        comments: perf.comments,
      });
      await prisma.contentAttribution.update({
        where: { id: match.id },
        data: {
          views: perf.views,
          impressions: perf.views,
          engagements: perf.engagements,
          clicks: perf.clicks,
          shares: perf.shares,
          comments: perf.comments,
          performanceScore: metrics.performanceScore,
          publishedAt: perf.publishedAt,
          status: "published",
        },
      });
      continue;
    }

    const metrics = buildMetrics({
      views: perf.views,
      engagements: perf.engagements,
      clicks: perf.clicks,
      shares: perf.shares,
      comments: perf.comments,
    });

    await prisma.contentAttribution.create({
      data: {
        userId,
        feature: perf.contentType,
        title: perf.title,
        topic: perf.title,
        hook: extractAttributionFields(perf.contentType, perf.title, "", {}).hook,
        platform: perf.platform,
        status: "published",
        impressions: perf.views,
        views: perf.views,
        engagements: perf.engagements,
        clicks: perf.clicks,
        shares: perf.shares,
        comments: perf.comments,
        performanceScore: metrics.performanceScore,
        publishedAt: perf.publishedAt,
        generatedAt: perf.createdAt,
      },
    });
  }

  const publishedPosts = await prisma.scheduledPost.findMany({
    where: { userId, status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 100,
  });

  for (const post of publishedPosts) {
    const exists = await prisma.contentAttribution.findFirst({
      where: { userId, title: post.title, platform: post.platform },
    });
    if (exists) {
      const est = estimateEngagementFromImpressions(post.impressions, post.engagements);
      const metrics = buildMetrics({
        impressions: est.impressions,
        views: est.impressions,
        engagements: est.engagements,
        clicks: post.clicks,
      });
      await prisma.contentAttribution.update({
        where: { id: exists.id },
        data: {
          impressions: est.impressions,
          views: est.impressions,
          engagements: est.engagements,
          clicks: post.clicks,
          performanceScore: metrics.performanceScore,
          status: "published",
          publishedAt: post.publishedAt,
        },
      });
      continue;
    }

    const { topic, hook, cta } = extractAttributionFields(
      post.platform,
      post.title,
      post.content,
      { topic: post.title }
    );
    const est = estimateEngagementFromImpressions(post.impressions, post.engagements);
    const metrics = buildMetrics({
      impressions: est.impressions,
      views: est.impressions,
      engagements: est.engagements,
      clicks: post.clicks,
    });

    await prisma.contentAttribution.create({
      data: {
        userId,
        feature: post.platform,
        title: post.title,
        topic,
        hook,
        cta,
        platform: post.platform,
        status: "published",
        impressions: est.impressions,
        views: est.impressions,
        engagements: est.engagements,
        clicks: post.clicks,
        performanceScore: metrics.performanceScore,
        publishedAt: post.publishedAt,
        generatedAt: post.createdAt,
      },
    });
  }
}

export async function getAttributionDashboard(userId: string): Promise<AttributionDashboard> {
  await seedAttributionIfEmpty(userId);
  await syncAttributionFromSources(userId);

  const rows = await prisma.contentAttribution.findMany({
    where: { userId },
    orderBy: { performanceScore: "desc" },
  });

  const records = rows.map(mapRow);
  const published = records.filter((r) => r.status === "published");
  const summary = buildSummary(records);

  return {
    summary,
    records,
    bestContent: [...published].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 8),
    bestTopics: rankByField(published.length ? published : records, "topic"),
    bestHooks: rankByField(published.length ? published : records, "hook"),
    bestCtas: rankByField(published.length ? published : records, "cta"),
    trend: buildTrend(records),
    funnel: {
      generated: summary.totalGenerated,
      published: summary.totalPublished,
      engaged: published.filter((r) => r.engagements > 0).length,
    },
  };
}
