export type BillingType = "individual" | "team" | "agency";

export interface PlanLimits {
  credits: number | "unlimited";
  seats: number;
  clients: number | "unlimited";
  billingType: BillingType;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: { credits: 100, seats: 1, clients: 1, billingType: "individual" },
  creator: { credits: 2000, seats: 1, clients: 3, billingType: "individual" },
  pro: { credits: 10000, seats: 3, clients: 10, billingType: "team" },
  agency: { credits: "unlimited", seats: 10, clients: "unlimited", billingType: "agency" },
};

export function getPlanLimits(planId: string): PlanLimits {
  return PLAN_LIMITS[planId] ?? PLAN_LIMITS.free;
}

export function planIdFromStripePrice(priceId: string): string | null {
  const map: Record<string, string> = {
    [process.env.STRIPE_PRICE_CREATOR ?? "price_creator_monthly"]: "creator",
    [process.env.STRIPE_PRICE_PRO ?? "price_pro_monthly"]: "pro",
    [process.env.STRIPE_PRICE_AGENCY ?? "price_agency_monthly"]: "agency",
  };
  return map[priceId] ?? null;
}

export function isPaidPlan(planId: string): boolean {
  return planId !== "free";
}

export function recommendedUpgrade(planId: string): string | null {
  if (planId === "free") return "creator";
  if (planId === "creator") return "pro";
  if (planId === "pro") return "agency";
  return null;
}
