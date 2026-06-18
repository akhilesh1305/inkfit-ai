export interface AgencyClient {
  id: string;
  name: string;
  industry: string;
  website?: string;
  brandColor: string;
  contentCreated: number;
  projects: number;
  brandVoiceReady: boolean;
  calendarItems: number;
}

export interface CreateClientInput {
  name: string;
  industry: string;
  website?: string;
  brandColor: string;
}

export const ACTIVE_CLIENT_KEY = "inkfit-active-client-id";

export const BRAND_COLOR_PRESETS = [
  "#7C3AED",
  "#3B82F6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#EF4444",
];

export const DEMO_CLIENTS: Omit<AgencyClient, "id">[] = [
  {
    name: "Acme SaaS",
    industry: "B2B Software",
    website: "https://acmesaas.com",
    brandColor: "#7C3AED",
    contentCreated: 47,
    projects: 3,
    brandVoiceReady: true,
    calendarItems: 24,
  },
  {
    name: "Bloom Fitness",
    industry: "Health & Wellness",
    website: "https://bloomfit.io",
    brandColor: "#10B981",
    contentCreated: 31,
    projects: 2,
    brandVoiceReady: true,
    calendarItems: 18,
  },
  {
    name: "Apex Realty",
    industry: "Real Estate",
    website: "https://apexrealty.com",
    brandColor: "#3B82F6",
    contentCreated: 22,
    projects: 1,
    brandVoiceReady: false,
    calendarItems: 12,
  },
  {
    name: "Nova E-commerce",
    industry: "Retail",
    website: "https://novashop.co",
    brandColor: "#EC4899",
    contentCreated: 56,
    projects: 4,
    brandVoiceReady: true,
    calendarItems: 30,
  },
];

export function getClientInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getActiveClientId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_CLIENT_KEY);
}

export function setActiveClientId(id: string): void {
  localStorage.setItem(ACTIVE_CLIENT_KEY, id);
  window.dispatchEvent(new CustomEvent("inkfit-client-change", { detail: id }));
}

export function clearActiveClientId(): void {
  localStorage.removeItem(ACTIVE_CLIENT_KEY);
  window.dispatchEvent(new CustomEvent("inkfit-client-change", { detail: null }));
}
