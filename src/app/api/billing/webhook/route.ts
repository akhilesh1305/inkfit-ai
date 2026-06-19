import { NextResponse } from "next/server";
import { handleStripeWebhookEvent } from "@/lib/stripe";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  try {
    await handleStripeWebhookEvent(payload, signature);
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Stripe webhook error:", e);
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
