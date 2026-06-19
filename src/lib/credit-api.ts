import { NextResponse } from "next/server";
import { getPlanById } from "@/lib/billing";
import { checkCredits, consumeCredits, refundCredits } from "@/lib/credit-service";
import { requirePermission } from "@/lib/auth-guard";
import { resolveBillingContext } from "@/lib/billing-service";
import type { Permission } from "@/lib/rbac";
import type { CreditActionType } from "@/lib/credits";

export type CreditGateSuccess = {
  ok: true;
  userId: string;
  billingUserId: string;
  planId: string;
  effectiveRole: string;
};

export type CreditGateResult = CreditGateSuccess | { ok: false; response: NextResponse };

/** Check credits + permission without charging (charge after success). */
export async function gateCredits(
  action: CreditActionType,
  quantity = 1
): Promise<CreditGateResult> {
  const auth = await requirePermission("ai:generate");
  if (!auth.ok) return { ok: false, response: auth.response };

  const billing = await resolveBillingContext(auth.ctx.user.id);
  const plan = getPlanById(billing.planId);
  const result = await checkCredits(
    billing.billingUserId,
    billing.planId,
    plan.name,
    action,
    quantity
  );

  if (!result.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: result.error,
          credits: result.summary,
          upgradeUrl: "/dashboard/billing",
          recommendedPlan: billing.planId === "free" ? "creator" : "pro",
        },
        { status: 402 }
      ),
    };
  }

  return {
    ok: true,
    userId: auth.ctx.user.id,
    billingUserId: billing.billingUserId,
    planId: billing.planId,
    effectiveRole: auth.ctx.effectiveRole,
  };
}

/** Deduct credits after a successful generation. */
export async function chargeAfterGate(
  gate: CreditGateSuccess,
  action: CreditActionType,
  quantity = 1
) {
  const plan = getPlanById(gate.planId);
  return consumeCredits(gate.billingUserId, gate.planId, plan.name, action, quantity);
}

export async function refundAfterGate(
  gate: CreditGateSuccess,
  action: CreditActionType,
  quantity = 1
) {
  return refundCredits(gate.billingUserId, action, quantity);
}

/** Auth-only gate without credit check. */
export async function gateAuth(permission: Permission = "content:read") {
  return requirePermission(permission);
}
