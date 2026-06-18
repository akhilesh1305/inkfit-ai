import { format, addDays } from "date-fns";
import type { BrandKit } from "./brand";
import { brandContext } from "./brand";

function hasOpenAIKey(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return !!key && key !== "sk-your-key-here" && key.startsWith("sk-");
}

function hasGeminiKey(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return !!key && key.length > 10;
}

async function callOpenAI(system: string, user: string, maxTokens = 2000): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.choices[0]?.message?.content ?? "";
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function generate(system: string, user: string, maxTokens = 2000): Promise<string> {
  if (hasOpenAIKey()) return callOpenAI(system, user, maxTokens);
  if (hasGeminiKey()) return callGemini(`${system}\n\n${user}`);
  return "";
}

export interface BlogRequest {
  topic: string;
  tone: string;
  length: string;
  keywords?: string;
  audience?: string;
  brand?: BrandKit;
}

export async function generateBlog(req: BlogRequest): Promise<string> {
  const brand = req.brand ? brandContext(req.brand) : "";
  const prompt = `Write a ${req.length} SEO-optimized blog post about "${req.topic}".
Tone: ${req.tone}
${req.audience ? `Target audience: ${req.audience}` : ""}
${req.keywords ? `Include keywords: ${req.keywords}` : ""}
${brand}
Use SEO-friendly H1, H2, H3 headings. Include intro, body sections, and CTA conclusion.`;

  const live = await generate("Expert SEO copywriter and content marketer.", prompt, 2500);
  if (live) return live;

  const kw = req.keywords?.split(",").map((k) => k.trim()).filter(Boolean) ?? [];
  const company = req.brand?.companyName || "Your Brand";
  return `# ${req.topic}: The Complete Guide

## Introduction
**${req.topic}** is transforming how ${req.audience || req.brand?.targetAudience || "businesses"} create and distribute content. At **${company}**, we've seen firsthand how a ${req.tone.toLowerCase()} approach drives measurable results${kw.length ? ` — especially around **${kw.join("**, **")}**` : ""}.

## Why ${req.topic} Matters in 2026
Content that ranks and converts isn't accidental. It follows a system: research, creation, optimization, and distribution.

### Key Benefits
- Higher organic visibility on Google and LinkedIn
- Stronger brand authority in your niche
- More qualified leads from educational content
- Lower customer acquisition cost vs. paid-only

## Best Practices for ${req.topic}
1. **Start with audience research** — understand pain points before writing
2. **Structure for SEO** — use keyword-rich headings naturally
3. **Add original insights** — data, case studies, personal experience
4. **Optimize meta tags** — title under 60 chars, description under 160
5. **Repurpose across channels** — blog → LinkedIn → email → video

## How to Get Started This Week
Pick one topic your audience asks about most. Write a 1,000-word pillar post. Share it on LinkedIn with a personal story hook. Track impressions and engagement for 7 days.

## Conclusion
**${req.topic}** is your competitive edge. ${company} helps you generate, optimize, and schedule content that grows your brand — consistently.

---
*Demo mode — add OPENAI_API_KEY or GEMINI_API_KEY in .env.local for live AI.*`;
}

export interface SocialRequest {
  topic: string;
  platform: string;
  tone: string;
  hashtags?: boolean;
  cta?: boolean;
  count?: number;
  brand?: BrandKit;
}

