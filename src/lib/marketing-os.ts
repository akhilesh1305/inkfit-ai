export interface MarketingOSSection {
  id: string;
  title: string;
  content: string;
}

export interface MarketingOSOutput {
  id?: string;
  title: string;
  goal: string;
  executiveSummary: string;
  sections: MarketingOSSection[];
  generatedAt: string;
  live?: boolean;
}

export interface MarketingOSSectionMeta {
  id: string;
  title: string;
  subtitle: string;
  gradient: string;
}

export const SECTION_META: MarketingOSSectionMeta[] = [
  {
    id: "marketing-strategy",
    title: "Marketing Strategy",
    subtitle: "Positioning, channels & 90-day roadmap",
    gradient: "from-brand-600 to-violet-700",
  },
  {
    id: "content-strategy",
    title: "Content Strategy",
    subtitle: "Themes, formats & distribution",
    gradient: "from-cyan-600 to-blue-700",
  },
  {
    id: "content-pillars",
    title: "Content Pillars",
    subtitle: "Core narratives to own",
    gradient: "from-emerald-600 to-teal-700",
  },
  {
    id: "audience-personas",
    title: "Audience Personas",
    subtitle: "ICP profiles & messaging angles",
    gradient: "from-pink-600 to-rose-700",
  },
  {
    id: "funnel-strategy",
    title: "Funnel Strategy",
    subtitle: "TOFU → MOFU → BOFU architecture",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "seo-plan",
    title: "SEO Plan",
    subtitle: "Keywords, clusters & technical SEO",
    gradient: "from-green-600 to-emerald-800",
  },
  {
    id: "linkedin-strategy",
    title: "LinkedIn Strategy",
    subtitle: "Thought leadership & inbound pipeline",
    gradient: "from-[#0A66C2] to-blue-900",
  },
  {
    id: "blog-strategy",
    title: "Blog Strategy",
    subtitle: "Pillar content & editorial calendar",
    gradient: "from-indigo-600 to-violet-800",
  },
  {
    id: "content-calendar",
    title: "30-Day Content Calendar",
    subtitle: "Day-by-day publishing plan",
    gradient: "from-fuchsia-600 to-purple-800",
  },
  {
    id: "weekly-action-plan",
    title: "Weekly Action Plan",
    subtitle: "Execution checklist by week",
    gradient: "from-zinc-500 to-zinc-800",
  },
];

export const GOAL_SUGGESTIONS = [
  "I want to grow my SaaS startup and generate more leads.",
  "Build thought leadership for my consulting firm on LinkedIn.",
  "Launch a new product and drive 500 signups in 90 days.",
  "Scale organic traffic for my B2B marketing agency.",
];

function inferContext(goal: string) {
  const g = goal.toLowerCase();
  const isSaaS = /saas|software|startup|app|platform/.test(g);
  const isAgency = /agency|client|consulting/.test(g);
  const isLeads = /lead|pipeline|mql|demo|signup/.test(g);
  const isBrand = /brand|thought leadership|authority/.test(g);
  const industry = isSaaS ? "B2B SaaS" : isAgency ? "Marketing Agency" : "Growth Business";
  const audience = isSaaS
    ? "founders, marketing leaders, and ops teams at SMBs"
    : isAgency
      ? "marketing directors and business owners"
      : "decision-makers in your target market";
  const focus = isLeads
    ? "lead generation and pipeline growth"
    : isBrand
      ? "brand authority and audience trust"
      : "sustainable revenue growth";
  return { industry, audience, focus, isSaaS, isAgency, isLeads };
}

function buildCalendar(): string {
  const themes = [
    "Launch story + problem hook",
    "Educational carousel",
    "Customer proof / case study",
    "Contrarian industry take",
    "How-to thread",
    "Behind the scenes",
    "Data point / trend",
    "Tool stack / resources",
    "Founder lesson",
    "Community question",
  ];
  const lines = ["## 30-Day Publishing Calendar", "", "| Day | Channel | Topic | Format |", "|-----|---------|-------|--------|"];
  for (let d = 1; d <= 30; d++) {
    const theme = themes[(d - 1) % themes.length];
    const channel = d % 3 === 0 ? "Blog" : d % 2 === 0 ? "LinkedIn" : "LinkedIn + Email";
    const format = d % 5 === 0 ? "Carousel" : d % 4 === 0 ? "Long post" : "Short post";
    lines.push(`| ${d} | ${channel} | ${theme} | ${format} |`);
  }
  lines.push("", "**Weekend slots:** Repurpose top performer into newsletter + short-form video.");
  return lines.join("\n");
}

