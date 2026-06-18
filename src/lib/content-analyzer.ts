export type ContentType = "general" | "blog" | "linkedin" | "social" | "email";

export interface AnalyzerScores {
  readability: number;
  seo: number;
  engagement: number;
  brandVoice: number;
  virality: number;
}

export interface AnalysisSuggestion {
  text: string;
  category: keyof AnalyzerScores | "general";
  priority: "high" | "medium" | "low";
}

export interface AnalysisRecommendation {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: keyof AnalyzerScores;
}

export interface ContentAnalysisResult {
  overall: number;
  scores: AnalyzerScores;
  grade: string;
  gradeColor: string;
  wordCount: number;
  sentenceCount: number;
  readingTimeMin: number;
  suggestions: AnalysisSuggestion[];
  recommendations: AnalysisRecommendation[];
  live: boolean;
}

export interface AnalyzeRequest {
  content: string;
  contentType?: ContentType;
  keyword?: string;
  brandTone?: string;
  targetAudience?: string;
}

export const CONTENT_TYPES: { id: ContentType; label: string; description: string }[] = [
  { id: "general", label: "General", description: "Any content format" },
  { id: "blog", label: "Blog", description: "Long-form articles" },
  { id: "linkedin", label: "LinkedIn", description: "Professional posts" },
  { id: "social", label: "Social", description: "Short-form social copy" },
  { id: "email", label: "Email", description: "Newsletters & campaigns" },
];

export const SAMPLE_CONTENT: Record<ContentType, string> = {
  general:
    "AI is changing how teams create content. But most tools produce generic output that sounds like everyone else.\n\nThe fix isn't more AI — it's better inputs: brand voice, audience clarity, and a repeatable workflow.\n\nWhat's your biggest content bottleneck right now?",
  blog: `# How to Build a Content Engine in 2026

Content marketing isn't dead — inconsistent publishing is.

Most B2B teams publish sporadically, chase vanity metrics, and wonder why pipeline doesn't move. A content engine fixes that with systems, not heroics.

## Start with one pillar topic

Pick a keyword cluster your buyers actually search. Write one 1,500-word pillar post. Break it into 8–10 derivative assets.

## Measure what matters

Track organic traffic, engagement depth, and assisted conversions — not just impressions.

Ready to scale? Start with one topic and ship weekly.`,
  linkedin: `I almost quit content marketing last year.

We were publishing 12 posts a month with zero pipeline impact.

Then we changed 3 things:
→ One clear ICP per quarter
→ AI for drafts, humans for voice
→ Repurpose every pillar into 5 formats

Result: 3x inbound leads in 90 days.

What's one workflow change that moved the needle for you?`,
  social: `Stop posting content nobody asked for. 🛑

Start here:
✅ Hook in line 1
✅ One idea per post
✅ End with a question

Save this for your next caption.`,
  email: `Subject: Your content calendar doesn't need more ideas

Hi there,

Most marketers don't have an ideation problem — they have a prioritization problem.

This week, pick ONE topic your audience keeps asking about. Ship one pillar piece. Repurpose it everywhere.

— The InkFit team`,
};

export const SCORE_DIMENSIONS: {
  key: keyof AnalyzerScores;
  label: string;
  description: string;
  gradient: string;
  icon: string;
}[] = [
  {
    key: "readability",
    label: "Readability",
    description: "Clarity, pacing, and scan-friendly structure",
    gradient: "from-cyan-500 to-blue-600",
    icon: "📖",
  },
  {
    key: "seo",
    label: "SEO Score",
    description: "Keywords, structure, and search intent alignment",
    gradient: "from-emerald-500 to-teal-600",
    icon: "🔍",
  },
  {
    key: "engagement",
    label: "Engagement",
    description: "Hooks, CTAs, and audience interaction potential",
    gradient: "from-brand-500 to-violet-600",
    icon: "💬",
  },
  {
    key: "brandVoice",
    label: "Brand Voice Match",
    description: "Tone consistency and brand alignment",
    gradient: "from-pink-500 to-rose-600",
    icon: "🎯",
  },
  {
    key: "virality",
    label: "Virality Score",
    description: "Shareability, hooks, and scroll-stopping power",
    gradient: "from-amber-500 to-orange-600",
    icon: "🚀",
  },
];

