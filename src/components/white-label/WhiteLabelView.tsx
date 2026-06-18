"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, Check, Sparkles, Eye, Monitor } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { WhiteLabelSettingsPanel } from "@/components/white-label/WhiteLabelSettingsPanel";
import { LoginPreview } from "@/components/white-label/LoginPreview";
import { ClientPortalPreview } from "@/components/white-label/ClientPortalPreview";
import {
  DEFAULT_WHITE_LABEL,
  type PreviewMode,
  type WhiteLabelConfig,
} from "@/lib/white-label";
import { cn } from "@/lib/utils";

export function WhiteLabelView() {
  const [config, setConfig] = useState<WhiteLabelConfig>(DEFAULT_WHITE_LABEL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("login");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/white-label");
    if (res.ok) {
      const data = await res.json();
      if (data.config) setConfig(data.config);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function patch(p: Partial<WhiteLabelConfig>) {
    setConfig((prev) => ({ ...prev, ...p }));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/white-label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", config }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.config) setConfig(data.config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  }

  async function handleVerifyDomain() {
    if (!config.customDomain) return;
    setVerifying(true);
    const res = await fetch("/api/white-label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify-domain", domain: config.customDomain }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.config) setConfig(data.config);
    }
    setVerifying(false);
  }

  async function handleRemoveLogo() {
    const res = await fetch("/api/white-label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove-logo" }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.config) setConfig(data.config);
    } else {
      patch({ logoDataUrl: null });
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-brand-400" />
            White Label
          </span>
        }
        description="Rebrand InkFit for your agency or enterprise clients — custom logo, domain, colors, and login experience."
      >
        <button
          type="button"
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <>
              <Check className="h-4 w-4" /> Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save settings
            </>
          )}
        </button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Agency ready", desc: "Multi-client portals with your branding" },
          { label: "Enterprise SSO", desc: "Custom domain + login screen" },
          { label: "Full white label", desc: "Hide vendor branding entirely" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent px-4 py-3"
          >
            <p className="text-sm font-semibold text-white">{item.label}</p>
            <p className="mt-0.5 text-xs text-content-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <WhiteLabelSettingsPanel
          config={config}
          onChange={patch}
          onVerifyDomain={handleVerifyDomain}
          onRemoveLogo={handleRemoveLogo}
          verifying={verifying}
        />

        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="card overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-brand-400" />
                <span className="text-sm font-semibold text-white">Preview mode</span>
              </div>
              <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
                {(
                  [
                    { id: "login" as const, label: "Login", icon: Monitor },
                    { id: "portal" as const, label: "Portal", icon: Sparkles },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPreviewMode(m.id)}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-medium transition",
                      previewMode === m.id
                        ? "bg-brand-600 text-white"
                        : "text-content-muted hover:text-white"
                    )}
                  >
                    <m.icon className="h-3 w-3" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4">
              <p className="mb-3 text-xs text-content-muted">
                {previewMode === "login"
                  ? "Custom login screen — what your clients see when signing in"
                  : "Client portal preview — branded workspace for your clients"}
              </p>
              {previewMode === "login" ? (
                <LoginPreview config={config} />
              ) : (
                <ClientPortalPreview config={config} />
              )}
            </div>

            {config.customDomain && config.domainStatus === "verified" && (
              <div className="border-t border-white/[0.06] px-4 py-2.5 text-center text-[10px] text-emerald-400/90">
                Live at https://{config.customDomain}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
