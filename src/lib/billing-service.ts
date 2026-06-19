import { prisma } from "@/lib/prisma";
import { getPlanById, type BillingHistoryItem, type TeamBillingInfo } from "@/lib/billing";
import { getPlanLimits, type BillingType } from "@/lib/billing-plans";

export interface BillingContext {
  /** User making the request */
  userId: string;
  /** User whose subscription pays for usage */
  billingUserId: string;
  planId: string;
  planName: string;
  billingType: BillingType;
  seatLimit: number;
  seatsUsed: number;
  clientLimit: number | "unlimited";
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string;
  currentPeriodEnd: Date | null;
  isBillingOwner: boolean;
}

export async function getOrCreateSubscription(userId: string, planId = "free") {
  let sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) {
    const limits = getPlanLimits(planId);
    sub = await prisma.subscription.create({
      data: {
        userId,
        planId,
        billingType: limits.billingType,
        seatLimit: limits.seats,
        clientLimit: limits.clients === "unlimited" ? 9999 : limits.clients,
      },
    });
  }
  return sub;
}

async function countSeatsForUser(ownerId: string): Promise<number> {
  const ownedWorkspaces = await prisma.workspace.findMany({
    where: { ownerId },
    select: { id: true },
  });
  if (ownedWorkspaces.length === 0) return 1;

  const memberCounts = await Promise.all(
    ownedWorkspaces.map((ws) =>
      prisma.workspaceMember.count({ where: { workspaceId: ws.id } })
    )
  );
  return 1 + memberCounts.reduce((a, b) => a + b, 0);
}

async function countAgencyClients(ownerId: string): Promise<number> {
  return prisma.agencyClient.count({ where: { userId: ownerId } });
}

export async function resolveBillingContext(userId: string): Promise<BillingContext> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  let billingUserId = userId;

  const pref = await prisma.userWorkspacePreference.findUnique({
    where: { userId },
    select: { activeWorkspaceId: true },
  });

  if (pref?.activeWorkspaceId) {
    const ws = await prisma.workspace.findFirst({
      where: { id: pref.activeWorkspaceId },
      select: { ownerId: true },
    });
    if (ws && ws.ownerId !== userId) {
      billingUserId = ws.ownerId;
    }
  }

  const sub = await getOrCreateSubscription(
    billingUserId,
    user?.plan ?? "free"
  );
  const planId = sub.planId ?? user?.plan ?? "free";
  const limits = getPlanLimits(planId);
  const seatsUsed = await countSeatsForUser(billingUserId);

  return {
    userId,
    billingUserId,
    planId,
    planName: getPlanById(planId).name,
    billingType: (sub.billingType as BillingType) ?? limits.billingType,
    seatLimit: sub.seatLimit ?? limits.seats,
    seatsUsed,
    clientLimit: limits.clients,
    stripeCustomerId: sub.stripeCustomerId,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    subscriptionStatus: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd,
    isBillingOwner: billingUserId === userId,
  };
}

export async function syncUserPlan(
  userId: string,
  data: {
    planId: string;
    status?: string;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    currentPeriodEnd?: Date | null;
  }
) {
  const limits = getPlanLimits(data.planId);
  const seatsUsed = await countSeatsForUser(userId);

  await prisma.user.update({
    where: { id: userId },
    data: { plan: data.planId },
  });

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planId: data.planId,
      status: data.status ?? "active",
      billingType: limits.billingType,
      seatLimit: limits.seats,
      seatsUsed,
      clientLimit: limits.clients === "unlimited" ? 9999 : limits.clients,
      stripeCustomerId: data.stripeCustomerId ?? null,
      stripeSubscriptionId: data.stripeSubscriptionId ?? null,
      currentPeriodEnd: data.currentPeriodEnd ?? null,
    },
    update: {
      planId: data.planId,
      status: data.status ?? "active",
      billingType: limits.billingType,
      seatLimit: limits.seats,
      seatsUsed,
      clientLimit: limits.clients === "unlimited" ? 9999 : limits.clients,
      stripeCustomerId: data.stripeCustomerId ?? undefined,
      stripeSubscriptionId: data.stripeSubscriptionId ?? undefined,
      currentPeriodEnd: data.currentPeriodEnd ?? undefined,
    },
  });
}

