"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, AlertTriangle, ArrowUpRight } from "lucide-react";
import type { CreditSummary } from "@/lib/credits";
import { formatCredits, WARNING_META } from "@/lib/credits";
import { cn } from "@/lib/utils";

interface CreditsWarningBannerProps {
  summary: CreditSummary;
  className?: string;
  showUpgrade?: boolean;
}

export function CreditsWarningBanner({
  summary,
  className,
  showUpgrade = true,
}: CreditsWarningBannerProps) {
  if (summary.warningLevel === "none" || summary.isUnlimited) return null;

  const meta = WARNING_META[summary.warningLevel];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
        meta.bg,
        meta.border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={cn("mt-0.5 h-4 w-4 shrink-0", meta.color)} />
        <div>
          <p className={cn("text-sm font-semibold", meta.color)}>{meta.title}</p>
          <p className="text-xs text-content-muted">{meta.message}</p>
        </div>
      </div>
      {showUpgrade && (
        <Link href="/dashboard/billing" className="btn-primary !px-3 !py-1.5 text-xs shrink-0">
          Upgrade plan
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

interface CreditsMeterProps {
  summary: CreditSummary;
  compact?: boolean;
}

export function CreditsMeter({ summary, compact }: CreditsMeterProps) {
  const remaining =
    summary.creditsRemaining === "unlimited"
      ? "∞"
      : formatCredits(summary.creditsRemaining);

  const barColor =
    summary.warningLevel === "depleted"
      ? "from-red-500 to-red-600"
      : summary.warningLevel === "critical"
        ? "from-orange-500 to-amber-500"
        : summary.warningLevel === "approaching"
          ? "from-amber-500 to-yellow-500"
          : "from-brand-600 via-accent-blue to-cyan-500";

  if (compact) {
    return (
      <div className="min-w-[140px]">
        <div className="mb-1 flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1 text-content-muted">
            <Zap className="h-3 w-3 text-brand-400" />
            Credits
          </span>
          <span className="font-semibold text-white">
            {remaining}
            {!summary.isUnlimited && (
              <span className="text-content-subtle"> / {formatCredits(summary.creditsLimit as number)}</span>
            )}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${summary.percentUsed}%` }}
            className={cn("h-full rounded-full bg-gradient-to-r", barColor)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] p-5">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-brand-400" />
            <h3 className="section-title">AI Credits</h3>
          </div>
          <p className="mt-1 text-xs text-content-muted">
            {summary.planName} plan · Resets{" "}
            {new Date(summary.resetDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {!summary.isUnlimited && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
              summary.warningLevel === "depleted" && "bg-red-500/15 text-red-400",
              summary.warningLevel === "critical" && "bg-orange-500/15 text-orange-400",
              summary.warningLevel === "approaching" && "bg-amber-500/15 text-amber-400",
              summary.warningLevel === "none" && "bg-emerald-500/15 text-emerald-400"
            )}
          >
            {summary.percentUsed}% used
          </span>
        )}
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-3">
        <StatBox label="Credits Remaining" value={remaining} accent="text-brand-300" />
        <StatBox
          label="Credits Used"
          value={formatCredits(summary.creditsUsed)}
          accent="text-cyan-300"
        />
        <StatBox
          label="Monthly Reset"
          value={new Date(summary.resetDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
          accent="text-violet-300"
          sub="Next billing cycle"
        />
      </div>

      <div className="px-5 pb-5">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-content-muted">Monthly usage</span>
          <span className="font-medium text-white">
            {formatCredits(summary.creditsUsed)}
            {!summary.isUnlimited && ` / ${formatCredits(summary.creditsLimit as number)}`}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${summary.percentUsed}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className={cn("h-full rounded-full bg-gradient-to-r", barColor)}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-content-subtle">
          <span>0%</span>
          <span className="text-amber-400/80">80%</span>
          <span className="text-orange-400/80">90%</span>
          <span className="text-red-400/80">100%</span>
        </div>
      </div>

      <CreditsWarningBanner summary={summary} className="mx-5 mb-5" />
    </div>
  );
}

function StatBox({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: string;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className={cn("text-2xl font-bold", accent)}>{value}</p>
      <p className="mt-0.5 text-xs font-medium text-white">{label}</p>
      {sub && <p className="text-[10px] text-content-subtle">{sub}</p>}
    </div>
  );
}
