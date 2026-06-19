import type { IntegrationProviderAdapter } from "@/lib/integrations/providers/base";
import { envOrNull } from "@/lib/integrations/providers/base";
import type {
  IntegrationAccountInfo,
  OAuthTokens,
  PublishPayload,
  PublishResult,
  SyncResult,
} from "@/lib/integrations/types";

const AUTH_URL = "https://public-api.wordpress.com/oauth2/authorize";
const TOKEN_URL = "https://public-api.wordpress.com/oauth2/token";
const API_BASE = "https://public-api.wordpress.com/rest/v1.1";

async function wpToken(body: Record<string, string>): Promise<OAuthTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  if (!res.ok) throw new Error(`WordPress token error: ${await res.text()}`);
  const data = (await res.json()) as {
    access_token: string;
    blog_id?: string;
    blog_url?: string;
  };
  return {
    accessToken: data.access_token,
    scopes: ["posts"],
  };
}

export const wordpressProvider: IntegrationProviderAdapter = {
  id: "wordpress",

  isOAuthConfigured() {
    return Boolean(envOrNull("WORDPRESS_CLIENT_ID") && envOrNull("WORDPRESS_CLIENT_SECRET"));
  },

  buildAuthorizationUrl({ redirectUri, state }) {
    const clientId = envOrNull("WORDPRESS_CLIENT_ID");
    if (!clientId) throw new Error("WordPress OAuth is not configured");
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      state,
    });
    return `${AUTH_URL}?${params}`;
  },

  async exchangeAuthorizationCode({ code, redirectUri }) {
    const clientId = envOrNull("WORDPRESS_CLIENT_ID");
    const clientSecret = envOrNull("WORDPRESS_CLIENT_SECRET");
    if (!clientId || !clientSecret) throw new Error("WordPress OAuth is not configured");
    return wpToken({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });
  },

  async refreshTokens() {
    throw new Error("WordPress.com tokens do not support refresh in this integration");
  },

  async fetchAccountInfo(accessToken, metadata): Promise<IntegrationAccountInfo> {
    if (accessToken.startsWith("demo_")) {
      const site = String(metadata?.siteUrl ?? "yoursite.wordpress.com");
      return {
        accountId: "demo-wp",
        accountLabel: site,
        accountEmail: "admin@wordpress.com",
      };
    }
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error("Failed to fetch WordPress account");
    const data = (await res.json()) as { ID: number; display_name?: string; email?: string };
    return {
      accountId: String(data.ID),
      accountLabel: data.display_name ?? "WordPress",
      accountEmail: data.email,
    };
  },

  async publish(accessToken, payload, metadata): Promise<PublishResult> {
    if (accessToken.startsWith("demo_")) {
      const site = String(metadata?.siteUrl ?? "yoursite.wordpress.com");
      return {
        success: true,
        externalId: `demo_wp_${Date.now()}`,
        externalUrl: `https://${site}`,
      };
    }

    const siteId = metadata?.siteId ?? "me";
    const res = await fetch(`${API_BASE}/sites/${siteId}/posts/new`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: payload.title,
        content: payload.content,
        status: "draft",
      }),
    });

    if (!res.ok) return { success: false, error: await res.text() };
    const data = (await res.json()) as { ID: number; URL?: string };
    return {
      success: true,
      externalId: String(data.ID),
      externalUrl: data.URL,
    };
  },

  async sync(accessToken, metadata): Promise<SyncResult> {
    await this.fetchAccountInfo(accessToken, metadata);
    return { success: true, syncedAt: new Date().toISOString(), itemsSynced: 1 };
  },
};
