"use client";

import { formatDistanceToNow } from "date-fns";
import { Puzzle, CheckCircle2, AlertCircle, Download, RefreshCw } from "lucide-react";
import type { ExtensionStatus } from "@/lib/extensions";
import { cn } from "@/lib/utils";

const STATE_META = {
  not_installed: {
    label: "Not installed",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    icon: Download,
  },
  installed: {
    label: "Installed",
    color: "text-cyan-400",
    bg: "bg-cyan-500/15",
    icon: Puzzle,
  },
  outdated: {
    label: "Update available",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    icon: AlertCircle,
  },
  connected: {
    label: "Connected & active",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    icon: CheckCircle2,
  },
};

interface ExtensionStatusCardProps {
  status: ExtensionStatus;
  onMarkInstalled: () => void;
  marking: boolean;
}

export function ExtensionStatusCard({
  status,
  onMarkInstalled,
  marking,
}: ExtensionStatusCardProps) {
  const meta = STATE_META[status.installState];
  const Icon = meta.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-600/10 via-transparent to-cyan-500/5 p-6 shadow-card">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Puzzle className="h-5 w-5 text-brand-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
              Extension Status
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                meta.bg,
                meta.color
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
            </span>
            {status.version && (
              <span className="text-sm text-content-muted">v{status.version}</span>
            )}
          </div>
          {status.lastSeenAt && (
            <p className="mt-2 text-xs text-content-muted">
              Last seen {formatDistanceToNow(new Date(status.lastSeenAt), { addSuffix: true })}
            </p>
          )}
          {status.installState === "outdated" && (
            <p className="mt-2 text-xs text-amber-300/90">
              Latest version is v{status.latestVersion} — update in Chrome Web Store.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {status.installState === "not_installed" ? (
            <button type="button" className="btn-primary" onClick={onMarkInstalled} disabled={marking}>
              {marking ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Download className="h-4 w-4" /> I&apos;ve installed it
                </>
              )}
            </button>
          ) : (
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-center text-sm"
            >
              Chrome Web Store
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
