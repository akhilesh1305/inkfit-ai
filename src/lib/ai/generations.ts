import { format, addDays } from "date-fns";
import type { BrandKit } from "@/lib/brand";
import type { GeneratedBrandProfile, BrandVoiceFormData } from "@/lib/brand-voice";
import type { CarouselData, CarouselSlide } from "@/lib/carousel-content";
import type { LinkedInContentType, LinkedInPostOutput } from "@/lib/linkedin-content";
import { scoreEngagement, scoreHook } from "@/lib/linkedin-content";
import type { RepurposeOutputId } from "@/lib/repurpose-content";
import type { SEOArticleOutput } from "@/lib/seo-content";
import { computeSEOScore } from "@/lib/seo-content";
import {
  generateMarketingOS,
  getSectionMeta,
  type MarketingOSOutput,
  type MarketingOSSection,
} from "@/lib/marketing-os";
import type {
  BlogIdea,
  ContentPlanOutput,
  ImageAsset,
  LinkedInPostDraft,
  StrategyOutput,
  EmployeeStepId,
} from "@/lib/marketing-employee";
import { generate30DayPlan, type CalendarPlanItem } from "@/lib/calendar-plan";
import { getStyleById, type ImageStyleId } from "@/lib/image-studio";
import { buildAIContext, formatBrandContext, type AIContext } from "@/lib/ai/context";
import {
  generateText,
  generateImageFromPrompt,
  parseAIJson,
  hasAnyAIProvider,
} from "@/lib/ai/providers";
import {
  SYSTEM_ROLES,
  brandVoiceUserPrompt,
  linkedInPostUserPrompt,
  seoArticleUserPrompt,
  carouselUserPrompt,
  repurposeUserPrompt,
  marketingOSUserPrompt,
  marketingOSSectionPrompt,
  employeeContentPlanPrompt,
  employeeBlogIdeasPrompt,
  employeeLinkedInPostsPrompt,
  employeeImagePromptsPrompt,
  employeeCalendarPrompt,
} from "@/lib/ai/prompts";

export interface GenerationOptions {
  userId?: string;
  ctx?: AIContext;
}

async function ctxOrBuild(userId?: string, ctx?: AIContext): Promise<AIContext> {
  if (ctx) return ctx;
  if (!userId) return { knowledgeContext: "" };
  return buildAIContext(userId);
}

// ─── Brand Voice ───────────────────────────────────────────────────────────

export async function generateBrandVoiceProfile(
  data: BrandVoiceFormData,
  opts: GenerationOptions = {}
): Promise<{ profile: GeneratedBrandProfile; live: boolean }> {
  const ctx = await ctxOrBuild(opts.userId, opts.ctx);
  const brandCtx = formatBrandContext(ctx);

  const { text, live } = await generateText({
    system: SYSTEM_ROLES.brandVoice,
    user: brandVoiceUserPrompt(data),
    maxTokens: 1200,
    brandContext: brandCtx,
    userId: opts.userId,
    feature: "brand_voice",
  });

  if (live && text) {
    try {
      const profile = parseAIJson<GeneratedBrandProfile>(text);
      return { profile, live: true };
    } catch {
      /* fall through */
    }
  }

  const { generateBrandProfile } = await import("@/lib/brand-voice");
  return { profile: generateBrandProfile(data), live: false };
}

// ─── Repurpose ───────────────────────────────────────────────────────────────

export async function generateRepurposeOutput(
  source: string,
  outputId: RepurposeOutputId,
  opts: GenerationOptions = {}
): Promise<{ content: string; live: boolean }> {
  const ctx = await ctxOrBuild(opts.userId, opts.ctx);
  const brandCtx = formatBrandContext(ctx);

  const { text, live } = await generateText({
    system: SYSTEM_ROLES.repurposer,
    user: repurposeUserPrompt(source, outputId),
    maxTokens: 1500,
    brandContext: brandCtx,
    userId: opts.userId,
    feature: `repurpose_${outputId}`,
  });

  if (live && text.trim()) {
    return { content: text.trim(), live: true };
  }

  const { generateMockRepurpose } = await import("@/lib/repurpose-content");
  return { content: generateMockRepurpose(source, outputId), live: false };
}

