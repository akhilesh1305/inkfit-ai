import { NextResponse } from "next/server";
import { gateAuth } from "@/lib/credit-api";
import { resolveBillingContext } from "@/lib/billing-service";
import { getCreditSummaryForUser } from "@/lib/credit-service";
import { getPlanById } from "@/lib/billing";
import { isStripeConfigured } from "@/lib/stripe";
import { recommendedUpgrade } from "@/lib/billing-plans";

export async function GET() {
  try {
    const auth = await gateAuth("content:read");
    if (!auth.ok) return auth.response;

    const ctx = await resolveBillingContext(auth.ctx.user.id);
    const plan = getPlanById(ctx.planId);
    const credits = await getCreditSummaryForUser(
      ctx.billingUserId,
      ctx.planId,
      plan.name
    );

    return NextResponse.json({
      planId: ctx.planId,
      planName: plan.name,
      billingType: ctx.billingType,
      isBillingOwner: ctx.isBillingOwner,
      stripeEnabled: isStripeConfigured(),
      credits,
      showUpgradePrompt:
        credits.warningLevel !== "none" ||
        ctx.planId === "free",
      recommendedPlan: recommendedUpgrade(ctx.planId),
      upgradeUrl: "/dashboard/billing",
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
