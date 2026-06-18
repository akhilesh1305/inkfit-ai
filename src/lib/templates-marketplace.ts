export type TemplateCategory = "linkedin" | "seo" | "blog" | "email" | "carousel";

export interface TemplateCategoryMeta {
  id: TemplateCategory;
  label: string;
  description: string;
  gradient: string;
  icon: string;
  route: string;
}

export interface MarketplaceTemplate {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  preview: string;
  body: string;
  tags: string[];
  gradient: string;
  baseUseCount: number;
  trending: boolean;
  author: string;
}

export interface TemplateWithMeta extends MarketplaceTemplate {
  useCount: number;
  favorite: boolean;
}

export const TEMPLATE_CATEGORIES: TemplateCategoryMeta[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    description: "Posts, hooks & thought leadership",
    gradient: "from-[#0A66C2] to-[#004182]",
    icon: "in",
    route: "/dashboard/linkedin",
  },
  {
    id: "seo",
    label: "SEO",
    description: "Meta, articles & landing pages",
    gradient: "from-emerald-600 to-teal-700",
    icon: "⌕",
    route: "/dashboard/seo",
  },
  {
    id: "blog",
    label: "Blog",
    description: "Long-form articles & guides",
    gradient: "from-violet-600 to-indigo-800",
    icon: "✎",
    route: "/dashboard/blog",
  },
  {
    id: "email",
    label: "Email",
    description: "Campaigns & nurture sequences",
    gradient: "from-amber-500 to-orange-600",
    icon: "✉",
    route: "/dashboard/social",
  },
  {
    id: "carousel",
    label: "Carousel",
    description: "Slide decks & swipe posts",
    gradient: "from-pink-600 to-fuchsia-700",
    icon: "▤",
    route: "/dashboard/carousel",
  },
];

