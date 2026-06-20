"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useOnboardingStatus } from "@/hooks/use-dashboard-queries";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading, isError, refetch } = useOnboardingStatus();

  useEffect(() => {
    if (data && !data.completed) {
      router.replace("/onboarding");
    }
  }, [data, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-content-muted">Could not verify onboarding status.</p>
        <button type="button" className="btn-primary text-sm" onClick={() => void refetch()}>
          Retry
        </button>
      </div>
    );
  }

  if (data && !data.completed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return <>{children}</>;
}
