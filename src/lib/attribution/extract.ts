import { computeCtr, computeEngagementRate, computePerformanceScore } from "@/lib/content-performance";

export function parseMetadata(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** First paragraph or first line as hook candidate. */
export function extractHookFromBody(body: string): string | null {
  const trimmed = body.trim();
  if (!trimmed) return null;
  const blocks = trimmed.split(/\n\n+/);
  const first = blocks[0]?.trim();
  if (!first) return null;
  return first.split("\n")[0]?.trim().slice(0, 280) ?? null;
}

/** Last paragraph as CTA candidate. */
export function extractCtaFromBody(body: string): string | null {
  const trimmed = body.trim();
  if (!trimmed) return null;
  const blocks = trimmed.split(/\n\n+/).filter(Boolean);
  const last = blocks[blocks.length - 1]?.trim();
  if (!last) return null;
  if (last.length < 12) return null;
  return last.slice(0, 280);
}

export function extractAttributionFields(
  feature: string,
  title: string,
  body: string,
  metadata: Record<string, unknown>
): { topic: string; hook: string | null; cta: string | null } {
  const topic =
    String(metadata.topic ?? metadata.subject ?? title).trim().slice(0, 300) || title;

  const post = metadata.post as Record<string, unknown> | undefined;
  let hook =
    (typeof post?.hook === "string" ? post.hook : null) ??
    (typeof metadata.hook === "string" ? metadata.hook : null) ??
    extractHookFromBody(body);

  let cta =
    (typeof post?.cta === "string" ? post.cta : null) ??
    (typeof metadata.cta === "string" ? metadata.cta : null) ??
    extractCtaFromBody(body);

  if (hook) hook = hook.split("\n")[0]?.trim().slice(0, 280) ?? hook;
  if (cta) cta = cta.trim().slice(0, 280);

  if (feature === "linkedin" && !hook && body) {
    hook = extractHookFromBody(body);
  }

  return { topic, hook, cta };
}

export function buildMetrics(input: {
  impressions?: number;
  views?: number;
  engagements?: number;
  clicks?: number;
  shares?: number;
  comments?: number;
}) {
  const impressions = input.impressions ?? 0;
  const views = input.views ?? impressions;
  const engagements = input.engagements ?? 0;
  const clicks = input.clicks ?? 0;
  const shares = input.shares ?? 0;
  const comments = input.comments ?? 0;

  return {
    impressions,
    views,
    engagements,
    clicks,
    shares,
    comments,
    engagementRate: computeEngagementRate(views, engagements),
    ctr: computeCtr(views, clicks),
    performanceScore: computePerformanceScore({
      views,
      engagements,
      clicks,
      shares,
      comments,
    }),
  };
}

/** Estimate engagement from impressions when only publish metrics exist. */
export function estimateEngagementFromImpressions(impressions: number, engagements: number) {
  if (engagements > 0) return { impressions, engagements };
  if (impressions <= 0) return { impressions: 0, engagements: 0 };
  const rate = 0.04 + Math.random() * 0.06;
  return {
    impressions,
    engagements: Math.round(impressions * rate),
  };
}
