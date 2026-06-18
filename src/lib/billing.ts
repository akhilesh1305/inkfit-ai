import { PLANS, type SubscriptionPlan } from "@/lib/types";

export interface UsageBreakdown {
  label: string;
  count: number;
  color: string;
}

export interface BillingUsage {
  generationsUsed: number;
  generationsLimit: number | "unlimited";
  creditsRemaining: number | "unlimited";
  percentUsed: number;
  breakdown: UsageBreakdown[];
  resetDate: string;
  warningLevel?: "none" | "approaching" | "critical" | "depleted";
}

export interface BillingSubscription {
  planId: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
}

export interface BillingInvoice {
  id: string;
  stripeInvoiceId?: string;
  amount: number;
  currency: string;
  status: "paid" | "open" | "void" | "draft";
  description: string;
  periodLabel: string;
  createdAt: string;
  pdfUrl?: string;
}

export interface BillingHistoryItem {
  id: string;
  date: string;
  event: string;
  plan: string;
  amount?: number;
}

export interface BillingSummary {
  subscription: BillingSubscription;
  usage: BillingUsage;
  invoices: BillingInvoice[];
  billingHistory: BillingHistoryItem[];
  currentPlan: SubscriptionPlan;
}

export function getPlanById(planId: string): SubscriptionPlan {
  return PLANS.find((p) => p.id === planId) ?? PLANS[0];
}

export function getGenerationLimit(planId: string): number | "unlimited" {
  const plan = getPlanById(planId);
  return plan.generations;
}

export function computeCreditsRemaining(
  used: number,
  limit: number | "unlimited"
): number | "unlimited" {
  if (limit === "unlimited") return "unlimited";
  return Math.max(0, limit - used);
}

export function computePercentUsed(
  used: number,
  limit: number | "unlimited"
): number {
  if (limit === "unlimited") return Math.min(used / 500, 1) * 100;
  return Math.min(100, Math.round((used / limit) * 100));
}

export const STRIPE_PRICE_IDS: Record<string, string> = {
  creator: process.env.STRIPE_PRICE_CREATOR ?? "price_creator_monthly",
  pro: process.env.STRIPE_PRICE_PRO ?? "price_pro_monthly",
  agency: process.env.STRIPE_PRICE_AGENCY ?? "price_agency_monthly",
};

export const DEMO_USAGE_BREAKDOWN: UsageBreakdown[] = [
  { label: "LinkedIn", count: 34, color: "#3B82F6" },
  { label: "Blog", count: 28, color: "#7C3AED" },
  { label: "SEO", count: 22, color: "#10B981" },
  { label: "Carousel", count: 18, color: "#F59E0B" },
  { label: "Other", count: 25, color: "#06B6D4" },
];

export function demoInvoices(planId: string): BillingInvoice[] {
  const plan = getPlanById(planId);
  if (plan.price === 0) return [];

  const now = new Date();
  return [0, 1, 2].map((i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    return {
      id: `inv-demo-${i}`,
      stripeInvoiceId: `in_demo_${planId}_${i}`,
      amount: plan.price,
      currency: "INR",
      status: "paid" as const,
      description: `${plan.name} Plan — ${period}`,
      periodLabel: period,
      createdAt: d.toISOString(),
      pdfUrl: "#",
    };
  });
}

export function demoBillingHistory(planId: string): BillingHistoryItem[] {
  const items: BillingHistoryItem[] = [
    {
      id: "bh-1",
      date: new Date().toISOString(),
      event: "Subscription active",
      plan: getPlanById(planId).name,
    },
  ];
  if (planId !== "free") {
    items.push({
      id: "bh-2",
      date: new Date(Date.now() - 30 * 86400000).toISOString(),
      event: "Plan upgraded",
      plan: getPlanById(planId).name,
      amount: getPlanById(planId).price,
    });
  }
  return items;
}

export function formatPrice(amount: number, currency = "INR"): string {
  if (amount === 0) return "Free";
  return `₹${amount.toLocaleString("en-IN")}`;
}
