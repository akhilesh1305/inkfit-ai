"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CreditSummary } from "@/lib/credits";
import { CreditsMeter } from "@/components/credits/CreditsMeter";

export function CreditsTopBarWidget() {
  const [summary, setSummary] = useState<CreditSummary | null>(null);

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((d) => setSummary(d.credits))
      .catch(() => {});
  }, []);

  if (!summary) return null;

  return (
    <Link
      href="/dashboard/credits"
      className="hidden rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 transition hover:border-brand-500/30 xl:block"
    >
      <CreditsMeter summary={summary} compact />
    </Link>
  );
}
