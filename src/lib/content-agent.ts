export type AgentIntent =
  | "linkedin_calendar"
  | "blog_topics"
  | "content_strategy"
  | "seo_plan"
  | "content_ideas"
  | "general";

export interface AgentMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface AgentConversation {
  id: string;
  title: string;
  messages: AgentMessage[];
  updatedAt: string;
}

export const QUICK_ACTIONS = [
  {
    id: "linkedin-week",
    label: "LinkedIn week plan",
    prompt: "Create next week's LinkedIn content.",
    icon: "linkedin",
  },
  {
    id: "blog-saas",
    label: "Blog ideas for SaaS",
    prompt: "Generate blog ideas for SaaS founders.",
    icon: "blog",
  },
  {
    id: "strategy",
    label: "Content strategy",
    prompt: "Create a content strategy for my brand.",
    icon: "strategy",
  },
  {
    id: "seo",
    label: "SEO plan",
    prompt: "Build an SEO content plan for the next quarter.",
    icon: "seo",
  },
  {
    id: "calendar",
    label: "30-day calendar",
    prompt: "Plan a 30-day content calendar across LinkedIn and blog.",
    icon: "calendar",
  },
  {
    id: "posts",
    label: "Write posts",
    prompt: "Write 5 LinkedIn posts about growing a personal brand.",
    icon: "posts",
  },
];

export const STORAGE_CONVERSATIONS = "inkfit-agent-conversations";
export const STORAGE_SAVED_PROMPTS = "inkfit-agent-saved-prompts";

export function detectIntent(prompt: string): AgentIntent {
  const p = prompt.toLowerCase();
  if (
    (p.includes("linkedin") || p.includes("linked in")) &&
    (p.includes("week") || p.includes("calendar") || p.includes("next"))
  ) {
    return "linkedin_calendar";
  }
  if (
    (p.includes("blog") || p.includes("article")) &&
    (p.includes("idea") || p.includes("topic") || p.includes("generate"))
  ) {
    return "blog_topics";
  }
  if (p.includes("seo") || p.includes("keyword") || p.includes("search engine")) {
    return "seo_plan";
  }
  if (p.includes("strategy") || p.includes("strategic") || p.includes("roadmap")) {
    return "content_strategy";
  }
  if (p.includes("idea") || p.includes("brainstorm")) {
    return "content_ideas";
  }
  return "general";
}

function extractTopic(prompt: string): string {
  const lower = prompt.toLowerCase();
  const forMatch = prompt.match(/for\s+([^.?!]+)/i);
  if (forMatch) return forMatch[1].trim();
  if (lower.includes("saas")) return "SaaS founders";
  if (lower.includes("linkedin")) return "LinkedIn professionals";
  return "your target audience";
}

export function generateAgentResponse(prompt: string): string {
  const intent = detectIntent(prompt);
  const topic = extractTopic(prompt);

  switch (intent) {
    case "linkedin_calendar":
      return generateLinkedInWeek(topic);
    case "blog_topics":
      return generateBlogTopics(topic);
    case "content_strategy":
      return generateContentStrategy(topic);
    case "seo_plan":
      return generateSEOPlan(topic);
    case "content_ideas":
      return generateContentIdeas(topic);
    default:
      return generateGeneralResponse(prompt, topic);
  }
}

function generateLinkedInWeek(audience: string): string {
  return `Here's your **LinkedIn content plan** for next week, tailored for ${audience}.

## Content Calendar

| Day | Format | Topic |
|-----|--------|-------|
| Monday | Thought leadership | The #1 mistake ${audience} make in 2026 |
| Tuesday | Carousel | 7 frameworks for faster growth |
| Wednesday | Story post | A failure that changed my approach |
| Thursday | Educational | Step-by-step playbook (actionable) |
| Friday | Engagement | Poll + hot take to spark comments |
| Saturday | Repurpose | Turn Thursday's post into a thread |
| Sunday | Soft CTA | Weekly recap + "follow for more" |

## Post Drafts

**Monday — Thought Leadership**
> Hook: "Most ${audience} are optimizing the wrong metric."
> Body: 3 insights + one contrarian take
> CTA: What's the metric you track most?

**Wednesday — Story**
> Hook: "I almost gave up last year. Here's what saved me."
> Body: Short narrative + lesson for ${audience}
> CTA: Share your turning point below.

## Content Ideas (bonus)
- Behind-the-scenes of your workflow
- Tool stack reveal
- Client win (anonymized)
- Industry trend reaction

Want me to expand any day into a full post?`;
}

function generateBlogTopics(audience: string): string {
  return `## Blog Topics for ${audience}

### Pillar Articles (1,500+ words)
1. **The Complete Guide to [Core Topic] for ${audience}**
2. **How to Build a Content Engine on a Small Team**
3. **2026 Trends Every ${audience.split(" ")[0]} Leader Should Know**

### Listicles (high shareability)
4. 10 Mistakes ${audience} Make (And How to Fix Them)
5. 7 Tools That 10x Productivity for ${audience}
6. 5 Frameworks for Faster Decision-Making

### Comparison & Commercial
7. [Your Solution] vs Alternatives: An Honest Comparison
8. How to Choose the Right [Category] in 2026

### SEO-Friendly How-To
9. How to Get Your First 100 Customers as a ${audience.split(" ")[0]} Founder
10. Step-by-Step: Launching a Newsletter for ${audience}

### Thought Leadership
11. Why the Old Playbook for ${audience} Is Dead
12. What I Would Do Differently Starting Over Today

**Recommended cadence:** 2 pillar posts + 1 listicle per month.`;
}

