export type TrendCategory = "saas" | "marketing" | "ai" | "startups" | "ecommerce";

export type CompetitionLevel = "low" | "medium" | "high";

export interface TrendCategoryMeta {
  id: TrendCategory;
  label: string;
  gradient: string;
}

export interface TrendTopic {
  id: string;
  title: string;
  description: string;
  category: TrendCategory;
  trendScore: number;
  opportunityScore: number;
  competition: CompetitionLevel;
  volume: string;
  growth: string;
  tags: string[];
}

export interface TrendKeyword {
  id: string;
  keyword: string;
  category: TrendCategory;
  trendScore: number;
  opportunityScore: number;
  competition: CompetitionLevel;
  volume: string;
  difficulty: string;
}

export interface IndustryTrend {
  id: string;
  title: string;
  summary: string;
  category: TrendCategory;
  impact: "rising" | "stable" | "emerging";
  trendScore: number;
}

export interface ContentOpportunity {
  id: string;
  title: string;
  angle: string;
  format: string;
  category: TrendCategory;
  trendScore: number;
  opportunityScore: number;
  competition: CompetitionLevel;
  relatedTopic: string;
}

export interface TrendChartPoint {
  week: string;
  interest: number;
  content: number;
}

export interface TrendDiscoveryData {
  topics: TrendTopic[];
  keywords: TrendKeyword[];
  industryTrends: IndustryTrend[];
  opportunities: ContentOpportunity[];
  chartData: TrendChartPoint[];
  summary: {
    avgTrendScore: number;
    avgOpportunity: number;
    hotCount: number;
  };
}

export const TREND_CATEGORIES: TrendCategoryMeta[] = [
  { id: "saas", label: "SaaS", gradient: "from-brand-600 to-violet-700" },
  { id: "marketing", label: "Marketing", gradient: "from-cyan-600 to-blue-700" },
  { id: "ai", label: "AI", gradient: "from-emerald-600 to-teal-700" },
  { id: "startups", label: "Startups", gradient: "from-amber-500 to-orange-600" },
  { id: "ecommerce", label: "E-commerce", gradient: "from-pink-600 to-rose-700" },
];

export const COMPETITION_META: Record<
  CompetitionLevel,
  { label: string; color: string; bg: string }
> = {
  low: { label: "Low", color: "text-emerald-400", bg: "bg-emerald-500/15" },
  medium: { label: "Medium", color: "text-amber-400", bg: "bg-amber-500/15" },
  high: { label: "High", color: "text-red-400", bg: "bg-red-500/15" },
};

const TOPICS: Omit<TrendTopic, "id">[] = [
  {
    title: "AI agents for marketing teams",
    description: "Autonomous workflows replacing manual content ops",
    category: "ai",
    trendScore: 94,
    opportunityScore: 88,
    competition: "medium",
    volume: "48K/mo",
    growth: "+142%",
    tags: ["agents", "automation"],
  },
  {
    title: "Product-led SEO for SaaS",
    description: "Programmatic pages driven by product data",
    category: "saas",
    trendScore: 87,
    opportunityScore: 91,
    competition: "low",
    volume: "22K/mo",
    growth: "+67%",
    tags: ["seo", "plg"],
  },
  {
    title: "LinkedIn thought leadership 2.0",
    description: "Founder-led content with AI-assisted drafting",
    category: "marketing",
    trendScore: 89,
    opportunityScore: 85,
    competition: "high",
    volume: "65K/mo",
    growth: "+38%",
    tags: ["linkedin", "b2b"],
  },
  {
    title: "Bootstrapped to $1M ARR playbooks",
    description: "Capital-efficient growth stories resonating with founders",
    category: "startups",
    trendScore: 82,
    opportunityScore: 79,
    competition: "medium",
    volume: "18K/mo",
    growth: "+55%",
    tags: ["bootstrap", "arr"],
  },
  {
    title: "Zero-party data collection",
    description: "Privacy-first personalization for e-commerce brands",
    category: "ecommerce",
    trendScore: 78,
    opportunityScore: 84,
    competition: "low",
    volume: "12K/mo",
    growth: "+91%",
    tags: ["privacy", "cx"],
  },
  {
    title: "Content repurposing at scale",
    description: "One pillar asset → 20+ derivatives across channels",
    category: "marketing",
    trendScore: 91,
    opportunityScore: 92,
    competition: "medium",
    volume: "31K/mo",
    growth: "+74%",
    tags: ["repurpose", "workflow"],
  },
  {
    title: "Vertical SaaS positioning",
    description: "Niche-specific software winning vs horizontal tools",
    category: "saas",
    trendScore: 85,
    opportunityScore: 86,
    competition: "low",
    volume: "15K/mo",
    growth: "+44%",
    tags: ["vertical", "positioning"],
  },
  {
    title: "Multimodal AI content",
    description: "Text + image + video generated from single briefs",
    category: "ai",
    trendScore: 96,
    opportunityScore: 90,
    competition: "medium",
    volume: "52K/mo",
    growth: "+210%",
    tags: ["multimodal", "creative"],
  },
  {
    title: "DTC retention loops",
    description: "Subscription and community models post-acquisition spike",
    category: "ecommerce",
    trendScore: 80,
    opportunityScore: 82,
    competition: "medium",
    volume: "20K/mo",
    growth: "+33%",
    tags: ["retention", "dtc"],
  },
  {
    title: "AI startup fundraising narrative",
    description: "How AI-native companies pitch differentiation in 2026",
    category: "startups",
    trendScore: 88,
    opportunityScore: 77,
    competition: "high",
    volume: "27K/mo",
    growth: "+62%",
    tags: ["fundraising", "pitch"],
  },
];

