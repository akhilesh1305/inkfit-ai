export type PromptCategoryId = "linkedin" | "seo" | "blog" | "carousel" | "marketing";

export interface PromptCategoryMeta {
  id: PromptCategoryId;
  label: string;
  description: string;
  color: string;
  gradient: string;
  icon: string;
}

export interface PromptCollection {
  id: string;
  name: string;
  icon: string;
  color: string;
  promptCount: number;
  createdAt: string;
}

export interface PromptItem {
  id: string;
  title: string;
  body: string;
  category: PromptCategoryId;
  tags: string[];
  collectionId: string | null;
  favorite: boolean;
  useCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const PROMPT_CATEGORIES: PromptCategoryMeta[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    description: "Posts, hooks & thought leadership",
    color: "#0A66C2",
    gradient: "from-[#0A66C2] to-[#004182]",
    icon: "in",
  },
  {
    id: "seo",
    label: "SEO",
    description: "Keywords, meta & articles",
    color: "#10B981",
    gradient: "from-emerald-600 to-teal-700",
    icon: "⌕",
  },
  {
    id: "blog",
    label: "Blog",
    description: "Long-form guides & articles",
    color: "#7C3AED",
    gradient: "from-violet-600 to-purple-800",
    icon: "✎",
  },
  {
    id: "carousel",
    label: "Carousel",
    description: "Slide decks & swipe posts",
    color: "#EC4899",
    gradient: "from-pink-600 to-fuchsia-700",
    icon: "▤",
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Campaigns, strategy & copy",
    color: "#3B82F6",
    gradient: "from-blue-600 to-indigo-700",
    icon: "◎",
  },
];

export const DEFAULT_COLLECTIONS = [
  { name: "Favorites", icon: "⭐", color: "#F59E0B" },
  { name: "Content Ops", icon: "🚀", color: "#7C3AED" },
  { name: "Client Work", icon: "💼", color: "#06B6D4" },
];

export function getCategoryMeta(id: PromptCategoryId): PromptCategoryMeta {
  return PROMPT_CATEGORIES.find((c) => c.id === id) ?? PROMPT_CATEGORIES[0];
}

export function parseTags(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === "string") : [];
  } catch {
    return [];
  }
}

export function truncateBody(text: string, max = 120): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max)}…`;
}

export function filterPrompts(
  prompts: PromptItem[],
  opts: {
    search?: string;
    category?: PromptCategoryId | "all";
    collectionId?: string | null;
    tag?: string | null;
    favoritesOnly?: boolean;
  }
): PromptItem[] {
  let result = [...prompts];

  if (opts.favoritesOnly) {
    result = result.filter((p) => p.favorite);
  }

  if (opts.category && opts.category !== "all") {
    result = result.filter((p) => p.category === opts.category);
  }

  if (opts.collectionId) {
    result = result.filter((p) => p.collectionId === opts.collectionId);
  }

  if (opts.tag) {
    result = result.filter((p) =>
      p.tags.some((t) => t.toLowerCase() === opts.tag!.toLowerCase())
    );
  }

  if (opts.search?.trim()) {
    const q = opts.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return result;
}

export function getMostUsed(prompts: PromptItem[], limit = 6): PromptItem[] {
  return [...prompts].sort((a, b) => b.useCount - a.useCount).slice(0, limit);
}

export function getRecentlyUsed(prompts: PromptItem[], limit = 6): PromptItem[] {
  return [...prompts]
    .filter((p) => p.lastUsedAt)
    .sort((a, b) => {
      const da = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
      const db = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
      return db - da;
    })
    .slice(0, limit);
}

export function getAllTags(prompts: PromptItem[]): string[] {
  const set = new Set<string>();
  for (const p of prompts) {
    for (const t of p.tags) set.add(t);
  }
  return [...set].sort();
}

export const DEMO_PROMPTS: Omit<
  PromptItem,
  "id" | "collectionId" | "createdAt" | "updatedAt"
>[] = [
  {
    title: "Story → Lesson LinkedIn Post",
    body: `Write a LinkedIn post using this structure:
1. Hook: Personal story opening with tension
2. Turning point: What changed
3. Lesson: 3 actionable takeaways
4. CTA: Question to drive comments

