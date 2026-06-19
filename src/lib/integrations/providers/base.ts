import type {
  IntegrationAccountInfo,
  IntegrationProviderId,
  OAuthTokens,
  PublishPayload,
  PublishResult,
  SyncResult,
} from "@/lib/integrations/types";

export interface IntegrationProviderAdapter {
  id: IntegrationProviderId;
  isOAuthConfigured(): boolean;
  buildAuthorizationUrl(params: {
    redirectUri: string;
    state: string;
    metadata?: Record<string, string>;
  }): string;
  exchangeAuthorizationCode(params: {
    code: string;
    redirectUri: string;
    metadata?: Record<string, string>;
  }): Promise<OAuthTokens>;
  refreshTokens(refreshToken: string): Promise<OAuthTokens>;
  fetchAccountInfo(
    accessToken: string,
    metadata?: Record<string, unknown>
  ): Promise<IntegrationAccountInfo>;
  publish(
    accessToken: string,
    payload: PublishPayload,
    metadata?: Record<string, unknown>
  ): Promise<PublishResult>;
  sync?(
    accessToken: string,
    metadata?: Record<string, unknown>
  ): Promise<SyncResult>;
}

export function envOrNull(key: string): string | null {
  const v = process.env[key]?.trim();
  return v || null;
}

export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.VERCEL_URL?.replace(/^(?!https?:\/\/)/, "https://") ||
    "http://localhost:3000"
  );
}

export function oauthRedirectUri(provider: IntegrationProviderId): string {
  return `${appBaseUrl()}/api/integrations/oauth/${provider}/callback`;
}
