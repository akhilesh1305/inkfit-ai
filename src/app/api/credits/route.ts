import { NextResponse } from "next/server";
import { getPlanById } from "@/lib/billing";
import { getCreditSummaryForUser } from "@/lib/credit-service";
import { gateAuth } from "@/lib/credit-api";
import { resolveBillingContext } from "@/lib/billing-service";

export async function GET() {
  try {
    const auth = await gateAuth("content:read");
    if (!auth.ok) return auth.response;

    const ctx = await resolveBillingContext(auth.ctx.user.id);
    const plan = getPlanById(ctx.planId);
    const summary = await getCreditSummaryForUser(
      ctx.billingUserId,
      ctx.planId,
      plan.name
    );

    return NextResponse.json({
      credits: summary,
      planId: ctx.planId,
      billingUserId: ctx.billingUserId,
      isBillingOwner: ctx.isBillingOwner,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
