"use client";

import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Unplug,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  IntegrationConnectionView,
  IntegrationProviderMeta,
} from "@/lib/integrations/types";

const PROVIDER_ICONS: Record<string, string> = {
  linkedin: "in",
  wordpress: "W",
  notion: "N",
  google_docs: "G",
};

interface IntegrationCardProps {
  meta: IntegrationProviderMeta;
  connection: IntegrationConnectionView;
  busy: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}

function statusBadge(connection: IntegrationConnectionView) {
  if (connection.status === "syncing") {
    return { label: "Syncing", className: "bg-amber-500/15 text-amber-300 border-amber-500/30" };
  }
  if (connection.status === "error") {
    return { label: "Error", className: "bg-red-500/15 text-red-300 border-red-500/30" };
  }
  if (connection.connected) {
    return { label: "Connected", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" };
  }
  return { label: "Not connected", className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" };
}

function formatSyncTime(iso: string | null) {
  if (!iso) return "Never synced";
  return `Last sync ${new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export function IntegrationCard({
  meta,
  connection,
  busy,
  onConnect,
  onDisconnect,
  onSync,
}: IntegrationCardProps) {
  const badge = statusBadge(connection);
  const icon = PROVIDER_ICONS[meta.id] ?? "•";

  return (
    <div className="card flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-lg",
              meta.gradient
            )}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-white">{meta.name}</h3>
            <p className="text-xs text-content-muted">{meta.category}</p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            badge.className
          )}
        >
          {badge.label}
        </span>
      </div>

      <p className="text-sm text-content-muted">{meta.description}</p>

      <ul className="flex flex-wrap gap-1.5">
        {meta.features.map((f) => (
          <li
            key={f}
            className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-content-subtle"
          >
            {f}
          </li>
        ))}
      </ul>

      {connection.connected && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center gap-2">
            {connection.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={connection.profileImage}
                alt=""
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-300">
                {connection.accountLabel?.[0] ?? "?"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {connection.accountLabel ?? "Connected account"}
              </p>
              {connection.accountEmail && (
                <p className="truncate text-xs text-content-muted">{connection.accountEmail}</p>
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-content-subtle">
            {connection.lastSyncStatus === "success" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : connection.lastSyncStatus === "error" ? (
              <AlertCircle className="h-3.5 w-3.5 text-red-400" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            <span>{formatSyncTime(connection.lastSyncAt)}</span>
          </div>
          {connection.lastSyncError && (
            <p className="mt-1 text-xs text-red-300">{connection.lastSyncError}</p>
          )}
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-2">
        {!connection.connected ? (
          <button
            type="button"
            className="btn-primary flex-1"
            disabled={busy}
            onClick={onConnect}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn-secondary flex items-center gap-1.5"
              disabled={busy}
              onClick={onSync}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sync
            </button>
            <button
              type="button"
              className="btn-ghost flex items-center gap-1.5 text-red-300"
              disabled={busy}
              onClick={onDisconnect}
            >
              <Unplug className="h-4 w-4" />
              Disconnect
            </button>
          </>
        )}
      </div>

      {!connection.oauthConfigured && !connection.connected && (
        <p className="text-[11px] text-content-subtle">
          OAuth credentials not configured — demo connection available for testing.
        </p>
      )}
    </div>
  );
}

export function IntegrationsOverviewBar({
  connectedCount,
  totalCount,
}: {
  connectedCount: number;
  totalCount: number;
}) {
  return (
    <div className="card flex flex-wrap items-center justify-between gap-4 p-4">
      <div>
        <p className="text-sm font-medium text-white">Integration health</p>
        <p className="text-xs text-content-muted">
          {connectedCount} of {totalCount} platforms connected
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-content-subtle">
        <ExternalLink className="h-3.5 w-3.5" />
        Publishing service routes content to connected targets
      </div>
    </div>
  );
}