// ─── LinkedIn Post ───────────────────────────────────────────────────────────

export async function generateLinkedInPostAI(
  req: { topic: string; targetAudience: string; contentType: LinkedInContentType },
  opts: GenerationOptions = {}
): Promise<LinkedInPostOutput & { live: boolean }> {
  const ctx = await ctxOrBuild(opts.userId, opts.ctx);
  const brandCtx = formatBrandContext(ctx);

  const { text, live } = await generateText({
    system: SYSTEM_ROLES.linkedin,
    user: linkedInPostUserPrompt(req),
    maxTokens: 1500,
    brandContext: brandCtx,
    userId: opts.userId,
    feature: "linkedin_post",
  });

  if (live && text) {
    try {
      const parsed = parseAIJson<{ hook: string; mainContent: string; cta: string }>(text);
      const hook = parsed.hook ?? "";
      const mainContent = parsed.mainContent ?? "";
      const cta = parsed.cta ?? "";
      return {
        hook,
        mainContent,
        cta,
        hookScore: scoreHook(hook),
        engagementScore: scoreEngagement(hook, mainContent, cta),
        live: true,
      };
    } catch {
      /* fall through */
    }
  }

  const { generateLinkedInPost } = await import("@/lib/linkedin-content");
  return { ...generateLinkedInPost(req), live: false };
}

// ─── SEO Article ─────────────────────────────────────────────────────────────

export async function generateSEOArticleAI(
  req: { topic: string; targetKeyword: string; audience?: string },
  opts: GenerationOptions = {}
): Promise<SEOArticleOutput & { live: boolean }> {
  const ctx = await ctxOrBuild(opts.userId, opts.ctx);
  const brandCtx = formatBrandContext(ctx);

  const { text, live } = await generateText({
    system: SYSTEM_ROLES.seo,
    user: seoArticleUserPrompt(req),
    maxTokens: 4000,
    brandContext: brandCtx,
    userId: opts.userId,
    feature: "seo_article",
  });

  if (live && text) {
    try {
      const parsed = parseAIJson<Omit<SEOArticleOutput, "seoScore">>(text);
      const seoScore = computeSEOScore(req, parsed);
      return { ...parsed, seoScore, live: true };
    } catch {
      /* fall through */
    }
  }

  const { generateSEOArticle } = await import("@/lib/seo-content");
  return { ...generateSEOArticle(req), live: false };
}

// ─── Carousel ────────────────────────────────────────────────────────────────

export async function generateCarouselAI(
  topic: string,
  opts: GenerationOptions = {}
): Promise<CarouselData & { live: boolean }> {
  const ctx = await ctxOrBuild(opts.userId, opts.ctx);
  const brandCtx = formatBrandContext(ctx);

  const { text, live } = await generateText({
    system: SYSTEM_ROLES.carousel,
    user: carouselUserPrompt(topic),
    maxTokens: 2000,
    brandContext: brandCtx,
    userId: opts.userId,
    feature: "carousel",
  });

  if (live && text) {
    try {
      const parsed = parseAIJson<{ slides: { role: string; title: string; body: string }[] }>(text);
      if (parsed.slides?.length >= 3) {
        const slides: CarouselSlide[] = parsed.slides.map((s, i) => ({
          id: `slide-${i + 1}-${Date.now()}`,
          number: i + 1,
          role: (s.role === "hook" || s.role === "cta" ? s.role : "content") as CarouselSlide["role"],
          title: s.title,
          body: s.body,
        }));
        return { topic: topic.trim(), slides, live: true };
      }
    } catch {
      /* fall through */
    }
  }

  const { generateCarousel } = await import("@/lib/carousel-content");
  return { ...generateCarousel(topic), live: false };
}

// ─── Marketing OS ────────────────────────────────────────────────────────────