function clamp(n: number, min = 0, max = 100) {
  return Math.round(Math.max(min, Math.min(max, n)));
}

function words(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

function sentences(text: string) {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
}

function scoreReadability(content: string, type: ContentType): number {
  const w = words(content);
  const s = sentences(content);
  if (w.length < 10) return 35;

  const avgWordsPerSentence = w.length / Math.max(s.length, 1);
  let score = 55;

  if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 20) score += 18;
  else if (avgWordsPerSentence <= 25) score += 8;
  else score -= 10;

  const paragraphs = content.split(/\n\n+/).filter(Boolean).length;
  if (paragraphs >= 2) score += 10;
  if (paragraphs >= 4) score += 5;

  const hasBullets = /[•→✅✓\-*]/.test(content) || /^\d+\./m.test(content);
  if (hasBullets) score += 8;

  if (type === "linkedin" || type === "social") {
    const lines = content.split("\n").filter(Boolean);
    if (lines.length >= 4 && lines.length <= 20) score += 10;
  }

  if (type === "blog" && w.length >= 300) score += 10;
  if (w.length < 50) score -= 15;

  return clamp(score);
}

function scoreSEO(content: string, keyword: string, type: ContentType): number {
  const w = words(content);
  if (w.length < 20) return 30;

  let score = 45;
  const lower = content.toLowerCase();
  const kw = keyword.trim().toLowerCase();

  if (kw) {
    const count = (lower.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
    if (count >= 1) score += 12;
    if (count >= 2 && count <= 6) score += 10;
    if (lower.slice(0, 150).includes(kw)) score += 12;
  } else {
    score += 15;
  }

  if (/^#+\s/m.test(content)) score += 12;
  if (w.length >= 300) score += 10;
  if (w.length >= 600) score += 5;
  if (content.includes("?")) score += 5;
  if (/\b(guide|how to|tips|best|strategy)\b/i.test(content)) score += 6;

  if (type === "social" || type === "linkedin") {
    score = Math.min(score, 78);
  }

  return clamp(score);
}

function scoreEngagement(content: string, type: ContentType): number {
  let score = 48;

  if (/\?/.test(content)) score += 12;
  if (/\b(comment|share|follow|reply|thoughts|agree|drop|save)\b/i.test(content)) score += 10;
  if (/[•→✅]/.test(content) || /^\d+\./m.test(content)) score += 12;

  const lines = content.split("\n").filter(Boolean);
  if (lines.length >= 3) score += 8;

  if (/[!]/.test(content)) score += 4;
  if (/[\u{1F300}-\u{1FAFF}]/u.test(content)) score += 6;

  const firstLine = lines[0] ?? "";
  if (firstLine.length >= 20 && firstLine.length <= 120) score += 10;

  if (type === "email" && /\b(subject|hi|hello|hey)\b/i.test(content)) score += 8;
  if (type === "linkedin" && content.includes("\n\n")) score += 8;

  return clamp(score);
}

function scoreBrandVoice(content: string, tone: string, audience: string): number {
  let score = 58;
  const lower = content.toLowerCase();
  const toneLower = tone.toLowerCase();

  const professionalMarkers = ["strategy", "results", "teams", "growth", "pipeline", "roi"];
  const casualMarkers = ["honestly", "real talk", "here's the thing", "btw", "imo"];
  const boldMarkers = ["unpopular", "truth", "mistake", "wrong", "stop", "secret"];

  if (toneLower.includes("professional")) {
    if (professionalMarkers.some((m) => lower.includes(m))) score += 12;
    if (casualMarkers.some((m) => lower.includes(m))) score -= 8;
  } else if (toneLower.includes("casual") || toneLower.includes("friendly")) {
    if (casualMarkers.some((m) => lower.includes(m))) score += 10;
  }

  if (audience && lower.includes(audience.toLowerCase().split(" ")[0])) score += 8;

  const exclamations = (content.match(/!/g) || []).length;
  if (exclamations <= 2) score += 6;
  else if (exclamations > 5) score -= 10;

  if (!/ALL CAPS/.test(content) && !/\b[A-Z]{4,}\b/.test(content)) score += 6;

  const weYouRatio =
    (lower.match(/\byou\b/g) || []).length + (lower.match(/\byour\b/g) || []).length;
  if (weYouRatio >= 2) score += 10;

  return clamp(score);
}

function scoreVirality(content: string, type: ContentType): number {
  let score = 42;
  const lines = content.split("\n").filter(Boolean);
  const opener = lines[0] ?? "";

  if (opener.length >= 15 && opener.length <= 100) score += 14;
  if (/\d/.test(opener)) score += 10;
  if (/\b(secret|mistake|truth|nobody|everyone|stop|never|always|3x|10x)\b/i.test(content)) score += 12;
  if (/\b(unpopular|controversial|hot take|wrong)\b/i.test(content)) score += 8;
  if (/→|•|✅/.test(content)) score += 8;
  if (lines.length >= 5 && lines.length <= 15) score += 8;

  if (type === "linkedin" || type === "social") {
    if (opener.split(" ").length <= 12) score += 8;
    if (content.includes("♻️") || /\b(repost|share)\b/i.test(content)) score += 6;
  }

  if (type === "blog") score = Math.min(score + 5, 85);

  return clamp(score);
}

function getGrade(overall: number): { grade: string; gradeColor: string } {
  if (overall >= 85) return { grade: "Excellent", gradeColor: "text-emerald-400" };
  if (overall >= 70) return { grade: "Good", gradeColor: "text-brand-300" };
  if (overall >= 55) return { grade: "Fair", gradeColor: "text-amber-400" };
  return { grade: "Needs Work", gradeColor: "text-red-400" };
}

function buildSuggestions(scores: AnalyzerScores, content: string, keyword: string): AnalysisSuggestion[] {
  const suggestions: AnalysisSuggestion[] = [];
  const w = words(content);

  if (scores.readability < 70) {
    suggestions.push({
      text: "Break long paragraphs into shorter blocks (2–3 sentences each) for easier scanning.",
      category: "readability",
      priority: "high",
    });
  }
  if (scores.readability < 60) {
    suggestions.push({
      text: "Shorten sentences — aim for 12–18 words on average.",
      category: "readability",
      priority: "medium",
    });
  }

  if (scores.seo < 70 && keyword) {
    suggestions.push({
      text: `Place "${keyword}" in the first 100 characters and use it 2–3 times naturally.`,
      category: "seo",
      priority: "high",
    });
  }
  if (scores.seo < 65 && w.length < 300) {
    suggestions.push({
      text: "Expand to 300+ words to improve search ranking potential.",
      category: "seo",
      priority: "medium",
    });
  }
  if (!/^#+\s/m.test(content) && w.length > 150) {
    suggestions.push({
      text: "Add H2/H3 headings to improve structure and SEO.",
      category: "seo",
      priority: "medium",
    });
  }

  if (scores.engagement < 70) {
    suggestions.push({
      text: "End with a question or clear CTA to drive comments and clicks.",
      category: "engagement",
      priority: "high",
    });
  }
  if (!/[•→]/.test(content) && !/^\d+\./m.test(content)) {
    suggestions.push({
      text: "Use bullet points or numbered lists to boost engagement.",
      category: "engagement",
      priority: "low",
    });
  }

  if (scores.brandVoice < 70) {
    suggestions.push({
      text: "Align tone with your brand kit — keep voice consistent across posts.",
      category: "brandVoice",
      priority: "medium",
    });
  }

  if (scores.virality < 70) {
    suggestions.push({
      text: "Strengthen your opening line — lead with a bold claim, stat, or story hook.",
      category: "virality",
      priority: "high",
    });
  }
  if (scores.virality < 60) {
    suggestions.push({
      text: "Add a specific number or result to make the post more shareable.",
      category: "virality",
      priority: "medium",
    });
  }

  return suggestions.slice(0, 8);
}

function buildRecommendations(
  scores: AnalyzerScores,
  contentType: ContentType
): AnalysisRecommendation[] {
  const recs: AnalysisRecommendation[] = [];

  if (scores.readability < 75) {
    recs.push({
      title: "Improve scanability",
      description:
        "Add white space between ideas. Use one concept per paragraph and front-load key takeaways in the first two lines.",
      impact: scores.readability < 60 ? "high" : "medium",
      category: "readability",
    });
  }

  if (scores.seo < 75) {
    recs.push({
      title: "Optimize for search intent",
      description:
        "Map content to a primary keyword, add semantic related terms, and include a FAQ block for featured snippet opportunities.",
      impact: "high",
      category: "seo",
    });
  }

  if (scores.engagement < 75) {
    recs.push({
      title: "Boost interaction triggers",
      description:
        contentType === "linkedin"
          ? "Use a story hook, 4–8 short lines, and end with an open question. Reply to early comments within 60 minutes."
          : "Add a direct CTA (comment, share, save) and use second-person language ('you', 'your') to speak to the reader.",
      impact: "high",
      category: "engagement",
    });
  }

  if (scores.brandVoice < 75) {
    recs.push({
      title: "Tighten brand voice consistency",
      description:
        "Cross-check against your Brand Kit tone. Remove generic phrases that could belong to any competitor.",
      impact: "medium",
      category: "brandVoice",
    });
  }

  if (scores.virality < 75) {
    recs.push({
      title: "Increase shareability",
      description:
        "Lead with tension (problem → insight → payoff). Use concrete numbers, contrarian angles, or mini-frameworks people want to save.",
      impact: scores.virality < 60 ? "high" : "medium",
      category: "virality",
    });
  }

  if (scores.readability >= 80 && scores.engagement >= 80) {
    recs.push({
      title: "Repurpose this content",
      description:
        "Strong base content — split into LinkedIn posts, carousel slides, email snippet, and short-form video script.",
      impact: "medium",
      category: "engagement",
    });
  }

  return recs.slice(0, 6);
}

export function analyzeContent(req: AnalyzeRequest): ContentAnalysisResult {
  const content = req.content.trim();
  const type = req.contentType ?? "general";
  const keyword = req.keyword ?? "";
  const tone = req.brandTone ?? "Professional";
  const audience = req.targetAudience ?? "";

  const w = words(content);
  const s = sentences(content);

  const scores: AnalyzerScores = {
    readability: scoreReadability(content, type),
    seo: scoreSEO(content, keyword, type),
    engagement: scoreEngagement(content, type),
    brandVoice: scoreBrandVoice(content, tone, audience),
    virality: scoreVirality(content, type),
  };

  const overall = clamp(
    scores.readability * 0.2 +
      scores.seo * 0.2 +
      scores.engagement * 0.25 +
      scores.brandVoice * 0.15 +
      scores.virality * 0.2
  );

  const { grade, gradeColor } = getGrade(overall);

  return {
    overall,
    scores,
    grade,
    gradeColor,
    wordCount: w.length,
    sentenceCount: s.length,
    readingTimeMin: Math.max(1, Math.ceil(w.length / 200)),
    suggestions: buildSuggestions(scores, content, keyword),
    recommendations: buildRecommendations(scores, type),
    live: false,
  };
}

export function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-brand-300";
  if (score >= 55) return "text-amber-400";
  return "text-red-400";
}

export function scoreBarColor(score: number): string {
  if (score >= 85) return "from-emerald-500 to-teal-400";
  if (score >= 70) return "from-brand-500 to-cyan-400";
  if (score >= 55) return "from-amber-500 to-orange-400";
  return "from-red-500 to-rose-400";
}
