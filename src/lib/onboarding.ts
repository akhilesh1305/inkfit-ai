import type { WritingStyleId } from "@/lib/brand-voice";

export type CompanySize = "1-10" | "11-50" | "51-200" | "201-1000" | "1000+";

export type AudienceType = "b2b" | "b2c" | "both" | "internal";

export type ContentGoalId =
  | "brand-awareness"
  | "lead-generation"
  | "seo-growth"
  | "personal-branding"
  | "social-growth";

export type OnboardingBrandVoice = WritingStyleId;

export interface OnboardingFormData {
  businessName: string;
  websiteUrl: string;
  industry: string;
  companySize: CompanySize | "";
  audienceType: AudienceType | "";
  goals: string;
  mainChallenges: string;
  contentGoals: ContentGoalId[];
  brandVoice: OnboardingBrandVoice;
}

export interface ContentPillar {
  title: string;
  description: string;
}

export interface CalendarItem {
  day: string;
  title: string;
  type: string;
  platform: string;
}

export interface GeneratedOnboardingProfile {
  contentPillars: ContentPillar[];
  brandVoiceSummary: {
    tone: string;
    vocabulary: string;
    writingPatterns: string;
    audienceStyle: string;
  };
  suggestedStrategy: string;
  initialCalendar: CalendarItem[];
}

export interface OnboardingState extends OnboardingFormData {
  completed: boolean;
  generated: GeneratedOnboardingProfile | null;
}

export const ONBOARDING_STEPS = [
  { id: 1, title: "Business", subtitle: "Tell us about your company" },
  { id: 2, title: "Audience", subtitle: "Who you serve" },
  { id: 3, title: "Goals", subtitle: "What you want to achieve" },
  { id: 4, title: "Voice", subtitle: "How you sound" },
  { id: 5, title: "Profile", subtitle: "Your AI brand kit" },
] as const;

export const COMPANY_SIZES: { id: CompanySize; label: string }[] = [
  { id: "1-10", label: "1–10 employees" },
  { id: "11-50", label: "11–50 employees" },
  { id: "51-200", label: "51–200 employees" },
  { id: "201-1000", label: "201–1,000 employees" },
  { id: "1000+", label: "1,000+ employees" },
];

export const AUDIENCE_TYPES: { id: AudienceType; label: string; description: string }[] = [
  { id: "b2b", label: "B2B", description: "Businesses & decision-makers" },
  { id: "b2c", label: "B2C", description: "Consumers & end users" },
  { id: "both", label: "Both", description: "Mixed B2B and B2C" },
  { id: "internal", label: "Internal", description: "Employees & stakeholders" },
];

export const CONTENT_GOALS: {
  id: ContentGoalId;
  label: string;
  description: string;
}[] = [
  {
    id: "brand-awareness",
    label: "Brand Awareness",
    description: "Grow recognition and trust in your market",
  },
  {
    id: "lead-generation",
    label: "Lead Generation",
    description: "Capture and nurture qualified prospects",
  },
  {
    id: "seo-growth",
    label: "SEO Growth",
    description: "Rank higher and drive organic traffic",
  },
  {
    id: "personal-branding",
    label: "Personal Branding",
    description: "Build authority as a founder or expert",
  },
  {
    id: "social-growth",
    label: "Social Media Growth",
    description: "Expand reach on LinkedIn, Instagram, and more",
  },
];

export const BRAND_VOICE_OPTIONS: {
  id: OnboardingBrandVoice;
  label: string;
  description: string;
}[] = [
  { id: "professional", label: "Professional", description: "Clear, credible, business-appropriate" },
  { id: "casual", label: "Casual", description: "Relaxed, direct, easy-going" },
  { id: "friendly", label: "Friendly", description: "Warm, approachable, conversational" },
  { id: "technical", label: "Technical", description: "Precise, expert-led, detailed" },
  { id: "luxury", label: "Luxury", description: "Refined, premium, aspirational" },
];

export const DEFAULT_ONBOARDING_FORM: OnboardingFormData = {
  businessName: "",
  websiteUrl: "",
  industry: "",
  companySize: "",
  audienceType: "",
  goals: "",
  mainChallenges: "",
  contentGoals: [],
  brandVoice: "professional",
};

