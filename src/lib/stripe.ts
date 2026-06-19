/**
 * Production Stripe billing integration.
 * Set STRIPE_SECRET_KEY and price IDs in .env to enable live checkout.
 */

import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { STRIPE_PRICE_IDS, CREDIT_PACK } from "@/lib/billing";
import { planIdFromStripePrice } from "@/lib/billing-plans";
import {
  recordBillingEvent,
  syncUserPlan,
  upsertInvoiceFromStripe,
} from "@/lib/billing-service";
import { applyCreditPackBonus } from "@/lib/credit-service";
import { getPlanById } from "@/lib/billing";

export interface CheckoutSessionResult {
  mode: "stripe" | "demo";
  url?: string;
  sessionId?: string;
  planId: string;
}

let stripeClient: Stripe | null = null;

function subscriptionPeriodEnd(sub: Stripe.Subscription): Date | null {
  const end = sub.items?.data?.[0]?.current_period_end;
  return end ? new Date(end * 1000) : null;
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription;
  if (!sub) return null;
  return typeof sub === "string" ? sub : sub.id;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export async function createCheckoutSession(
  planId: string,
  userId: string,
  email: string,
  successUrl: string,
  cancelUrl: string,
  existingCustomerId?: string | null
): Promise<CheckoutSessionResult> {
  const priceId = STRIPE_PRICE_IDS[planId];

  if (!isStripeConfigured() || !priceId || planId === "free") {
    return { mode: "demo", planId };
  }

  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existingCustomerId ?? undefined,
    customer_email: existingCustomerId ? undefined : email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId, planId },
    subscription_data: { metadata: { userId, planId } },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return { mode: "demo", planId };
  }

  return {
    mode: "stripe",
    url: session.url,
    sessionId: session.id,
    planId,
  };
}

export interface CreditPackCheckoutResult {
  mode: "stripe" | "demo";
  url?: string;
  sessionId?: string;
  credits: number;
}

export async function createCreditPackCheckoutSession(
  userId: string,
  email: string,
  successUrl: string,
  cancelUrl: string,
  existingCustomerId?: string | null
): Promise<CreditPackCheckoutResult> {
  const priceId = CREDIT_PACK.stripePriceId;
  const credits = CREDIT_PACK.credits;

  if (!isStripeConfigured() || !priceId) {
    return { mode: "demo", credits };
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: existingCustomerId ?? undefined,
    customer_email: existingCustomerId ? undefined : email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      purchaseType: "credit_pack",
      credits: String(credits),
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return { mode: "demo", credits };
  }

  return {
    mode: "stripe",
    url: session.url,
    sessionId: session.id,
    credits,
  };
}

export async function createBillingPortalSession(
  stripeCustomerId: string,
  returnUrl: string
): Promise<string | null> {
  if (!isStripeConfigured() || !stripeCustomerId) return null;

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
  return session.url;
}

export async function handleStripeWebhookEvent(
  payload: string,
  signature: string
): Promise<void> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");

  const stripe = getStripe();
  const event = stripe.webhooks.constructEvent(payload, signature, secret);

  const existing = await prisma.stripeWebhookEvent.findUnique({
    where: { eventId: event.id },
  });
  if (existing) return;

  await prisma.stripeWebhookEvent.create({
    data: { eventId: event.id, type: event.type },
  });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) break;

      if (session.metadata?.purchaseType === "credit_pack") {
        const credits = parseInt(session.metadata.credits ?? String(CREDIT_PACK.credits), 10);
        await applyCreditPackBonus(userId, credits);
        await recordBillingEvent(userId, "credit_pack_purchased", {
          amount: CREDIT_PACK.priceInr,
          currency: "inr",
          stripeRef: session.id,
          metadata: { credits },
        });
        break;
      }

      const planId = session.metadata?.planId ?? "creator";

      let currentPeriodEnd: Date | null = null;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        currentPeriodEnd = subscriptionPeriodEnd(sub);
      }

      await syncUserPlan(userId, {
        planId,
        status: "active",
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        currentPeriodEnd,
      });

      await recordBillingEvent(userId, "checkout_completed", {
        planId,
        stripeRef: session.id,
      });
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      const priceId = sub.items.data[0]?.price?.id;
      const planId = priceId ? planIdFromStripePrice(priceId) : null;

      await syncUserPlan(userId, {
        planId: planId ?? "creator",
        status: sub.status === "active" ? "active" : sub.status,
        stripeCustomerId: sub.customer as string,
        stripeSubscriptionId: sub.id,
        currentPeriodEnd: subscriptionPeriodEnd(sub),
      });

      await recordBillingEvent(userId, "subscription_updated", {
        planId: planId ?? undefined,
        stripeRef: sub.id,
        metadata: { status: sub.status },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      await syncUserPlan(userId, {
        planId: "free",
        status: "canceled",
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
      });

      await recordBillingEvent(userId, "subscription_canceled", {
        stripeRef: sub.id,
      });
      break;
    }

    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      let userId = invoice.metadata?.userId;

      if (!userId) {
        const subscriptionId = invoiceSubscriptionId(invoice);
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          userId = sub.metadata?.userId;
        }
      }

      if (userId) {
        const period = invoice.lines?.data[0]?.period;
        const periodLabel = period
          ? new Date(period.start * 1000).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

        await upsertInvoiceFromStripe(userId, {
          stripeInvoiceId: invoice.id,
          amount: Math.round((invoice.amount_paid ?? invoice.amount_due) / 100),
          currency: invoice.currency,
          status: invoice.status ?? "open",
          description: invoice.description ?? "Subscription invoice",
          periodLabel,
          pdfUrl: invoice.invoice_pdf ?? undefined,
        });

        await recordBillingEvent(
          userId,
          event.type === "invoice.paid" ? "invoice_paid" : "invoice_payment_failed",
          {
            amount: Math.round((invoice.amount_paid ?? 0) / 100),
            currency: invoice.currency,
            stripeRef: invoice.id,
          }
        );
      }
      break;
    }

    default:
      break;
  }
}

export async function cancelStripeSubscription(
  stripeSubscriptionId: string
): Promise<boolean> {
  if (!isStripeConfigured()) return false;
  try {
    const stripe = getStripe();
    await stripe.subscriptions.cancel(stripeSubscriptionId);
    return true;
  } catch {
    return false;
  }
}

export { getPlanById };
