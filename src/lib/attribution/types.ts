export type AttributionStatus = "generated" | "published";

export interface AttributionRecord {
  id: string;
  generatedContentId: string | null;
  feature: string;
  title: string;
  topic: string | null;
  hook: string | null;
  cta: string | null;
  platform: string | null;
  status: AttributionStatus;
  impressions: number;
  views: number;
  engagements: number;
  clicks: number;
  shares: number;
  comments: number;
  engagementRate: number;
  ctr: number;
  performanceScore: number;
  publishedAt: string | null;
  generatedAt: string;
}

export interface RankedItem {
  key: string;
  label: string;
  count: number;
  totalEngagements: number;
  totalViews: number;
  avgEngagementRate: number;
  avgScore: number;
  sampleTitle?: string;
}

export interface AttributionSummary {
  totalGenerated: number;
  totalPublished: number;
  totalViews: number;
  totalEngagements: number;
  avgEngagementRate: number;
  publishRate: number;
}

export interface AttributionTrendPoint {
  label: string;
  generated: number;
  published: number;
  engagements: number;
}

export interface AttributionDashboard {
  summary: AttributionSummary;
  records: AttributionRecord[];
  bestContent: AttributionRecord[];
  bestTopics: RankedItem[];
  bestHooks: RankedItem[];
  bestCtas: RankedItem[];
  trend: AttributionTrendPoint[];
  funnel: { generated: number; published: number; engaged: number };
}

export interface AttributionInsightView {
  headline: string;
  body: string;
  highlights: string[];
  generatedAt: string;
  live: boolean;
}
