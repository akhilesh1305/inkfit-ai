import type { CreditActionType } from "@/lib/credits";
import { CREDIT_COSTS } from "@/lib/credits";
import type { EmployeeRunMode, EmployeeStepId } from "@/lib/marketing-employee";
import { EMPLOYEE_STEPS } from "@/lib/marketing-employee";

export interface StepCreditSpec {
  action: CreditActionType;
  quantity: number;
}

export function getEmployeeStepCredit(stepId: EmployeeStepId): StepCreditSpec {
  switch (stepId) {
    case "strategy":
      return { action: "marketing_plan", quantity: 1 };
    case "images":
      return { action: "ai_image", quantity: 3 };
    case "content_plan":
    case "blog_ideas":
    case "linkedin_posts":
    case "calendar":
      return { action: "content_generation", quantity: 1 };
    default:
      return { action: "content_generation", quantity: 1 };
  }
}

export function creditCostForSpec(spec: StepCreditSpec): number {
  return CREDIT_COSTS[spec.action] * spec.quantity;
}

export function estimateEmployeeRunCredits(mode: EmployeeRunMode = "autonomous"): number {
  if (mode === "guided") {
    return creditCostForSpec(getEmployeeStepCredit("strategy"));
  }
  return EMPLOYEE_STEPS.reduce(
    (sum, step) => sum + creditCostForSpec(getEmployeeStepCredit(step.id)),
    0
  );
}

export function estimateCreditCost(action: CreditActionType, quantity = 1): number {
  return CREDIT_COSTS[action] * quantity;
}