export const MARKETPLACE_TEMPLATES: MarketplaceTemplate[] = [
  {
    id: "li-story-lesson",
    title: "Story → Lesson Post",
    description: "Personal narrative with a clear takeaway for LinkedIn",
    category: "linkedin",
    preview: "I almost quit [topic]. Then one conversation changed everything…",
    body: `I almost gave up on [TOPIC].

Three years in, I was burned out. Publishing felt like shouting into the void.

Then a mentor asked me one question:
"What would you teach your past self?"

That reframed everything.

Here's what I'd tell anyone starting today:
→ Focus on one audience, not everyone
→ Ship weekly, not when it's perfect
→ Engage before you publish

[TOPIC] isn't a talent — it's a system.

What's one lesson [TOPIC] taught you?`,
    tags: ["story", "engagement", "founder"],
    gradient: "from-[#0A66C2] to-cyan-700",
    baseUseCount: 2840,
    trending: true,
    author: "InkFit",
  },
  {
    id: "li-hot-take",
    title: "Contrarian Hot Take",
    description: "Bold opinion post that sparks discussion",
    category: "linkedin",
    preview: "Unpopular opinion: [common belief] is hurting your growth.",
    body: `Unpopular opinion:

[COMMON BELIEF] is hurting more careers than helping.

Everyone in [INDUSTRY] is copying the same playbook:
• Generic advice
• Safe takes
• Zero point of view

The creators winning in 2026 do the opposite:
→ Specific niche narratives
→ Evidence-backed claims
→ Consistency over virality

If your post about [TOPIC] could be written by anyone, it won't build authority.

Agree or disagree?`,
    tags: ["thought-leadership", "viral"],
    gradient: "from-zinc-700 to-black",
    baseUseCount: 1920,
    trending: true,
    author: "InkFit",
  },
  {
    id: "li-listicle",
    title: "5-Step Framework",
    description: "Numbered actionable framework for professionals",
    category: "linkedin",
    preview: "5 steps to [outcome] (that actually work in 2026)",
    body: `5 steps to [OUTCOME] (that actually work in 2026):

1. **Define the outcome** — What does success look like in 90 days?
2. **Audit what you ship** — Kill 50% of low-impact content
3. **Build one repeatable workflow** — AI drafts, human voice
4. **Measure depth, not vanity** — Comments > impressions
5. **Repurpose everything** — 1 pillar → 8 derivatives

Most teams fail at step 2.

Save this for your next [TOPIC] sprint.`,
    tags: ["educational", "framework"],
    gradient: "from-brand-600 to-violet-700",
    baseUseCount: 3100,
    trending: false,
    author: "InkFit",
  },
  {
    id: "li-launch",
    title: "Product Launch Announcement",
    description: "Ship announcement with social proof hooks",
    category: "linkedin",
    preview: "We just launched [product]. Here's why we built it.",
    body: `We just launched [PRODUCT].

After [X] months talking to [AUDIENCE], one problem kept coming up:
[PAIN POINT]

So we built [PRODUCT] to help you:
✅ [Benefit 1]
✅ [Benefit 2]
✅ [Benefit 3]

Early users are seeing [RESULT].

Try it free → [LINK]

What feature would you want next?`,
    tags: ["launch", "saas"],
    gradient: "from-cyan-600 to-blue-800",
    baseUseCount: 1560,
    trending: true,
    author: "InkFit",
  },
  {
    id: "seo-pillar",
    title: "SEO Pillar Article",
    description: "Long-form guide optimized for search intent",
    category: "seo",
    preview: "Complete guide to [keyword] for [audience]",
    body: `# The Complete Guide to [KEYWORD] (2026)

[KEYWORD] is evolving fast. This guide covers everything [AUDIENCE] needs to rank, convert, and scale.

## What is [KEYWORD]?
[2-3 sentence definition with target keyword in first 100 words.]

## Why [KEYWORD] matters now
- Trend 1
- Trend 2
- Trend 3

## How to implement [KEYWORD]
### Step 1: Research intent
### Step 2: Structure your content
### Step 3: Optimize on-page elements

## FAQ
**Q: How long should a [KEYWORD] article be?**
A: Aim for 1,500+ words with clear H2/H3 structure.

## Conclusion
Start with one pillar page, then build cluster content around [KEYWORD].`,
    tags: ["pillar", "long-form"],
    gradient: "from-emerald-600 to-teal-700",
    baseUseCount: 4200,
    trending: true,
    author: "InkFit",
  },
  {
    id: "seo-meta",
    title: "Meta Title & Description",
    description: "Search snippet pack for any landing page",
    category: "seo",
    preview: "Title (60 chars) + meta description (155 chars) + keywords",
    body: `SEO TITLE (max 60 chars):
[KEYWORD]: Expert Guide for [AUDIENCE] | [BRAND]

META DESCRIPTION (max 155 chars):
Learn proven [KEYWORD] strategies for [AUDIENCE]. Actionable tips, examples, and a free checklist. Updated for 2026.

PRIMARY KEYWORD: [keyword]
SECONDARY KEYWORDS:
- [keyword] tips
- best [keyword] strategy
- [keyword] for beginners
- how to [keyword]

URL SLUG: /[keyword-slug]`,
    tags: ["meta", "quick-win"],
    gradient: "from-green-600 to-emerald-800",
    baseUseCount: 3680,
    trending: false,
    author: "InkFit",
  },
  {
    id: "seo-landing",
    title: "Landing Page Copy",
    description: "Conversion-focused SEO landing page structure",
    category: "seo",
    preview: "Hero → benefits → social proof → CTA",
    body: `# [KEYWORD] for [AUDIENCE]

## Hero
**Headline:** Ship [OUTCOME] 10x faster with [PRODUCT]
**Subhead:** The [KEYWORD] platform built for [AUDIENCE] who need results, not more tools.

## Benefits
- **Benefit 1:** [Specific outcome]
- **Benefit 2:** [Specific outcome]
- **Benefit 3:** [Specific outcome]

## Social Proof
"Since using [PRODUCT], we [METRIC]." — [Customer], [Role]

## CTA
Start free → No credit card required`,
    tags: ["landing-page", "conversion"],
    gradient: "from-teal-600 to-cyan-800",
    baseUseCount: 2100,
    trending: true,
    author: "InkFit",
  },
  {
    id: "blog-howto",
    title: "How-To Tutorial",
    description: "Step-by-step blog with intro, steps, and conclusion",
    category: "blog",
    preview: "How to [achieve outcome] in [timeframe]",
    body: `# How to [ACHIEVE OUTCOME] in [TIMEFRAME]

Most guides on [TOPIC] are too vague. This one isn't.

By the end, you'll know exactly how to [OUTCOME] — even if you're starting from zero.

## What you'll need
- Prerequisite 1
- Prerequisite 2

## Step 1: [First action]
[Detailed explanation with examples.]

## Step 2: [Second action]
[Detailed explanation with examples.]

## Step 3: [Third action]
[Detailed explanation with examples.]

## Common mistakes to avoid
1. Mistake one
2. Mistake two

## Wrapping up
[Summary + soft CTA to related resource]`,
    tags: ["tutorial", "evergreen"],
    gradient: "from-violet-600 to-purple-800",
    baseUseCount: 2750,
    trending: false,
    author: "InkFit",
  },
  {
    id: "blog-listicle",
    title: "Listicle Article",
    description: "10 tips / tools / trends list format",
    category: "blog",
    preview: "10 [things] every [audience] should know in 2026",
    body: `# 10 [THINGS] Every [AUDIENCE] Should Know in 2026

The [INDUSTRY] landscape shifted again. Here are the trends worth your attention.

## 1. [Item one]
[2-3 sentences]

## 2. [Item two]
[2-3 sentences]

## 3. [Item three]
[2-3 sentences]

[Continue through 10...]

## Final thoughts
Pick one item. Execute this week. Momentum beats perfection.`,
    tags: ["listicle", "trends"],
    gradient: "from-indigo-600 to-violet-800",
    baseUseCount: 1890,
    trending: true,
    author: "InkFit",
  },
  {
    id: "blog-case-study",
    title: "Case Study",
    description: "Problem → solution → results narrative",
    category: "blog",
    preview: "How [company] achieved [result] with [approach]",
    body: `# Case Study: How [COMPANY] Achieved [RESULT]

## The Challenge
[COMPANY] struggled with [PROBLEM]. Despite [CONTEXT], results plateaued.

## The Approach
We implemented a [STRATEGY] focused on:
1. [Tactic A]
2. [Tactic B]
3. [Tactic C]

## The Results
- **[Metric 1]:** +X%
- **[Metric 2]:** +Y%
- **[Metric 3]:** Z improvement

## Key Takeaways
→ Takeaway 1
→ Takeaway 2
→ Takeaway 3

Want similar results? [CTA]`,
    tags: ["case-study", "b2b"],
    gradient: "from-blue-600 to-indigo-800",
    baseUseCount: 1340,
    trending: false,
    author: "InkFit",
  },
  {
    id: "email-welcome",
    title: "Welcome Sequence",
    description: "Onboarding email for new subscribers",
    category: "email",
    preview: "Subject: Welcome to [brand] — here's your first win",
    body: `Subject: Welcome to [BRAND] — here's your first win

Preview text: Your [RESOURCE] is inside + what to expect this week.

---

Hi [NAME],

Welcome to [BRAND]. You're in the right place if you want to [OUTCOME].

Here's what to do first:
1. [Action 1] → [Link]
2. [Action 2] → [Link]
3. Reply and tell me your #1 [TOPIC] challenge

This week you'll get:
• [Email 1 topic]
• [Email 2 topic]
• [Email 3 topic]

Talk soon,
[SIGNATURE]`,
    tags: ["onboarding", "nurture"],
    gradient: "from-amber-500 to-orange-600",
    baseUseCount: 2450,
    trending: true,
    author: "InkFit",
  },
  {
    id: "email-launch",
    title: "Product Launch Email",
    description: "Announcement email with urgency and benefits",
    category: "email",
    preview: "Subject: [Product] is live 🚀",
    body: `Subject: [PRODUCT] is live — built for [AUDIENCE]

Preview text: See what's new and claim your launch bonus.

---

Hi [NAME],

It's here.

After months of building with beta users, [PRODUCT] is officially live.

What you get today:
✨ [Feature 1]
✨ [Feature 2]
✨ [Feature 3]

**Launch offer:** [DISCOUNT/BONUS] until [DATE].

→ Get started: [CTA LINK]

Questions? Just hit reply.

— [TEAM]`,
    tags: ["launch", "promo"],
    gradient: "from-orange-500 to-red-600",
    baseUseCount: 1780,
    trending: false,
    author: "InkFit",
  },
  {
    id: "email-newsletter",
    title: "Weekly Newsletter",
    description: "Curated weekly digest format",
    category: "email",
    preview: "Subject: This week in [niche] — [hook]",
    body: `Subject: This week in [NICHE] — [HOOK]

---

# [NEWSLETTER NAME] · Issue [#]

Hey [NAME],

Quick hits before the weekend:

## 🔥 Top story
[2-3 sentences + link]

## 📚 Worth reading
• [Article 1]
• [Article 2]

## 💡 One idea to try
[Actionable tip in 2-3 sentences]

## From the community
"[Quote or win from a reader]"

See you next week,
[SIGNATURE]`,
    tags: ["newsletter", "weekly"],
    gradient: "from-yellow-500 to-amber-600",
    baseUseCount: 2210,
    trending: true,
    author: "InkFit",
  },
  {
    id: "carousel-framework",
    title: "5-Slide Framework",
    description: "Educational carousel with hook and CTA slide",
    category: "carousel",
    preview: "Slide 1: Hook → Slides 2-4: Value → Slide 5: CTA",
    body: `SLIDE 1 — HOOK
[Bold statement about TOPIC]
(Swipe →)

SLIDE 2
The problem:
[1-2 lines describing pain point]

SLIDE 3
The framework:
Step 1: [Action]
Step 2: [Action]
Step 3: [Action]

SLIDE 4
Pro tip:
[One non-obvious insight]

SLIDE 5 — CTA
Save this for later ♻️
Follow @[HANDLE] for more [TOPIC]`,
    tags: ["framework", "educational"],
    gradient: "from-pink-600 to-rose-700",
    baseUseCount: 3520,
    trending: true,
    author: "InkFit",
  },
  {
    id: "carousel-before-after",
    title: "Before / After",
    description: "Transformation carousel for social proof",
    category: "carousel",
    preview: "Before: [pain] → After: [result]",
    body: `SLIDE 1
Before vs After:
[TOPIC] edition

SLIDE 2 — BEFORE
❌ [Pain 1]
❌ [Pain 2]
❌ [Pain 3]

SLIDE 3 — AFTER
✅ [Win 1]
✅ [Win 2]
✅ [Win 3]

SLIDE 4
How we got there:
→ [Step 1]
→ [Step 2]
→ [Step 3]

SLIDE 5
Want the full playbook?
Comment "[KEYWORD]" below 👇`,
    tags: ["transformation", "social-proof"],
    gradient: "from-fuchsia-600 to-purple-800",
    baseUseCount: 2890,
    trending: false,
    author: "InkFit",
  },
  {
    id: "carousel-myths",
    title: "Myths vs Facts",
    description: "Debunk common misconceptions",
    category: "carousel",
    preview: "5 myths about [topic] holding you back",
    body: `SLIDE 1
5 myths about [TOPIC]
(that are holding you back)

SLIDE 2
Myth: [Myth 1]
Fact: [Truth 1]

SLIDE 3
Myth: [Myth 2]
Fact: [Truth 2]

SLIDE 4
Myth: [Myth 3]
Fact: [Truth 3]

SLIDE 5
Which myth surprised you?
Follow for more [TOPIC] truths`,
    tags: ["myths", "viral"],
    gradient: "from-purple-600 to-pink-700",
    baseUseCount: 2650,
    trending: true,
    author: "InkFit",
  },
];