export async function generateSocialPosts(req: SocialRequest): Promise<string> {
  const brand = req.brand ? brandContext(req.brand) : "";
  const count = req.count ?? 3;
  const prompt = `Create ${count} ${req.platform} posts about "${req.topic}". Tone: ${req.tone}.
${req.hashtags ? "Include hashtag suggestions." : ""}
${req.cta ? "Include CTA suggestions for each post." : ""}
${brand}
Format each post clearly numbered with --- between posts.`;

  const live = await generate("Social media strategist specializing in B2B LinkedIn growth.", prompt, 1500);
  if (live) return live;

  const hooks: Record<string, string[]> = {
    LinkedIn: [
      "I spent 6 months testing this. Here's what actually moved the needle:",
      "Unpopular opinion about",
      "3 lessons I wish I knew earlier about",
    ],
    Instagram: [
      "POV: You finally figured out",
      "Save this for later",
      "The secret nobody talks about:",
    ],
    Twitter: [
      "Hot take:",
      "Thread: Everything about",
      "Stop doing this with",
    ],
    "X (Twitter)": [
      "Hot take:",
      "Thread: Everything about",
      "Stop doing this with",
    ],
  };

  const platformHooks = hooks[req.platform] || hooks.LinkedIn;
  const posts = Array.from({ length: count }, (_, i) => {
    const hook = platformHooks[i % platformHooks.length];
    const hashtags = req.hashtags ? "\n\n**Hashtags:** #InkFitAI #ContentMarketing #LinkedInTips" : "";
    const cta = req.cta ? "\n\n**CTA:** Follow for more insights · Save & share with your network" : "";
    return `### Post ${i + 1}\n${hook} ${req.topic.toLowerCase()}.\n\n${req.brand?.writingStyle || "Engaging, value-first content"} for ${req.brand?.targetAudience || "your audience"}. Tone: ${req.tone}.${hashtags}${cta}`;
  });

  return posts.join("\n\n---\n\n");
}

export interface LinkedInCarouselRequest {
  topic: string;
  slides: number;
  brand?: BrandKit;
}

export async function generateLinkedInCarousel(req: LinkedInCarouselRequest): Promise<string> {
  const brand = req.brand ? brandContext(req.brand) : "";
  const prompt = `Create a ${req.slides}-slide LinkedIn carousel about "${req.topic}". ${brand}
For each slide: Slide number, headline (max 8 words), body (max 30 words). End with a CTA slide.`;

  const live = await generate("LinkedIn carousel expert for personal branding.", prompt, 1500);
  if (live) return live;

  const slides = Array.from({ length: req.slides }, (_, i) => {
    if (i === 0) return `**Slide 1 — Cover**\n# ${req.topic}\nSwipe → for the playbook`;
    if (i === req.slides - 1) return `**Slide ${i + 1} — CTA**\nFollow ${req.brand?.companyName || "us"} for more\nSave this carousel · Share with a friend`;
    return `**Slide ${i + 1}**\n## Tip #${i}: Master ${req.topic}\nActionable insight your audience can use today.`;
  });
  return slides.join("\n\n---\n\n");
}

export async function generateCommentSuggestions(post: string, brand?: BrandKit): Promise<string> {
  const brandCtx = brand ? brandContext(brand) : "";
  const prompt = `Suggest 5 thoughtful LinkedIn comments for this post. Vary tone: supportive, insightful, question-based. ${brandCtx}\n\nPost:\n${post}`;

  const live = await generate("LinkedIn engagement strategist.", prompt, 800);
  if (live) return live;

  return `1. "This resonates deeply — especially the point about consistency. What's been your biggest challenge?"

2. "Great breakdown. I'd add that timing matters as much as content quality. When do you post?"

3. "Saving this. We implemented something similar and saw 3x engagement in 30 days."

4. "Curious — how do you measure ROI on this approach? Would love to hear your framework."

5. "Well said. This is the kind of content that actually helps people, not just gets likes."`;
}

export async function generateViralIdeas(niche: string, brand?: BrandKit): Promise<string> {
  const brandCtx = brand ? brandContext(brand) : "";
  const prompt = `Generate 10 viral LinkedIn post ideas for the ${niche} niche. ${brandCtx} Include hook, format, and why it works.`;

  const live = await generate("Viral content strategist for LinkedIn.", prompt, 1200);
  if (live) return live;

  const formats = ["Story post", "Contrarian take", "Listicle", "Before/After", "Poll", "Carousel", "Case study", "Myth busting", "Personal failure", "Industry prediction"];
  return formats.map((f, i) => `### Idea ${i + 1}: ${f}
**Hook:** "Everyone in ${niche} is doing X wrong..."
**Format:** ${f}
**Why it works:** Triggers curiosity + shares lived experience`).join("\n\n");
}

export interface SEORequest {
  content: string;
  targetKeyword: string;
  brand?: BrandKit;
}

export interface SEOResult {
  score: number;
  title: string;
  metaDescription: string;
  suggestions: string[];
  keywords: string[];
  readability: string;
}

