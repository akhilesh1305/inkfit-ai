export interface AnalyticsSummary {
  contentGenerated: number;
  linkedinPosts: number;
  blogs: number;
  seoArticles: number;
  carouselCount: number;
  monthlyUsage: number;
  monthlyLimit: number;
  growthPercent: number;
  timeSavedHours: number;
  aiCreditsUsed: number;
}

export interface MonthlyTrendPoint {
  month: string;
  total: number;
  linkedin: number;
  blogs: number;
  seo: number;
  carousels: number;
}

export interface ContentTypeSlice {
  name: string;
  value: number;
  color: string;
}

export interface WeeklyUsagePoint {
  week: string;
  credits: number;
  generations: number;
}

export const CHART_COLORS = {
  violet: "#7C3AED",
  blue: "#3B82F6",
  cyan: "#06B6D4",
  emerald: "#10B981",
  amber: "#F59E0B",
  pink: "#EC4899",
};

export const ANALYTICS_SUMMARY: AnalyticsSummary = {
  contentGenerated: 248,
  linkedinPosts: 86,
  blogs: 42,
  seoArticles: 31,
  carouselCount: 54,
  monthlyUsage: 127,
  monthlyLimit: 500,
  growthPercent: 24.8,
  timeSavedHours: 47.5,
  aiCreditsUsed: 127,
};

export const MONTHLY_TREND: MonthlyTrendPoint[] = [
  { month: "Jan", total: 28, linkedin: 10, blogs: 6, seo: 4, carousels: 8 },
  { month: "Feb", total: 35, linkedin: 12, blogs: 8, seo: 5, carousels: 10 },
  { month: "Mar", total: 42, linkedin: 15, blogs: 9, seo: 6, carousels: 12 },
  { month: "Apr", total: 38, linkedin: 14, blogs: 7, seo: 5, carousels: 12 },
  { month: "May", total: 51, linkedin: 18, blogs: 11, seo: 8, carousels: 14 },
  { month: "Jun", total: 54, linkedin: 17, blogs: 10, seo: 7, carousels: 20 },
];

export const CONTENT_DISTRIBUTION: ContentTypeSlice[] = [
  { name: "LinkedIn", value: 86, color: CHART_COLORS.blue },
  { name: "Carousels", value: 54, color: CHART_COLORS.violet },
  { name: "Blogs", value: 42, color: CHART_COLORS.cyan },
  { name: "SEO Articles", value: 31, color: CHART_COLORS.emerald },
  { name: "Social", value: 35, color: CHART_COLORS.pink },
];

export const WEEKLY_USAGE: WeeklyUsagePoint[] = [
  { week: "W1", credits: 22, generations: 18 },
  { week: "W2", credits: 28, generations: 24 },
  { week: "W3", credits: 31, generations: 26 },
  { week: "W4", credits: 46, generations: 38 },
];

export const CONTENT_METRICS = [
  {
    key: "contentGenerated",
    label: "Content Generated",
    value: ANALYTICS_SUMMARY.contentGenerated,
    icon: "sparkles",
    color: CHART_COLORS.violet,
  },
  {
    key: "linkedinPosts",
    label: "LinkedIn Posts",
    value: ANALYTICS_SUMMARY.linkedinPosts,
    icon: "linkedin",
    color: CHART_COLORS.blue,
  },
  {
    key: "blogs",
    label: "Blogs",
    value: ANALYTICS_SUMMARY.blogs,
    icon: "file",
    color: CHART_COLORS.cyan,
  },
  {
    key: "seoArticles",
    label: "SEO Articles",
    value: ANALYTICS_SUMMARY.seoArticles,
    icon: "search",
    color: CHART_COLORS.emerald,
  },
  {
    key: "carouselCount",
    label: "Carousels",
    value: ANALYTICS_SUMMARY.carouselCount,
    icon: "layers",
    color: CHART_COLORS.amber,
  },
  {
    key: "monthlyUsage",
    label: "Monthly Usage",
    value: ANALYTICS_SUMMARY.monthlyUsage,
    suffix: ` / ${ANALYTICS_SUMMARY.monthlyLimit}`,
    icon: "zap",
    color: CHART_COLORS.pink,
  },
] as const;
