"use client";

import Image from "next/image";
import { Check, Link2, Loader2, Unlink } from "lucide-react";
import type { LinkedInConnection } from "@/lib/linkedin-publishing";
import { formatLinkedInHandle } from "@/lib/linkedin-publishing";
import { cn } from "@/lib/utils";

interface LinkedInConnectCardProps {
  connection: LinkedInConnection;
  onConnect: () => void;
  onDisconnect: () => void;
  loading?: boolean;
}

export function LinkedInConnectCard({
  connection,
  onConnect,
  onDisconnect,
  loading,
}: LinkedInConnectCardProps) {
  const { connected, profileName, profileImage, account } = connection;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6",
        connected
          ? "border-[#0A66C2]/40 bg-gradient-to-br from-[#0A66C2]/10 via-[#0c0c0e] to-[#0a0a0a]"
          : "border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent"
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#0A66C2]/20 blur-3xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            {connected && profileImage ? (
              <Image
                src={profileImage}
                alt={profileName ?? "LinkedIn profile"}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border-2 border-[#0A66C2]/50 object-cover shadow-lg"
                unoptimized
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-white/20 bg-white/5">
                <span className="text-2xl font-bold text-[#0A66C2]">in</span>
              </div>
            )}
            {connected && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#0c0c0e]">
                <Check className="h-3 w-3 text-white" />
              </span>
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0A66C2]">
              LinkedIn Account
            </p>
            {connected ? (
              <>
                <h2 className="mt-0.5 text-lg font-bold text-white">{profileName}</h2>
                <p className="text-sm text-content-muted">{formatLinkedInHandle(account)}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Connected
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-0.5 text-lg font-bold text-white">Not connected</h2>
                <p className="text-sm text-content-muted">
                  Connect your LinkedIn to publish and schedule posts
                </p>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={connected ? onDisconnect : onConnect}
          className={cn(
            "flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition",
            connected
              ? "border border-white/10 bg-white/[0.04] text-content-muted hover:bg-white/[0.08] hover:text-white"
              : "bg-gradient-to-r from-[#0A66C2] to-[#004182] text-white shadow-lg shadow-[#0A66C2]/25 hover:opacity-90"
          )}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : connected ? (
            <>
              <Unlink className="h-4 w-4" />
              Disconnect
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              Connect LinkedIn
            </>
          )}
        </button>
      </div>
    </div>
  );
}