export async function optimizeSEO(req: SEORequest): Promise<SEOResult> {
  if (hasOpenAIKey() || hasGeminiKey()) {
    const raw = await generate(
      "SEO expert. Return ONLY valid JSON: score, title, metaDescription, suggestions[], keywords[], readability",
      `Optimize for "${req.targetKeyword}":\n${req.content.slice(0, 3000)}`,
      1000
    );
    try {
      return JSON.parse(raw.replace(/```json\n?|\n?```/g, ""));
    } catch { /* demo */ }
  }

  const wordCount = req.content.split(/\s+/).filter(Boolean).length;
  const keywordCount = (req.content.toLowerCase().match(new RegExp(req.targetKeyword.toLowerCase(), "g")) || []).length;
  const score = Math.min(95, 50 + (wordCount > 300 ? 15 : 0) + (keywordCount >= 2 ? 20 : 10) + (req.content.includes("#") ? 10 : 0));

  return {
    score,
    title: `${req.targetKeyword.charAt(0).toUpperCase() + req.targetKeyword.slice(1)} — Expert Guide | ${req.brand?.companyName || "Your Brand"}`,
    metaDescription: `Learn ${req.targetKeyword} strategies that work. Actionable tips for ${req.brand?.targetAudience || "professionals"}. Read more.`,
    suggestions: [
      wordCount < 300 ? "Expand to 300+ words for better rankings." : "Good content length.",
      keywordCount < 2 ? `Use "${req.targetKeyword}" 2-3 times naturally.` : "Keyword density looks good.",
      "Add FAQ section for featured snippets.",
      "Include internal and external links.",
      "Add alt text to images with target keyword.",
    ],
    keywords: [req.targetKeyword, `${req.targetKeyword} tips`, `best ${req.targetKeyword}`, `${req.targetKeyword} 2026`],
    readability: wordCount > 500 ? "Good" : wordCount > 200 ? "Fair" : "Needs improvement",
  };
}

export async function researchKeywords(topic: string, brand?: BrandKit): Promise<{ keyword: string; volume: string; difficulty: string }[]> {
  const prompt = `List 15 SEO keywords for "${topic}" targeting ${brand?.targetAudience || "business audience"}. Return JSON array: [{keyword, volume, difficulty}]`;
  if (hasOpenAIKey() || hasGeminiKey()) {
    const raw = await generate("SEO keyword researcher.", prompt, 1000);
    try {
      return JSON.parse(raw.replace(/```json\n?|\n?```/g, ""));
    } catch { /* demo */ }
  }

  const bases = [topic, `${topic} strategy`, `${topic} tips`, `how to ${topic}`, `best ${topic}`, `${topic} for beginners`, `${topic} examples`, `${topic} tools`, `${topic} trends 2026`, `${topic} guide`];
  return bases.map((kw, i) => ({
    keyword: kw,
    volume: ["High", "Medium", "Low"][i % 3],
    difficulty: ["Easy", "Medium", "Hard"][i % 3],
  }));
}

export async function analyzeCompetitor(url: string, brand?: BrandKit): Promise<{
  gaps: string[];
  topics: string[];
  strengths: string[];
}> {
  const prompt = `Analyze competitor website ${url} for content gaps vs a brand targeting ${brand?.targetAudience || "businesses"} in ${brand?.industry || "general"}. Return JSON: {gaps[], topics[], strengths[]}`;
  if (hasOpenAIKey() || hasGeminiKey()) {
    const raw = await generate("Competitive content analyst.", prompt, 1000);
    try {
      return JSON.parse(raw.replace(/```json\n?|\n?```/g, ""));
    } catch { /* demo */ }
  }

  return {
    strengths: ["Strong blog publishing cadence", "Good use of case studies", "Active LinkedIn presence"],
    gaps: [
      "No video content or short-form repurposing",
      "Missing comparison/alternative pages",
      "Thin content on emerging AI topics",
      "No downloadable lead magnets",
      "Limited personal branding from founders",
    ],
    topics: [
      "AI-powered content workflows for agencies",
      "LinkedIn growth playbook for B2B founders",
      `${brand?.industry || "Industry"} trends report 2026`,
      "How to build a content engine with 1 person",
      "ROI calculator for content marketing",
    ],
  };
}

