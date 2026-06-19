import type { IntegrationProviderAdapter } from "@/lib/integrations/providers/base";
import { linkedInProvider } from "@/lib/integrations/providers/linkedin";
import { wordpressProvider } from "@/lib/integrations/providers/wordpress";
import { notionProvider } from "@/lib/integrations/providers/notion";
import { googleDocsProvider } from "@/lib/integrations/providers/google-docs";
import type {
  IntegrationProviderId,
  IntegrationProviderMeta,
} from "@/lib/integrations/types";

export const INTEGRATION_PROVIDER_META: IntegrationProviderMeta[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Publish posts and articles directly to your LinkedIn profile or company page.",
    category: "social",
    features: ["Post publishing", "Scheduling", "Engagement sync"],
    gradient: "from-[#0A66C2] to-[#004182]",
    brandColor: "#0A66C2",
    supportsPublish: true,
    supportsSync: true,
  },
  {
    id: "wordpress",
    name: "WordPress",
    description: "Push blog drafts and pages to your WordPress site via REST API.",
    category: "cms",
    features: ["Draft publish", "SEO metadata", "Category sync"],
    gradient: "from-[#21759B] to-[#1B4F72]",
    brandColor: "#21759B",
    supportsPublish: true,
    supportsSync: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Export content to Notion databases and pages in your workspace.",
    category: "workspace",
    features: ["Page export", "Database rows", "Workspace sync"],
    gradient: "from-zinc-100 to-zinc-400",
    brandColor: "#000000",
    supportsPublish: true,
    supportsSync: true,
  },
  {
    id: "google_docs",
    name: "Google Docs",
    description: "Create and update Google Docs from InkFit-generated content.",
    category: "docs",
    features: ["Doc creation", "Content append", "Drive sync"],
    gradient: "from-[#4285F4] to-[#1A73E8]",
    brandColor: "#4285F4",
    supportsPublish: true,
    supportsSync: true,
  },
];

const ADAPTERS: Record<IntegrationProviderId, IntegrationProviderAdapter> = {
  linkedin: linkedInProvider,
  wordpress: wordpressProvider,
  notion: notionProvider,
  google_docs: googleDocsProvider,
};

export function getIntegrationMeta(id: IntegrationProviderId): IntegrationProviderMeta {
  return INTEGRATION_PROVIDER_META.find((m) => m.id === id) ?? INTEGRATION_PROVIDER_META[0];
}

export function getIntegrationAdapter(id: IntegrationProviderId): IntegrationProviderAdapter {
  const adapter = ADAPTERS[id];
  if (!adapter) throw new Error(`Unknown integration provider: ${id}`);
  return adapter;
}

export function listIntegrationProviders(): IntegrationProviderMeta[] {
  return INTEGRATION_PROVIDER_META;
}

export function isValidProviderId(id: string): id is IntegrationProviderId {
  return id in ADAPTERS;
}

/** Register additional providers at runtime (future plugins). */
export function registerIntegrationProvider(
  meta: IntegrationProviderMeta,
  adapter: IntegrationProviderAdapter
) {
  if (!INTEGRATION_PROVIDER_META.some((m) => m.id === meta.id)) {
    INTEGRATION_PROVIDER_META.push(meta);
  }
  ADAPTERS[meta.id] = adapter;
}