function buildWeeklyPlan(): string {
  return `## Weekly Action Plan

### Week 1 — Foundation
- Finalize ICP and messaging doc
- Audit website conversion paths
- Publish 2 LinkedIn posts + 1 blog pillar
- Set up analytics & UTM tracking
- Launch lead magnet landing page

### Week 2 — Activation
- Start email nurture (5-email sequence)
- Publish 3 LinkedIn posts + 1 carousel
- Run first paid/organic experiment
- Engage 30 ICP accounts daily on LinkedIn
- Ship SEO cluster article #1

### Week 3 — Optimization
- Review top content by engagement
- A/B test landing page headline
- Publish case study or social proof
- Guest post or podcast outreach (5 targets)
- Repurpose blog into 4 social assets

### Week 4 — Scale
- Double down on best-performing channel
- Launch retargeting or lookalike audience
- Publish comparison / alternative page
- Host live Q&A or webinar
- Retrospective: KPIs, budget reallocation`;
}

export function generateMarketingOS(goal: string): MarketingOSOutput {
  const ctx = inferContext(goal);
  const { industry, audience, focus } = ctx;

  const executiveSummary = `This Marketing OS blueprint translates your goal — "${goal}" — into an executable system for ${industry}. The plan prioritizes ${focus} by aligning positioning, content, SEO, and LinkedIn into a single operating rhythm. Target audience: ${audience}. Execute in 30-day sprints with weekly reviews.`;

  const sections: MarketingOSSection[] = [
    {
      id: "marketing-strategy",
      title: "Marketing Strategy",
      content: `## Strategic Direction

**North Star:** ${goal}

**Positioning Statement**
We help ${audience} achieve ${focus} through a differentiated ${industry} offer — faster than legacy approaches and with measurable ROI.

**90-Day Priorities**
1. **Clarity** — One ICP, one core promise, one primary CTA
2. **Cadence** — Publish 4×/week on LinkedIn, 2×/week on blog
3. **Conversion** — Optimize landing page for demo/signup intent
4. **Compounding** — SEO pillars + email nurture running in parallel

**Channel Mix**
- 35% LinkedIn organic (inbound authority)
- 30% SEO / blog (compounding traffic)
- 20% Email nurture (conversion)
- 15% Paid tests (validate CPL)

**KPIs**
- Marketing qualified leads (MQLs)
- Cost per lead & demo-to-close rate
- Organic traffic growth (+30% in 90 days)
- Content engagement depth (saves, comments, shares)`,
    },
    {
      id: "content-strategy",
      title: "Content Strategy",
      content: `## Content Operating System

**Mission:** Every piece of content should move ${audience} one step closer to trusting your ${industry} solution.

**Content Lanes**
| Lane | Purpose | Volume |
|------|---------|--------|
| Educate | Teach frameworks & how-tos | 40% |
| Prove | Case studies, metrics, wins | 25% |
| Perspective | POV, trends, predictions | 20% |
| Convert | Soft CTAs, offers, demos | 15% |

**Format Mix**
- LinkedIn posts & carousels (daily visibility)
- Long-form blog / SEO guides (authority)
- Email newsletter (nurture)
- Lead magnets (capture)

**Repurposing Flow**
1 pillar blog → 5 LinkedIn posts → 1 carousel → 1 email → 1 video script

**Quality Bar**
- Hook in first 2 lines
- One idea per asset
- Specific examples > generic advice
- Always end with a conversation starter`,
    },
    {
      id: "content-pillars",
      title: "Content Pillars",
      content: `## Four Pillars to Own

**Pillar 1 — The Problem**
Content that names the pain ${audience} feels before they find your solution.
- "Why ${focus} stalls after the first 90 days"
- "The hidden cost of generic marketing"

**Pillar 2 — The Playbook**
Actionable systems, templates, and step-by-step guides.
- "Our 30-day ${industry} launch framework"
- "Weekly content sprint for solo founders"

**Pillar 3 — Proof & Results**
Customer stories, metrics, before/after transformations.
- Case study: 3× pipeline in 60 days
- ROI breakdown of content-led growth

**Pillar 4 — Category Vision**
Where the market is going — trends, predictions, contrarian takes.
- "The future of ${industry} marketing in 2026"
- "What high-growth teams do differently"`,
    },
    {
      id: "audience-personas",
      title: "Audience Personas",
      content: `## Primary Personas

### Persona A — "Growth-Focused Founder"
- **Role:** CEO / Co-founder at early-stage ${industry} company
- **Goals:** ${focus}, predictable pipeline
- **Pain:** No time, inconsistent marketing, generic messaging
- **Channels:** LinkedIn, podcasts, founder communities
- **Message:** "Ship marketing like product — systems, not heroics."

### Persona B — "Marketing Lead"
- **Role:** Head of Marketing / Demand Gen
- **Goals:** Hit MQL targets, prove ROI to leadership
- **Pain:** Content bottleneck, tool sprawl, weak attribution
- **Channels:** LinkedIn, industry newsletters, webinars
- **Message:** "One workspace for strategy → execution → publish."

### Persona C — "Agency Operator"
- **Role:** Agency owner managing multiple client brands
- **Goals:** Scale delivery without hiring linearly
- **Pain:** Client churn, margin pressure, inconsistent output
- **Channels:** LinkedIn, agency communities, referrals
- **Message:** "White-label AI content ops for every client."

**Messaging Matrix**
| Persona | Hook | CTA |
|---------|------|-----|
| Founder | Speed + clarity | Book demo |
| Marketer | ROI + workflow | Start free trial |
| Agency | Scale + margin | See agency plan |`,
    },
    {
      id: "funnel-strategy",
      title: "Funnel Strategy",
      content: `## Full-Funnel Architecture

**TOFU — Awareness**
- SEO blog content targeting problem-aware keywords
- LinkedIn thought leadership for ${audience}
- Lead magnet: "${industry} Growth Playbook" (PDF)
- Guest appearances on niche podcasts

**MOFU — Consideration**
- 7-day email nurture sequence
- Case studies with quantified outcomes
- Webinar: "How to ${goal.toLowerCase().replace(/\.$/, "")}"
- Retargeting ads to site visitors

**BOFU — Conversion**
- Demo / trial landing page with social proof
- Comparison pages vs. alternatives
- Sales-enablement one-pagers
- Limited-time onboarding offer

**Funnel Metrics**
| Stage | Target |
|-------|--------|
| Visitor → Lead | 2–4% |
| Lead → MQL | 30% |
| MQL → Opportunity | 25% |
| Opp → Customer | 20% |`,
    },
    {
      id: "seo-plan",
      title: "SEO Plan",
      content: `## SEO Roadmap

**Pillar Keywords**
- "${industry.toLowerCase()} marketing strategy"
- "how to ${focus.replace(/ /g, " ")}"
- "best tools for ${audience.split(",")[0]?.trim()}"

**Cluster Topics (Month 1)**
1. Complete guide to ${focus}
2. ${industry} content calendar template
3. LinkedIn lead gen for B2B
4. SEO for SaaS startups
5. Marketing metrics that matter

**Technical Checklist**
- Core Web Vitals pass
- Schema: Organization, FAQ, Article
- Internal linking hub model
- XML sitemap + Search Console

**Link Building**
- 2 guest posts / month
- Digital PR from original data
- Partner co-marketing pages
- HARO / journalist pitches

**90-Day Targets**
- 5 keywords in top 20
- +40% organic sessions
- 2 featured snippets`,
    },
    {
      id: "linkedin-strategy",
      title: "LinkedIn Strategy",
      content: `## LinkedIn Growth System

**Profile Optimization**
- Headline: outcome for ${audience} (not job title)
- Banner: social proof + single CTA
- Featured: lead magnet, case study, demo link

**Posting Cadence**
- 4 posts/week (Mon, Tue, Thu, Fri)
- 1 carousel every 2 weeks
- Engage 30 min/day on ICP content

**Content Mix**
- 30% story + lesson
- 30% tactical tips / frameworks
- 20% industry insights
- 20% proof + soft CTA

**Hook Templates**
1. "I almost quit [X]. Here's what changed."
2. "Unpopular opinion about [industry]:"
3. "3 mistakes ${audience} make with ${focus}:"

**Lead Gen Plays**
- Comment-to-DM on viral posts
- Lead gen form in featured section
- Newsletter signup in every 5th post
- Collaborate with 2 creators/month`,
    },
    {
      id: "blog-strategy",
      title: "Blog Strategy",
      content: `## Blog & SEO Content Engine

**Pillar Pages (Quarter)**
1. Ultimate guide to ${focus}
2. ${industry} marketing playbook 2026
3. Tool comparison / buyer's guide

**Publishing Rhythm**
- 2 articles/week (Tue + Thu)
- 1,500–2,500 words per pillar piece
- 800–1,200 words for cluster posts

**Article Structure**
- SEO title + meta description
- Hook intro (problem → promise)
- H2/H3 scannable sections
- FAQ block for snippets
- CTA: demo, newsletter, or lead magnet

**Distribution**
- Repurpose each post into 5 LinkedIn posts
- Email excerpt in weekly newsletter
- Share in 3 relevant communities

**Editorial Themes**
- How-to guides
- Industry benchmarks
- Founder lessons
- Product-led growth tactics`,
    },
    {
      id: "content-calendar",
      title: "30-Day Content Calendar",
      content: buildCalendar(),
    },
    {
      id: "weekly-action-plan",
      title: "Weekly Action Plan",
      content: buildWeeklyPlan(),
    },
  ];

  return {
    title: `Marketing OS — ${ctx.industry} Growth System`,
    goal,
    executiveSummary,
    sections,
    generatedAt: new Date().toISOString(),
    live: false,
  };
}

export function getSectionMeta(id: string): MarketingOSSectionMeta {
  return SECTION_META.find((s) => s.id === id) ?? SECTION_META[0];
}

export function formatMarketingOSForExport(output: MarketingOSOutput): string {
  const body = output.sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n---\n\n");
  return `# ${output.title}

**Goal:** ${output.goal}
**Generated:** ${new Date(output.generatedAt).toLocaleDateString()}

## Executive Summary

${output.executiveSummary}

---

${body}

---
Generated by InkFit AI Marketing OS`;
}

export function parseMarketingOSData(json: string): MarketingOSOutput | null {
  try {
    return JSON.parse(json) as MarketingOSOutput;
  } catch {
    return null;
  }
}
