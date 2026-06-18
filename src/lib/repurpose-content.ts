import {
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Newspaper,
  Mail,
  FileText,
  Youtube,
  type LucideIcon,
} from "lucide-react";

export type RepurposeOutputId =
  | "linkedin"
  | "twitter"
  | "instagram"
  | "facebook"
  | "newsletter"
  | "email"
  | "blog-summary"
  | "youtube";

export interface RepurposeOutputOption {
  id: RepurposeOutputId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const REPURPOSE_OUTPUTS: RepurposeOutputOption[] = [
  {
    id: "linkedin",
    label: "LinkedIn Post",
    description: "Professional post with hooks and hashtags",
    icon: Linkedin,
  },
  {
    id: "twitter",
    label: "Twitter Thread",
    description: "Multi-tweet thread with engagement hooks",
    icon: Twitter,
  },
  {
    id: "instagram",
    label: "Instagram Caption",
    description: "Scroll-stopping caption with emojis",
    icon: Instagram,
  },
  {
    id: "facebook",
    label: "Facebook Post",
    description: "Community-friendly post for engagement",
    icon: Facebook,
  },
  {
    id: "newsletter",
    label: "Newsletter",
    description: "Email newsletter section from your content",
    icon: Newspaper,
  },
  {
    id: "email",
    label: "Email Campaign",
    description: "Subject line, preview, and body copy",
    icon: Mail,
  },
  {
    id: "blog-summary",
    label: "Blog Summary",
    description: "Concise summary with key takeaways",
    icon: FileText,
  },
  {
    id: "youtube",
    label: "YouTube Description",
    description: "SEO-optimized video description",
    icon: Youtube,
  },
];

export type RepurposeResults = Partial<Record<RepurposeOutputId, string>>;

function excerpt(source: string, max = 120): string {
  const clean = source.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}…`;
}

function topicFromSource(source: string): string {
  const firstLine = source.trim().split("\n").find((l) => l.trim().length > 20);
  return firstLine?.slice(0, 80).trim() || "your content";
}

export function generateMockRepurpose(
  source: string,
  outputId: RepurposeOutputId
): string {
  const topic = topicFromSource(source);
  const snippet = excerpt(source, 160);

  const generators: Record<RepurposeOutputId, () => string> = {
    linkedin: () =>
      `🚀 Key insight from my latest piece on ${topic}

${snippet}

3 takeaways worth sharing:
→ Start with clarity — your audience scrolls fast
→ Repurpose once, publish everywhere
→ Consistency beats perfection every time

What's your biggest content challenge right now? Drop it below 👇

#ContentMarketing #AI #InkFitAI #Growth`,

    twitter: () =>
      `🧵 Thread: ${topic}

1/ ${snippet}

2/ Most teams spend hours rewriting the same idea for every platform. That's wasted energy.

3/ The fix? Repurpose your core message — don't recreate it from scratch.

4/ One blog post can become:
• A LinkedIn carousel
• A Twitter thread
• An email newsletter
• A YouTube description

5/ InkFit AI automates this in minutes. Write once → publish everywhere.

6/ Save this thread if you're building a content engine in 2026. 🔁`,

    instagram: () =>
      `New content drop ✨

${snippet}

Save this for later if you're building your brand online 📌

Double tap if you agree → consistency > perfection

.
.
.
#contentcreator #marketingtips #aitools #inkfitai #socialmediagrowth`,

    facebook: () =>
      `Hey everyone 👋

I just published something I think you'll find useful:

${snippet}

Would love to hear your thoughts — what's working for your content strategy right now?

Share this with someone who needs to hear it 💬`,

    newsletter: () =>
      `📬 This Week in Content

Hey there,

Here's what stood out from our latest deep-dive:

${snippet}

Why this matters:
Your audience is everywhere — but your time isn't. Smart repurposing lets you show up consistently without burning out.

What's inside this edition:
• The core idea broken down simply
• How to adapt it for LinkedIn, email, and social
• One action step you can take today

Keep creating,
The InkFit AI Team`,

    email: () =>
      `Subject: Your content, 8 ways — in under 5 minutes

Preview: Turn one article into a full week of posts automatically.

—

Hi there,

You wrote something great. Now let's make it work harder.

Based on your content about "${topic}":

${snippet}

With InkFit AI's Content Repurposer, you can spin this into LinkedIn posts, threads, emails, and more — without starting from zero.

→ Try repurposing your next article free

Talk soon,
InkFit AI`,

    "blog-summary": () =>
      `Summary: ${topic}

Overview:
${snippet}

Key Takeaways:
• Original long-form content can fuel an entire week of distribution
• Repurposing preserves your core message while adapting format and tone
• AI-assisted workflows cut production time by up to 85%
• Consistent multi-platform presence builds trust and authority

Bottom Line:
Don't let great content live in one place. Repurpose it strategically and scale your reach without scaling your workload.`,

    youtube: () =>
      `🎬 ${topic}

In this video, we break down:
${snippet}

⏱ Timestamps:
0:00 — Introduction
1:20 — Core concept explained
4:45 — Practical examples
8:30 — How to repurpose this content
12:00 — Final thoughts & CTA

🔗 Resources mentioned:
• InkFit AI Content Repurposer
• Free content templates

📌 Chapters, tags, and links help YouTube surface your content to the right audience.

#ContentCreation #AI #Marketing #InkFitAI`,
  };

  return generators[outputId]();
}

export async function generateAllRepurpose(
  source: string,
  selected: RepurposeOutputId[]
): Promise<RepurposeResults> {
  await new Promise((r) => setTimeout(r, 1800 + selected.length * 200));
  const results: RepurposeResults = {};
  for (const id of selected) {
    results[id] = generateMockRepurpose(source, id);
    await new Promise((r) => setTimeout(r, 150));
  }
  return results;
}
