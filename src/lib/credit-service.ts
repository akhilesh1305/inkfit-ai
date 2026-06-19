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
  bonusCredits?: number;
}): CreditUsageFields {
  return {
    contentGeneration: row.contentGeneration,
    aiImage: row.aiImage,
    seoArticle: row.seoArticle,
    marketingPlan: row.marketingPlan,
    agentRequest: row.agentRequest,
  };
}

function rowBonus(row: { bonusCredits?: number }): number {
  return row.bonusCredits ?? 0;
}

async function getOrCreateBalance(userId: string, month: string) {
  const existing = await prisma.creditUsage.findUnique({
    where: { userId_month: { userId, month } },
  });
  if (existing) return existing;

  const isFirstMonth = (await prisma.creditUsage.count({ where: { userId } })) === 0;
  const seed =
    isFirstMonth && process.env.NODE_ENV !== "production"
      ? DEMO_CREDIT_FIELDS
      : emptyFields();

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
    return buildCreditSummary(planId, planName, mapRow(row), rowBonus(row));
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
  const check = await checkCredits(userId, planId, planName, action, quantity);
  if (!check.ok) return check;

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

/** Validate credits without deducting. */
export async function checkCredits(
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

  return { ok: true, summary: await getCreditSummaryForUser(userId, planId, planName) };
}

/** Reverse a charge after a failed generation (best-effort). */
export async function refundCredits(
  userId: string,
  action: CreditActionType,
  quantity = 1
): Promise<void> {
  const month = getMonthKey();
  const field = FIELD_MAP[action];
  const row = await prisma.creditUsage.findUnique({
    where: { userId_month: { userId, month } },
  });
  if (!row) return;

  const current = row[field] as number;
  if (current <= 0) return;

  await prisma.creditUsage.update({
    where: { userId_month: { userId, month } },
    data: { [field]: { decrement: Math.min(quantity, current) } },
  });
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

/** Add purchased bonus credits for the current billing month. */
export async function applyCreditPackBonus(
  userId: string,
  credits: number
): Promise<void> {
  if (credits <= 0) return;
  const month = getMonthKey();
  await getOrCreateBalance(userId, month);
  await prisma.creditUsage.update({
    where: { userId_month: { userId, month } },
    data: { bonusCredits: { increment: credits } },
  });
}

export function fieldsToLegacyGenerations(fields: CreditUsageFields): number {
  return countToCredits(fields);
}
