export interface PersonalBrandRequest {
  name: string;
  industry: string;
  targetAudience: string;
  platform?: string;
}

export interface PersonalBrandMetrics {
  personalBrandScore: number;
  consistency: number;
  thoughtLeadership: number;
  contentQuality: number;
  engagementPotential: number;
}

export interface ScoreHistoryPoint {
  week: string;
  score: number;
  consistency: number;
  thoughtLeadership: number;
  contentQuality: number;
  engagementPotential: number;
}

export type GrowthImpact = "high" | "medium" | "low";

export interface GrowthRecommendation {
  id: string;
  title: string;
  description: string;
  impact: GrowthImpact;
  category: "consistency" | "thought-leadership" | "content-quality" | "engagement";
  action: string;
}

export interface WeeklyPlanItem {
  day: string;
  title: string;
  action: string;
  format: string;
  type: "post" | "story" | "engage" | "repurpose" | "commentary";
}

export interface LinkedInPostIdea {
  hook: string;
  angle: string;
  format: string;
  cta: string;
}

export interface StoryIdea {
  title: string;
  arc: string;
  emotion: string;
}

export interface CommentaryIdea {
  topic: string;
  stance: string;
  talkingPoints: string[];
}

export interface PersonalBrandOutput {
  metrics: PersonalBrandMetrics;
  scoreHistory: ScoreHistoryPoint[];
  growthRecommendations: GrowthRecommendation[];
  weeklyContentPlan: WeeklyPlanItem[];
  linkedInPostIdeas: LinkedInPostIdea[];
  storyIdeas: StoryIdea[];
  industryCommentary: CommentaryIdea[];
  live?: boolean;
}

export interface PersonalBrandProfile {
  name: string;
  industry: string;
  targetAudience: string;
  platform: string;
  output: PersonalBrandOutput | null;
}

function computeMetrics(req: PersonalBrandRequest): PersonalBrandMetrics {
  const nameLen = req.name.trim().length;
  const industryLen = req.industry.trim().length;
  const audienceLen = req.targetAudience.trim().length;

  const consistency = Math.min(92, 60 + nameLen + Math.min(industryLen, 14));
  const thoughtLeadership = Math.min(94, 56 + industryLen + Math.min(audienceLen, 14));
  const contentQuality = Math.min(90, 58 + nameLen + Math.min(industryLen, 12));
  const engagementPotential = Math.min(96, 64 + Math.min(audienceLen, 22));

  const personalBrandScore = Math.round(
    consistency * 0.25 +
      thoughtLeadership * 0.28 +
      contentQuality * 0.22 +
      engagementPotential * 0.25
  );

  return {
    personalBrandScore,
    consistency,
    thoughtLeadership,
    contentQuality,
    engagementPotential,
  };
}

export function buildScoreHistory(metrics: PersonalBrandMetrics): ScoreHistoryPoint[] {
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "Now"];
  return weeks.map((week, i) => {
    const progress = i / (weeks.length - 1);
    const lerp = (target: number) => Math.round(target * (0.58 + progress * 0.42));
    return {
      week,
      score: lerp(metrics.personalBrandScore),
      consistency: lerp(metrics.consistency),
      thoughtLeadership: lerp(metrics.thoughtLeadership),
      contentQuality: lerp(metrics.contentQuality),
      engagementPotential: lerp(metrics.engagementPotential),
    };
  });
}

export function metricsToRadar(metrics: PersonalBrandMetrics) {
  return [
    { metric: "Consistency", value: metrics.consistency, fullMark: 100 },
    { metric: "Thought Leadership", value: metrics.thoughtLeadership, fullMark: 100 },
    { metric: "Content Quality", value: metrics.contentQuality, fullMark: 100 },
    { metric: "Engagement", value: metrics.engagementPotential, fullMark: 100 },
  ];
}

