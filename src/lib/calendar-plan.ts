import { addDays, format } from "date-fns";

export const CALENDAR_PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", color: "#0A66C2" },
  { id: "instagram", name: "Instagram", color: "#E4405F" },
  { id: "facebook", name: "Facebook", color: "#1877F2" },
  { id: "twitter", name: "X (Twitter)", color: "#E7E9EA" },
  { id: "wordpress", name: "WordPress", color: "#21759B" },
  { id: "newsletter", name: "Newsletter", color: "#7C3AED" },
] as const;

export type CalendarPlatformId = (typeof CALENDAR_PLATFORMS)[number]["id"];

export const PLAN_CONTENT_TYPES = [
  { id: "thought-leadership", label: "Thought Leadership" },
  { id: "educational", label: "Educational" },
  { id: "story", label: "Story Post" },
  { id: "carousel", label: "Carousel" },
  { id: "blog", label: "Blog Article" },
  { id: "thread", label: "Thread" },
  { id: "reel", label: "Short Video" },
  { id: "case-study", label: "Case Study" },
] as const;

export type PlanContentTypeId = (typeof PLAN_CONTENT_TYPES)[number]["id"];

export type PlanItemStatus = "draft" | "scheduled" | "in-progress" | "published";

export interface CalendarPlanItem {
  id: string;
  date: string;
  topic: string;
  contentType: PlanContentTypeId;
  status: PlanItemStatus;
  platformId: CalendarPlatformId;
}

export interface GeneratePlanRequest {
  industry: string;
  goals: string;
  platforms: CalendarPlatformId[];
}

const TOPIC_TEMPLATES: Record<PlanContentTypeId, string[]> = {
  "thought-leadership": [
    "Why {industry} needs a new playbook in 2026",
    "The unpopular truth about {goal}",
    "What top performers in {industry} do differently",
    "3 myths holding back {industry} leaders",
    "My prediction for {industry} this quarter",
  ],
  educational: [
    "5-step framework for {goal}",
    "How to master {industry} basics in 30 minutes",
    "Beginner's guide to {goal}",
    "Common mistakes in {industry} (and fixes)",
    "Checklist: {goal} done right",
  ],
  story: [
    "The project that changed how I see {industry}",
    "I failed at {goal} — here's what I learned",
    "From zero to results: my {industry} journey",
    "A client story that proves {goal} works",
    "The conversation that shifted my {industry} strategy",
  ],
  carousel: [
    "10 stats every {industry} pro should know",
    "Swipe: {goal} in 7 slides",
    "Before vs after: {industry} transformation",
    "Tool stack for {goal}",
    "Weekly wins in {industry}",
  ],
  blog: [
    "Ultimate guide to {goal} in {industry}",
    "Deep dive: trends shaping {industry}",
    "How we achieved {goal} (with data)",
    "{industry} playbook for Q2",
    "SEO pillar: everything about {goal}",
  ],
  thread: [
    "Thread: {goal} breakdown",
    "7 tweets on {industry} lessons learned",
    "Hot take thread: {goal}",
    "Step-by-step {industry} thread",
    "Resources thread for {goal}",
  ],
  reel: [
    "60-sec tip: {goal}",
    "Behind the scenes in {industry}",
    "Quick win: {goal} hack",
    "Day in the life: {industry} creator",
    "Trend reaction: {industry} news",
  ],
  "case-study": [
    "Case study: {goal} results",
    "How [Client] crushed {industry} goals",
    "ROI breakdown: {goal} campaign",
    "Before/after: {industry} case study",
    "Numbers don't lie: {goal} wins",
  ],
};

const GOAL_SNIPPETS = [
  "brand awareness",
  "lead generation",
  "thought leadership",
  "community growth",
  "product launches",
  "engagement",
];

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

function interpolate(template: string, industry: string, goal: string): string {
  return template.replace(/\{industry\}/g, industry).replace(/\{goal\}/g, goal);
}

function statusForDay(dayIndex: number): PlanItemStatus {
  if (dayIndex < 2) return "in-progress";
  if (dayIndex < 7) return "scheduled";
  if (dayIndex % 11 === 0) return "published";
  return dayIndex % 3 === 0 ? "scheduled" : "draft";
}

function contentTypeForPlatform(
  platformId: CalendarPlatformId,
  dayIndex: number
): PlanContentTypeId {
  const byPlatform: Record<CalendarPlatformId, PlanContentTypeId[]> = {
    linkedin: ["thought-leadership", "story", "carousel", "educational", "case-study"],
    instagram: ["reel", "carousel", "story", "educational"],
    facebook: ["educational", "story", "blog", "carousel"],
    twitter: ["thread", "thought-leadership", "educational", "story"],
    wordpress: ["blog", "case-study", "educational"],
    newsletter: ["educational", "story", "blog", "thought-leadership"],
  };
  const types = byPlatform[platformId];
  return pick(types, dayIndex);
}

export function generate30DayPlan(req: GeneratePlanRequest): CalendarPlanItem[] {
  const industry = req.industry.trim() || "your industry";
  const goalText = req.goals.trim() || "grow your audience";
  const goalSnippet = goalText.split(/[,.]/)[0]?.trim().slice(0, 40) || pick(GOAL_SNIPPETS, 0);
  const platforms =
    req.platforms.length > 0 ? req.platforms : (["linkedin"] as CalendarPlatformId[]);

  const start = new Date();
  const items: CalendarPlanItem[] = [];

  for (let i = 0; i < 30; i++) {
    const platformId = pick(platforms, i);
    const contentType = contentTypeForPlatform(platformId, i);
    const templates = TOPIC_TEMPLATES[contentType];
    const topic = interpolate(pick(templates, i), industry, goalSnippet);

    items.push({
      id: `plan-${Date.now()}-${i}`,
      date: format(addDays(start, i), "yyyy-MM-dd"),
      topic,
      contentType,
      status: statusForDay(i),
      platformId,
    });
  }

  return items;
}

export function getContentTypeLabel(id: PlanContentTypeId): string {
  return PLAN_CONTENT_TYPES.find((t) => t.id === id)?.label ?? id;
}

export function getPlatformById(id: CalendarPlatformId) {
  return CALENDAR_PLATFORMS.find((p) => p.id === id)!;
}

export const STATUS_CONFIG: Record<
  PlanItemStatus,
  { label: string; className: string; dot: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-white/10 text-content-muted border-white/10",
    dot: "bg-content-subtle",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    dot: "bg-amber-400",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-brand-500/15 text-brand-300 border-brand-500/25",
    dot: "bg-brand-400",
  },
  published: {
    label: "Published",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    dot: "bg-emerald-400",
  },
};

export const STORAGE_KEY = "inkfit-calendar-plan";
