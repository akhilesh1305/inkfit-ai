import { generate30DayPlan, type CalendarPlanItem } from "@/lib/calendar-plan";
import { generateLinkedInPost } from "@/lib/linkedin-content";
import { generateMarketingOS } from "@/lib/marketing-os";

export type EmployeeStepId =
  | "strategy"
  | "content_plan"
  | "blog_ideas"
  | "linkedin_posts"
  | "images"
  | "calendar";

export type EmployeeStepStatus =
  | "pending"
  | "running"
  | "awaiting_approval"
  | "approved"
  | "rejected"
  | "completed";

export type EmployeeRunStatus = "active" | "completed" | "paused";

export interface EmployeeStepMeta {
  id: EmployeeStepId;
  title: string;
  description: string;
  icon: string;
  gradient: string;
}

export interface EmployeeStep {
  id: EmployeeStepId;
  title: string;
  description: string;
  status: EmployeeStepStatus;
  output?: unknown;
  preview?: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface EmployeeMessage {
  id: string;
  role: "user" | "employee";
  content: string;
  createdAt: string;
  stepId?: EmployeeStepId;
}

export interface EmployeeRun {
  id: string;
  goal: string;
  status: EmployeeRunStatus;
  messages: EmployeeMessage[];
  steps: EmployeeStep[];
  currentStepId: EmployeeStepId | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export const EMPLOYEE_STEPS: EmployeeStepMeta[] = [
  {
    id: "strategy",
    title: "Marketing Strategy",
    description: "Positioning, channels & 90-day roadmap",
    icon: "◎",
    gradient: "from-brand-600 to-violet-700",
  },
  {
    id: "content_plan",
    title: "Content Plan",
    description: "4-week themes, formats & distribution",
    icon: "▤",
    gradient: "from-cyan-600 to-blue-700",
  },
  {
    id: "blog_ideas",
    title: "Blog Ideas",
    description: "SEO-ready article concepts",
    icon: "✎",
    gradient: "from-indigo-600 to-purple-800",
  },
  {
    id: "linkedin_posts",
    title: "LinkedIn Posts",
    description: "Ready-to-publish thought leadership",
    icon: "in",
    gradient: "from-[#0A66C2] to-blue-900",
  },
  {
    id: "images",
    title: "Image Assets",
    description: "Social visuals for your campaign",
    icon: "◆",
    gradient: "from-pink-600 to-rose-700",
  },
  {
    id: "calendar",
    title: "Content Calendar",
    description: "14-day publishing schedule",
    icon: "📅",
    gradient: "from-emerald-600 to-teal-700",
  },
];

export const GOAL_STARTERS = [
  "Get more leads",
  "Grow LinkedIn following",
  "Launch a new product",
  "Build thought leadership",
  "Increase organic traffic",
];

export function createInitialSteps(): EmployeeStep[] {
  return EMPLOYEE_STEPS.map((meta) => ({
    id: meta.id,
    title: meta.title,
    description: meta.description,
    status: "pending" as const,
  }));
}

export function getStepMeta(id: EmployeeStepId): EmployeeStepMeta {
  return EMPLOYEE_STEPS.find((s) => s.id === id) ?? EMPLOYEE_STEPS[0];
}

export function computeProgress(steps: EmployeeStep[]): number {
  if (steps.length === 0) return 0;
  const done = steps.filter(
    (s) => s.status === "approved" || s.status === "completed"
  ).length;
  return Math.round((done / steps.length) * 100);
}

export function getNextPendingStep(steps: EmployeeStep[]): EmployeeStep | null {
  return steps.find((s) => s.status === "pending") ?? null;
}

function inferIndustry(goal: string): string {
  const g = goal.toLowerCase();
  if (/saas|software|startup/.test(g)) return "B2B SaaS";
  if (/agency/.test(g)) return "Marketing Agency";
  if (/ecommerce|shop/.test(g)) return "E-commerce";
  return "Growth Business";
}

export interface StrategyOutput {
  executiveSummary: string;
  pillars: string[];
  channels: string[];
  kpis: string[];
}

export interface ContentPlanOutput {
  weeks: { week: number; theme: string; formats: string[]; focus: string }[];
}

export interface BlogIdea {
  title: string;
  angle: string;
  keyword: string;
}

export interface LinkedInPostDraft {
  title: string;
  hook: string;
  body: string;
  cta: string;
}

export interface ImageAsset {
  prompt: string;
  url: string;
  style: string;
}

export function executeEmployeeStep(
  stepId: EmployeeStepId,
  goal: string
): { output: unknown; preview: string } {
  const industry = inferIndustry(goal);
  const isLeads = /lead|pipeline|mql|signup|demo/i.test(goal);

  switch (stepId) {
    case "strategy": {
      const os = generateMarketingOS(goal);
      const strategySection = os.sections.find((s) => s.id === "marketing-strategy");
      const output: StrategyOutput = {
        executiveSummary: os.executiveSummary,
        pillars: os.sections
          .filter((s) => s.id === "content-pillars")
          .map((s) => s.content.slice(0, 200))[0]
          ?.split("\n")
          .filter((l) => l.trim().startsWith("-") || l.trim().match(/^\d/))
          .slice(0, 4) ?? [
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
        preview: strategySection?.content.slice(0, 180) ?? os.executiveSummary.slice(0, 180),
      };
    }

    case "content_plan": {
      const output: ContentPlanOutput = {
        weeks: [
          {
            week: 1,
            theme: "Foundation & authority",
            formats: ["LinkedIn posts", "Pillar blog", "Lead magnet"],
            focus: isLeads ? "Capture intent — problem-aware content" : "Build trust & visibility",
          },
          {
            week: 2,
            theme: "Education & proof",
            formats: ["Carousel", "Case study", "Email sequence"],
            focus: "Demonstrate expertise with frameworks & results",
          },
          {
            week: 3,
            theme: "Engagement & nurture",
            formats: ["Threads", "Webinar teaser", "Retargeting ads"],
            focus: "Move warm audience toward conversion",
          },
          {
            week: 4,
            theme: "Conversion & scale",
            formats: ["Comparison page", "Demo CTA posts", "Newsletter"],
            focus: isLeads ? "Drive demos & signups" : "Double down on top performers",
          },
        ],
      };
      return {
        output,
        preview: `4-week plan: ${output.weeks.map((w) => w.theme).join(" → ")}`,
      };
    }

    case "blog_ideas": {
      const topics = isLeads
        ? [
            { title: `How to Generate More Leads in ${industry} (2026 Playbook)`, angle: "Framework + templates", keyword: "lead generation" },
            { title: "7 Content Types That Convert B2B Visitors Into Demos", angle: "Listicle with examples", keyword: "b2b content marketing" },
            { title: "Why Your Landing Pages Aren't Converting (And How to Fix Them)", angle: "Problem/solution", keyword: "landing page conversion" },
            { title: `The ${industry} Founder's Guide to Inbound Pipeline`, angle: "Pillar guide", keyword: "inbound marketing" },
            { title: "Content ROI: How to Measure What Actually Drives Revenue", angle: "Data-driven", keyword: "content marketing roi" },
          ]
        : [
            { title: `The Complete ${industry} Marketing Guide for 2026`, angle: "Pillar SEO", keyword: industry.toLowerCase() },
            { title: "How We 10x'd Our Content Output Without Hiring", angle: "Case study", keyword: "content operations" },
            { title: "AI + Human: The Content Workflow That Actually Works", angle: "Thought leadership", keyword: "ai content marketing" },
            { title: "30-Day Content Challenge: Results & Lessons", angle: "Story + data", keyword: "content strategy" },
            { title: "Building a Personal Brand That Drives Business Results", angle: "How-to", keyword: "personal branding b2b" },
          ];
      return {
        output: topics,
        preview: `${topics.length} blog ideas — "${topics[0].title}"`,
      };
    }

    case "linkedin_posts": {
      const topics = isLeads
        ? ["lead generation mistakes", "inbound vs outbound in 2026", "content that converts"]
        : ["content systems", "founder marketing", "building in public"];
      const posts: LinkedInPostDraft[] = topics.map((topic) => {
        const post = generateLinkedInPost({
          topic,
          targetAudience: "founders and marketing leaders",
          contentType: "thought-leadership",
        });
        return {
          title: topic,
          hook: post.hook,
          body: post.mainContent,
          cta: post.cta,
        };
      });
      return {
        output: posts,
        preview: posts[0]?.hook.slice(0, 120) ?? "3 LinkedIn posts ready",
      };
    }

    case "images": {
      const prompts = isLeads
        ? ["Lead generation funnel infographic", "B2B growth dashboard", "Marketing team collaboration"]
        : ["Modern SaaS marketing workspace", "Content calendar planning", "Social media growth chart"];
      const styles = ["modern-saas", "corporate", "minimal"];
      const images: ImageAsset[] = prompts.map((prompt, i) => ({
        prompt,
        style: styles[i % styles.length],
        url: `https://ui-avatars.com/api/?name=${encodeURIComponent(prompt.slice(0, 2))}&background=7C3AED&color=fff&size=512&bold=true`,
      }));
      return {
        output: images,
        preview: `${images.length} image concepts generated`,
      };
    }

    case "calendar": {
      const items = generate30DayPlan({
        industry,
        goals: goal,
        platforms: ["linkedin", "wordpress", "newsletter"],
      }).slice(0, 14);
      return {
        output: items,
        preview: `14-day calendar starting ${items[0]?.date ?? "today"}`,
      };
    }

    default:
      throw new Error(`Unknown step: ${stepId}`);
  }
}

export function employeeIntroMessage(goal: string): string {
  return `Got it — your goal is **"${goal}"**. I'm your AI Marketing Manager. I'll build your strategy, content plan, blog ideas, LinkedIn posts, images, and calendar — one step at a time. Review each deliverable and approve to keep me moving. Let's start with your marketing strategy.`;
}

export function employeeStepCompleteMessage(stepId: EmployeeStepId): string {
  const meta = getStepMeta(stepId);
  const next = EMPLOYEE_STEPS[EMPLOYEE_STEPS.findIndex((s) => s.id === stepId) + 1];
  if (!next) {
    return `**${meta.title}** is ready for your review. This is the final step — approve to complete your marketing package.`;
  }
  return `**${meta.title}** is ready. Review below and approve to continue to **${next.title}**, or regenerate if you'd like a different approach.`;
}

export function employeeApprovedMessage(stepId: EmployeeStepId): string {
  const meta = getStepMeta(stepId);
  const next = EMPLOYEE_STEPS[EMPLOYEE_STEPS.findIndex((s) => s.id === stepId) + 1];
  if (!next) {
    return `**${meta.title}** approved. Your full marketing package is complete — strategy through calendar, ready to execute.`;
  }
  return `**${meta.title}** approved. Working on **${next.title}** now…`;
}

export type CalendarPlanItemExport = CalendarPlanItem;
