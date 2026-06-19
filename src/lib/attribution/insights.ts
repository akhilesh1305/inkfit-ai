import { prisma } from "@/lib/prisma";
import {
  buildMetrics,
  extractAttributionFields,
  parseMetadata,
} from "@/lib/attribution/extract";
import type { AttributionInsightView } from "@/lib/attribution/types";
import type { AttributionDashboard } from "@/lib/attribution/types";
import { generateText, hasAnyAIProvider, parseAIJson } from "@/lib/ai/providers";
import { SYSTEM_ROLES } from "@/lib/ai/prompts";

function fallbackInsight(dashboard: AttributionDashboard): AttributionInsightView {
  const top = dashboard.bestContent[0];
  const topTopic = dashboard.bestTopics[0];
  const topHook = dashboard.bestHooks[0];
  const topCta = dashboard.bestCtas[0];

  const highlights = [
    top
      ? `Top content "${top.title}" scored ${top.performanceScore} with ${top.engagementRate}% engagement.`
      : "Publish more content to unlock performance patterns.",
    topTopic
      ? `Topic "${topTopic.label}" averages ${topTopic.avgEngagementRate}% engagement across ${topTopic.count} pieces.`
      : "Consistent topics build audience recognition.",
    topHook
      ? `Hooks like "${topHook.label.slice(0, 60)}…" drive above-average engagement.`
      : "Lead with a specific, curiosity-driven hook.",
    topCta
      ? `CTAs such as "${topCta.label.slice(0, 50)}…" convert attention into action.`
      : "End with a clear, low-friction call to action.",
  ];

  return {
    headline: "What is working and why",
    body: `Your published content shows a ${dashboard.summary.avgEngagementRate}% average engagement rate with a ${dashboard.summary.publishRate}% publish rate from generated drafts. ${
      topHook
        ? `Strong hooks that open with tension or specificity (${topHook.avgEngagementRate}% avg engagement) are outperforming generic intros.`
        : ""
    } ${
      topTopic
        ? `The topic "${topTopic.label}" is your highest-performing theme — double down with variations and repurposed formats.`
        : ""
    } ${
      topCta
        ? `Comment-driven CTAs are earning more interactions than passive sign-offs.`
        : ""
    }`.trim(),
    highlights,
    generatedAt: new Date().toISOString(),
    live: false,
  };
}

function insightPrompt(dashboard: AttributionDashboard): string {
  const topContent = dashboard.bestContent.slice(0, 5).map((c) => ({
    title: c.title,
    topic: c.topic,
    hook: c.hook?.slice(0, 120),
    cta: c.cta?.slice(0, 80),
    engagementRate: c.engagementRate,
    score: c.performanceScore,
  }));
  const topTopics = dashboard.bestTopics.slice(0, 5);
  const topHooks = dashboard.bestHooks.slice(0, 5).map((h) => h.label.slice(0, 100));
  const topCtas = dashboard.bestCtas.slice(0, 5).map((c) => c.label.slice(0, 80));

  return `Analyze this content attribution data and return ONLY valid JSON:
{
  "headline": "short punchy title for insight report",
  "body": "3-4 paragraphs explaining what is working and WHY, with specific patterns",
  "highlights": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"]
}

Summary: ${JSON.stringify(dashboard.summary)}
Funnel: ${JSON.stringify(dashboard.funnel)}
Top content: ${JSON.stringify(topContent)}
Top topics: ${JSON.stringify(topTopics)}
Top hooks: ${JSON.stringify(topHooks)}
Top CTAs: ${JSON.stringify(topCtas)}`;
}