function buildGrowthRecommendations(
  metrics: PersonalBrandMetrics,
  req: PersonalBrandRequest
): GrowthRecommendation[] {
  const { industry, targetAudience, platform } = req;
  const items: GrowthRecommendation[] = [];

  if (metrics.consistency < 78) {
    items.push({
      id: "consistency-cadence",
      title: "Lock a 3× weekly posting cadence",
      description: "Irregular posting is the #1 drag on personal brand momentum.",
      impact: "high",
      category: "consistency",
      action: `Schedule Mon / Wed / Fri ${platform} posts and batch-write on Sundays.`,
    });
  }

  if (metrics.thoughtLeadership < 80) {
    items.push({
      id: "thought-pov",
      title: "Publish a contrarian POV piece",
      description: `Leaders in ${industry} win by staking a clear position, not summarizing news.`,
      impact: "high",
      category: "thought-leadership",
      action: `Write "What most ${targetAudience} get wrong about ${industry}" this week.`,
    });
  }

  if (metrics.contentQuality < 76) {
    items.push({
      id: "quality-depth",
      title: "Upgrade depth over frequency",
      description: "One flagship post with frameworks beats five shallow takes.",
      impact: "medium",
      category: "content-quality",
      action: "Turn your best idea into a carousel or 1,200-word LinkedIn article.",
    });
  }

  if (metrics.engagementPotential < 82) {
    items.push({
      id: "engage-first",
      title: "Comment-first growth loop",
      description: "Engagement before broadcast increases reach 2–3× on LinkedIn.",
      impact: "high",
      category: "engagement",
      action: "Spend 15 minutes daily commenting on 10 posts from your ICP before posting.",
    });
  }

  items.push({
    id: "repurpose-wins",
    title: "Repurpose top performer",
    description: "Extend shelf life of content that already resonated.",
    impact: "medium",
    category: "content-quality",
    action: "Convert last month's best post into a story thread + newsletter snippet.",
  });

  items.push({
    id: "industry-commentary",
    title: "Weekly industry hot take",
    description: "Commentary posts signal you're plugged into the market.",
    impact: "medium",
    category: "thought-leadership",
    action: `React to one ${industry} news item with your take for ${targetAudience}.`,
  });

  return items.slice(0, 6);
}

