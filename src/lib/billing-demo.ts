import { isStripeConfigured } from "@/lib/stripe";

/** Instant plan upgrades without payment — development/staging only. */
export function isDemoBillingAllowed(): boolean {
  if (isStripeConfigured()) return false;
  if (process.env.BILLING_DEMO_MODE === "true") return true;
  if (process.env.NODE_ENV === "production") return false;
  return true;
}
