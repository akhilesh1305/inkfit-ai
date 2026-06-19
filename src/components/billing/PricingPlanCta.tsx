"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingPlanCtaProps {
  planId: string;
  label: string;
  popular?: boolean;
}

export function PricingPlanCta({ planId, label, popular }: PricingPlanCtaProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      const loggedIn = res.ok;

      if (planId === "free") {
        router.push(loggedIn ? "/dashboard" : "/register");
        return;
      }

      if (loggedIn) {
        router.push(`/dashboard/billing?upgrade=${planId}`);
        return;
      }

      router.push(`/register?plan=${planId}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn("mt-8 w-full", popular ? "btn-primary" : "btn-secondary")}
    >
      {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : label}
    </button>
  );
}