export async function generateAttributionInsights(
  userId: string,
  dashboard: AttributionDashboard
): Promise<AttributionInsightView> {
  const cached = await prisma.attributionInsight.findUnique({ where: { userId } });
  const cacheAge = cached ? Date.now() - cached.updatedAt.getTime() : Infinity;
  if (cached && cacheAge < 30 * 60 * 1000) {
    return {
      headline: cached.headline,
      body: cached.body,
      highlights: JSON.parse(cached.highlights) as string[],
      generatedAt: cached.generatedAt.toISOString(),
      live: true,
    };
  }

  if (!hasAnyAIProvider()) {
    return fallbackInsight(dashboard);
  }

  try {
    const { text, live } = await generateText({
      system:
        SYSTEM_ROLES.strategist +
        " You analyze content performance data and explain what is working and why in clear, actionable language.",
      user: insightPrompt(dashboard),
      maxTokens: 900,
      userId,
      feature: "attribution_insights",
    });

    if (live && text) {
      const parsed = parseAIJson<{
        headline: string;
        body: string;
        highlights: string[];
      }>(text);
      await prisma.attributionInsight.upsert({
        where: { userId },
        create: {
          userId,
          headline: parsed.headline,
          body: parsed.body,
          highlights: JSON.stringify(parsed.highlights ?? []),
        },
        update: {
          headline: parsed.headline,
          body: parsed.body,
          highlights: JSON.stringify(parsed.highlights ?? []),
        },
      });
      return {
        headline: parsed.headline,
        body: parsed.body,
        highlights: parsed.highlights ?? [],
        generatedAt: new Date().toISOString(),
        live: true,
      };
    }
  } catch {
    /* fall through */
  }

  return fallbackInsight(dashboard);
}

export async function recordGeneratedAttribution(input: {
  userId: string;
  workspaceId?: string | null;
  generatedContentId: string;
  feature: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}) {
  const { topic, hook, cta } = extractAttributionFields(
    input.feature,
    input.title,
    input.body,
    input.metadata ?? {}
  );
  const metrics = buildMetrics({});

  const existing = await prisma.contentAttribution.findFirst({
    where: { generatedContentId: input.generatedContentId },
  });

  if (existing) {
    await prisma.contentAttribution.update({
      where: { id: existing.id },
      data: { title: input.title, topic, hook, cta },
    });
    return;
  }

  await prisma.contentAttribution.create({
    data: {
      userId: input.userId,
      workspaceId: input.workspaceId ?? null,
      generatedContentId: input.generatedContentId,
      feature: input.feature,
      title: input.title,
      topic,
      hook,
      cta,
      status: "generated",
      performanceScore: metrics.performanceScore,
    },
  });
}

export async function recordPublishedAttribution(input: {
  userId: string;
  title: string;
  content: string;
  platform: string;
  feature?: string;
  generatedContentId?: string;
  impressions?: number;
  engagements?: number;
  clicks?: number;
  externalUrl?: string;
}) {
  const { topic, hook, cta } = extractAttributionFields(
    input.feature ?? input.platform,
    input.title,
    input.content,
    { topic: input.title }
  );
  const metrics = buildMetrics({
    impressions: input.impressions,
    views: input.impressions,
    engagements: input.engagements,
    clicks: input.clicks,
  });

  if (input.generatedContentId) {
    const existing = await prisma.contentAttribution.findFirst({
      where: { generatedContentId: input.generatedContentId },
    });
    if (existing) {
      await prisma.contentAttribution.update({
        where: { id: existing.id },
        data: {
          status: "published",
          platform: input.platform,
          impressions: metrics.impressions,
          views: metrics.views,
          engagements: metrics.engagements,
          clicks: metrics.clicks,
          performanceScore: metrics.performanceScore,
          publishedAt: new Date(),
          hook: hook ?? existing.hook,
          cta: cta ?? existing.cta,
          topic: topic ?? existing.topic,
        },
      });
      return;
    }
  }

  await prisma.contentAttribution.create({
    data: {
      userId: input.userId,
      generatedContentId: input.generatedContentId ?? null,
      feature: input.feature ?? input.platform,
      title: input.title,
      topic,
      hook,
      cta,
      platform: input.platform,
      status: "published",
      impressions: metrics.impressions,
      views: metrics.views,
      engagements: metrics.engagements,
      clicks: metrics.clicks,
      performanceScore: metrics.performanceScore,
      publishedAt: new Date(),
    },
  });
}
