import type { IntegrationProviderAdapter } from "@/lib/integrations/providers/base";
import { envOrNull } from "@/lib/integrations/providers/base";
import type {
  IntegrationAccountInfo,
  OAuthTokens,
  PublishPayload,
  PublishResult,
  SyncResult,
} from "@/lib/integrations/types";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DOCS_SCOPE = "https://www.googleapis.com/auth/documents";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const SCOPES = [DOCS_SCOPE, DRIVE_SCOPE, "openid", "email", "profile"];

async function googleToken(body: Record<string, string>): Promise<OAuthTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  if (!res.ok) throw new Error(`Google token error: ${await res.text()}`);
  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined,
    scopes: data.scope?.split(" ") ?? SCOPES,
  };
}

export const googleDocsProvider: IntegrationProviderAdapter = {
  id: "google_docs",

  isOAuthConfigured() {
    return Boolean(envOrNull("GOOGLE_CLIENT_ID") && envOrNull("GOOGLE_CLIENT_SECRET"));
  },

  buildAuthorizationUrl({ redirectUri, state }) {
    const clientId = envOrNull("GOOGLE_CLIENT_ID");
    if (!clientId) throw new Error("Google OAuth is not configured");
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: SCOPES.join(" "),
      access_type: "offline",
      prompt: "consent",
      state,
    });
    return `${AUTH_URL}?${params}`;
  },

  async exchangeAuthorizationCode({ code, redirectUri }) {
    const clientId = envOrNull("GOOGLE_CLIENT_ID");
    const clientSecret = envOrNull("GOOGLE_CLIENT_SECRET");
    if (!clientId || !clientSecret) throw new Error("Google OAuth is not configured");
    return googleToken({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });
  },

  async refreshTokens(refreshToken) {
    const clientId = envOrNull("GOOGLE_CLIENT_ID");
    const clientSecret = envOrNull("GOOGLE_CLIENT_SECRET");
    if (!clientId || !clientSecret) throw new Error("Google OAuth is not configured");
    return googleToken({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });
  },

  async fetchAccountInfo(accessToken): Promise<IntegrationAccountInfo> {
    if (accessToken.startsWith("demo_")) {
      return {
        accountId: "demo-google",
        accountLabel: "Demo Google Account",
        accountEmail: "you@gmail.com",
        profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=GD",
      };
    }
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error("Failed to fetch Google profile");
    const data = (await res.json()) as {
      id: string;
      name?: string;
      email?: string;
      picture?: string;
    };
    return {
      accountId: data.id,
      accountLabel: data.name ?? "Google",
      accountEmail: data.email,
      profileImage: data.picture,
    };
  },

  async publish(accessToken, payload): Promise<PublishResult> {
    if (accessToken.startsWith("demo_")) {
      return {
        success: true,
        externalId: `demo_gdoc_${Date.now()}`,
        externalUrl: "https://docs.google.com",
      };
    }

    const createRes = await fetch("https://docs.googleapis.com/v1/documents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: payload.title }),
    });

    if (!createRes.ok) return { success: false, error: await createRes.text() };
    const doc = (await createRes.json()) as { documentId: string };

    if (payload.content.trim()) {
      await fetch(`https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: payload.content,
              },
            },
          ],
        }),
      });
    }

    return {
      success: true,
      externalId: doc.documentId,
      externalUrl: `https://docs.google.com/document/d/${doc.documentId}/edit`,
    };
  },

  async sync(accessToken): Promise<SyncResult> {
    await this.fetchAccountInfo(accessToken);
    return { success: true, syncedAt: new Date().toISOString(), itemsSynced: 1 };
  },
};
