export type ContentTypeId =
  | "blog"
  | "linkedin"
  | "seo"
  | "carousel"
  | "social"
  | "image"
  | "video";

export type ChartPeriod = "daily" | "weekly" | "monthly";

export interface ContentPerformanceItem {
  id: string;
  title: string;
  contentType: ContentTypeId;
  platform: string | null;
  views: number;
  engagements: number;
  clicks: number;
  shares: number;
  comments: number;
  ctr: number;
  engagementRate: number;
  score: number;
  publishedAt: string | null;
  createdAt: string;
}

export interface PerformanceSummary {
  totalContent: number;
  totalViews: number;
  totalEngagements: number;
  avgCtr: number;
  totalShares: number;
  totalComments: number;
  avgEngagementRate: number;
}

export interface PerformanceChartPoint {
  label: string;
  views: number;
  engagements: number;
  shares: number;
  comments: number;
  ctr: number;
}

export const PERFORMANCE_CHART_COLORS = {
  views: "#7C3AED",
  engagements: "#06B6D4",
  shares: "#10B981",
  comments: "#F59E0B",
  ctr: "#EC4899",
};

export const CONTENT_TYPE_META: Record<
  ContentTypeId,
  { label: string; color: string; icon: string }
> = {
  blog: { label: "Blog", color: "#06B6D4", icon: "file" },
  linkedin: { label: "LinkedIn", color: "#0A66C2", icon: "linkedin" },
  seo: { label: "SEO Article", color: "#10B981", icon: "search" },
  carousel: { label: "Carousel", color: "#8B5CF6", icon: "layers" },
  social: { label: "Social", color: "#EC4899", icon: "share" },
  image: { label: "Image", color: "#F472B6", icon: "image" },
  video: { label: "Video", color: "#3B82F6", icon: "video" },
};

export function computeCtr(views: number, clicks: number): number {
  if (views === 0) return 0;
  return Math.round((clicks / views) * 1000) / 10;
}

export function computeEngagementRate(views: number, engagements: number): number {
  if (views === 0) return 0;
  return Math.round((engagements / views) * 1000) / 10;
}

export function computePerformanceScore(item: {
  views: number;
  engagements: number;
  shares: number;
  comments: number;
  clicks: number;
}): number {
  return Math.round(
    item.engagements * 2 +
      item.shares * 5 +
      item.comments * 8 +
      item.clicks * 3 +
      item.views * 0.05
  );
}