export async function enhanceMarketingOSAI(
  goal: string,
  base: MarketingOSOutput,
  opts: GenerationOptions = {}
): Promise<MarketingOSOutput> {
  if (!hasAnyAIProvider()) return base;

  const ctx = await ctxOrBuild(opts.userId, opts.ctx);
  const brandCtx = formatBrandContext(ctx);

  try {
    const { text } = await generateText({
      system: SYSTEM_ROLES.strategist,
      user: marketingOSUserPrompt(goal),
      maxTokens: 4000,
      brandContext: brandCtx,
      userId: opts.userId,
      feature: "marketing_os",
    });

    if (!text) return base;

    const parsed = parseAIJson<{
      executiveSummary: string;
      sections: MarketingOSSection[];
    }>(text);

    if (parsed.sections?.length >= 5) {
      return {
        ...base,
        executiveSummary: parsed.executiveSummary ?? base.executiveSummary,
        sections: parsed.sections.map((s) => ({
          id: s.id,
          title: s.title ?? getSectionMeta(s.id).title,
          content: s.content,
        })),
        live: true,
      };
    }
  } catch {
    /* use template */
  }
  return base;
}

export async function regenerateMarketingOSSectionAI(
  goal: string,
  sectionId: string,
  current: string,
  opts: GenerationOptions = {}
): Promise<{ content: string; live: boolean }> {
  const meta = getSectionMeta(sectionId);
  const base = generateMarketingOS(goal);
  const fallback = base.sections.find((s) => s.id === sectionId)?.content ?? current;

  if (!hasAnyAIProvider()) return { content: fallback, live: false };

  const ctx = await ctxOrBuild(opts.userId, opts.ctx);
  const brandCtx = formatBrandContext(ctx);

  try {
    const { text, live } = await generateText({
      system: SYSTEM_ROLES.strategist,
      user: marketingOSSectionPrompt(goal, sectionId, meta.title, current),
      maxTokens: 1500,
      brandContext: brandCtx,
      userId: opts.userId,
      feature: "marketing_os_section",
    });
    return { content: text.trim() || fallback, live };
  } catch {
    return { content: fallback, live: false };
  }
}

// ─── AI Employee Steps ───────────────────────────────────────────────────────

function inferIndustry(goal: string): string {
  const g = goal.toLowerCase();
  if (/saas|software|startup/.test(g)) return "B2B SaaS";
  if (/agency/.test(g)) return "Marketing Agency";
  if (/ecommerce|shop/.test(g)) return "E-commerce";
  return "Growth Business";
}

