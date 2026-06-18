export type BusinessType =
  | "b2b-saas"
  | "agency"
  | "ecommerce"
  | "local-business"
  | "personal-brand"
  | "professional-services";

export const BUSINESS_TYPES: { id: BusinessType; label: string }[] = [
  { id: "b2b-saas", label: "B2B SaaS" },
  { id: "agency", label: "Marketing Agency" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "local-business", label: "Local Business" },
  { id: "personal-brand", label: "Personal Brand" },
  { id: "professional-services", label: "Professional Services" },
];

export interface MarketingStrategyRequest {
  industry: string;
  businessType: BusinessType;
  targetAudience: string;
  goals: string;
  monthlyBudget: string;
}

export interface StrategySection {
  id: string;
  title: string;
  content: string;
}

export interface MarketingStrategyOutput {
  title: string;
  executiveSummary: string;
  sections: StrategySection[];
  generatedAt: string;
}

function budgetTier(budget: string): "lean" | "growth" | "scale" {
  const num = parseInt(budget.replace(/[^0-9]/g, ""), 10);
  if (num >= 10000) return "scale";
  if (num >= 3000) return "growth";
  return "lean";
}

export function generateMarketingStrategy(
  req: MarketingStrategyRequest
): MarketingStrategyOutput {
  const { industry, businessType, targetAudience, goals, monthlyBudget } = req;
  const tier = budgetTier(monthlyBudget);
  const bizLabel =
    BUSINESS_TYPES.find((b) => b.id === businessType)?.label ?? businessType;

  const channelSplit =
    tier === "scale"
      ? "40% paid acquisition, 30% content/SEO, 20% social, 10% partnerships"
      : tier === "growth"
        ? "35% content/SEO, 30% paid, 25% social, 10% email"
        : "50% organic content, 25% social, 15% email, 10% paid tests";

  const executiveSummary = `This strategic marketing plan is designed for a ${bizLabel} operating in ${industry}, targeting ${targetAudience}. With a monthly budget of ${monthlyBudget}, the focus is on ${goals}. The recommended approach balances quick-win channels with compounding assets (SEO, email, thought leadership) to build sustainable pipeline within 90 days.`;

  const sections: StrategySection[] = [
    {
      id: "marketing-plan",
      title: "Marketing Plan",
      content: `## 90-Day Marketing Roadmap

**Phase 1 (Days 1–30): Foundation**
- Define ICP and messaging pillars aligned to: ${goals}
- Launch core landing page with clear value proposition for ${targetAudience}
- Set up analytics (GA4, conversion events, UTM discipline)
- Publish 4 cornerstone content pieces in ${industry}

**Phase 2 (Days 31–60): Activation**
- Run first paid experiments ($${tier === "lean" ? "500–1,500" : tier === "growth" ? "2,000–5,000" : "8,000–15,000"}/mo allocation)
- Launch email nurture sequence (5–7 emails)
- Begin weekly LinkedIn thought leadership cadence
- Partner outreach: 3–5 micro-influencers or complementary brands

**Phase 3 (Days 61–90): Scale**
- Double down on top 2 performing channels
- Introduce retargeting and lookalike audiences
- Launch case study or social proof campaign
- Review KPIs and reallocate ${monthlyBudget} budget

**Budget Allocation:** ${channelSplit}

**Primary KPIs:** MQLs, cost per lead, content engagement rate, organic traffic growth, conversion rate from ${targetAudience}.`,
    },
    {
      id: "content-strategy",
      title: "Content Strategy",
      content: `## Content Pillars for ${industry}

**Pillar 1 — Education**
How-to guides, frameworks, and tutorials that help ${targetAudience} solve immediate problems.

**Pillar 2 — Authority**
Original insights, trend analysis, and POV content positioning your ${bizLabel} as the expert.

**Pillar 3 — Proof**
Case studies, testimonials, before/after results, and data-backed wins.

**Pillar 4 — Community**
Behind-the-scenes, founder stories, and audience engagement prompts.

**Publishing Cadence**
| Channel | Frequency | Format |
|---------|-----------|--------|
| Blog/SEO | 2× per week | 1,200–2,000 word guides |
| LinkedIn | 4× per week | Posts + 1 carousel |
| Email | 1× per week | Newsletter + nurture |
| Video/Reels | 2× per week | Short tips, demos |

**Content Themes (Q1)**
1. "${industry} trends your audience can't ignore"
2. "Mistakes ${targetAudience} make — and how to fix them"
3. "Playbook: ${goals} in 90 days"
4. Customer success stories and ROI breakdowns`,
    },
    {
      id: "funnel-strategy",
      title: "Funnel Strategy",
      content: `## Full-Funnel Architecture

**TOFU — Awareness**
- SEO blog content targeting "${industry}" + problem-aware keywords
- LinkedIn organic reach to ${targetAudience}
- Paid: broad interest + job title targeting on LinkedIn/Meta
- Lead magnet: "${industry} Strategy Checklist" or free audit

**MOFU — Consideration**
- Email nurture: 7-day educational sequence
- Retargeting ads to site visitors and content engagers
- Webinar or live workshop: "How to achieve ${goals}"
- Comparison content vs. alternatives in ${industry}

**BOFU — Conversion**
- Dedicated landing pages per segment of ${targetAudience}
- Case studies with quantified results
- Free trial / demo / consultation CTA
- Sales-enablement one-pagers for ${bizLabel} offers

**Funnel Metrics to Track**
- Visitor → Lead: target 2–4%
- Lead → MQL: target 25–35%
- MQL → Customer: benchmark against ${industry} norms
- Average deal cycle and CAC payback period`,
    },
    {
      id: "social-media-plan",
      title: "Social Media Plan",
      content: `## Platform Strategy

**LinkedIn (Primary for ${bizLabel})**
- Audience: ${targetAudience}
- Content: thought leadership, carousels, short video, polls
- Posting: Mon–Thu, 8–10 AM local time
- Goal: inbound DMs, profile visits, newsletter signups

**Instagram (Secondary)**
- Visual brand storytelling, reels, carousel tips
- 3 posts + 2 reels per week
- Link in bio → lead magnet or landing page

**X / Twitter (Optional)**
- Real-time commentary on ${industry} news
- Thread repurposing from blog content
- 3–5 posts per week

**Content Mix (Monthly)**
- 40% educational
- 25% social proof
- 20% engagement (questions, polls)
- 15% promotional (soft CTAs)

**Community Playbook**
- Reply to every comment in first 60 minutes
- Engage 15 accounts daily in your ICP
- Collaborate with 2 creators per month
- Monthly LinkedIn Live or AMA session`,
    },
    {
      id: "seo-plan",
      title: "SEO Plan",
      content: `## SEO Roadmap for ${industry}

**Keyword Strategy**
- Tier 1 (Pillar): "${industry} guide", "${goals}", "best ${industry} strategies"
- Tier 2 (Cluster): 15–20 supporting articles linking to pillars
- Tier 3 (Long-tail): FAQ and comparison keywords for ${targetAudience}

**Technical SEO**
- Core Web Vitals optimization
- Schema markup (FAQ, Article, Organization)
- Internal linking hub-and-spoke model
- Mobile-first page speed under 2.5s LCP

**Content SEO (90 Days)**
- Month 1: 4 pillar pages + keyword research doc
- Month 2: 8 cluster articles + internal link audit
- Month 3: 6 comparison/alternative pages + backlink outreach

**Link Building**
- Guest posts on ${industry} publications
- Digital PR around original data or surveys
- Partner co-marketing with complementary tools
- HARO / journalist outreach (2 pitches/week)

**Targets**
- +40% organic traffic in 90 days
- 5 keywords in top 10 for ${industry} terms
- Featured snippet capture for 2–3 FAQ queries`,
    },
    {
      id: "lead-generation",
      title: "Lead Generation Ideas",
      content: `## Lead Gen Playbook

**High-Intent Offers**
1. Free "${industry} ROI Calculator" interactive tool
2. "${goals}" strategy template (Notion/PDF)
3. 15-minute audit for ${targetAudience}
4. Exclusive industry benchmark report

**Outbound + Inbound Hybrid**
- LinkedIn connection campaigns to ${targetAudience} (50/week)
- Personalized video messages for dream accounts
- Comment-to-DM strategy on viral ${industry} posts
- Referral incentive: 20% discount for introductions

**Paid Lead Gen**
- LinkedIn Lead Gen Forms ($${tier === "lean" ? "20–40" : tier === "growth" ? "40–80" : "60–120"} target CPL)
- Google Search on high-intent "${industry}" keywords
- Retargeting sequences for abandoned signups

**Partnership Channels**
- Co-hosted webinars with non-competing brands
- Affiliate program for ${targetAudience} communities
- Integration marketplace listings (if B2B SaaS)

**Quick Wins (Week 1)**
- Optimize existing landing page headline for ${goals}
- Add exit-intent popup with lead magnet
- Launch "founder's LinkedIn" posting sprint
- Email past contacts with new ${industry} offer

**Budget Fit (${monthlyBudget})**
Focus on 2 channels max in month one. Measure CPL and double spend only on channels below target CAC.`,
    },
  ];

  return {
    title: `${industry} Marketing Strategy — ${bizLabel}`,
    executiveSummary,
    sections,
    generatedAt: new Date().toISOString(),
  };
}

export function formatStrategyForExport(output: MarketingStrategyOutput): string {
  const body = output.sections
    .map((s) => `## ${s.title}\n\n${s.content}`)
    .join("\n\n---\n\n");

  return `# ${output.title}

**Prepared for:** Strategic Marketing Engagement
**Date:** ${new Date(output.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

## Executive Summary

${output.executiveSummary}

---

${body}`;
}