export function mapPerformanceRow(row: {
  id: string;
  title: string;
  contentType: string;
  platform: string | null;
  views: number;
  engagements: number;
  clicks: number;
  shares: number;
  comments: number;
  publishedAt: Date | null;
  createdAt: Date;
}): ContentPerformanceItem {
  const ctr = computeCtr(row.views, row.clicks);
  const engagementRate = computeEngagementRate(row.views, row.engagements);
  return {
    id: row.id,
    title: row.title,
    contentType: row.contentType as ContentTypeId,
    platform: row.platform,
    views: row.views,
    engagements: row.engagements,
    clicks: row.clicks,
    shares: row.shares,
    comments: row.comments,
    ctr,
    engagementRate,
    score: computePerformanceScore(row),
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export function buildSummary(items: ContentPerformanceItem[]): PerformanceSummary {
  const totalViews = items.reduce((s, i) => s + i.views, 0);
  const totalClicks = items.reduce((s, i) => s + i.clicks, 0);
  const totalEngagements = items.reduce((s, i) => s + i.engagements, 0);

  return {
    totalContent: items.length,
    totalViews,
    totalEngagements,
    avgCtr: computeCtr(totalViews, totalClicks),
    totalShares: items.reduce((s, i) => s + i.shares, 0),
    totalComments: items.reduce((s, i) => s + i.comments, 0),
    avgEngagementRate: computeEngagementRate(totalViews, totalEngagements),
  };
}

export function formatMetric(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(12, 0, 0, 0);
  return d;
}

export const DEMO_PERFORMANCE_SEED: Omit<
  {
    title: string;
    contentType: ContentTypeId;
    platform: string | null;
    views: number;
    engagements: number;
    clicks: number;
    shares: number;
    comments: number;
    publishedAt: Date;
  },
  never
>[] = [
  {
    title: "5 AI content workflows for founders",
    contentType: "linkedin",
    platform: "linkedin",
    views: 24800,
    engagements: 1847,
    clicks: 412,
    shares: 289,
    comments: 156,
    publishedAt: daysAgo(2),
  },
  {
    title: "Content calendar template for B2B SaaS",
    contentType: "linkedin",
    platform: "linkedin",
    views: 18600,
    engagements: 1203,
    clicks: 298,
    shares: 198,
    comments: 89,
    publishedAt: daysAgo(5),
  },
  {
    title: "Ultimate Guide to AI Marketing in 2026",
    contentType: "blog",
    platform: "website",
    views: 14200,
    engagements: 890,
    clicks: 534,
    shares: 124,
    comments: 42,
    publishedAt: daysAgo(8),
  },
  {
    title: "SEO checklist for SaaS landing pages",
    contentType: "seo",
    platform: "website",
    views: 9800,
    engagements: 612,
    clicks: 445,
    shares: 78,
    comments: 31,
    publishedAt: daysAgo(12),
  },
  {
    title: "LinkedIn carousel: Content repurposing playbook",
    contentType: "carousel",
    platform: "linkedin",
    views: 16400,
    engagements: 1102,
    clicks: 267,
    shares: 312,
    comments: 94,
    publishedAt: daysAgo(14),
  },
  {
    title: "Why brand voice beats generic AI copy",
    contentType: "blog",
    platform: "website",
    views: 7600,
    engagements: 445,
    clicks: 198,
    shares: 67,
    comments: 28,
    publishedAt: daysAgo(18),
  },
  {
    title: "Thread: SEO in 2026",
    contentType: "social",
    platform: "twitter",
    views: 11200,
    engagements: 823,
    clicks: 156,
    shares: 445,
    comments: 112,
    publishedAt: daysAgo(21),
  },
  {
    title: "Product launch hero image",
    contentType: "image",
    platform: "instagram",
    views: 8900,
    engagements: 1240,
    clicks: 89,
    shares: 234,
    comments: 178,
    publishedAt: daysAgo(25),
  },
  {
    title: "Weekly marketing roundup",
    contentType: "linkedin",
    platform: "linkedin",
    views: 5400,
    engagements: 312,
    clicks: 98,
    shares: 45,
    comments: 23,
    publishedAt: daysAgo(28),
  },
  {
    title: "YouTube script: AI agents for marketers",
    contentType: "video",
    platform: "youtube",
    views: 22100,
    engagements: 1567,
    clicks: 678,
    shares: 389,
    comments: 201,
    publishedAt: daysAgo(32),
  },
  {
    title: "How we 10x content output with InkFit",
    contentType: "blog",
    platform: "website",
    views: 6800,
    engagements: 398,
    clicks: 212,
    shares: 56,
    comments: 19,
    publishedAt: daysAgo(35),
  },
  {
    title: "Personal brand positioning framework",
    contentType: "carousel",
    platform: "linkedin",
    views: 12800,
    engagements: 934,
    clicks: 201,
    shares: 267,
    comments: 78,
    publishedAt: daysAgo(40),
  },
];

export const DAILY_CHART_DATA: PerformanceChartPoint[] = [
  { label: "Mon", views: 4200, engagements: 312, shares: 89, comments: 45, ctr: 3.2 },
  { label: "Tue", views: 5100, engagements: 398, shares: 112, comments: 58, ctr: 3.8 },
  { label: "Wed", views: 6800, engagements: 512, shares: 145, comments: 72, ctr: 4.1 },
  { label: "Thu", views: 5900, engagements: 445, shares: 128, comments: 61, ctr: 3.6 },
  { label: "Fri", views: 7200, engagements: 567, shares: 167, comments: 84, ctr: 4.4 },
  { label: "Sat", views: 3400, engagements: 289, shares: 78, comments: 42, ctr: 2.9 },
  { label: "Sun", views: 2800, engagements: 234, shares: 56, comments: 31, ctr: 2.5 },
  { label: "Mon", views: 4800, engagements: 356, shares: 98, comments: 49, ctr: 3.4 },
  { label: "Tue", views: 6200, engagements: 478, shares: 134, comments: 67, ctr: 3.9 },
  { label: "Wed", views: 8100, engagements: 612, shares: 178, comments: 91, ctr: 4.6 },
  { label: "Thu", views: 7400, engagements: 534, shares: 152, comments: 76, ctr: 4.0 },
  { label: "Fri", views: 8900, engagements: 678, shares: 198, comments: 98, ctr: 4.8 },
  { label: "Sat", views: 4100, engagements: 312, shares: 89, comments: 44, ctr: 3.1 },
  { label: "Sun", views: 3600, engagements: 278, shares: 72, comments: 38, ctr: 2.8 },
];

export const WEEKLY_CHART_DATA: PerformanceChartPoint[] = [
  { label: "W1", views: 28400, engagements: 1890, shares: 512, comments: 267, ctr: 3.4 },
  { label: "W2", views: 32100, engagements: 2234, shares: 598, comments: 312, ctr: 3.7 },
  { label: "W3", views: 35600, engagements: 2567, shares: 678, comments: 345, ctr: 3.9 },
  { label: "W4", views: 29800, engagements: 2012, shares: 534, comments: 289, ctr: 3.5 },
  { label: "W5", views: 38200, engagements: 2789, shares: 745, comments: 398, ctr: 4.1 },
  { label: "W6", views: 41500, engagements: 3012, shares: 812, comments: 423, ctr: 4.3 },
  { label: "W7", views: 36800, engagements: 2678, shares: 698, comments: 367, ctr: 4.0 },
  { label: "W8", views: 44200, engagements: 3234, shares: 867, comments: 445, ctr: 4.5 },
];

export const MONTHLY_CHART_DATA: PerformanceChartPoint[] = [
  { label: "Jan", views: 98000, engagements: 6200, shares: 1680, comments: 890, ctr: 3.2 },
  { label: "Feb", views: 112000, engagements: 7450, shares: 1920, comments: 1020, ctr: 3.4 },
  { label: "Mar", views: 128000, engagements: 8900, shares: 2340, comments: 1180, ctr: 3.6 },
  { label: "Apr", views: 118000, engagements: 8120, shares: 2100, comments: 1050, ctr: 3.5 },
  { label: "May", views: 145000, engagements: 10200, shares: 2780, comments: 1340, ctr: 3.8 },
  { label: "Jun", views: 162000, engagements: 11450, shares: 3120, comments: 1520, ctr: 4.1 },
];

export function getChartData(period: ChartPeriod): PerformanceChartPoint[] {
  switch (period) {
    case "daily":
      return DAILY_CHART_DATA;
    case "weekly":
      return WEEKLY_CHART_DATA;
    case "monthly":
      return MONTHLY_CHART_DATA;
  }
}

export function getLeaderboard(items: ContentPerformanceItem[]): ContentPerformanceItem[] {
  return [...items].sort((a, b) => b.score - a.score);
}

export function getTopPerforming(
  items: ContentPerformanceItem[],
  limit = 5
): ContentPerformanceItem[] {
  return getLeaderboard(items).slice(0, limit);
}
