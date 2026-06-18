"use client";

import { Mail, Lock, ArrowRight } from "lucide-react";
import type { WhiteLabelConfig } from "@/lib/white-label";

interface LoginPreviewProps {
  config: WhiteLabelConfig;
}

export function LoginPreview({ config }: LoginPreviewProps) {
  const { primaryColor, secondaryColor, brandName, logoDataUrl } = config;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0c] shadow-2xl">
      <div className="flex h-[420px] text-[10px] sm:text-xs">
        {/* Branded panel */}
        <div
          className="relative hidden w-1/2 flex-col justify-between p-6 sm:flex"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}ee 0%, ${secondaryColor}99 50%, #0c0c0e 100%)`,
          }}
        >
          <div>
            {logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoDataUrl} alt="" className="h-8 max-w-[140px] object-contain" />
            ) : (
              <div
                className="inline-flex rounded-lg px-3 py-1.5 text-sm font-bold text-white"
                style={{ backgroundColor: `${primaryColor}40` }}
              >
                {brandName}
              </div>
            )}
          </div>
          <div>
            <p className="text-lg font-bold leading-snug text-white">{config.loginTagline}</p>
            <p className="mt-2 text-white/60">Secure client access · Enterprise SSO ready</p>
          </div>
          <p className="text-white/40">© {new Date().getFullYear()} {brandName}</p>
        </div>

        {/* Form panel */}
        <div className="flex w-full flex-col justify-center px-6 py-8 sm:w-1/2">
          <div className="mb-4 sm:hidden">
            {logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoDataUrl} alt="" className="h-7 max-w-[120px] object-contain" />
            ) : (
              <span className="font-bold text-white">{brandName}</span>
            )}
          </div>
          <h3 className="text-base font-bold text-white">{config.loginHeadline}</h3>
          <p className="mt-0.5 text-content-muted">{config.loginSubheadline}</p>

          <div className="mt-5 space-y-3">
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-content-muted" />
              <div className="rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-8 pr-3 text-content-muted">
                client@company.com
              </div>
            </div>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-content-muted" />
              <div className="rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-8 pr-3 text-content-muted">
                ••••••••
              </div>
            </div>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
            >
              Sign In <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