export function getCategoryMeta(id: TemplateCategory): TemplateCategoryMeta {
  return TEMPLATE_CATEGORIES.find((c) => c.id === id) ?? TEMPLATE_CATEGORIES[0];
}

export function getTemplateById(id: string): MarketplaceTemplate | undefined {
  return MARKETPLACE_TEMPLATES.find((t) => t.id === id);
}

export function categoryToWorkspaceType(
  category: TemplateCategory
): "blog" | "linkedin" | "seo" | "social" | "carousel" {
  const map: Record<TemplateCategory, "blog" | "linkedin" | "seo" | "social" | "carousel"> = {
    linkedin: "linkedin",
    seo: "seo",
    blog: "blog",
    email: "social",
    carousel: "carousel",
  };
  return map[category];
}

export function formatUseCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function mergeTemplateData(
  templates: MarketplaceTemplate[],
  useCounts: Record<string, number>,
  favoriteIds: Set<string>
): TemplateWithMeta[] {
  return templates.map((t) => ({
    ...t,
    useCount: useCounts[t.id] ?? t.baseUseCount,
    favorite: favoriteIds.has(t.id),
  }));
}

export function getTrending(templates: TemplateWithMeta[]): TemplateWithMeta[] {
  return [...templates]
    .filter((t) => t.trending)
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, 6);
}

export function getMostUsed(templates: TemplateWithMeta[]): TemplateWithMeta[] {
  return [...templates].sort((a, b) => b.useCount - a.useCount).slice(0, 6);
}
