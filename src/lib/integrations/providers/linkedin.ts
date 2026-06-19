import type { IntegrationProviderAdapter } from "@/lib/integrations/providers/base";
import { envOrNull, oauthRedirectUri } from "@/lib/integrations/providers/base";
import type {
  IntegrationAccountInfo,
  OAuthTokens,
  PublishPayload,
  PublishResult,
  SyncResult,
} from "@/lib/integrations/types";

const AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const PROFILE_URL = "https://api.linkedin.com/v2/userinfo";
const POSTS_URL = "https://api.linkedin.com/v2/ugcPosts";

const SCOPES = ["openid", "profile", "email", "w_member_social"];

async function tokenRequest(body: Record<string, string>): Promise<OAuthTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LinkedIn token error: ${text}`);
  }
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

export const linkedInProvider: IntegrationProviderAdapter = {
  id: "linkedin",

  isOAuthConfigured() {
    return Boolean(envOrNull("LINKEDIN_CLIENT_ID") && envOrNull("LINKEDIN_CLIENT_SECRET"));
  },

  buildAuthorizationUrl({ redirectUri, state }) {
    const clientId = envOrNull("LINKEDIN_CLIENT_ID");
    if (!clientId) throw new Error("LinkedIn OAuth is not configured");
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: SCOPES.join(" "),
    });
    return `${AUTH_URL}?${params}`;
  },

  async exchangeAuthorizationCode({ code, redirectUri }) {
    const clientId = envOrNull("LINKEDIN_CLIENT_ID");
    const clientSecret = envOrNull("LINKEDIN_CLIENT_SECRET");
    if (!clientId || !clientSecret) throw new Error("LinkedIn OAuth is not configured");
    return tokenRequest({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });
  },

  async refreshTokens(refreshToken) {
    const clientId = envOrNull("LINKEDIN_CLIENT_ID");
    const clientSecret = envOrNull("LINKEDIN_CLIENT_SECRET");
    if (!clientId || !clientSecret) throw new Error("LinkedIn OAuth is not configured");
    return tokenRequest({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });
  },

  async fetchAccountInfo(accessToken): Promise<IntegrationAccountInfo> {
    if (accessToken.startsWith("demo_")) {
      return {
        accountId: "demo-linkedin",
        accountLabel: "Demo LinkedIn Profile",
        accountEmail: "you@linkedin.com",
        profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=LI",
      };
    }
    const res = await fetch(PROFILE_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error("Failed to fetch LinkedIn profile");
    const data = (await res.json()) as {
      sub: string;
      name?: string;
      email?: string;
      picture?: string;
    };
    return {
      accountId: data.sub,
      accountLabel: data.name ?? "LinkedIn",
      accountEmail: data.email,
      profileImage: data.picture,
    };
  },

  async publish(accessToken, payload): Promise<PublishResult> {
    if (accessToken.startsWith("demo_")) {
      return {
        success: true,
        externalId: `demo_li_${Date.now()}`,
        externalUrl: "https://www.linkedin.com/feed/",
      };
    }

    const authorUrn = `urn:li:person:${payload.metadata?.linkedinPersonId ?? "me"}`;
    const body = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: `${payload.title}\n\n${payload.content}` },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    };

    const res = await fetch(POSTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: err };
    }

    const id = res.headers.get("x-restli-id") ?? `li_${Date.now()}`;
    return { success: true, externalId: id, externalUrl: "https://www.linkedin.com/feed/" };
  },

  async sync(accessToken): Promise<SyncResult> {
    await this.fetchAccountInfo(accessToken);
    return { success: true, syncedAt: new Date().toISOString(), itemsSynced: 1 };
  },
};
