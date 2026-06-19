export type CreditActionType =
  | "content_generation"
  | "ai_image"
  | "seo_article"
  | "marketing_plan"
  | "agent_request";

import { getPlanLimits } from "@/lib/billing-plans";

export type CreditWarningLevel = "none" | "approaching" | "critical" | "depleted";

export interface CreditCategoryMeta {
  id: CreditActionType;
  label: string;
  description: string;
  cost: number;
  color: string;
}

export interface CreditBreakdownItem {
  id: CreditActionType;
  label: string;
  count: number;
  credits: number;
  color: string;
}

export interface CreditSummary {
  planId: string;
  planName: string;
  creditsUsed: number;
  creditsLimit: number | "unlimited";
  creditsRemaining: number | "unlimited";
  percentUsed: number;
  warningLevel: CreditWarningLevel;
  resetDate: string;
  breakdown: CreditBreakdownItem[];
  isUnlimited: boolean;
  bonusCredits?: number;
}

export const CREDIT_CATEGORIES: CreditCategoryMeta[] = [
  {
    id: "content_generation",
    label: "Content Generations",
    description: "Blog, LinkedIn, social, video scripts, landing pages",
    cost: 1,
    color: "#7C3AED",
  },
  {
    id: "ai_image",
    label: "AI Images",
    description: "Image Studio generations",
    cost: 5,
    color: "#EC4899",
  },
  {
    id: "seo_article",
    label: "SEO Articles",
    description: "SEO writer and keyword research",
    cost: 3,
    color: "#10B981",
  },
  {
    id: "marketing_plan",
    label: "Marketing Plans",
    description: "Marketing OS and strategy generation",
    cost: 10,
    color: "#3B82F6",
  },
  {
    id: "agent_request",
    label: "Agent Requests",
    description: "Content Agent conversations",
    cost: 2,
    color: "#06B6D4",
  },
];

export const CREDIT_COSTS: Record<CreditActionType, number> = Object.fromEntries(
  CREDIT_CATEGORIES.map((c) => [c.id, c.cost])
) as Record<CreditActionType, number>;

const FIELD_MAP: Record<CreditActionType, keyof CreditUsageFields> = {
  content_generation: "contentGeneration",
  ai_image: "aiImage",
  seo_article: "seoArticle",
  marketing_plan: "marketingPlan",
  agent_request: "agentRequest",
};

export interface CreditUsageFields {
  contentGeneration: number;
  aiImage: number;
  seoArticle: number;
  marketingPlan: number;
  agentRequest: number;
}

export function getMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthlyResetDate(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

export function getCreditLimit(planId: string): number | "unlimited" {
  return getPlanLimits(planId).credits;
}

export function countToCredits(fields: CreditUsageFields): number {
  return CREDIT_CATEGORIES.reduce((sum, cat) => {
    const count = fields[FIELD_MAP[cat.id]];
    return sum + count * cat.cost;
  }, 0);
}

export function buildBreakdown(fields: CreditUsageFields): CreditBreakdownItem[] {
  return CREDIT_CATEGORIES.map((cat) => {
    const count = fields[FIELD_MAP[cat.id]];
    return {
      id: cat.id,
      label: cat.label,
      count,
      credits: count * cat.cost,
      color: cat.color,
    };
  }).filter((b) => b.count > 0);
}

export function computePercentUsed(
  used: number,
  limit: number | "unlimited"
): number {
  if (limit === "unlimited") return Math.min(100, Math.round((used / 10000) * 100));
  if (limit === 0) return 100;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function computeCreditsRemaining(
  used: number,
  limit: number | "unlimited"
): number | "unlimited" {
  if (limit === "unlimited") return "unlimited";
  return Math.max(0, limit - used);
}

export function getWarningLevel(
  percentUsed: number,
  isUnlimited: boolean
): CreditWarningLevel {
  if (isUnlimited) return "none";
  if (percentUsed >= 100) return "depleted";
  if (percentUsed >= 90) return "critical";
  if (percentUsed >= 80) return "approaching";
  return "none";
}

export const WARNING_META: Record<
  Exclude<CreditWarningLevel, "none">,
  { title: string; message: string; color: string; bg: string; border: string }
> = {
  approaching: {
    title: "80% of credits used",
    message: "You're approaching your monthly limit. Consider upgrading for more capacity.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
  },
  critical: {
    title: "90% of credits used",
    message: "Almost at your limit — upgrade now to avoid interruptions.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/25",
  },
  depleted: {
    title: "Credits exhausted",
    message: "You've used all monthly credits. Upgrade your plan or wait until reset.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
  },
};

export function creditsRemainingWithBonus(
  creditsUsed: number,
  limit: number | "unlimited",
  bonusCredits = 0
): number | "unlimited" {
  if (limit === "unlimited") return "unlimited";
  return Math.max(0, limit - creditsUsed + bonusCredits);
}

export function buildCreditSummary(
  planId: string,
  planName: string,
  fields: CreditUsageFields,
  bonusCredits = 0
): CreditSummary {
  const limit = getCreditLimit(planId);
  const isUnlimited = limit === "unlimited";
  const creditsUsed = countToCredits(fields);
  const percentUsed = computePercentUsed(creditsUsed, limit);

  return {
    planId,
    planName,
    creditsUsed,
    creditsLimit: limit,
    creditsRemaining: creditsRemainingWithBonus(creditsUsed, limit, bonusCredits),
    percentUsed,
    warningLevel: getWarningLevel(percentUsed, isUnlimited),
    resetDate: getMonthlyResetDate().toISOString(),
    breakdown: buildBreakdown(fields),
    isUnlimited,
    bonusCredits,
  };
}

export function formatCredits(n: number | "unlimited"): string {
  if (n === "unlimited") return "∞";
  return n.toLocaleString();
}

export const DEMO_CREDIT_FIELDS: CreditUsageFields = {
  contentGeneration: 42,
  aiImage: 8,
  seoArticle: 6,
  marketingPlan: 2,
  agentRequest: 15,
};
