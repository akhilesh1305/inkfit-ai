"use client";

import { Check, Link2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PUBLISH_PLATFORMS,
  type PublishConnection,
  type PublishPlatformId,
} from "@/lib/publishing";

interface ConnectAccountsProps {
  connections: PublishConnection[];
  onToggle: (platform: PublishPlatformId, connected: boolean) => void;
  loading?: string | null;
}

export function ConnectAccounts({ connections, onToggle, loading }: ConnectAccountsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {PUBLISH_PLATFORMS.map((platform) => {
        const conn = connections.find((c) => c.platform === platform.id);
        const connected = conn?.connected ?? false;
        const isLoading = loading === platform.id;

        return (
          <div
            key={platform.id}
            className={cn(
              "relative overflow-hidden rounded-xl border p-4 transition",
              connected
                ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                : "border-white/[0.06] bg-[#0c0c0e]"
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-20 blur-2xl",
                platform.gradient
              )}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-lg",
                    platform.gradient
                  )}
                >
                  {platform.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-content">{platform.name}</p>
                  <p className="text-[11px] text-content-subtle">
                    {connected ? conn?.account : "Not connected"}
                  </p>
                </div>
              </div>
              {connected && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="h-3 w-3 text-emerald-400" />
                </span>
              )}
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onToggle(platform.id, !connected)}
              className={cn(
                "relative mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition",
                connected
                  ? "border border-white/10 bg-white/[0.04] text-content-muted hover:bg-white/[0.08]"
                  : "bg-gradient-to-r from-brand-600 to-cyan-600 text-white hover:opacity-90"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : connected ? (
                "Disconnect"
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" />
                  Connect
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
