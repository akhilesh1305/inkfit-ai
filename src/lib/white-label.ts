export type DomainStatus = "none" | "pending" | "verified";

export type PreviewMode = "login" | "portal";

export interface WhiteLabelConfig {
  id?: string;
  enabled: boolean;
  brandName: string;
  logoDataUrl: string | null;
  customDomain: string | null;
  domainStatus: DomainStatus;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  loginHeadline: string;
  loginSubheadline: string;
  loginTagline: string;
  portalWelcome: string;
  hidePoweredBy: boolean;
}

export const DEFAULT_WHITE_LABEL: WhiteLabelConfig = {
  enabled: false,
  brandName: "Acme Agency",
  logoDataUrl: null,
  customDomain: null,
  domainStatus: "none",
  primaryColor: "#7C3AED",
  secondaryColor: "#06B6D4",
  accentColor: "#A78BFA",
  loginHeadline: "Welcome back",
  loginSubheadline: "Sign in to your client portal",
  loginTagline: "Your branded content workspace — powered by your agency.",
  portalWelcome: "Client Portal",
  hidePoweredBy: true,
};

export const DOMAIN_STATUS_META: Record<
  DomainStatus,
  { label: string; color: string; bg: string }
> = {
  none: { label: "Not configured", color: "text-content-muted", bg: "bg-white/5" },
  pending: { label: "Pending DNS", color: "text-amber-400", bg: "bg-amber-500/15" },
  verified: { label: "Verified", color: "text-emerald-400", bg: "bg-emerald-500/15" },
};

export const DNS_RECORDS = [
  { type: "CNAME", host: "portal", value: "custom.inkfit.ai" },
  { type: "TXT", host: "_inkfit-verify", value: "inkfit-verify=your-token" },
];

export const MAX_LOGO_BYTES = 400_000;

export function validateLogoFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please upload a PNG, JPG, or SVG image.";
  }
  if (file.size > MAX_LOGO_BYTES) {
    return "Logo must be under 400 KB.";
  }
  return null;
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
}
