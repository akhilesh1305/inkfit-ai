"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Linkedin,
  Mail,
  FileText,
  Globe,
  Loader2,
  ExternalLink,
} from "lucide-react";
import type { ExtensionIntegration, IntegrationPlatform } from "@/lib/extensions";
import { getIntegrationMeta, INTEGRATIONS } from "@/lib/extensions";
import { cn } from "@/lib/utils";

const PLATFORM_ICONS: Record<IntegrationPlatform, typeof Linkedin> = {
  linkedin: Linkedin,
  gmail: Mail,
  "google-docs": FileText,
  wordpress: Globe,
};

interface IntegrationsGridProps {
  integrations: ExtensionIntegration[];
  connecting: string | null;
  onToggle: (platform: IntegrationPlatform, connected: boolean) => void;
}

export function IntegrationsGrid({
  integrations,
  connecting,
  onToggle,
}: IntegrationsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {INTEGRATIONS.map((meta) => {
        const row = integrations.find((i) => i.platform === meta.id);
        const connected = row?.connected ?? false;
        const Icon = PLATFORM_ICONS[meta.id];
        const loading = connecting === meta.id;

        return (
          <div
            key={meta.id}
            className={cn(
              "card relative overflow-hidden transition",
              connected && "border-brand-500/25"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-10",
                meta.gradient
              )}
            />
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                    meta.gradient
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <label className="flex cursor-pointer items-center gap-2">
                  <span className="text-[10px] font-medium text-content-muted">
                    {connected ? "Connected" : "Off"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={connected}
                    disabled={loading}
                    onClick={() => onToggle(meta.id, !connected)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition",
                      connected ? "bg-brand-600" : "bg-white/10"
                    )}
                  >
                    {loading ? (
                      <Loader2 className="absolute left-2 top-0.5 h-5 w-5 animate-spin text-white" />
                    ) : (
                      <span
                        className={cn(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                          connected ? "left-[22px]" : "left-0.5"
                        )}
                      />
                    )}
                  </button>
                </label>
              </div>

              <h3 className="mt-3 font-semibold text-white">{meta.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-content-muted">
                {meta.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {meta.features.map((f) => (
                  <span
                    key={f}
                    className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-medium text-content-muted"
                  >
                    {f}
                  </span>
                ))}
              </div>

              {connected && row?.account && (
                <p className="mt-3 flex items-center gap-1 text-[10px] text-content-subtle">
                  <ExternalLink className="h-3 w-3" />
                  {row.account}
                  {row.lastUsedAt && (
                    <span className="text-content-muted">
                      · {formatDistanceToNow(new Date(row.lastUsedAt), { addSuffix: true })}
                    </span>
                  )}
                </p>
              )}

              <p className="mt-2 font-mono text-[9px] text-content-subtle">
                {getIntegrationMeta(meta.id).hostPatterns.join(", ")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
