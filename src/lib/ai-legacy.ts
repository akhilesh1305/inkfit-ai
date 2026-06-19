/** Template fallbacks when no AI provider keys are configured. */
import type { BrandKit } from "@/lib/brand";
import { brandContext } from "@/lib/brand";
import type { BlogRequest, SocialRequest, LinkedInCarouselRequest, SEORequest, SEOResult } from "@/lib/ai/generations";

export async function generateBlog(req: BlogRequest): Promise<string> {
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

## Conclusion
**${req.topic}** is your competitive edge. ${company} helps you generate, optimize, and schedule content that grows your brand — consistently.

---
*Demo mode — add OPENAI_API_KEY or GEMINI_API_KEY for live AI.*`;
}

export async function generateSocialPosts(req: SocialRequest): Promise<string> {
  const count = req.count ?? 3;
  const hooks: Record<string, string[]> = {
    LinkedIn: ["I spent 6 months testing this. Here's what actually moved the needle:", "Unpopular opinion about", "3 lessons I wish I knew earlier about"],
    Instagram: ["POV: You finally figured out", "Save this for later", "The secret nobody talks about:"],
    Twitter: ["Hot take:", "Thread: Everything about", "Stop doing this with"],
    "X (Twitter)": ["Hot take:", "Thread: Everything about", "Stop doing this with"],
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

export async function generateLinkedInCarousel(req: LinkedInCarouselRequest): Promise<string> {
  const slides = Array.from({ length: req.slides }, (_, i) => {
    if (i === 0) return `**Slide 1 — Cover**\n# ${req.topic}\nSwipe → for the playbook`;
    if (i === req.slides - 1) return `**Slide ${i + 1} — CTA**\nFollow ${req.brand?.companyName || "us"} for more\nSave this carousel · Share with a friend`;
    return `**Slide ${i + 1}**\n## Tip #${i}: Master ${req.topic}\nActionable insight your audience can use today.`;
  });
  return slides.join("\n\n---\n\n");
}

export async function generateCommentSuggestions(_post: string, _brand?: BrandKit): Promise<string> {
  return `1. "This resonates deeply — especially the point about consistency. What's been your biggest challenge?"

2. "Great breakdown. I'd add that timing matters as much as content quality."

3. "Saving this. We implemented something similar and saw 3x engagement in 30 days."

4. "Curious — how do you measure ROI on this approach?"

5. "Well said. This is the kind of content that actually helps people."`;
}

export async function generateViralIdeas(niche: string, _brand?: BrandKit): Promise<string> {
  const formats = ["Story post", "Contrarian take", "Listicle", "Before/After", "Poll", "Carousel", "Case study", "Myth busting", "Personal failure", "Industry prediction"];
  return formats.map((f, i) => `### Idea ${i + 1}: ${f}
**Hook:** "Everyone in ${niche} is doing X wrong..."
**Format:** ${f}
**Why it works:** Triggers curiosity + shares lived experience`).join("\n\n");
}

export async function optimizeSEO(req: SEORequest): Promise<SEOResult> {
  const wordCount = req.content.split(/\s+/).filter(Boolean).length;
  const keywordCount = (req.content.toLowerCase().match(new RegExp(req.targetKeyword.toLowerCase(), "g")) || []).length;
  const score = Math.min(95, 50 + (wordCount > 300 ? 15 : 0) + (keywordCount >= 2 ? 20 : 10) + (req.content.includes("#") ? 10 : 0));

  return {
    score,
    title: `${req.targetKeyword.charAt(0).toUpperCase() + req.targetKeyword.slice(1)} — Expert Guide | ${req.brand?.companyName || "Your Brand"}`,
    metaDescription: `Learn ${req.targetKeyword} strategies that work. Actionable tips for ${req.brand?.targetAudience || "professionals"}.`,
    suggestions: [
      wordCount < 300 ? "Expand to 300+ words for better rankings." : "Good content length.",
      keywordCount < 2 ? `Use "${req.targetKeyword}" 2-3 times naturally.` : "Keyword density looks good.",
      "Add FAQ section for featured snippets.",
      "Include internal and external links.",
    ],
    keywords: [req.targetKeyword, `${req.targetKeyword} tips`, `best ${req.targetKeyword}`],
    readability: wordCount > 500 ? "Good" : wordCount > 200 ? "Fair" : "Needs improvement",
  };
}

export async function researchKeywords(topic: string, brand?: BrandKit): Promise<{ keyword: string; volume: string; difficulty: string }[]> {
  const bases = [topic, `${topic} strategy`, `${topic} tips`, `how to ${topic}`, `best ${topic}`];
  return bases.map((kw, i) => ({
    keyword: kw,
    volume: ["High", "Medium", "Low"][i % 3],
    difficulty: ["Easy", "Medium", "Hard"][i % 3],
  }));
}

export async function analyzeCompetitor(_url: string, brand?: BrandKit): Promise<{ gaps: string[]; topics: string[]; strengths: string[] }> {
  return {
    strengths: ["Strong blog publishing cadence", "Good use of case studies", "Active LinkedIn presence"],
    gaps: ["No video content", "Missing comparison pages", "Thin content on emerging AI topics"],
    topics: [`AI content workflows for ${brand?.industry || "businesses"}`, "LinkedIn growth playbook", "Content marketing ROI"],
  };
}

export async function suggestTopics(brand?: BrandKit, count = 10): Promise<string[]> {
  const industry = brand?.industry || "business";
  return [
    `5 ${industry} trends nobody is talking about`,
    `How I grew my LinkedIn to 10K followers in 90 days`,
    `The content system that saved me 20 hours/week`,
    `AI tools every ${industry} founder should use`,
    `Content repurposing: 1 blog → 10 social posts`,
  ].slice(0, count);
}
