export interface PersonalBrandRequest {
  name: string;
  industry: string;
  targetAudience: string;
  platform?: string;
}

export interface PersonalBrandMetrics {
  personalBrandScore: number;
  postingConsistency: number;
  thoughtLeadership: number;
  engagementPotential: number;
  contentVolume: number;
}

export interface WeeklyRecommendation {
  day: string;
  action: string;
  type: "post" | "story" | "engage" | "repurpose";
}

export interface PersonalBrandOutput {
  metrics: PersonalBrandMetrics;
  contentIdeas: string[];
  postSuggestions: string[];
  storyTopics: string[];
  industryTrends: string[];
  weeklyRecommendations: WeeklyRecommendation[];
}

function computeMetrics(req: PersonalBrandRequest): PersonalBrandMetrics {
  const nameLen = req.name.trim().length;
  const industryLen = req.industry.trim().length;
  const audienceLen = req.targetAudience.trim().length;

  const postingConsistency = Math.min(92, 62 + nameLen + Math.min(industryLen, 15));
  const thoughtLeadership = Math.min(94, 58 + industryLen + Math.min(audienceLen, 12));
  const engagementPotential = Math.min(96, 65 + Math.min(audienceLen, 20));
  const contentVolume = Math.min(88, 55 + nameLen + industryLen);

  const personalBrandScore = Math.round(
    postingConsistency * 0.25 +
      thoughtLeadership * 0.3 +
      engagementPotential * 0.25 +
      contentVolume * 0.2
  );

  return {
    personalBrandScore,
    postingConsistency,
    thoughtLeadership,
    engagementPotential,
    contentVolume,
  };
}

export function generatePersonalBrand(req: PersonalBrandRequest): PersonalBrandOutput {
  const { name, industry, targetAudience } = req;
  const niche = industry.trim();
  const aud = targetAudience.trim();
  const platform = req.platform ?? "LinkedIn";

  const metrics = computeMetrics(req);

  const contentIdeas = [
    `"5 lessons I learned building in ${niche}" — carousel or long-form post`,
    `Hot take: what most ${aud} get wrong about ${niche}`,
    `Behind the scenes: a day in my life as a ${niche} creator`,
    `Tool stack I use daily for ${niche} content`,
    `Myth vs reality in ${niche} — debunk common advice`,
    `How I would start from zero in ${niche} in 2026`,
    `Client win story (anonymized) with measurable results`,
    `Book/resource list every ${aud} should know`,
  ];

  const postSuggestions = [
    `Hook: "I almost quit ${niche}. Here's what changed."\nBody: Share a turning point + 3 lessons for ${aud}.\nCTA: What's your biggest challenge in ${niche}?`,
    `Hook: "Unpopular opinion about ${niche}:"\nBody: Bold stance + evidence + invite debate.\nCTA: Agree or disagree? Comment below.`,
    `Hook: "3 frameworks that 10x'd my ${niche} results"\nBody: Numbered list with actionable steps.\nCTA: Save this for later ♻️`,
    `Hook: "Stop doing this if you're targeting ${aud}"\nBody: Common mistake + better alternative.\nCTA: Tag someone who needs this.`,
    `Hook: "The ${niche} trend nobody is talking about"\nBody: Trend analysis + what ${aud} should do now.\nCTA: Follow ${name} for more insights.`,
  ];

  const storyTopics = [
    `The failure that taught me more than any win in ${niche}`,
    `How I landed my first client in ${niche} with zero budget`,
    `A conversation that changed how I serve ${aud}`,
    `Why I pivoted my ${niche} strategy (and what happened next)`,
    `My morning routine for consistent content creation`,
    `The mentor advice I ignored — and regretted`,
    `Building in public: month 1 vs month 12`,
  ];

  const industryTrends = [
    `AI-assisted personal branding is table stakes — differentiation is voice and POV`,
    `Short-form video continues to dominate discovery for ${niche} creators`,
    `${aud} increasingly prefer authentic stories over polished corporate content`,
    `Newsletter + ${platform} combo drives the highest trust conversion`,
    `Comment-led growth outperforms broadcast-only posting in 2026`,
    `Niche authority beats broad reach for ${niche} professionals`,
  ];

  const weeklyRecommendations: WeeklyRecommendation[] = [
    {
      day: "Monday",
      action: `Publish a thought leadership post on a ${niche} trend for ${aud}`,
      type: "post",
    },
    {
      day: "Tuesday",
      action: "Engage on 15 posts from your ICP before posting your own content",
      type: "engage",
    },
    {
      day: "Wednesday",
      action: `Share a personal story topic: "${storyTopics[0]}"`,
      type: "story",
    },
    {
      day: "Thursday",
      action: `Post an educational carousel: "${contentIdeas[0].split("—")[0].trim()}"`,
      type: "post",
    },
    {
      day: "Friday",
      action: "Repurpose your best post into a thread or newsletter snippet",
      type: "repurpose",
    },
    {
      day: "Saturday",
      action: `Comment on industry leaders in ${niche} — add genuine value`,
      type: "engage",
    },
    {
      day: "Sunday",
      action: "Plan next week's content and batch-write 2 posts",
      type: "post",
    },
  ];

  return {
    metrics,
    contentIdeas,
    postSuggestions,
    storyTopics,
    industryTrends,
    weeklyRecommendations,
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
    key: "postingConsistency" as const,
    label: "Posting Consistency",
    description: "Cadence and reliability of your content schedule",
    color: "#7C3AED",
  },
  {
    key: "thoughtLeadership" as const,
    label: "Thought Leadership",
    description: "Original insights and authority in your niche",
    color: "#3B82F6",
  },
  {
    key: "engagementPotential" as const,
    label: "Engagement Potential",
    description: "Likelihood to spark comments, shares, and DMs",
    color: "#06B6D4",
  },
  {
    key: "contentVolume" as const,
    label: "Content Volume",
    description: "Depth and breadth of your content library",
    color: "#10B981",
  },
];
