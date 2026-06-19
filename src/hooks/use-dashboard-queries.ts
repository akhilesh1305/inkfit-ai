"use client";

import { useQuery } from "@tanstack/react-query";
import type { CreditSummary } from "@/lib/credits";
import type { Permission, Role } from "@/lib/rbac";
import { queryKeys } from "@/lib/query-keys";

export interface AuthContextData {
  platformRole?: string;
  effectiveRole?: Role;
  permissions?: Permission[];
}

export interface AuthMeData {
  user?: {
    name: string;
    email: string;
    plan: string;
  };
}

export interface CreditsResponse {
  credits: CreditSummary;
  planId?: string;
}

export interface BillingStatusData {
  planId: string;
  planName: string;
  showUpgradePrompt: boolean;
  recommendedPlan: string | null;
  credits: CreditSummary;
  stripeEnabled?: boolean;
}

export interface OnboardingData {
  completed: boolean;
}

export function useAuthContext() {
  return useQuery<AuthContextData>({
    queryKey: queryKeys.authContext,
    queryFn: async () => {
      const res = await fetch("/api/auth/context");
      if (!res.ok) throw new Error("Failed to load auth context");
      return res.json();
    },
  });
}

export function useAuthMe() {
  return useQuery<AuthMeData>({
    queryKey: queryKeys.authMe,
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to load session");
      return res.json();
    },
  });
}

export function useCredits() {
  return useQuery<CreditsResponse>({
    queryKey: queryKeys.credits,
    queryFn: async () => {
      const res = await fetch("/api/credits");
      if (!res.ok) throw new Error("Failed to load credits");
      return res.json();
    },
  });
}

export function useBillingStatus() {
  return useQuery<BillingStatusData>({
    queryKey: queryKeys.billingStatus,
    queryFn: async () => {
      const res = await fetch("/api/billing/status");
      if (!res.ok) throw new Error("Failed to load billing status");
      return res.json();
    },
  });
}

export function useOnboardingStatus() {
  return useQuery<OnboardingData>({
    queryKey: queryKeys.onboarding,
    queryFn: async () => {
      const res = await fetch("/api/onboarding");
      if (!res.ok) throw new Error("Failed to load onboarding");
      return res.json();
    },
    retry: 1,
  });
}