export async function suggestTopics(brand?: BrandKit, count = 10): Promise<string[]> {
  const prompt = `Suggest ${count} content topics for ${brand?.companyName || "a business"} targeting ${brand?.targetAudience || "professionals"} in ${brand?.writingStyle || "engaging"} style. Return JSON array of strings.`;
  if (hasOpenAIKey() || hasGeminiKey()) {
    const raw = await generate("Content strategist.", prompt, 800);
    try {
      return JSON.parse(raw.replace(/```json\n?|\n?```/g, ""));
    } catch { /* demo */ }
  }

  const industry = brand?.industry || "business";
  return [
    `5 ${industry} trends nobody is talking about`,
    `How I grew my LinkedIn to 10K followers in 90 days`,
    `The content system that saved me 20 hours/week`,
    `Why most ${industry} companies fail at content marketing`,
    `AI tools every ${industry} founder should use`,
    `Behind the scenes: our content creation process`,
    `Mistakes I made building a personal brand`,
    `${industry} case study: 3x leads in 60 days`,
    `The ultimate guide to LinkedIn carousels`,
    `Content repurposing: 1 blog → 10 social posts`,
  ].slice(0, count);
}

export interface ImageRequest {
  prompt: string;
  style: string;
  size: string;
  useCase?: string;
}

export async function generateImage(req: ImageRequest): Promise<{ url: string; prompt: string }> {
  const fullPrompt = `${req.useCase || "marketing"} image, ${req.style} style: ${req.prompt}`;

  if (hasOpenAIKey()) {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: "dall-e-3", prompt: fullPrompt, size: req.size, n: 1 }),
    });
    if (res.ok) {
      const data = await res.json();
      return { url: data.data[0]?.url ?? "", prompt: req.prompt };
    }
  }

  const dims = req.size === "1024x1024" ? "800x800" : "800x450";
  const text = encodeURIComponent(`${req.useCase || "Creative"}`.slice(0, 30));
  return {
    url: `https://placehold.co/${dims}/4f46e5/ffffff/png?text=${text}`,
    prompt: req.prompt,
  };
}

const DEMO_TYPE_INSTRUCTIONS: Record<string, string> = {
  linkedin: "Write a LinkedIn post with hooks, short paragraphs, and hashtags.",
  blog: "Write a blog introduction (2-3 paragraphs) with a strong hook.",
  instagram: "Write an Instagram caption with emojis and hashtags. Keep it engaging and platform-native.",
  seo: "Write an SEO meta title (under 60 chars) and meta description (under 160 chars).",
  email: "Write an email subject line, preview text, and short body.",
};

export async function generateDemoContent(
  prompt: string,
  type: string
): Promise<{ content: string; live: boolean }> {
  const instruction = DEMO_TYPE_INSTRUCTIONS[type] ?? DEMO_TYPE_INSTRUCTIONS.linkedin;
  const system = `You are InkFit AI, an expert content writer. ${instruction} Follow the user's request exactly. Output only the content — no preamble.`;
  const live = await generate(system, prompt.trim(), 800);
  if (live) return { content: live.trim(), live: true };
  return { content: "", live: false };
}

export function getDemoCalendarEvents(): import("./types").CalendarEvent[] {
  const today = new Date();
  return [
    { id: "1", title: "LinkedIn Growth Playbook", type: "linkedin", date: format(addDays(today, 1), "yyyy-MM-dd"), status: "scheduled", platform: "LinkedIn" },
    { id: "2", title: "Q2 Product Launch Blog", type: "blog", date: format(addDays(today, 2), "yyyy-MM-dd"), status: "draft" },
    { id: "3", title: "Carousel: 5 Content Tips", type: "carousel", date: format(addDays(today, 3), "yyyy-MM-dd"), status: "scheduled", platform: "LinkedIn" },
    { id: "4", title: "Instagram Campaign Visual", type: "image", date: format(today, "yyyy-MM-dd"), status: "published", platform: "Instagram" },
    { id: "5", title: "SEO Landing Page Refresh", type: "seo", date: format(addDays(today, 5), "yyyy-MM-dd"), status: "scheduled" },
  ];
}