const VOICE_TONE: Record<OnboardingBrandVoice, string> = {
  professional: "Authoritative yet accessible — confident, clear, and credibility-focused.",
  casual: "Relaxed and conversational — short sentences and authentic peer-to-peer tone.",
  friendly: "Warm and inclusive — encouraging, helpful, mentor-like presence.",
  technical: "Expert and precise — structured, evidence-backed, domain-specific.",
  luxury: "Sophisticated and aspirational — refined vocabulary and premium positioning.",
  creative: "Bold and expressive — vivid language with distinctive rhythm.",
};

export function generateOnboardingProfile(
  form: OnboardingFormData
): GeneratedOnboardingProfile {
  const name = form.businessName.trim() || "Your Brand";
  const ind = form.industry.trim() || "your industry";
  const goalsText = form.goals.trim() || "grow your business";
  const challenges = form.mainChallenges.trim() || "standing out in a crowded market";
  const goalLabels = form.contentGoals
    .map((g) => CONTENT_GOALS.find((c) => c.id === g)?.label)
    .filter(Boolean)
    .join(", ");

  const contentPillars: ContentPillar[] = [
    {
      title: "Education & How-To",
      description: `Actionable ${ind} insights that help your audience solve real problems.`,
    },
    {
      title: "Thought Leadership",
      description: `Bold perspectives on trends shaping ${ind} — position ${name} as the expert.`,
    },
    {
      title: "Social Proof & Stories",
      description: "Customer wins, case studies, and behind-the-scenes authenticity.",
    },
    {
      title: form.contentGoals.includes("lead-generation")
        ? "Conversion Content"
        : "Community & Engagement",
      description: form.contentGoals.includes("lead-generation")
        ? "Lead magnets, demos, and CTAs that move prospects to action."
        : "Questions, polls, and conversations that build loyal followers.",
    },
  ];

  const brandVoiceSummary = {
    tone: VOICE_TONE[form.brandVoice],
    vocabulary: `Use ${form.brandVoice} language aligned with ${ind}. Focus on outcomes ${form.audienceType === "b2b" ? "decision-makers" : "your audience"} care about.`,
    writingPatterns: `Structured hooks, scannable sections, and clear CTAs. Optimized for ${goalLabels || "multi-channel content"}.`,
    audienceStyle: `Tailored for ${form.audienceType.toUpperCase()} audiences pursuing: ${goalsText}. Address challenges: ${challenges}.`,
  };

  const suggestedStrategy = `## 90-Day Content Strategy for ${name}

### Positioning
${name} in ${ind} (${form.companySize || "growing"} team) targets ${form.audienceType} audiences with a **${form.brandVoice}** voice.

### Primary objectives
${goalLabels ? goalLabels.split(", ").map((g) => `- ${g}`).join("\n") : "- Build consistent content presence"}

### Channel mix
- **LinkedIn** — thought leadership & B2B reach
- **Blog/SEO** — long-form authority content
- **Social** — short-form hooks and engagement
${form.contentGoals.includes("lead-generation") ? "- **Email** — nurture sequences from content CTAs" : ""}

### Weekly rhythm
- 3× social posts (Mon / Wed / Fri)
- 1× long-form piece (blog or newsletter)
- 1× engagement block (comments + community)

### Key challenges to address
${challenges}`;

  const calendarTypes = ["LinkedIn post", "Blog draft", "Social post", "Newsletter", "Carousel"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const initialCalendar: CalendarItem[] = days.map((day, i) => ({
    day,
    title: `${contentPillars[i % contentPillars.length].title} — ${name}`,
    type: calendarTypes[i % calendarTypes.length],
    platform: i % 2 === 0 ? "LinkedIn" : "Blog",
  }));

  return {
    contentPillars,
    brandVoiceSummary,
    suggestedStrategy,
    initialCalendar,
  };
}

export function parseOnboardingForm(json: string | null | undefined): Partial<OnboardingFormData> {
  if (!json) return {};
  try {
    return JSON.parse(json) as Partial<OnboardingFormData>;
  } catch {
    return {};
  }
}

export function parseGeneratedProfile(json: string | null | undefined): GeneratedOnboardingProfile | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as GeneratedOnboardingProfile;
  } catch {
    return null;
  }
}
