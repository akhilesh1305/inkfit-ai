/**
 * Stripe-ready billing integration.
 * Set STRIPE_SECRET_KEY and price IDs in .env to enable live checkout.
 */

import { STRIPE_PRICE_IDS } from "@/lib/billing";

export interface CheckoutSessionResult {
  mode: "stripe" | "demo";
  url?: string;
  sessionId?: string;
  planId: string;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export async function createCheckoutSession(
  planId: string,
  userId: string,
  email: string,
  successUrl: string,
  cancelUrl: string
): Promise<CheckoutSessionResult> {
  const priceId = STRIPE_PRICE_IDS[planId];

  if (!isStripeConfigured() || !priceId) {
    return { mode: "demo", planId };
  }

  // Stripe Checkout — uncomment when stripe package is installed:
  //
  // import Stripe from "stripe";
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const session = await stripe.checkout.sessions.create({
  //   mode: "subscription",
  //   customer_email: email,
  //   line_items: [{ price: priceId, quantity: 1 }],
  //   success_url: successUrl,
  //   cancel_url: cancelUrl,
  //   metadata: { userId, planId },
  //   subscription_data: { metadata: { userId, planId } },
  // });
  // return { mode: "stripe", url: session.url!, sessionId: session.id, planId };

  return { mode: "demo", planId };
}

export async function createBillingPortalSession(
  stripeCustomerId: string,
  returnUrl: string
): Promise<string | null> {
  if (!isStripeConfigured() || !stripeCustomerId) return null;

  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const session = await stripe.billingPortal.sessions.create({
  //   customer: stripeCustomerId,
  //   return_url: returnUrl,
  // });
  // return session.url;

  return null;
}

export function handleStripeWebhookEvent(_payload: string, _signature: string): void {
  // Verify with stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  // Handle: checkout.session.completed, customer.subscription.updated, invoice.paid
}
