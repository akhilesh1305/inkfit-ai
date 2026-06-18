"use client";

import { useState } from "react";
import { Copy, Check, Link2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReferralLinkCardProps {
  link: string;
  code: string;
  onCopy?: () => void;
}

export function ReferralLinkCard({ link, code, onCopy }: ReferralLinkCardProps) {
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  async function copy(text: string, type: "link" | "code") {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    onCopy?.();
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#12121a] via-[#0c0c0e] to-[#0a0a0a] p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-cyan-500 shadow-glow">
          <Link2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-content">Your referral link</h2>
          <p className="text-xs text-content-subtle">
            Share and earn 50 credits per signup · 150 per paid conversion
          </p>
        </div>
      </div>

      <div className="relative mt-5 space-y-3">
        <div>
          <label className="label">Referral URL</label>
          <div className="flex gap-2">
            <input
              readOnly
              value={link}
              className="input-field flex-1 font-mono text-xs text-content-muted"
            />
            <button
              type="button"
              onClick={() => copy(link, "link")}
              className="btn-primary shrink-0 px-4"
            >
              {copied === "link" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied === "link" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div>
          <label className="label">Referral code</label>
          <div className="flex gap-2">
            <div
              className={cn(
                "input-field flex flex-1 items-center font-mono text-sm font-semibold tracking-wide text-brand-300"
              )}
            >
              {code}
            </div>
            <button
              type="button"
              onClick={() => copy(code, "code")}
              className="btn-secondary shrink-0 px-4"
            >
              {copied === "code" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "Join InkFit AI", url: link });
              } else {
                copy(link, "link");
              }
            }}
            className="btn-secondary text-xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share link
          </button>
        </div>
      </div>
    </div>
  );
}