export async function recordBillingEvent(
  userId: string,
  event: string,
  opts: {
    planId?: string;
    amount?: number;
    currency?: string;
    stripeRef?: string;
    metadata?: Record<string, unknown>;
  } = {}
) {
  await prisma.billingEvent.create({
    data: {
      userId,
      event,
      planId: opts.planId ?? null,
      amount: opts.amount ?? null,
      currency: opts.currency ?? "INR",
      stripeRef: opts.stripeRef ?? null,
      metadata: JSON.stringify(opts.metadata ?? {}),
    },
  });
}

export async function getBillingHistory(userId: string): Promise<BillingHistoryItem[]> {
  const events = await prisma.billingEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  if (events.length === 0) return [];

  return events.map((e) => ({
    id: e.id,
    date: e.createdAt.toISOString(),
    event: e.event.replace(/_/g, " "),
    plan: e.planId ? getPlanById(e.planId).name : "—",
    amount: e.amount ?? undefined,
  }));
}

export async function upsertInvoiceFromStripe(
  userId: string,
  data: {
    stripeInvoiceId: string;
    amount: number;
    currency: string;
    status: string;
    description?: string;
    periodLabel: string;
    pdfUrl?: string;
  }
) {
  const existing = await prisma.invoice.findFirst({
    where: { stripeInvoiceId: data.stripeInvoiceId },
  });
  if (existing) {
    await prisma.invoice.update({
      where: { id: existing.id },
      data: {
        amount: data.amount,
        status: data.status,
        pdfUrl: data.pdfUrl ?? null,
      },
    });
    return existing.id;
  }

  const row = await prisma.invoice.create({
    data: {
      userId,
      stripeInvoiceId: data.stripeInvoiceId,
      amount: data.amount,
      currency: data.currency.toUpperCase(),
      status: data.status,
      description: data.description,
      periodLabel: data.periodLabel,
      pdfUrl: data.pdfUrl ?? null,
    },
  });

  await recordBillingEvent(userId, "invoice_received", {
    planId: undefined,
    amount: data.amount,
    currency: data.currency,
    stripeRef: data.stripeInvoiceId,
  });

  return row.id;
}

export async function canInviteTeamMember(ownerId: string): Promise<{
  ok: boolean;
  reason?: string;
}> {
  const ctx = await resolveBillingContext(ownerId);
  if (ctx.billingType === "individual" && ctx.planId !== "agency") {
    if (ctx.seatsUsed >= ctx.seatLimit) {
      return {
        ok: false,
        reason: `Your ${ctx.planName} plan includes ${ctx.seatLimit} seat(s). Upgrade to Pro for team billing.`,
      };
    }
  }
  if (ctx.seatsUsed >= ctx.seatLimit) {
    return {
      ok: false,
      reason: `Seat limit reached (${ctx.seatLimit}). Upgrade your plan to add more team members.`,
    };
  }
  return { ok: true };
}

export async function getTeamBillingSummary(userId: string): Promise<TeamBillingInfo> {
  const ctx = await resolveBillingContext(userId);
  const clientsUsed = await countAgencyClients(userId);

  const clientsAvailable: number | "unlimited" =
    ctx.clientLimit === "unlimited"
      ? "unlimited"
      : Math.max(0, ctx.clientLimit - clientsUsed);

  return {
    billingType: ctx.billingType,
    seatLimit: ctx.seatLimit,
    seatsUsed: ctx.seatsUsed,
    seatsAvailable: Math.max(0, ctx.seatLimit - ctx.seatsUsed),
    clientLimit: ctx.clientLimit,
    clientsUsed,
    clientsAvailable,
    isBillingOwner: ctx.isBillingOwner,
  };
}

export async function applyDemoCheckout(userId: string, planId: string) {
  const plan = getPlanById(planId);
  await syncUserPlan(userId, {
    planId,
    status: "active",
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
  });

  await prisma.invoice.create({
    data: {
      userId,
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

  await recordBillingEvent(userId, "plan_upgraded", {
    planId,
    amount: plan.price,
    metadata: { mode: "demo" },
  });
}
