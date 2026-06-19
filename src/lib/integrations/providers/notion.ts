import type { IntegrationProviderAdapter } from "@/lib/integrations/providers/base";
import { envOrNull } from "@/lib/integrations/providers/base";
import type {
  IntegrationAccountInfo,
  OAuthTokens,
  PublishPayload,
  PublishResult,
  SyncResult,
} from "@/lib/integrations/types";

const AUTH_URL = "https://api.notion.com/v1/oauth/authorize";
const TOKEN_URL = "https://api.notion.com/v1/oauth/token";
const NOTION_VERSION = "2022-06-28";

async function notionToken(body: Record<string, string>, useBasic = false): Promise<OAuthTokens> {
  const clientId = envOrNull("NOTION_CLIENT_ID");
  const clientSecret = envOrNull("NOTION_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Notion OAuth is not configured");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
  };
  if (useBasic) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Notion token error: ${await res.text()}`);
  const data = (await res.json()) as {
    access_token: string;
    workspace_id?: string;
    workspace_name?: string;
    bot_id?: string;
  };
  return {
    accessToken: data.access_token,
    scopes: ["read", "write"],
  };
}

export const notionProvider: IntegrationProviderAdapter = {
  id: "notion",

  isOAuthConfigured() {
    return Boolean(envOrNull("NOTION_CLIENT_ID") && envOrNull("NOTION_CLIENT_SECRET"));
  },

  buildAuthorizationUrl({ redirectUri, state }) {
    const clientId = envOrNull("NOTION_CLIENT_ID");
    if (!clientId) throw new Error("Notion OAuth is not configured");
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      owner: "user",
      state,
    });
    return `${AUTH_URL}?${params}`;
  },

  async exchangeAuthorizationCode({ code, redirectUri }) {
    return notionToken(
      { grant_type: "authorization_code", code, redirect_uri: redirectUri },
      true
    );
  },

  async refreshTokens() {
    throw new Error("Notion tokens do not expire");
  },

  async fetchAccountInfo(accessToken, metadata): Promise<IntegrationAccountInfo> {
    if (accessToken.startsWith("demo_")) {
      return {
        accountId: "demo-notion",
        accountLabel: String(metadata?.workspaceName ?? "InkFit Workspace"),
        accountEmail: "workspace@notion.so",
      };
    }
    const res = await fetch("https://api.notion.com/v1/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Notion-Version": NOTION_VERSION,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch Notion user");
    const data = (await res.json()) as {
      id: string;
      name?: string;
      person?: { email?: string };
      avatar_url?: string;
    };
    return {
      accountId: data.id,
      accountLabel: data.name ?? "Notion",
      accountEmail: data.person?.email,
      profileImage: data.avatar_url,
    };
  },

  async publish(accessToken, payload, metadata): Promise<PublishResult> {
    const parentId = metadata?.parentPageId as string | undefined;

    if (accessToken.startsWith("demo_")) {
      return {
        success: true,
        externalId: `demo_notion_${Date.now()}`,
        externalUrl: "https://www.notion.so",
      };
    }

    if (!parentId) {
      return { success: false, error: "Notion parent page ID required in connection metadata" };
    }

    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      },
      body: JSON.stringify({
        parent: { page_id: parentId },
        properties: {
          title: {
            title: [{ text: { content: payload.title.slice(0, 2000) } }],
          },
        },
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{ type: "text", text: { content: payload.content.slice(0, 2000) } }],
            },
          },
        ],
      }),
    });

    if (!res.ok) return { success: false, error: await res.text() };
    const data = (await res.json()) as { id: string; url?: string };
    return { success: true, externalId: data.id, externalUrl: data.url };
  },

  async sync(accessToken, metadata): Promise<SyncResult> {
    await this.fetchAccountInfo(accessToken, metadata);
    return { success: true, syncedAt: new Date().toISOString(), itemsSynced: 1 };
  },
};
