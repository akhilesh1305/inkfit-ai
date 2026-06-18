import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanById } from "@/lib/billing";
import { requireCredits } from "@/lib/credit-service";
import type { CreditActionType } from "@/lib/credits";

export type CreditGateResult =
  | { ok: true; userId: string; planId: string }
  | { ok: false; response: NextResponse };

/** Reusable credit gate for API routes — call before AI generation. */
export async function gateCredits(action: CreditActionType): Promise<CreditGateResult> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const planId = user?.plan ?? session.plan ?? "free";
  const plan = getPlanById(planId);
  const result = await requireCredits(session.id, planId, plan.name, action);

  if (!result.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: result.error, credits: result.summary },
        { status: 402 }
      ),
    };
  }

  return { ok: true, userId: session.id, planId };
}
