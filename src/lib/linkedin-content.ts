export type LinkedInContentType =
  | "story"
  | "thought-leadership"
  | "educational"
  | "personal-brand"
  | "industry-insight";

export interface LinkedInContentTypeOption {
  id: LinkedInContentType;
  label: string;
  description: string;
}

export const LINKEDIN_CONTENT_TYPES: LinkedInContentTypeOption[] = [
  {
    id: "story",
    label: "Story Post",
    description: "Personal narrative with a lesson or turning point",
  },
  {
    id: "thought-leadership",
    label: "Thought Leadership",
    description: "Bold perspective that shapes industry conversation",
  },
  {
    id: "educational",
    label: "Educational",
    description: "Actionable tips, frameworks, or how-to value",
  },
  {
    id: "personal-brand",
    label: "Personal Brand",
    description: "Behind-the-scenes authenticity and credibility",
  },
  {
    id: "industry-insight",
    label: "Industry Insight",
    description: "Trends, data, and analysis your audience needs",
  },
];

export interface LinkedInPostRequest {
  topic: string;
  targetAudience: string;
  contentType: LinkedInContentType;
}

export interface LinkedInPostOutput {
  hook: string;
  mainContent: string;
  cta: string;
  hookScore: number;
  engagementScore: number;
}

function scoreHook(hook: string): number {
  let score = 62;
  if (hook.length >= 40 && hook.length <= 120) score += 12;
  if (/[?]/.test(hook)) score += 8;
  if (/\d/.test(hook)) score += 6;
  if (hook.split(" ").length <= 18) score += 6;
  return Math.min(98, score);
}

function scoreEngagement(hook: string, main: string, cta: string): number {
  let score = 58;
  const lines = main.split("\n").filter(Boolean).length;
  if (lines >= 4 && lines <= 12) score += 14;
  if (main.includes("→") || main.includes("•")) score += 8;
  if (cta.length > 20) score += 10;
  if (hook.length > 30) score += 6;
  return Math.min(97, score);
}

const TYPE_INTROS: Record<LinkedInContentType, string> = {
  story: "Here's something I learned the hard way about",
  "thought-leadership": "Unpopular opinion:",
  educational: "Most people get this wrong about",
  "personal-brand": "A quick note on my journey with",
  "industry-insight": "What I'm seeing in",
};

export function generateLinkedInPost(req: LinkedInPostRequest): LinkedInPostOutput {
  const { topic, targetAudience, contentType } = req;
  const audience = targetAudience || "professionals on LinkedIn";

  const hooks: Record<LinkedInContentType, string> = {
    story: `I almost gave up on ${topic}.\n\nThen one conversation changed everything.`,
    "thought-leadership": `${TYPE_INTROS[contentType]} ${topic} — and it's costing ${audience} more than they realize.`,
    educational: `${TYPE_INTROS[contentType]} ${topic} (and how to fix it in 15 minutes).`,
    "personal-brand": `3 years ago, I knew nothing about ${topic}.\n\nToday, it's central to how I help ${audience}.`,
    "industry-insight": `${TYPE_INTROS[contentType]} ${topic} right now — 3 signals you shouldn't ignore.`,
  };

  const mains: Record<LinkedInContentType, string> = {
    story: `When I first tackled ${topic}, I made every mistake in the book.

I chased tactics without strategy. I copied what worked for others instead of listening to ${audience}.

The shift happened when I stopped optimizing for vanity metrics and started optimizing for trust.

What changed:
→ I focused on one core message per post
→ I shared real failures, not just wins
→ I engaged before I published

${topic} isn't about perfection. It's about showing up with clarity and consistency.`,

    "thought-leadership": `Everyone in our space is talking about ${topic}.

But few are asking the harder question: does this actually serve ${audience}?

The brands winning on LinkedIn in 2026 share three traits:
• A clear point of view (not generic advice)
• Evidence — data, stories, or lived experience
• Consistency over virality

If your content around ${topic} could be written by anyone, it won't build authority.

Specificity is the new thought leadership.`,

    educational: `If you're creating content about ${topic} for ${audience}, start here:

1. **Lead with the outcome** — what will they be able to do after reading?
2. **Use simple structure** — hook → insight → steps → CTA
3. **One idea per post** — depth beats breadth on LinkedIn
4. **Format for scanners** — short lines, bullets, white space
5. **End with engagement** — ask a question they'll want to answer

Save this for your next ${topic} post.`,

    "personal-brand": `Building a personal brand around ${topic} isn't about going viral.

It's about becoming the person ${audience} thinks of when this topic comes up.

My approach:
→ Publish 3x per week minimum
→ Mix educational + personal + industry takes
→ Reply to every meaningful comment in the first hour
→ Repurpose one idea across formats

Your story + your expertise = your unfair advantage.

${topic} is crowded. Your voice isn't.`,

    "industry-insight": `The ${topic} landscape is shifting faster than most teams can adapt.

Here's what ${audience} should watch:

**Signal 1:** AI-assisted creation is table stakes — differentiation is voice and POV
**Signal 2:** Short-form authority beats long-form noise
**Signal 3:** Engagement depth matters more than impression volume

Teams still treating ${topic} as a checkbox will fall behind.

The opportunity: own a niche narrative before it's crowded.`,
  };

  const ctas: Record<LinkedInContentType, string> = {
    story: `What's one lesson ${topic} taught you? I'd love to hear it in the comments. 👇`,
    "thought-leadership": `Agree or disagree? Drop your take below — let's discuss.`,
    educational: `Which step resonates most? Save this post and tag someone who needs it.`,
    "personal-brand": `Follow for more on ${topic} and building in public. Repost if this helped ♻️`,
    "industry-insight": `What trends are you seeing in ${topic}? Share below.`,
  };

  const hook = hooks[contentType];
  const mainContent = mains[contentType];
  const cta = ctas[contentType];

  return {
    hook,
    mainContent,
    cta,
    hookScore: scoreHook(hook.split("\n")[0]),
    engagementScore: scoreEngagement(hook, mainContent, cta),
  };
}

export function formatLinkedInPost(output: LinkedInPostOutput): string {
  return `${output.hook}\n\n${output.mainContent}\n\n${output.cta}`;
}
