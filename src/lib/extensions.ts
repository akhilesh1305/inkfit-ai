export type IntegrationPlatform = "linkedin" | "gmail" | "google-docs" | "wordpress";

export type WebsiteStatus = "active" | "paused" | "error";

export type ExtensionInstallState = "not_installed" | "installed" | "outdated" | "connected";

export interface IntegrationMeta {
  id: IntegrationPlatform;
  name: string;
  description: string;
  hostPatterns: string[];
  features: string[];
  gradient: string;
}

export interface ExtensionIntegration {
  platform: IntegrationPlatform;
  connected: boolean;
  account: string | null;
  usageCount: number;
  lastUsedAt: string | null;
}

export interface ConnectedWebsite {
  id: string;
  domain: string;
  label: string | null;
  status: WebsiteStatus;
  lastSyncAt: string | null;
}

export interface ExtensionStatus {
  installed: boolean;
  version: string | null;
  lastSeenAt: string | null;
  installState: ExtensionInstallState;
  latestVersion: string;
}

export interface UsageStatPoint {
  day: string;
  captures: number;
  inserts: number;
  aiAssists: number;
}

export interface ExtensionUsageSummary {
  totalCaptures: number;
  totalInserts: number;
  totalAiAssists: number;
  weeklyChange: number;
  history: UsageStatPoint[];
  byPlatform: { platform: IntegrationPlatform; count: number }[];
}

export interface ExtensionsDashboard {
  status: ExtensionStatus;
  integrations: ExtensionIntegration[];
  websites: ConnectedWebsite[];
  usage: ExtensionUsageSummary;
}

export const LATEST_EXTENSION_VERSION = "0.9.0";

export const INTEGRATIONS: IntegrationMeta[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Draft posts, comment suggestions, and profile-aware content in the composer.",
    hostPatterns: ["linkedin.com"],
    features: ["Post draft", "Comment assist", "Profile context"],
    gradient: "from-[#0A66C2] to-[#004182]",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Rewrite emails, generate replies, and match your brand voice in compose.",
    hostPatterns: ["mail.google.com"],
    features: ["Email rewrite", "Reply suggest", "Tone match"],
    gradient: "from-[#EA4335] to-[#C5221F]",
  },
  {
    id: "google-docs",
    name: "Google Docs",
    description: "Insert AI content, expand outlines, and refine docs without leaving the editor.",
    hostPatterns: ["docs.google.com"],
    features: ["Insert content", "Expand section", "Rewrite selection"],
    gradient: "from-[#4285F4] to-[#1A73E8]",
  },
  {
    id: "wordpress",
    name: "WordPress",
    description: "Push blog drafts to the block editor and sync metadata from InkFit.",
    hostPatterns: ["wordpress.com", "*.wordpress.com"],
    features: ["Draft push", "SEO meta", "Block insert"],
    gradient: "from-[#21759B] to-[#1B4F72]",
  },
];

export const INSTALL_STEPS = [
  {
    step: 1,
    title: "Install the extension",
    description:
      "Add InkFit AI from the Chrome Web Store (or load unpacked during beta from your developer dashboard).",
  },
  {
    step: 2,
    title: "Pin to toolbar",
    description: "Click the puzzle icon in Chrome, then pin InkFit AI for one-click access on any site.",
  },
  {
    step: 3,
    title: "Sign in with InkFit",
    description: "Open the extension popup and authenticate with the same account you use in this dashboard.",
  },
  {
    step: 4,
    title: "Connect integrations",
    description: "Enable LinkedIn, Gmail, Google Docs, or WordPress below — grant permissions per platform.",
  },
  {
    step: 5,
    title: "Create on any site",
    description: "Highlight text or open a supported editor — the InkFit sidebar appears with AI actions.",
  },
];

export const DEMO_WEBSITES: Omit<ConnectedWebsite, "id">[] = [
  {
    domain: "linkedin.com",
    label: "LinkedIn",
    status: "active",
    lastSyncAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    domain: "mail.google.com",
    label: "Gmail",
    status: "active",
    lastSyncAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    domain: "docs.google.com",
    label: "Google Docs",
    status: "paused",
    lastSyncAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function getIntegrationMeta(id: IntegrationPlatform): IntegrationMeta {
  return INTEGRATIONS.find((i) => i.id === id) ?? INTEGRATIONS[0];
}

export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
}

export function buildUsageHistory(): UsageStatPoint[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, i) => ({
    day,
    captures: 4 + i * 2 + (i % 2),
    inserts: 2 + i + (i % 3),
    aiAssists: 6 + i * 3,
  }));
}

export function buildUsageSummary(integrations: ExtensionIntegration[]): ExtensionUsageSummary {
  const history = buildUsageHistory();
  const totalCaptures = history.reduce((s, p) => s + p.captures, 0);
  const totalInserts = history.reduce((s, p) => s + p.inserts, 0);
  const totalAiAssists = history.reduce((s, p) => s + p.aiAssists, 0);

  return {
    totalCaptures,
    totalInserts,
    totalAiAssists,
    weeklyChange: 18,
    history,
    byPlatform: integrations
      .filter((i) => i.connected)
      .map((i) => ({ platform: i.platform, count: i.usageCount }))
      .sort((a, b) => b.count - a.count),
  };
}

export function resolveInstallState(
  installed: boolean,
  version: string | null
): ExtensionInstallState {
  if (!installed) return "not_installed";
  if (!version) return "installed";
  if (version < LATEST_EXTENSION_VERSION) return "outdated";
  return "connected";
}

export function buildDemoDashboard(): ExtensionsDashboard {
  const integrations: ExtensionIntegration[] = INTEGRATIONS.map((meta, i) => ({
    platform: meta.id,
    connected: i < 2,
    account: i < 2 ? `user@${meta.hostPatterns[0]}` : null,
    usageCount: i < 2 ? 24 - i * 8 : 0,
    lastUsedAt: i < 2 ? new Date(Date.now() - i * 3600000).toISOString() : null,
  }));

  return {
    status: {
      installed: true,
      version: LATEST_EXTENSION_VERSION,
      lastSeenAt: new Date().toISOString(),
      installState: "connected",
      latestVersion: LATEST_EXTENSION_VERSION,
    },
    integrations,
    websites: DEMO_WEBSITES.map((w, i) => ({ id: `demo-${i}`, ...w })),
    usage: buildUsageSummary(integrations),
  };
}
