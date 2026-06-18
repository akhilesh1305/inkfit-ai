import { NextResponse } from "next/server";
import { handleStripeWebhookEvent } from "@/lib/stripe";

/**
 * Stripe webhook endpoint.
 * Set STRIPE_WEBHOOK_SECRET in .env and configure in Stripe Dashboard.
 *
 * Events to handle:
 * - checkout.session.completed
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.paid
 */
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  try {
    handleStripeWebhookEvent(payload, signature);
    return NextResponse.json({ received: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