const KEYWORDS: Omit<TrendKeyword, "id">[] = [
  { keyword: "ai content studio", category: "ai", trendScore: 92, opportunityScore: 88, competition: "low", volume: "8.1K", difficulty: "34" },
  { keyword: "saas content marketing", category: "saas", trendScore: 85, opportunityScore: 90, competition: "medium", volume: "5.4K", difficulty: "48" },
  { keyword: "linkedin carousel generator", category: "marketing", trendScore: 88, opportunityScore: 86, competition: "medium", volume: "6.2K", difficulty: "42" },
  { keyword: "startup go to market", category: "startups", trendScore: 79, opportunityScore: 81, competition: "high", volume: "12K", difficulty: "58" },
  { keyword: "ecommerce email automation", category: "ecommerce", trendScore: 76, opportunityScore: 85, competition: "low", volume: "4.8K", difficulty: "36" },
  { keyword: "marketing ai tools 2026", category: "ai", trendScore: 94, opportunityScore: 89, competition: "high", volume: "14K", difficulty: "62" },
  { keyword: "b2b demand generation", category: "marketing", trendScore: 83, opportunityScore: 84, competition: "medium", volume: "9.1K", difficulty: "51" },
  { keyword: "product led growth seo", category: "saas", trendScore: 81, opportunityScore: 87, competition: "low", volume: "3.2K", difficulty: "38" },
  { keyword: "shopify retention strategy", category: "ecommerce", trendScore: 74, opportunityScore: 80, competition: "medium", volume: "2.9K", difficulty: "45" },
  { keyword: "founder led sales", category: "startups", trendScore: 86, opportunityScore: 83, competition: "low", volume: "4.1K", difficulty: "40" },
];

const INDUSTRY: Omit<IndustryTrend, "id">[] = [
  { title: "AI-native marketing stacks", summary: "Teams consolidating 5+ tools into unified AI workspaces", category: "ai", impact: "rising", trendScore: 95 },
  { title: "Search everywhere optimization", summary: "Beyond Google — LinkedIn, YouTube, and AI answer engines", category: "marketing", impact: "rising", trendScore: 88 },
  { title: "Usage-based pricing models", summary: "SaaS shifting from seat-based to consumption pricing", category: "saas", impact: "stable", trendScore: 82 },
  { title: "Capital efficiency narrative", summary: "Investors favor profitable growth over blitzscaling", category: "startups", impact: "rising", trendScore: 90 },
  { title: "Social commerce integration", summary: "TikTok Shop and Instagram checkout driving DTC sales", category: "ecommerce", impact: "emerging", trendScore: 86 },
  { title: "Human + AI content workflows", summary: "AI drafts, human voice — hybrid production becoming standard", category: "marketing", impact: "rising", trendScore: 93 },
];

