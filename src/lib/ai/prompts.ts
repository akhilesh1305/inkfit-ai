import type { LinkedInContentType } from "@/lib/linkedin-content";
import type { RepurposeOutputId } from "@/lib/repurpose-content";
import type { WritingStyleId } from "@/lib/brand-voice";

export const SYSTEM_ROLES = {
  copywriter: "Expert marketing copywriter and content strategist for B2B brands.",
  seo: "Senior SEO content writer. Produce structured, keyword-optimized articles.",
  linkedin: "LinkedIn growth expert specializing in hook-driven B2B posts.",
  carousel: "LinkedIn carousel designer. Create scannable, high-value slide copy.",
  strategist: "Marketing strategist delivering consulting-grade, actionable plans.",
  brandVoice: "Brand voice analyst. Extract tone, vocabulary, and writing patterns from samples.",
  repurposer: "Content repurposing specialist. Adapt one source into platform-native formats.",
} as const;

export function brandVoiceUserPrompt(data: {
  brandName: string;
  industry: string;
  targetAudience: string;
  writingStyle: WritingStyleId;
  trainingSamples: string;
}): string {
  return `Analyze this brand and return ONLY valid JSON:
{
  "tone": "2-3 sentences describing voice and delivery",
  "vocabulary": "2-3 sentences on word choice and terminology",
  "writingPatterns": "2-3 sentences on sentence structure and rhythm",
  "audienceStyle": "2-3 sentences on how to address the audience"
}

Brand: ${data.brandName}
Industry: ${data.industry || "general"}
Target audience: ${data.targetAudience}
Preferred style: ${data.writingStyle}

Training samples:
${data.trainingSamples.slice(0, 4000)}`;
}

export function linkedInPostUserPrompt(req: {
  topic: string;
  targetAudience: string;
  contentType: LinkedInContentType;
}): string {
  return `Create a LinkedIn ${req.contentType} post about "${req.topic}" for ${req.targetAudience}.

Return ONLY valid JSON:
{
  "hook": "attention-grabbing opening (1-2 lines)",
  "mainContent": "body with line breaks, bullets or arrows where helpful",
  "cta": "closing call-to-action"
}`;
}

export function seoArticleUserPrompt(req: {
  topic: string;
  targetKeyword: string;
  audience?: string;
}): string {
  return `Write a comprehensive SEO article.

Topic: ${req.topic}
Primary keyword: ${req.targetKeyword}
Audience: ${req.audience || "business professionals"}

Return ONLY valid JSON:
{
  "seoTitle": "under 65 chars, includes keyword",
  "metaDescription": "140-160 chars with keyword",
  "keywords": ["8-10 related keywords"],
  "faq": [{"question": "...", "answer": "..."}],
  "fullArticle": "full markdown article 800+ words with H2/H3 headings"
}`;
}

export function carouselUserPrompt(topic: string): string {
  return `Create a 10-slide LinkedIn carousel about "${topic}".

Return ONLY valid JSON:
{
  "slides": [
    { "role": "hook|content|cta", "title": "max 10 words", "body": "max 40 words" }
  ]
}

Slide 1 = hook, slides 2-9 = content tips, slide 10 = CTA. Exactly 10 slides.`;
}

export function repurposeUserPrompt(source: string, outputId: RepurposeOutputId): string {
  const formats: Record<RepurposeOutputId, string> = {
    linkedin: "LinkedIn post with hook, value, hashtags",
    twitter: "Twitter/X thread (5-8 tweets numbered)",
    instagram: "Instagram caption with emojis and hashtags",
    facebook: "Facebook community post",
    newsletter: "Newsletter section with subject hook",
    email: "Email with subject line, preview text, and body",
    "blog-summary": "Blog summary with key takeaways as bullets",
    youtube: "YouTube description with SEO keywords and chapters",
  };

  return `Repurpose this source content into a ${formats[outputId]}.

Source:
${source.slice(0, 6000)}

Output only the final content — no preamble.`;
}

export function marketingOSUserPrompt(goal: string): string {
  return `Create a complete marketing system for: "${goal}"

Return ONLY valid JSON:
{
  "executiveSummary": "2-3 paragraphs",
  "sections": [
    { "id": "marketing-strategy", "title": "...", "content": "markdown" }
  ]
}

Include these section ids exactly:
marketing-strategy, content-strategy, content-pillars, audience-personas, funnel-strategy, seo-plan, linkedin-strategy, blog-strategy, content-calendar, weekly-action-plan.

Content calendar section = 30-day table. Be specific and actionable.`;
}

export function marketingOSSectionPrompt(goal: string, sectionId: string, title: string, current: string): string {
  return `Regenerate the "${title}" section for marketing goal: "${goal}"

Previous version:
${current.slice(0, 2000)}

Return ONLY the section content in markdown — no JSON, no preamble.`;
}

export function employeeContentPlanPrompt(goal: string): string {
  return `Create a 4-week content plan for goal: "${goal}"

Return ONLY valid JSON:
{
  "weeks": [
    { "week": 1, "theme": "...", "formats": ["..."], "focus": "..." }
  ]
}`;
}

export function employeeBlogIdeasPrompt(goal: string, industry: string): string {
  return `Generate 5 SEO blog ideas for goal "${goal}" in ${industry}.

Return ONLY valid JSON array:
[{ "title": "...", "angle": "...", "keyword": "..." }]`;
}

export function employeeLinkedInPostsPrompt(goal: string, audience: string): string {
  return `Create 3 LinkedIn posts for goal "${goal}" targeting ${audience}.

Return ONLY valid JSON array:
[{ "title": "topic", "hook": "...", "body": "...", "cta": "..." }]`;
}

export function employeeImagePromptsPrompt(goal: string): string {
  return `Suggest 3 social image concepts for marketing goal "${goal}".

Return ONLY valid JSON array:
[{ "prompt": "detailed image prompt", "style": "modern-saas|corporate|minimal" }]`;
}

export function employeeCalendarPrompt(goal: string, industry: string): string {
  return `Create a 14-day content publishing schedule for goal "${goal}" in ${industry}.

Return ONLY valid JSON array:
[{
  "id": "unique",
  "date": "YYYY-MM-DD",
  "topic": "...",
  "contentType": "thought-leadership|educational|blog|carousel|story",
  "platformId": "linkedin|wordpress|newsletter",
  "status": "scheduled",
  "suggestedTime": "HH:MM (24h, optimal posting time)",
  "dayOfWeek": "Mon|Tue|..."
}]

Start from today. Include varied content types and platform-appropriate suggested posting times.`;
}
