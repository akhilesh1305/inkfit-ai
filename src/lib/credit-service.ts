import { prisma } from "@/lib/prisma";
import {
  buildCreditSummary,
  countToCredits,
  CREDIT_COSTS,
  getMonthKey,
  type CreditActionType,
  type CreditSummary,
  type CreditUsageFields,
  DEMO_CREDIT_FIELDS,
} from "@/lib/credits";

const FIELD_MAP: Record<CreditActionType, keyof CreditUsageFields> = {
  content_generation: "contentGeneration",
  ai_image: "aiImage",
  seo_article: "seoArticle",
  marketing_plan: "marketingPlan",
  agent_request: "agentRequest",
};

function emptyFields(): CreditUsageFields {
  return {
    contentGeneration: 0,
    aiImage: 0,
    seoArticle: 0,
    marketingPlan: 0,
    agentRequest: 0,
  };
}

function mapRow(row: {
  contentGeneration: number;
  aiImage: number;
  seoArticle: number;
  marketingPlan: number;
  agentRequest: number;
}): CreditUsageFields {
  return {
    contentGeneration: row.contentGeneration,
    aiImage: row.aiImage,
    seoArticle: row.seoArticle,
    marketingPlan: row.marketingPlan,
    agentRequest: row.agentRequest,
  };
}

async function getOrCreateBalance(userId: string, month: string) {
  const existing = await prisma.creditUsage.findUnique({
    where: { userId_month: { userId, month } },
  });
  if (existing) return existing;

  const isFirstMonth = (await prisma.creditUsage.count({ where: { userId } })) === 0;
  const seed = isFirstMonth ? DEMO_CREDIT_FIELDS : emptyFields();

  return prisma.creditUsage.create({
    data: {
      userId,
      month,
      ...seed,
    },
  });
}

export async function getCreditSummaryForUser(
  userId: string,
  planId: string,
  planName: string
): Promise<CreditSummary> {
  try {
    const month = getMonthKey();
    const row = await getOrCreateBalance(userId, month);
    return buildCreditSummary(planId, planName, mapRow(row));
  } catch {
    return buildCreditSummary(planId, planName, DEMO_CREDIT_FIELDS);
  }
}

export interface ConsumeResult {
  ok: boolean;
  error?: string;
  summary?: CreditSummary;
}

export async function consumeCredits(
  userId: string,
  planId: string,
  planName: string,
  action: CreditActionType,
  quantity = 1
): Promise<ConsumeResult> {
  const limit = (await import("@/lib/credits")).getCreditLimit(planId);
  const cost = CREDIT_COSTS[action] * quantity;

  if (limit !== "unlimited") {
    const summary = await getCreditSummaryForUser(userId, planId, planName);
    const remaining =
      summary.creditsRemaining === "unlimited" ? Infinity : summary.creditsRemaining;
    if (remaining < cost) {
      return {
        ok: false,
        error: `Insufficient credits. This action requires ${cost} credits; you have ${remaining} remaining.`,
        summary,
      };
    }
  }

  const month = getMonthKey();
  const field = FIELD_MAP[action];

  await getOrCreateBalance(userId, month);
  await prisma.creditUsage.update({
    where: { userId_month: { userId, month } },
    data: { [field]: { increment: quantity } },
  });

  const summary = await getCreditSummaryForUser(userId, planId, planName);
  return { ok: true, summary };
}

export async function requireCredits(
  userId: string,
  planId: string,
  planName: string,
  action: CreditActionType,
  quantity = 1
): Promise<ConsumeResult> {
  return consumeCredits(userId, planId, planName, action, quantity);
}

export function fieldsToLegacyGenerations(fields: CreditUsageFields): number {
  return countToCredits(fields);
}