Topic: {{topic}}
Audience: {{audience}}
Tone: Authentic, conversational`,
    category: "linkedin",
    tags: ["story", "engagement", "hook"],
    favorite: true,
    useCount: 47,
    lastUsedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    title: "Thought Leadership Hot Take",
    body: `Write a bold thought leadership LinkedIn post challenging conventional wisdom about {{topic}}.

Include:
- Contrarian opening statement
- 3 evidence-backed points
- What most people get wrong
- Your unique perspective
- Engagement question

Audience: {{audience}}`,
    category: "linkedin",
    tags: ["thought-leadership", "bold", "b2b"],
    favorite: true,
    useCount: 38,
    lastUsedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    title: "SEO Pillar Article",
    body: `Write a comprehensive SEO pillar article.

Target keyword: {{keyword}}
Topic: {{topic}}
Word count: 1,500–2,000

Include:
- SEO title (55–60 chars)
- Meta description (150–160 chars)
- H2/H3 structure with keyword placement
- FAQ section (5 questions)
- Internal linking suggestions`,
    category: "seo",
    tags: ["pillar", "long-form", "keyword"],
    favorite: false,
    useCount: 31,
    lastUsedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    title: "Blog Introduction Hook",
    body: `Write a compelling blog introduction for "{{topic}}".

Requirements:
- Open with a surprising stat or question
- State the reader's pain point
- Promise a clear outcome
- Keep under 150 words
- Match tone: {{tone}}`,
    category: "blog",
    tags: ["introduction", "hook", "blog"],
    favorite: false,
    useCount: 28,
    lastUsedAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    title: "7-Slide Carousel Framework",
    body: `Create a 7-slide LinkedIn carousel about {{topic}}.

Slide 1: Bold cover headline
Slides 2–6: One tip per slide (headline + 2 lines)
Slide 7: CTA + follow prompt

Style: Scannable, punchy, actionable
Audience: {{audience}}`,
    category: "carousel",
    tags: ["carousel", "slides", "tips"],
    favorite: true,
    useCount: 42,
    lastUsedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    title: "30-Day Content Calendar",
    body: `Build a 30-day content calendar for {{brand}} targeting {{audience}}.

Include for each day:
- Content type (blog, LinkedIn, carousel, etc.)
- Topic/title
- Key message
- CTA

Balance: 40% educational, 30% thought leadership, 20% promotional, 10% personal`,
    category: "marketing",
    tags: ["calendar", "strategy", "planning"],
    favorite: false,
    useCount: 22,
    lastUsedAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    title: "Meta Title & Description",
    body: `Generate SEO meta tags for a page about {{topic}}.

Target keyword: {{keyword}}

Return:
1. SEO title (50–60 characters, keyword front-loaded)
2. Meta description (150–160 characters, includes CTA)
3. 3 alternative title variations`,
    category: "seo",
    tags: ["meta", "snippets", "quick"],
    favorite: false,
    useCount: 19,
    lastUsedAt: null,
  },
  {
    title: "Product Launch Announcement",
    body: `Write a product launch marketing brief for {{product}}.

Sections:
- Executive summary
- Target audience & pain points
- Key messaging pillars (3)
- Channel plan (LinkedIn, email, blog)
- Launch timeline (2 weeks)
- Success metrics`,
    category: "marketing",
    tags: ["launch", "campaign", "brief"],
    favorite: false,
    useCount: 15,
    lastUsedAt: new Date(Date.now() - 1209600000).toISOString(),
  },
  {
    title: "Listicle Blog Post",
    body: `Write a listicle blog post: "{{number}} Ways to {{outcome}}"

Requirements:
- Numbered H2 sections
- Each item: headline + 2–3 sentences + example
- Intro with hook + preview
- Conclusion with CTA
- Target audience: {{audience}}`,
    category: "blog",
    tags: ["listicle", "how-to", "seo"],
    favorite: false,
    useCount: 24,
    lastUsedAt: new Date(Date.now() - 518400000).toISOString(),
  },
  {
    title: "Educational LinkedIn Thread",
    body: `Write an educational LinkedIn post teaching {{topic}} to {{audience}}.

Structure:
- Hook: "Most people get {{topic}} wrong. Here's the fix:"
- 5 numbered tips (one idea per line)
- Real example or mini case study
- Save-worthy closing
- Question CTA`,
    category: "linkedin",
    tags: ["educational", "tips", "value"],
    favorite: false,
    useCount: 33,
    lastUsedAt: new Date(Date.now() - 129600000).toISOString(),
  },
];