const OPPORTUNITIES: Omit<ContentOpportunity, "id">[] = [
  { title: "Ultimate guide to AI marketing agents", angle: "Compare 5 workflow patterns with ROI examples", format: "Blog + LinkedIn series", category: "ai", trendScore: 94, opportunityScore: 91, competition: "low", relatedTopic: "AI agents for marketing teams" },
  { title: "PLG SEO template pack", angle: "Free Notion template for programmatic page planning", format: "Lead magnet + carousel", category: "saas", trendScore: 87, opportunityScore: 93, competition: "low", relatedTopic: "Product-led SEO for SaaS" },
  { title: "LinkedIn hook swipe file", angle: "50 hooks that generated 1M+ impressions", format: "Carousel + email", category: "marketing", trendScore: 89, opportunityScore: 88, competition: "medium", relatedTopic: "LinkedIn thought leadership 2.0" },
  { title: "Bootstrap milestone calculator", angle: "Interactive tool for ARR milestones", format: "Tool + blog", category: "startups", trendScore: 82, opportunityScore: 85, competition: "low", relatedTopic: "Bootstrapped to $1M ARR" },
  { title: "Zero-party data playbook", angle: "Step-by-step for Shopify brands", format: "Guide + case study", category: "ecommerce", trendScore: 78, opportunityScore: 87, competition: "low", relatedTopic: "Zero-party data collection" },
  { title: "Content repurposing workflow", angle: "1 blog → 15 assets in 2 hours", format: "Video + checklist", category: "marketing", trendScore: 91, opportunityScore: 94, competition: "medium", relatedTopic: "Content repurposing at scale" },
];

const CHART_DATA: TrendChartPoint[] = [
  { week: "W1", interest: 62, content: 45 },
  { week: "W2", interest: 68, content: 52 },
  { week: "W3", interest: 74, content: 58 },
  { week: "W4", interest: 81, content: 64 },
  { week: "W5", interest: 88, content: 71 },
  { week: "W6", interest: 92, content: 78 },
];

function withIds<T extends { title?: string; keyword?: string }>(
  items: T[],
  prefix: string
): (T & { id: string })[] {
  return items.map((item, i) => ({
    ...item,
    id: `${prefix}-${i}`,
  }));
}

export function getTrendDiscoveryData(category: TrendCategory | "all"): TrendDiscoveryData {
  const filter = <T extends { category: TrendCategory }>(items: T[]) =>
    category === "all" ? items : items.filter((i) => i.category === category);

  const topics = filter(withIds(TOPICS, "topic"));
  const keywords = filter(withIds(KEYWORDS, "kw"));
  const industryTrends = filter(withIds(INDUSTRY, "ind"));
  const opportunities = filter(withIds(OPPORTUNITIES, "opp"));

  const allScores = [...topics, ...opportunities];
  const avgTrend =
    allScores.length > 0
      ? Math.round(allScores.reduce((s, t) => s + t.trendScore, 0) / allScores.length)
      : 0;
  const avgOpp =
    allScores.length > 0
      ? Math.round(allScores.reduce((s, t) => s + t.opportunityScore, 0) / allScores.length)
      : 0;
  const hotCount = topics.filter((t) => t.trendScore >= 85 && t.competition !== "high").length;

  return {
    topics: topics.sort((a, b) => b.trendScore - a.trendScore),
    keywords: keywords.sort((a, b) => b.opportunityScore - a.opportunityScore),
    industryTrends,
    opportunities: opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore),
    chartData: CHART_DATA,
    summary: { avgTrendScore: avgTrend, avgOpportunity: avgOpp, hotCount },
  };
}

export function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-brand-300";
  if (score >= 55) return "text-amber-400";
  return "text-content-subtle";
}

export function scoreBarGradient(score: number): string {
  if (score >= 85) return "from-emerald-500 to-teal-400";
  if (score >= 70) return "from-brand-500 to-cyan-400";
  return "from-amber-500 to-orange-400";
}

export function buildContentPrompt(item: {
  title: string;
  description?: string;
  angle?: string;
  format?: string;
  relatedTopic?: string;
}): string {
  const parts = [
    `Create content about: ${item.title}`,
    item.description && `Context: ${item.description}`,
    item.angle && `Angle: ${item.angle}`,
    item.format && `Format: ${item.format}`,
    item.relatedTopic && `Related trend: ${item.relatedTopic}`,
  ].filter(Boolean);
  return parts.join("\n");
}

export function getCategoryMeta(id: TrendCategory): TrendCategoryMeta {
  return TREND_CATEGORIES.find((c) => c.id === id) ?? TREND_CATEGORIES[0];
}
