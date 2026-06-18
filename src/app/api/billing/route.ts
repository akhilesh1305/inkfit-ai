import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getPlanById,
  getGenerationLimit,
  computeCreditsRemaining,
  computePercentUsed,
  DEMO_USAGE_BREAKDOWN,
  demoInvoices,
  demoBillingHistory,
  type BillingSummary,
} from "@/lib/billing";
import { createCheckoutSession } from "@/lib/stripe";
import { getRequestOrigin } from "@/lib/site";

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function getOrCreateSubscription(userId: string, planId: string) {
  let sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) {
    sub = await prisma.subscription.create({
      data: { userId, planId },
    });
  }
  return sub;
}

async function getUsage(planId: string) {
  const month = currentMonthKey();
  let usage = await prisma.usage.findUnique({ where: { month } });
  if (!usage) {
    usage = await prisma.usage.create({
      data: { month, generations: 127, plan: planId },
    });
  }
  const limit = getGenerationLimit(planId);
  const used = usage.generations;
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1, 1);

  return {
    generationsUsed: used,
    generationsLimit: limit,
    creditsRemaining: computeCreditsRemaining(used, limit),
    percentUsed: computePercentUsed(used, limit),
    breakdown: DEMO_USAGE_BREAKDOWN,
    resetDate: nextMonth.toISOString(),
  };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    const planId = user?.plan ?? session.plan ?? "free";
    const sub = await getOrCreateSubscription(session.id, planId);
    const usage = await getUsage(planId);

    const dbInvoices = await prisma.invoice.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    const invoices =
      dbInvoices.length > 0
        ? dbInvoices.map((inv) => ({
            id: inv.id,
            stripeInvoiceId: inv.stripeInvoiceId ?? undefined,
            amount: inv.amount,
            currency: inv.currency,
            status: inv.status as "paid" | "open" | "void" | "draft",
            description: inv.description ?? `${inv.periodLabel} subscription`,
            periodLabel: inv.periodLabel,
            createdAt: inv.createdAt.toISOString(),
            pdfUrl: inv.pdfUrl ?? undefined,
          }))
        : demoInvoices(planId);

    const summary: BillingSummary = {
      subscription: {
        planId: sub.planId,
        status: sub.status as BillingSummary["subscription"]["status"],
        stripeCustomerId: sub.stripeCustomerId ?? undefined,
        stripeSubscriptionId: sub.stripeSubscriptionId ?? undefined,
        currentPeriodEnd: sub.currentPeriodEnd?.toISOString(),
      },
      usage,
      invoices,
      billingHistory: demoBillingHistory(planId),
      currentPlan: getPlanById(planId),
    };

    return NextResponse.json(summary);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "checkout") {
      const planId = body.planId as string;
      if (!["creator", "pro", "agency"].includes(planId)) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }

      const origin = getRequestOrigin(req);
      const result = await createCheckoutSession(
        planId,
        session.id,
        session.email,
        `${origin}/dashboard/billing?success=1`,
        `${origin}/dashboard/billing?canceled=1`
      );

      if (result.mode === "stripe" && result.url) {
        return NextResponse.json({ checkoutUrl: result.url });
      }

      // Demo mode: apply plan immediately
      await prisma.user.update({
        where: { id: session.id },
        data: { plan: planId },
      });
      await prisma.subscription.upsert({
        where: { userId: session.id },
        create: {
          userId: session.id,
          planId,
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
        },
        update: {
          planId,
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
        },
      });

      const plan = getPlanById(planId);
      await prisma.invoice.create({
        data: {
          userId: session.id,
          amount: plan.price,
          currency: "INR",
          status: "paid",
          description: `${plan.name} Plan subscription`,
          periodLabel: new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
        },
      });

      return NextResponse.json({ success: true, planId, mode: "demo" });
    }

    if (body.action === "downgrade" && body.planId === "free") {
      await prisma.user.update({
        where: { id: session.id },
        data: { plan: "free" },
      });
      await prisma.subscription.update({
        where: { userId: session.id },
        data: { planId: "free", status: "active" },
      });
      return NextResponse.json({ success: true, planId: "free" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
