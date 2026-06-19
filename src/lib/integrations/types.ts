export const INTEGRATION_PROVIDER_IDS = [
  "linkedin",
  "wordpress",
  "notion",
  "google_docs",
] as const;

export type IntegrationProviderId = (typeof INTEGRATION_PROVIDER_IDS)[number];

export type IntegrationConnectionStatus =
  | "connected"
  | "disconnected"
  | "error"
  | "syncing";

export type IntegrationSyncStatus = "success" | "error" | "pending" | "never";

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes?: string[];
  tokenType?: string;
}

export interface IntegrationAccountInfo {
  accountId: string;
  accountLabel: string;
  accountEmail?: string;
  profileImage?: string;
}

export interface PublishPayload {
  title: string;
  content: string;
  contentType?: "post" | "article" | "page" | "document";
  scheduledAt?: string | null;
  metadata?: Record<string, unknown>;
}

export interface PublishResult {
  success: boolean;
  externalId?: string;
  externalUrl?: string;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  syncedAt: string;
  itemsSynced?: number;
  error?: string;
}

/** Public-facing connection (no secrets). */
export interface IntegrationConnectionView {
  provider: IntegrationProviderId;
  status: IntegrationConnectionStatus;
  accountLabel: string | null;
  accountEmail: string | null;
  profileImage: string | null;
  scopes: string[];
  metadata: Record<string, unknown>;
  lastSyncAt: string | null;
  lastSyncStatus: IntegrationSyncStatus;
  lastSyncError: string | null;
  oauthConfigured: boolean;
  connected: boolean;
}

export interface IntegrationProviderMeta {
  id: IntegrationProviderId;
  name: string;
  description: string;
  category: "social" | "cms" | "docs" | "workspace";
  features: string[];
  gradient: string;
  brandColor: string;
  supportsPublish: boolean;
  supportsSync: boolean;
}
