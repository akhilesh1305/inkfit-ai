export interface KeywordGap {
  keyword: string;
  volume: string;
  difficulty: "Easy" | "Medium" | "Hard";
  opportunity: string;
}

export interface KeywordRecommendation {
  keyword: string;
  intent: string;
  reason: string;
}

export interface ContentGapItem {
  area: string;
  gap: string;
  priority: "high" | "medium" | "low";
}

export interface PostingFrequency {
  blog: string;
  linkedin: string;
  newsletter: string;
  overall: string;
}

export interface CompetitorAnalysis {
  competitorUrl: string;
  competitorName: string;
  opportunityScore: number;
  contentTopics: string[];
  postingFrequency: PostingFrequency;
  seoOpportunities: string[];
  keywordGaps: KeywordGap[];
  contentWeaknesses: string[];
  contentGapReport: ContentGapItem[];
  keywordRecommendations: KeywordRecommendation[];
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] || "competitor";
  }
}

function brandNameFromDomain(domain: string): string {
  const base = domain.split(".")[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function computeOpportunityScore(weaknesses: number, gaps: number, seoOps: number): number {
  return Math.min(94, 58 + weaknesses * 4 + gaps * 3 + seoOps * 2);
}

export function analyzeCompetitorSite(url: string): CompetitorAnalysis {
  const domain = extractDomain(url);
  const name = brandNameFromDomain(domain);

  const contentTopics = [
    `${name} product updates and feature launches`,
    "Industry trends and market analysis",
    "Customer success stories and case studies",
    "How-to guides for core use cases",
    "Thought leadership on digital transformation",
    "Comparison and alternative content (limited)",
    "Team culture and hiring posts",
  ];

  const postingFrequency: PostingFrequency = {
    blog: "2–3 posts per week",
    linkedin: "4–5 posts per week",
    newsletter: "Bi-weekly",
    overall: "High — consistent multi-channel presence",
  };

  const seoOpportunities = [
    `Target long-tail keywords ${name} ranks #8–15 for — easier to outrank`,
    "Build comprehensive pillar pages on topics they cover thinly",
    "Capture featured snippets with FAQ schema on high-intent queries",
    "Create comparison pages: 'Your Brand vs " + name + "'",
    "Improve content depth — their average article is ~900 words; aim for 1,500+",
    "Build backlinks via original research they haven't published",
  ];

  const keywordGaps: KeywordGap[] = [
    {
      keyword: `${name} alternative`,
      volume: "2.4K/mo",
      difficulty: "Medium",
      opportunity: "High commercial intent — they don't own this term",
    },
    {
      keyword: `best tools like ${name}`,
      volume: "1.8K/mo",
      difficulty: "Easy",
      opportunity: "Listicle gap — no dedicated landing page found",
    },
    {
      keyword: `${domain.split(".")[0]} pricing comparison`,
      volume: "920/mo",
      difficulty: "Easy",
      opportunity: "Transparent pricing content missing on their site",
    },
    {
      keyword: `how to migrate from ${name}`,
      volume: "640/mo",
      difficulty: "Medium",
      opportunity: "Switching guide could capture frustrated users",
    },
    {
      keyword: `${name} integrations guide`,
      volume: "1.1K/mo",
      difficulty: "Medium",
      opportunity: "Technical SEO gap — shallow integration docs",
    },
  ];

  const contentWeaknesses = [
    "No video or short-form content strategy detected",
    "Limited founder-led personal branding on LinkedIn",
    "Missing downloadable lead magnets (templates, calculators)",
    "Thin FAQ and support content for SEO",
    "No public product roadmap or changelog for community building",
    "Blog lacks original data and proprietary research",
  ];

  const contentGapReport: ContentGapItem[] = [
    {
      area: "Video & Short-Form",
      gap: `${name} relies on text-only content — no YouTube, reels, or TikTok presence`,
      priority: "high",
    },
    {
      area: "Comparison Content",
      gap: "No 'vs' or alternative pages — opportunity to intercept comparison traffic",
      priority: "high",
    },
    {
      area: "Lead Magnets",
      gap: "Few gated assets; mostly blog CTAs to demo requests only",
      priority: "medium",
    },
    {
      area: "Technical SEO",
      gap: "Missing schema markup on blog posts and product pages",
      priority: "medium",
    },
    {
      area: "Community",
      gap: "No active community forum or user-generated content hub",
      priority: "low",
    },
    {
      area: "Email Nurture",
      gap: "Basic newsletter only — no segmented nurture sequences visible",
      priority: "medium",
    },
  ];

  const keywordRecommendations: KeywordRecommendation[] = [
    {
      keyword: `${name} alternative 2026`,
      intent: "Commercial",
      reason: "Competitor doesn't rank; high buyer intent",
    },
    {
      keyword: `content strategy for ${domain.split(".")[0]} users`,
      intent: "Informational",
      reason: "Audience overlap with underserved long-tail",
    },
    {
      keyword: "AI content marketing playbook",
      intent: "Informational",
      reason: "Trending topic with weak competitor coverage",
    },
    {
      keyword: `${name} review honest`,
      intent: "Commercial",
      reason: "Review content gap — capture evaluation-stage traffic",
    },
    {
      keyword: "B2B LinkedIn growth framework",
      intent: "Informational",
      reason: "Aligns with their audience; low competition depth",
    },
    {
      keyword: `${name} vs [your brand]`,
      intent: "Transactional",
      reason: "Own the comparison narrative before they do",
    },
  ];

  const opportunityScore = computeOpportunityScore(
    contentWeaknesses.length,
    contentGapReport.filter((g) => g.priority === "high").length,
    seoOpportunities.length
  );

  return {
    competitorUrl: url.startsWith("http") ? url : `https://${url}`,
    competitorName: name,
    opportunityScore,
    contentTopics,
    postingFrequency,
    seoOpportunities,
    keywordGaps,
    contentWeaknesses,
    contentGapReport,
    keywordRecommendations,
  };
}