function generateContentStrategy(audience: string): string {
  return `## Content Strategy for ${audience}

### Goals (90 days)
- Build authority in your niche
- Generate consistent inbound leads
- Grow email list by 25%

### Content Pillars
1. **Education** — How-to, frameworks, tutorials
2. **Authority** — Trends, predictions, original POV
3. **Proof** — Case studies, results, testimonials
4. **Community** — Stories, behind-the-scenes, engagement

### Channel Mix
| Channel | Role | Cadence |
|---------|------|---------|
| LinkedIn | Top of funnel, authority | 4×/week |
| Blog | SEO, depth, conversion | 2×/week |
| Newsletter | Nurture, trust | 1×/week |
| Carousel | Reach, saves | 1×/week |

### Funnel Alignment
- **TOFU:** LinkedIn posts, short video, trends
- **MOFU:** Blog guides, carousels, webinars
- **BOFU:** Case studies, demos, comparison pages

### KPIs
- Impressions & engagement rate (LinkedIn)
- Organic traffic & keyword rankings (Blog)
- Open rate & click-through (Newsletter)
- MQLs attributed to content

### Next Steps
1. Pick 3 pillar topics for Q1
2. Batch-create 2 weeks of LinkedIn content
3. Publish one SEO pillar page this month`;
}

function generateSEOPlan(audience: string): string {
  return `## SEO Content Plan — Next Quarter

### Keyword Targets
| Priority | Keyword | Intent | Content Type |
|----------|---------|--------|--------------|
| High | [topic] for ${audience} | Commercial | Pillar page |
| High | best [tool category] | Comparison | Listicle |
| Medium | how to [solve problem] | Informational | Guide |
| Medium | [industry] trends 2026 | Informational | Report |
| Low | [long-tail question] | Informational | FAQ post |

### Content Roadmap
**Month 1:** Keyword research + 2 pillar pages
**Month 2:** 4 cluster articles + internal linking
**Month 3:** Comparison pages + backlink outreach

### On-Page Checklist
- Title tags 50–60 chars with primary keyword
- Meta descriptions 150–160 chars
- H2/H3 structure with semantic keywords
- FAQ schema on guide pages
- Internal links to pillar content

### SEO Opportunities
- Competitors lack depth on "${audience}" topics
- Featured snippet gaps on "how to" queries
- Underserved long-tail in your niche

### Expected Outcomes
- +30–40% organic traffic in 90 days
- 5–8 keywords in top 10
- 2–3 featured snippets`;
}

function generateContentIdeas(audience: string): string {
  return `## Content Ideas for ${audience}

### LinkedIn Posts
- Unpopular opinion about your industry
- "I analyzed 100 posts — here's what worked"
- Before/after transformation story
- 3 mistakes + fixes carousel

### Blog Topics
- Ultimate guide to [your expertise]
- Year in review lessons learned
- Interview-style expert roundup

### Short-Form / Video
- 60-second tip of the day
- Day in the life
- Tool demo

### Engagement Plays
- Poll: "What's your biggest challenge?"
- "Fill in the blank" post
- Comment giveaway (template/checklist)`;
}

function generateGeneralResponse(prompt: string, audience: string): string {
  return `Got it — here's a **content package** based on your request.

## Content Ideas
1. Thought leadership angle for ${audience}
2. Educational carousel on a core pain point
3. Personal story with a business lesson
4. Industry trend breakdown
5. Client success snapshot

## Sample LinkedIn Post
**Hook:** "Here's what nobody tells ${audience} about content marketing."
**Body:** 3 bullet insights + one actionable step
**CTA:** Save this if it helped ♻️

## Blog Topics
- How to [solve main problem] in 2026
- The ${audience} playbook for consistent growth
- 5 tools that changed my workflow

## Mini Calendar (This Week)
- Mon: Thought leadership post
- Wed: Educational carousel
- Fri: Story + engagement question

## SEO Quick Wins
- Target one long-tail keyword this week
- Add FAQ section to your top blog post
- Refresh meta titles on top 5 pages

---
*You asked:* "${prompt}"

Tell me which section to expand — full posts, a detailed calendar, or an SEO plan.`;
}

export function conversationTitle(firstMessage: string): string {
  return firstMessage.slice(0, 48) + (firstMessage.length > 48 ? "…" : "");
}

export function loadConversations(): AgentConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_CONVERSATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: AgentConversation[]): void {
  localStorage.setItem(STORAGE_CONVERSATIONS, JSON.stringify(conversations));
}

export function loadSavedPrompts(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_PROMPTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSavedPrompts(prompts: string[]): void {
  localStorage.setItem(STORAGE_SAVED_PROMPTS, JSON.stringify(prompts));
}
