"use client";

import { useRef, useState } from "react";
import {
  Upload,
  Loader2,
  Globe,
  Palette,
  LogIn,
  X,
  Check,
  Copy,
  Shield,
} from "lucide-react";
import {
  DNS_RECORDS,
  DOMAIN_STATUS_META,
  fileToDataUrl,
  validateLogoFile,
  type WhiteLabelConfig,
} from "@/lib/white-label";
import { cn } from "@/lib/utils";

type SettingsTab = "brand" | "domain" | "login";

interface WhiteLabelSettingsPanelProps {
  config: WhiteLabelConfig;
  onChange: (patch: Partial<WhiteLabelConfig>) => void;
  onVerifyDomain: () => void;
  onRemoveLogo: () => void;
  verifying: boolean;
}

export function WhiteLabelSettingsPanel({
  config,
  onChange,
  onVerifyDomain,
  onRemoveLogo,
  verifying,
}: WhiteLabelSettingsPanelProps) {
  const [tab, setTab] = useState<SettingsTab>("brand");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const tabs: { id: SettingsTab; label: string; icon: typeof Palette }[] = [
    { id: "brand", label: "Branding", icon: Palette },
    { id: "domain", label: "Domain", icon: Globe },
    { id: "login", label: "Login", icon: LogIn },
  ];

  async function handleLogo(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const err = validateLogoFile(file);
    if (err) {
      setUploadError(err);
      return;
    }
    setUploadError("");
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange({ logoDataUrl: dataUrl });
    } catch {
      setUploadError("Failed to upload logo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const domainMeta = DOMAIN_STATUS_META[config.domainStatus];

  return (
    <div className="card overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
        <div>
          <h2 className="section-title">Configuration</h2>
          <p className="mt-0.5 text-xs text-content-muted">
            Brand your client-facing portal for agencies & enterprise
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
          <span className="text-xs font-medium text-content-muted">White label active</span>
          <button
            type="button"
            role="switch"
            aria-checked={config.enabled}
            onClick={() => onChange({ enabled: !config.enabled })}
            className={cn(
              "relative h-6 w-11 rounded-full transition",
              config.enabled ? "bg-brand-600" : "bg-white/10"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                config.enabled ? "left-[22px]" : "left-0.5"
              )}
            />
          </button>
        </label>
      </div>

      <div className="flex gap-1 border-b border-white/[0.06] px-4 pt-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-xs font-medium transition",
              tab === t.id
                ? "bg-white/[0.05] text-white"
                : "text-content-muted hover:text-white"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-5 p-5">
        {tab === "brand" && (
          <>
            <div>
              <label className="label">Custom brand name</label>
              <input
                className="input-field"
                value={config.brandName}
                onChange={(e) => onChange({ brandName: e.target.value })}
                placeholder="Acme Agency"
              />
            </div>

            <div>
              <label className="label">Custom logo</label>
              <div
                className="relative rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleLogo(e.dataTransfer.files);
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={(e) => handleLogo(e.target.files)}
                />
                {config.logoDataUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={config.logoDataUrl}
                      alt="Logo preview"
                      className="max-h-16 max-w-[200px] object-contain"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn-ghost text-xs"
                        onClick={() => inputRef.current?.click()}
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        className="btn-ghost text-xs text-red-400"
                        onClick={onRemoveLogo}
                      >
                        <X className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : uploading ? (
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-400" />
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-content-muted" />
                    <p className="mt-2 text-sm text-white">Drop logo or click to upload</p>
                    <p className="mt-1 text-xs text-content-muted">PNG, JPG, SVG · max 400 KB</p>
                    <button
                      type="button"
                      className="btn-primary mt-3 !px-4 !py-2 text-sm"
                      onClick={() => inputRef.current?.click()}
                    >
                      Upload logo
                    </button>
                  </>
                )}
              </div>
              {uploadError && <p className="mt-2 text-sm text-red-400">{uploadError}</p>}
            </div>

            <div>
              <label className="label">Brand colors</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["primaryColor", "Primary"],
                    ["secondaryColor", "Secondary"],
                    ["accentColor", "Accent"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <span className="mb-1 block text-xs text-content-muted">{label}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config[key]}
                        onChange={(e) => onChange({ [key]: e.target.value })}
                        className="h-10 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
                      />
                      <input
                        className="input-field flex-1 font-mono text-xs"
                        value={config[key]}
                        onChange={(e) => onChange({ [key]: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <input
                type="checkbox"
                checked={config.hidePoweredBy}
                onChange={(e) => onChange({ hidePoweredBy: e.target.checked })}
                className="rounded border-white/20"
              />
              <div>
                <p className="text-sm font-medium text-white">Hide &quot;Powered by InkFit&quot;</p>
                <p className="text-xs text-content-muted">Enterprise white label — no vendor branding</p>
              </div>
            </label>
          </>
        )}

        {tab === "domain" && (
          <>
            <div className="rounded-lg border border-brand-500/20 bg-brand-500/5 px-3 py-2.5 text-xs text-brand-200/90">
              <Shield className="mb-1 inline h-3.5 w-3.5" /> Map a custom domain so clients access
              your portal at <strong>portal.youragency.com</strong>
            </div>

            <div>
              <label className="label">Custom domain</label>
              <input
                className="input-field"
                value={config.customDomain ?? ""}
                onChange={(e) =>
                  onChange({
                    customDomain: e.target.value || null,
                    domainStatus: "none",
                  })
                }
                placeholder="portal.youragency.com"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                  domainMeta.bg,
                  domainMeta.color
                )}
              >
                {domainMeta.label}
              </span>
              {config.customDomain && config.domainStatus !== "verified" && (
                <button
                  type="button"
                  className="btn-primary !px-3 !py-1.5 text-xs"
                  onClick={onVerifyDomain}
                  disabled={verifying}
                >
                  {verifying ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Verify DNS"
                  )}
                </button>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-content-muted">DNS records</p>
              <div className="space-y-2">
                {DNS_RECORDS.map((rec) => (
                  <div
                    key={rec.host}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 font-mono text-[10px]"
                  >
                    <span className="text-content-muted">
                      {rec.type} · {rec.host}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/80">{rec.value}</span>
                      <button
                        type="button"
                        className="text-content-muted hover:text-white"
                        onClick={() => copyText(rec.value, rec.host)}
                      >
                        {copied === rec.host ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "login" && (
          <>
            <div>
              <label className="label">Portal welcome title</label>
              <input
                className="input-field"
                value={config.portalWelcome}
                onChange={(e) => onChange({ portalWelcome: e.target.value })}
                placeholder="Client Portal"
              />
            </div>
            <div>
              <label className="label">Login headline</label>
              <input
                className="input-field"
                value={config.loginHeadline}
                onChange={(e) => onChange({ loginHeadline: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Login subheadline</label>
              <input
                className="input-field"
                value={config.loginSubheadline}
                onChange={(e) => onChange({ loginSubheadline: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Login panel tagline</label>
              <textarea
                className="input-field min-h-[80px] resize-y"
                value={config.loginTagline}
                onChange={(e) => onChange({ loginTagline: e.target.value })}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
