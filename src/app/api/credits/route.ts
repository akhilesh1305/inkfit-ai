import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanById } from "@/lib/billing";
import { getCreditSummaryForUser } from "@/lib/credit-service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    const planId = user?.plan ?? session.plan ?? "free";
    const plan = getPlanById(planId);
    const summary = await getCreditSummaryForUser(session.id, planId, plan.name);

    return NextResponse.json({ credits: summary });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