export function generatePersonalBrand(req: PersonalBrandRequest): PersonalBrandOutput {
  const { name, industry, targetAudience } = req;
  const niche = industry.trim();
  const aud = targetAudience.trim();
  const platform = req.platform ?? "LinkedIn";

  const metrics = computeMetrics(req);
  const scoreHistory = buildScoreHistory(metrics);

  const linkedInPostIdeas: LinkedInPostIdea[] = [
    {
      hook: `I almost quit ${niche}. Here's what changed.`,
      angle: "Vulnerability → lesson → authority",
      format: "Long-form post (1,200 chars)",
      cta: `What's the hardest part of ${niche} for you?`,
    },
    {
      hook: `Unpopular opinion about ${niche}:`,
      angle: "Contrarian stance with evidence",
      format: "Text post + poll",
      cta: "Agree or disagree? Comment below.",
    },
    {
      hook: `3 frameworks that 10×'d my ${niche} results`,
      angle: "Actionable numbered list",
      format: "Carousel (7 slides)",
      cta: "Save this for later ♻️",
    },
    {
      hook: `Stop doing this if you're targeting ${aud}`,
      angle: "Mistake → fix pattern",
      format: "Hook + bullet list",
      cta: "Tag someone who needs this.",
    },
    {
      hook: `The ${niche} trend nobody is talking about`,
      angle: "Trend analysis + prediction",
      format: "Industry commentary",
      cta: `Follow ${name} for more ${niche} insights.`,
    },
  ];

  const storyIdeas: StoryIdea[] = [
    {
      title: `The failure that taught me more than any win in ${niche}`,
      arc: "Setup → rock bottom → insight → today",
      emotion: "Vulnerable, relatable",
    },
    {
      title: `How I landed my first client in ${niche} with zero budget`,
      arc: "Problem → scrappy tactics → first win",
      emotion: "Inspiring, practical",
    },
    {
      title: `A conversation that changed how I serve ${aud}`,
      arc: "Scene → dialogue → mindset shift",
      emotion: "Human, authentic",
    },
    {
      title: `Why I pivoted my ${niche} strategy`,
      arc: "Old approach → data/reality → new path → results",
      emotion: "Honest, strategic",
    },
    {
      title: "Building in public: month 1 vs month 12",
      arc: "Then vs now comparison with metrics",
      emotion: "Motivational",
    },
  ];

  const industryCommentary: CommentaryIdea[] = [
    {
      topic: `AI-assisted personal branding in ${niche}`,
      stance: "Table stakes — differentiation is voice and POV",
      talkingPoints: [
        "Generic AI output floods feeds",
        "Win with specific stories and frameworks",
        `${aud} reward authenticity over polish`,
      ],
    },
    {
      topic: `Short-form video for ${niche} creators`,
      stance: "Discovery engine — but LinkedIn text still converts trust",
      talkingPoints: [
        "Repurpose video hooks into written posts",
        "Use video for reach, long-form for depth",
        "Hybrid creators outperform single-format",
      ],
    },
    {
      topic: `Comment-led growth in 2026`,
      stance: "Outperforms broadcast-only posting",
      talkingPoints: [
        "15 min/day in ICP threads",
        "Add value before self-promotion",
        "Algorithm rewards conversation starters",
      ],
    },
    {
      topic: `Niche authority vs broad reach`,
      stance: `Niche authority wins for ${niche} professionals`,
      talkingPoints: [
        `${aud} follow specialists, not generalists`,
        "Depth on 3 pillars beats 10 shallow topics",
        "Referrals come from clear positioning",
      ],
    },
  ];

  const weeklyContentPlan: WeeklyPlanItem[] = [
    {
      day: "Monday",
      title: "Thought leadership anchor",
      action: `Publish industry commentary on a ${niche} trend for ${aud}`,
      format: "Long-form post",
      type: "commentary",
    },
    {
      day: "Tuesday",
      title: "Engagement sprint",
      action: "Comment on 15 posts from your ICP before posting",
      format: "15 min engagement block",
      type: "engage",
    },
    {
      day: "Wednesday",
      title: "Personal story",
      action: storyIdeas[0].title,
      format: "Story post",
      type: "story",
    },
    {
      day: "Thursday",
      title: "Educational value",
      action: linkedInPostIdeas[2].hook,
      format: "Carousel",
      type: "post",
    },
    {
      day: "Friday",
      title: "Repurpose winner",
      action: "Turn best post into thread or newsletter snippet",
      format: "Multi-format repurpose",
      type: "repurpose",
    },
    {
      day: "Saturday",
      title: "Leader engagement",
      action: `Add genuine takes on ${niche} leaders' posts`,
      format: "3–5 thoughtful comments",
      type: "engage",
    },
    {
      day: "Sunday",
      title: "Batch & plan",
      action: "Write 2 posts + schedule next week's content plan",
      format: "Planning session",
      type: "post",
    },
  ];

  return {
    metrics,
    scoreHistory,
    growthRecommendations: buildGrowthRecommendations(metrics, req),
    weeklyContentPlan,
    linkedInPostIdeas,
    storyIdeas,
    industryCommentary,
  };
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return "Strong personal brand";
  if (score >= 70) return "Growing authority";
  if (score >= 55) return "Building momentum";
  return "Early stage — high upside";
}

export const METRIC_CONFIG = [
  {
    key: "consistency" as const,
    label: "Consistency",
    description: "Posting cadence and brand reliability",
    color: "#7C3AED",
  },
  {
    key: "thoughtLeadership" as const,
    label: "Thought Leadership",
    description: "Original insights and niche authority",
    color: "#3B82F6",
  },
  {
    key: "contentQuality" as const,
    label: "Content Quality",
    description: "Depth, clarity, and value of your content",
    color: "#10B981",
  },
  {
    key: "engagementPotential" as const,
    label: "Engagement Potential",
    description: "Likelihood to spark comments, shares, and DMs",
    color: "#06B6D4",
  },
];

export function parsePersonalBrandOutput(json: string): PersonalBrandOutput | null {
  try {
    return JSON.parse(json) as PersonalBrandOutput;
  } catch {
    return null;
  }
}
