import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import {
  getPlanById,
  demoInvoices,
  type BillingSummary,
} from "@/lib/billing";
import { getCreditSummaryForUser } from "@/lib/credit-service";
import {
  applyDemoCheckout,
  getBillingHistory,
  getOrCreateSubscription,
  getTeamBillingSummary,
  recordBillingEvent,
  resolveBillingContext,
} from "@/lib/billing-service";
import {
  createBillingPortalSession,
  createCheckoutSession,
  createCreditPackCheckoutSession,
  isStripeConfigured,
} from "@/lib/stripe";
import { isDemoBillingAllowed } from "@/lib/billing-demo";
import { getRequestOrigin } from "@/lib/site";
import { billingPostSchema } from "@/lib/api-schemas";
import { CREDIT_PACK } from "@/lib/billing";
import { applyCreditPackBonus } from "@/lib/credit-service";

async function getUsage(billingUserId: string, planId: string) {
  const plan = getPlanById(planId);
  const creditSummary = await getCreditSummaryForUser(billingUserId, planId, plan.name);

  return {
    generationsUsed: creditSummary.creditsUsed,
    generationsLimit: creditSummary.creditsLimit,
    creditsRemaining: creditSummary.creditsRemaining,
    percentUsed: creditSummary.percentUsed,
    breakdown: creditSummary.breakdown.map((b) => ({
      label: b.label,
      count: b.credits,
      color: b.color,
    })),
    resetDate: creditSummary.resetDate,
    warningLevel: creditSummary.warningLevel,
  };
}

export async function GET() {
  try {
    const auth = await requirePermission("platform:billing");
    if (!auth.ok) return auth.response;

    const ctx = await resolveBillingContext(auth.ctx.user.id);
    const sub = await getOrCreateSubscription(ctx.billingUserId, ctx.planId);
    const usage = await getUsage(ctx.billingUserId, ctx.planId);

    const dbInvoices = await prisma.invoice.findMany({
      where: { userId: ctx.billingUserId },
      orderBy: { createdAt: "desc" },
      take: 24,
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
        : demoInvoices(ctx.planId);

    const billingHistory = await getBillingHistory(ctx.billingUserId);
    const teamBilling = await getTeamBillingSummary(ctx.billingUserId);

    const summary: BillingSummary = {
      subscription: {
        planId: sub.planId,
        status: sub.status as BillingSummary["subscription"]["status"],
        billingType: (sub.billingType as BillingSummary["subscription"]["billingType"]) ?? ctx.billingType,
        seatLimit: sub.seatLimit,
        seatsUsed: teamBilling.seatsUsed,
        clientLimit: teamBilling.clientLimit,
        stripeCustomerId: sub.stripeCustomerId ?? undefined,
        stripeSubscriptionId: sub.stripeSubscriptionId ?? undefined,
        currentPeriodEnd: sub.currentPeriodEnd?.toISOString(),
        stripeEnabled: isStripeConfigured(),
      },
      usage,
      invoices,
      billingHistory:
        billingHistory.length > 0
          ? billingHistory
          : (await import("@/lib/billing")).demoBillingHistory(ctx.planId),
      currentPlan: getPlanById(ctx.planId),
      teamBilling,
    };

    return NextResponse.json(summary);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requirePermission("platform:billing");
    if (!auth.ok) return auth.response;

    const ctx = await resolveBillingContext(auth.ctx.user.id);
    if (!ctx.isBillingOwner) {
      return NextResponse.json(
        { error: "Only the billing account owner can manage subscriptions" },
        { status: 403 }
      );
    }

    const raw = await req.json();
    const parsed = billingPostSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;
    const origin = getRequestOrigin(req);

    if (body.action === "portal") {
      const sub = await getOrCreateSubscription(ctx.billingUserId);
      if (!sub.stripeCustomerId) {
        return NextResponse.json({ error: "No Stripe customer on file" }, { status: 400 });
      }
      const url = await createBillingPortalSession(
        sub.stripeCustomerId,
        `${origin}/dashboard/billing`
      );
      if (!url) {
        return NextResponse.json({ error: "Billing portal unavailable" }, { status: 503 });
      }
      return NextResponse.json({ portalUrl: url });
    }

    if (body.action === "checkout") {
      const planId = body.planId;

      const sub = await getOrCreateSubscription(ctx.billingUserId);
      const result = await createCheckoutSession(
        planId,
        ctx.billingUserId,
        auth.ctx.user.email,
        `${origin}/dashboard/billing?success=1`,
        `${origin}/dashboard/billing?canceled=1`,
        sub.stripeCustomerId
      );

      if (result.mode === "stripe" && result.url) {
        return NextResponse.json({ checkoutUrl: result.url, mode: "stripe" });
      }

      if (!isDemoBillingAllowed()) {
        return NextResponse.json(
          {
            error:
              "Live billing is not configured. Set STRIPE_SECRET_KEY or contact support.",
          },
          { status: 503 }
        );
      }

      await applyDemoCheckout(ctx.billingUserId, planId);
      return NextResponse.json({ success: true, planId, mode: "demo" });
    }

    if (body.action === "buy_credits") {
      const sub = await getOrCreateSubscription(ctx.billingUserId);
      const result = await createCreditPackCheckoutSession(
        ctx.billingUserId,
        auth.ctx.user.email,
        `${origin}/dashboard/billing?credits=1`,
        `${origin}/dashboard/billing?canceled=1`,
        sub.stripeCustomerId
      );

      if (result.mode === "stripe" && result.url) {
        return NextResponse.json({
          checkoutUrl: result.url,
          mode: "stripe",
          credits: result.credits,
        });
      }

      if (!isDemoBillingAllowed()) {
        return NextResponse.json(
          {
            error:
              "Live billing is not configured. Set STRIPE_SECRET_KEY or contact support.",
          },
          { status: 503 }
        );
      }

      await applyCreditPackBonus(ctx.billingUserId, CREDIT_PACK.credits);
      await recordBillingEvent(ctx.billingUserId, "credit_pack_purchased", {
        amount: CREDIT_PACK.priceInr,
        metadata: { credits: CREDIT_PACK.credits, mode: "demo" },
      });

      return NextResponse.json({
        success: true,
        mode: "demo",
        credits: CREDIT_PACK.credits,
      });
    }

    if (body.action === "downgrade" && body.planId === "free") {
      const sub = await getOrCreateSubscription(ctx.billingUserId);
      if (sub.stripeSubscriptionId && isStripeConfigured()) {
        const { cancelStripeSubscription } = await import("@/lib/stripe");
        await cancelStripeSubscription(sub.stripeSubscriptionId);
      }

      const { syncUserPlan } = await import("@/lib/billing-service");
      await syncUserPlan(ctx.billingUserId, {
        planId: "free",
        status: "active",
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
      });

      await recordBillingEvent(ctx.billingUserId, "plan_downgraded", { planId: "free" });
      return NextResponse.json({ success: true, planId: "free" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