export async function executeEmployeeStepAI(
  stepId: EmployeeStepId,
  goal: string,
  opts: GenerationOptions = {}
): Promise<{ output: unknown; preview: string; live: boolean }> {
  const ctx = await ctxOrBuild(opts.userId, opts.ctx);
  const brandCtx = formatBrandContext(ctx);
  const industry = inferIndustry(goal);
  const isLeads = /lead|pipeline|mql|signup|demo/i.test(goal);

  switch (stepId) {
    case "strategy": {
      const base = generateMarketingOS(goal);
      const enhanced = await enhanceMarketingOSAI(goal, base, opts);
      const strategySection = enhanced.sections.find((s) => s.id === "marketing-strategy");
      const output: StrategyOutput = {
        executiveSummary: enhanced.executiveSummary,
        pillars: enhanced.sections
          .find((s) => s.id === "content-pillars")
          ?.content.split("\n")
          .filter((l) => l.trim().startsWith("-") || l.trim().match(/^\d/))
          .slice(0, 4)
          .map((l) => l.replace(/^[-\d.]+\s*/, "")) ?? [
          "Thought leadership & authority",
          "Lead magnets & conversion content",
          "Social proof & case studies",
          "Educational how-to content",
        ],
        channels: ["LinkedIn", "Blog/SEO", "Email nurture", "Retargeting"],
        kpis: isLeads
          ? ["MQLs per month", "Demo requests", "Content-attributed pipeline", "LinkedIn engagement rate"]
          : ["Organic traffic", "Engagement rate", "Email list growth", "Brand search volume"],
      };
      return {
        output,
        preview: strategySection?.content.slice(0, 180) ?? enhanced.executiveSummary.slice(0, 180),
        live: Boolean(enhanced.live),
      };
    }

    case "content_plan": {
      const { text, live } = await generateText({
        system: SYSTEM_ROLES.strategist,
        user: employeeContentPlanPrompt(goal),
        maxTokens: 1200,
        brandContext: brandCtx,
        userId: opts.userId,
        feature: "employee_content_plan",
      });
      if (live && text) {
        try {
          const output = parseAIJson<ContentPlanOutput>(text);
          return {
            output,
            preview: `4-week plan: ${output.weeks.map((w) => w.theme).join(" → ")}`,
            live: true,
          };
        } catch {
          /* fall through */
        }
      }
      const { executeEmployeeStep } = await import("@/lib/marketing-employee");
      const mock = executeEmployeeStep(stepId, goal);
      return { ...mock, live: false };
    }

    case "blog_ideas": {
      const { text, live } = await generateText({
        system: SYSTEM_ROLES.seo,
        user: employeeBlogIdeasPrompt(goal, industry),
        maxTokens: 1200,
        brandContext: brandCtx,
        userId: opts.userId,
        feature: "employee_blog_ideas",
      });
      if (live && text) {
        try {
          const ideas = parseAIJson<BlogIdea[]>(text);
          return {
            output: ideas,
            preview: `${ideas.length} blog ideas — "${ideas[0]?.title}"`,
            live: true,
          };
        } catch {
          /* fall through */
        }
      }
      const { executeEmployeeStep } = await import("@/lib/marketing-employee");
      const mock = executeEmployeeStep(stepId, goal);
      return { ...mock, live: false };
    }

    case "linkedin_posts": {
      const audience = ctx.brand?.targetAudience || "founders and marketing leaders";
      const { text, live } = await generateText({
        system: SYSTEM_ROLES.linkedin,
        user: employeeLinkedInPostsPrompt(goal, audience),
        maxTokens: 2000,
        brandContext: brandCtx,
        userId: opts.userId,
        feature: "employee_linkedin",
      });
      if (live && text) {
        try {
          const posts = parseAIJson<LinkedInPostDraft[]>(text);
          return {
            output: posts,
            preview: posts[0]?.hook.slice(0, 120) ?? "3 LinkedIn posts ready",
            live: true,
          };
        } catch {
          /* fall through */
        }
      }
      const { executeEmployeeStep } = await import("@/lib/marketing-employee");
      const mock = executeEmployeeStep(stepId, goal);
      return { ...mock, live: false };
    }

    case "images": {
      const { text, live } = await generateText({
        system: SYSTEM_ROLES.copywriter,
        user: employeeImagePromptsPrompt(goal),
        maxTokens: 800,
        brandContext: brandCtx,
        userId: opts.userId,
        feature: "employee_images",
      });

      let prompts: { prompt: string; style: string }[] = [];
      if (live && text) {
        try {
          prompts = parseAIJson<{ prompt: string; style: string }[]>(text);
        } catch {
          /* fall through */
        }
      }

      if (prompts.length > 0) {
        const images: ImageAsset[] = [];
        for (const p of prompts.slice(0, 3)) {
          const styleId = (["modern-saas", "corporate", "minimal"] as ImageStyleId[]).includes(
            p.style as ImageStyleId
          )
            ? (p.style as ImageStyleId)
            : "modern-saas";
          const styleMeta = getStyleById(styleId);
          const fullPrompt = `${p.prompt}. Style: ${styleMeta.promptSuffix}`;
          const img = await generateImageFromPrompt(fullPrompt, "1024x1024", opts.userId);
          images.push({
            prompt: p.prompt,
            style: styleId,
            url:
              img.url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(p.prompt.slice(0, 2))}&background=7C3AED&color=fff&size=512&bold=true`,
          });
        }
        return {
          output: images,
          preview: `${images.length} image assets generated`,
          live: images.some((i) => !i.url.includes("ui-avatars")),
        };
      }

      const { executeEmployeeStep } = await import("@/lib/marketing-employee");
      const mock = executeEmployeeStep(stepId, goal);
      return { ...mock, live: false };
    }

    case "calendar": {
      const { text, live } = await generateText({
        system: SYSTEM_ROLES.strategist,
        user: employeeCalendarPrompt(goal, industry),
        maxTokens: 1500,
        brandContext: brandCtx,
        userId: opts.userId,
        feature: "employee_calendar",
      });
      if (live && text) {
        try {
          const items = parseAIJson<CalendarPlanItem[]>(text);
          return {
            output: items.slice(0, 14),
            preview: `14-day calendar starting ${items[0]?.date ?? "today"}`,
            live: true,
          };
        } catch {
          /* fall through */
        }
      }
      const items = generate30DayPlan({
        industry,
        goals: goal,
        platforms: ["linkedin", "wordpress", "newsletter"],
      }).slice(0, 14);
      return {
        output: items,
        preview: `14-day calendar starting ${items[0]?.date ?? "today"}`,
        live: false,
      };
    }

    default:
      throw new Error(`Unknown step: ${stepId}`);
  }
}

// ─── Legacy helpers (migrated from ai.ts) ────────────────────────────────────

export interface BlogRequest {
  topic: string;
  tone: string;
  length: string;
  keywords?: string;
  audience?: string;
  brand?: BrandKit;
  knowledgeContext?: string;
}

export async function generateBlog(req: BlogRequest, userId?: string): Promise<string> {
  const ctx = await ctxOrBuild(userId);
  const brandCtx = [formatBrandContext(ctx), req.knowledgeContext].filter(Boolean).join("\n\n");

  const prompt = `Write a ${req.length} SEO-optimized blog post about "${req.topic}".
Tone: ${req.tone}
${req.audience ? `Target audience: ${req.audience}` : ""}
${req.keywords ? `Include keywords: ${req.keywords}` : ""}
Use SEO-friendly H1, H2, H3 headings. Include intro, body sections, and CTA conclusion.`;

  const { text, live } = await generateText({
    system: SYSTEM_ROLES.seo,
    user: prompt,
    maxTokens: 2500,
    brandContext: brandCtx,
    userId,
    feature: "blog",
  });

  if (live && text) return text;

  const { generateBlog: legacyBlog } = await import("@/lib/ai-legacy");
  return legacyBlog(req);
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

export async function generateSocialPosts(req: SocialRequest, userId?: string): Promise<string> {
  const ctx = await ctxOrBuild(userId);
  const brandCtx = formatBrandContext(ctx);
  const count = req.count ?? 3;

  const prompt = `Create ${count} ${req.platform} posts about "${req.topic}". Tone: ${req.tone}.
${req.hashtags ? "Include hashtag suggestions." : ""}
${req.cta ? "Include CTA suggestions for each post." : ""}
Format each post clearly numbered with --- between posts.`;

  const { text, live } = await generateText({
    system: SYSTEM_ROLES.copywriter,
    user: prompt,
    maxTokens: 1500,
    brandContext: brandCtx,
    userId,
    feature: "social",
  });

  if (live && text) return text;

  const { generateSocialPosts: legacy } = await import("@/lib/ai-legacy");
  return legacy(req);
}

export interface LinkedInCarouselRequest {
  topic: string;
  slides: number;
  brand?: BrandKit;
}

export async function generateLinkedInCarousel(
  req: LinkedInCarouselRequest,
  userId?: string
): Promise<string> {
  const ctx = await ctxOrBuild(userId);
  const brandCtx = formatBrandContext(ctx);

  const prompt = `Create a ${req.slides}-slide LinkedIn carousel about "${req.topic}".
For each slide: Slide number, headline (max 8 words), body (max 30 words). End with a CTA slide.`;

  const { text, live } = await generateText({
    system: SYSTEM_ROLES.carousel,
    user: prompt,
    maxTokens: 1500,
    brandContext: brandCtx,
    userId,
    feature: "linkedin_carousel",
  });

  if (live && text) return text;

  const { generateLinkedInCarousel: legacy } = await import("@/lib/ai-legacy");
  return legacy(req);
}

export async function generateCommentSuggestions(
  post: string,
  brand?: BrandKit,
  userId?: string
): Promise<string> {
  const ctx = await ctxOrBuild(userId);
  const brandCtx = formatBrandContext({ ...ctx, brand: brand ?? ctx.brand });

  const { text, live } = await generateText({
    system: SYSTEM_ROLES.linkedin,
    user: `Suggest 5 thoughtful LinkedIn comments for this post. Vary tone: supportive, insightful, question-based.\n\nPost:\n${post}`,
    maxTokens: 800,
    brandContext: brandCtx,
    userId,
    feature: "linkedin_comments",
  });

  if (live && text) return text;

  const { generateCommentSuggestions: legacy } = await import("@/lib/ai-legacy");
  return legacy(post, brand);
}

export async function generateViralIdeas(
  niche: string,
  brand?: BrandKit,
  userId?: string
): Promise<string> {
  const ctx = await ctxOrBuild(userId);
  const brandCtx = formatBrandContext({ ...ctx, brand: brand ?? ctx.brand });

  const { text, live } = await generateText({
    system: SYSTEM_ROLES.linkedin,
    user: `Generate 10 viral LinkedIn post ideas for the ${niche} niche. Include hook, format, and why it works.`,
    maxTokens: 1200,
    brandContext: brandCtx,
    userId,
    feature: "linkedin_viral",
  });

  if (live && text) return text;

  const { generateViralIdeas: legacy } = await import("@/lib/ai-legacy");
  return legacy(niche, brand);
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

export async function optimizeSEO(req: SEORequest, userId?: string): Promise<SEOResult> {
  const ctx = await ctxOrBuild(userId);
  const brandCtx = formatBrandContext({ ...ctx, brand: req.brand ?? ctx.brand });

  if (hasAnyAIProvider()) {
    try {
      const { text } = await generateText({
        system: "SEO expert. Return ONLY valid JSON: score, title, metaDescription, suggestions[], keywords[], readability",
        user: `Optimize for "${req.targetKeyword}":\n${req.content.slice(0, 3000)}`,
        maxTokens: 1000,
        brandContext: brandCtx,
        userId,
        feature: "seo_optimize",
      });
      if (text) return parseAIJson<SEOResult>(text);
    } catch {
      /* demo */
    }
  }

  const { optimizeSEO: legacy } = await import("@/lib/ai-legacy");
  return legacy(req);
}

export async function researchKeywords(
  topic: string,
  brand?: BrandKit,
  userId?: string
): Promise<{ keyword: string; volume: string; difficulty: string }[]> {
  const ctx = await ctxOrBuild(userId);
  const brandCtx = formatBrandContext({ ...ctx, brand: brand ?? ctx.brand });

  if (hasAnyAIProvider()) {
    try {
      const { text } = await generateText({
        system: "SEO keyword researcher. Return JSON array: [{keyword, volume, difficulty}]",
        user: `List 15 SEO keywords for "${topic}" targeting ${brand?.targetAudience || "business audience"}.`,
        maxTokens: 1000,
        brandContext: brandCtx,
        userId,
        feature: "keyword_research",
      });
      if (text) return parseAIJson(text);
    } catch {
      /* demo */
    }
  }

  const { researchKeywords: legacy } = await import("@/lib/ai-legacy");
  return legacy(topic, brand);
}

export async function analyzeCompetitor(
  url: string,
  brand?: BrandKit,
  userId?: string
): Promise<{ gaps: string[]; topics: string[]; strengths: string[] }> {
  const ctx = await ctxOrBuild(userId);
  const brandCtx = formatBrandContext({ ...ctx, brand: brand ?? ctx.brand });

  if (hasAnyAIProvider()) {
    try {
      const { text } = await generateText({
        system: "Competitive content analyst. Return JSON: {gaps[], topics[], strengths[]}",
        user: `Analyze competitor website ${url} for content gaps.`,
        maxTokens: 1000,
        brandContext: brandCtx,
        userId,
        feature: "competitor_analysis",
      });
      if (text) return parseAIJson(text);
    } catch {
      /* demo */
    }
  }

  const { analyzeCompetitor: legacy } = await import("@/lib/ai-legacy");
  return legacy(url, brand);
}

export async function suggestTopics(brand?: BrandKit, count = 10, userId?: string): Promise<string[]> {
  const ctx = await ctxOrBuild(userId);
  const brandCtx = formatBrandContext({ ...ctx, brand: brand ?? ctx.brand });

  if (hasAnyAIProvider()) {
    try {
      const { text } = await generateText({
        system: "Content strategist. Return JSON array of topic strings.",
        user: `Suggest ${count} content topics for ${brand?.companyName || "a business"}.`,
        maxTokens: 800,
        brandContext: brandCtx,
        userId,
        feature: "topic_suggestions",
      });
      if (text) return parseAIJson<string[]>(text);
    } catch {
      /* demo */
    }
  }

  const { suggestTopics: legacy } = await import("@/lib/ai-legacy");
  return legacy(brand, count);
}

const STYLE_DEMO_URLS: Record<ImageStyleId, string> = {
  corporate: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
  minimal: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024&q=80",
  "3d": "https://images.unsplash.com/photo-1626785774573-4b799315346d?w=1024&q=80",
  illustration: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1024&q=80",
  "modern-saas": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
  "social-media": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1024&q=80",
};

export interface ImageRequest {
  prompt: string;
  style: string;
  styleId?: ImageStyleId;
  size: string;
  aspectRatio?: string;
  useCase?: string;
}

export async function generateImage(
  req: ImageRequest,
  userId?: string
): Promise<{ url: string; prompt: string; live: boolean }> {
  const styleMeta = req.styleId ? getStyleById(req.styleId) : null;
  const fullPrompt = styleMeta
    ? `${req.prompt}. Style: ${styleMeta.promptSuffix}`
    : `${req.useCase || "marketing"} image, ${req.style} style: ${req.prompt}`;

  const result = await generateImageFromPrompt(fullPrompt, req.size, userId);
  if (result.live && result.url) return { url: result.url, prompt: req.prompt, live: true };

  const styleId = req.styleId ?? "modern-saas";
  return { url: STYLE_DEMO_URLS[styleId], prompt: req.prompt, live: false };
}

export async function generateDemoContent(
  prompt: string,
  type: string,
  userId?: string
): Promise<{ content: string; live: boolean }> {
  const DEMO_TYPE_INSTRUCTIONS: Record<string, string> = {
    linkedin: "Write a LinkedIn post with hooks, short paragraphs, and hashtags.",
    blog: "Write a blog introduction (2-3 paragraphs) with a strong hook.",
    instagram: "Write an Instagram caption with emojis and hashtags.",
    seo: "Write an SEO meta title (under 60 chars) and meta description (under 160 chars).",
    email: "Write an email subject line, preview text, and short body.",
  };

  const instruction = DEMO_TYPE_INSTRUCTIONS[type] ?? DEMO_TYPE_INSTRUCTIONS.linkedin;
  const ctx = await ctxOrBuild(userId);
  const brandCtx = formatBrandContext(ctx);

  const { text, live } = await generateText({
    system: `You are InkFit AI, an expert content writer. ${instruction} Output only the content.`,
    user: prompt.trim(),
    maxTokens: 800,
    brandContext: brandCtx,
    userId,
    feature: "demo_content",
  });

  if (live && text) return { content: text.trim(), live: true };
  return { content: "", live: false };
}

export function getDemoCalendarEvents(): import("@/lib/types").CalendarEvent[] {
  const today = new Date();
  return [
    { id: "1", title: "LinkedIn Growth Playbook", type: "linkedin", date: format(addDays(today, 1), "yyyy-MM-dd"), status: "scheduled", platform: "LinkedIn" },
    { id: "2", title: "Q2 Product Launch Blog", type: "blog", date: format(addDays(today, 2), "yyyy-MM-dd"), status: "draft" },
    { id: "3", title: "Carousel: 5 Content Tips", type: "carousel", date: format(addDays(today, 3), "yyyy-MM-dd"), status: "scheduled", platform: "LinkedIn" },
    { id: "4", title: "Instagram Campaign Visual", type: "image", date: format(today, "yyyy-MM-dd"), status: "published", platform: "Instagram" },
    { id: "5", title: "SEO Landing Page Refresh", type: "seo", date: format(addDays(today, 5), "yyyy-MM-dd"), status: "scheduled" },
  ];
}
