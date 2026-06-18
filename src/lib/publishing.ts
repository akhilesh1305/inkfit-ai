export type PublishPlatformId = "linkedin" | "twitter" | "facebook" | "instagram";

export type PostStatus = "draft" | "queued" | "scheduled" | "published";

export interface PublishPlatform {
  id: PublishPlatformId;
  name: string;
  shortName: string;
  color: string;
  gradient: string;
  icon: string;
}

export interface PublishConnection {
  platform: PublishPlatformId;
  connected: boolean;
  account: string | null;
  profileName?: string | null;
  profileImage?: string | null;
}

export interface ScheduledPost {
  id: string;
  platform: PublishPlatformId;
  title: string;
  content: string;
  status: PostStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  impressions: number;
  engagements: number;
  clicks: number;
  createdAt: string;
}

export const PUBLISH_PLATFORMS: PublishPlatform[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    shortName: "in",
    color: "#0A66C2",
    gradient: "from-[#0A66C2] to-[#004182]",
    icon: "in",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    shortName: "𝕏",
    color: "#000000",
    gradient: "from-zinc-700 to-black",
    icon: "𝕏",
  },
  {
    id: "facebook",
    name: "Facebook",
    shortName: "f",
    color: "#1877F2",
    gradient: "from-[#1877F2] to-[#0d47a1]",
    icon: "f",
  },
  {
    id: "instagram",
    name: "Instagram",
    shortName: "ig",
    color: "#E4405F",
    gradient: "from-[#f09433] via-[#e6683c] to-[#bc1888]",
    icon: "◎",
  },
];

export const POST_STATUS_META: Record<
  PostStatus,
  { label: string; color: string; bg: string }
> = {
  draft: { label: "Draft", color: "text-zinc-400", bg: "bg-zinc-500/15" },
  queued: { label: "Queued", color: "text-amber-400", bg: "bg-amber-500/15" },
  scheduled: { label: "Scheduled", color: "text-brand-300", bg: "bg-brand-500/15" },
  published: { label: "Published", color: "text-emerald-400", bg: "bg-emerald-500/15" },
};

function daysFromNow(days: number, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number, hour = 14) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export const DEMO_POSTS: Omit<ScheduledPost, "id" | "createdAt">[] = [
  {
    platform: "linkedin",
    title: "5 AI content workflows for founders",
    content:
      "Most founders waste hours on content that doesn't convert.\n\nHere are 5 workflows we use at InkFit AI to ship LinkedIn posts in under 15 minutes…",
    status: "scheduled",
    scheduledAt: daysFromNow(1, 9, 30),
    publishedAt: null,
    impressions: 0,
    engagements: 0,
    clicks: 0,
  },
  {
    platform: "twitter",
    title: "Thread: SEO in 2026",
    content:
      "1/ SEO isn't dead — boring content is.\n\n2/ Start with search intent, not keywords.\n\n3/ Ship fast, iterate with real data.",
    status: "queued",
    scheduledAt: daysFromNow(2, 12, 0),
    publishedAt: null,
    impressions: 0,
    engagements: 0,
    clicks: 0,
  },
  {
    platform: "instagram",
    title: "Carousel launch teaser",
    content:
      "New feature drop this week ✨\n\nSwipe for a peek at our AI Image Studio →\n\n#contentmarketing #ai #saas",
    status: "scheduled",
    scheduledAt: daysFromNow(3, 18, 0),
    publishedAt: null,
    impressions: 0,
    engagements: 0,
    clicks: 0,
  },
  {
    platform: "facebook",
    title: "Weekly marketing roundup",
    content:
      "This week's top reads for marketers: AI scheduling, brand voice consistency, and multi-platform publishing.",
    status: "draft",
    scheduledAt: null,
    publishedAt: null,
    impressions: 0,
    engagements: 0,
    clicks: 0,
  },
  {
    platform: "linkedin",
    title: "Why we built InkFit AI",
    content:
      "We started InkFit because every marketing team we talked to had the same problem: great ideas, no bandwidth to ship.",
    status: "draft",
    scheduledAt: null,
    publishedAt: null,
    impressions: 0,
    engagements: 0,
    clicks: 0,
  },
  {
    platform: "twitter",
    title: "Product update",
    content: "Publishing Center is live — schedule to LinkedIn, X, Facebook & Instagram from one dashboard.",
    status: "published",
    scheduledAt: daysAgo(2, 10),
    publishedAt: daysAgo(2, 10),
    impressions: 4820,
    engagements: 312,
    clicks: 89,
  },
  {
    platform: "linkedin",
    title: "Content calendar template",
    content:
      "Steal our 30-day content calendar framework — built for B2B SaaS teams who need consistency without burnout.",
    status: "published",
    scheduledAt: daysAgo(5, 9),
    publishedAt: daysAgo(5, 9),
    impressions: 12400,
    engagements: 847,
    clicks: 203,
  },
  {
    platform: "instagram",
    title: "Behind the scenes",
    content: "Late-night ship session ☕ Building the future of AI content creation.",
    status: "published",
    scheduledAt: daysAgo(7, 19),
    publishedAt: daysAgo(7, 19),
    impressions: 3150,
    engagements: 428,
    clicks: 56,
  },
];

export function getPlatformById(id: PublishPlatformId): PublishPlatform {
  return PUBLISH_PLATFORMS.find((p) => p.id === id) ?? PUBLISH_PLATFORMS[0];
}

export function formatPostDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function computeEngagementRate(impressions: number, engagements: number): string {
  if (impressions === 0) return "0%";
  return `${((engagements / impressions) * 100).toFixed(1)}%`;
}

export function aggregateAnalytics(posts: ScheduledPost[]) {
  const published = posts.filter((p) => p.status === "published");
  const totals = published.reduce(
    (acc, p) => ({
      impressions: acc.impressions + p.impressions,
      engagements: acc.engagements + p.engagements,
      clicks: acc.clicks + p.clicks,
    }),
    { impressions: 0, engagements: 0, clicks: 0 }
  );
  return {
    postCount: published.length,
    scheduledCount: posts.filter((p) => p.status === "scheduled" || p.status === "queued").length,
    draftCount: posts.filter((p) => p.status === "draft").length,
    ...totals,
    engagementRate: computeEngagementRate(totals.impressions, totals.engagements),
  };
}
