import { z } from "zod";
import { PLATFORM_ROLES } from "@/lib/rbac";

const planIdSchema = z.enum(["free", "creator", "pro", "agency"]);
const paidPlanIdSchema = z.enum(["creator", "pro", "agency"]);

export const billingPostSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("portal") }),
  z.object({
    action: z.literal("checkout"),
    planId: paidPlanIdSchema,
  }),
  z.object({
    action: z.literal("downgrade"),
    planId: z.literal("free"),
  }),
  z.object({ action: z.literal("buy_credits") }),
]);

export const adminPostSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update-plan"),
    userId: z.string().min(1),
    planId: planIdSchema,
  }),
  z.object({
    action: z.literal("update-role"),
    userId: z.string().min(1),
    platformRole: z.enum(PLATFORM_ROLES),
  }),
]);

export type BillingPostBody = z.infer<typeof billingPostSchema>;
export type AdminPostBody = z.infer<typeof adminPostSchema>;
