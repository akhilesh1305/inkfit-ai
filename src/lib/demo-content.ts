import { Linkedin, FileText, Instagram, Search, Mail } from "lucide-react";

export type DemoOutputType = "linkedin" | "blog" | "instagram" | "seo" | "email";

export interface DemoPrompt {
  id: DemoOutputType;
  label: string;
  prompt: string;
  icon: typeof Linkedin;
}

export const DEMO_PROMPTS: DemoPrompt[] = [
  {
    id: "linkedin",
    label: "LinkedIn Post",
    prompt: "Write a LinkedIn post about AI in healthcare",
    icon: Linkedin,
  },
  {
    id: "blog",
    label: "Blog Intro",
    prompt: "Write a blog introduction about remote work trends in 2026",
    icon: FileText,
  },
  {
    id: "instagram",
    label: "Instagram Caption",
    prompt: "Create an Instagram caption for a SaaS product launch",
    icon: Instagram,
  },
  {
    id: "seo",
    label: "SEO Meta",
    prompt: "Generate SEO meta title and description for an AI content tool",
    icon: Search,
  },
  {
    id: "email",
    label: "Email Campaign",
    prompt: "Write an email subject line and preview for a newsletter launch",
    icon: Mail,
  },
];

export const DEMO_OUTPUTS: Record<
  DemoOutputType,
  { label: string; icon: typeof Linkedin; content: string }
> = {
  linkedin: {
    label: "LinkedIn Post",
    icon: Linkedin,
    content: `🚀 AI is transforming healthcare — and the opportunities are massive.

From predictive diagnostics to personalized treatment plans, machine learning is helping clinicians make faster, smarter decisions.

3 ways AI is reshaping healthcare today:
→ Early disease detection with imaging AI
→ Automated clinical documentation
→ Patient engagement through intelligent chatbots

The future isn't replacing doctors — it's empowering them with better tools.

What's the most exciting AI application you've seen in healthcare? 👇

#HealthcareAI #DigitalHealth #Innovation`,
  },
  blog: {
    label: "Blog Introduction",
    icon: FileText,
    content: `Remote work isn't a temporary shift anymore — it's the foundation of how modern teams operate in 2026.

Companies that embrace distributed work are seeing higher retention, access to global talent, and lower overhead. But success requires more than a Zoom account. It demands intentional culture, async communication, and the right tooling.

In this guide, we'll break down the remote work trends shaping the year ahead — from AI-powered collaboration to the rise of async-first teams — and how you can build a workplace that thrives without an office.`,
  },
  instagram: {
    label: "Instagram Caption",
    icon: Instagram,
    content: `The future of content creation just dropped ✨

InkFit AI is here — your all-in-one studio for blogs, social posts, SEO, and images. Built for founders who move fast 🚀

What you get:
✅ AI that matches your brand voice
✅ Content in minutes, not hours
✅ One workspace for every platform

Link in bio to start free →

#SaaS #AIContent #StartupLife #ContentMarketing #InkFitAI`,
  },
  seo: {
    label: "SEO Meta Tags",
    icon: Search,
    content: `Meta Title (58 chars):
InkFit AI — AI Content Studio for Blogs, Social & SEO

Meta Description (155 chars):
Generate LinkedIn posts, blogs, images, and SEO content in minutes. InkFit AI helps founders and teams create on-brand content from one intelligent workspace. Try free.

Focus Keywords:
AI content generator, LinkedIn growth, SEO toolkit, blog writer

SEO Score: 94/100 ✓`,
  },
  email: {
    label: "Email Campaign",
    icon: Mail,
    content: `Subject Line:
Your content engine is ready — start creating with InkFit AI 🚀

Preview Text:
Generate blogs, social posts, and SEO content in minutes. Free plan included.

—

Hi there,

Great content shouldn't take all week.

InkFit AI helps you publish faster with AI that understands your brand — from LinkedIn carousels to SEO landing pages.

→ Start your free account today
→ No credit card required

See you inside,
The InkFit AI Team`,
  },
};

export function detectOutputType(prompt: string): DemoOutputType {
  const lower = prompt.toLowerCase();
  if (lower.includes("email") || lower.includes("newsletter") || lower.includes("subject line")) {
    return "email";
  }
  if (lower.includes("seo") || lower.includes("meta") || lower.includes("landing page")) {
    return "seo";
  }
  if (lower.includes("instagram") || lower.includes("caption") || lower.includes("reel")) {
    return "instagram";
  }
  if (lower.includes("blog") || lower.includes("article") || lower.includes("introduction")) {
    return "blog";
  }
  return "linkedin";
}
