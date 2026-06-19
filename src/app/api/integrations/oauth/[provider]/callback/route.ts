import { NextResponse } from "next/server";
import {
  getIntegrationAdapter,
  isValidProviderId,
} from "@/lib/integrations/registry";
import { oauthRedirectUri } from "@/lib/integrations/providers/base";
import { verifyOAuthState } from "@/lib/integrations/oauth-state";
import { saveOAuthConnection } from "@/lib/integrations/connection-service";
import type { IntegrationProviderId } from "@/lib/integrations/types";

type RouteParams = { params: Promise<{ provider: string }> };

function redirectToIntegrations(params: Record<string, string>) {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const url = new URL("/dashboard/integrations", base);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return NextResponse.redirect(url);
}

export async function GET(req: Request, { params }: RouteParams) {
  const { provider: providerParam } = await params;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (!isValidProviderId(providerParam)) {
    return redirectToIntegrations({ error: "unknown_provider" });
  }

  const provider = providerParam as IntegrationProviderId;

  if (error) {
    return redirectToIntegrations({ error, provider });
  }

  if (!code || !state) {
    return redirectToIntegrations({ error: "missing_code", provider });
  }

  const statePayload = await verifyOAuthState(state);
  if (!statePayload || statePayload.provider !== provider) {
    return redirectToIntegrations({ error: "invalid_state", provider });
  }

  try {
    const adapter = getIntegrationAdapter(provider);
    const redirectUri = oauthRedirectUri(provider);
    const tokens = await adapter.exchangeAuthorizationCode({
      code,
      redirectUri,
      metadata: statePayload.metadata,
    });
    const account = await adapter.fetchAccountInfo(tokens.accessToken, statePayload.metadata);

    await saveOAuthConnection(
      statePayload.userId,
      provider,
      tokens,
      account,
      statePayload.metadata ?? {}
    );

    return redirectToIntegrations({ connected: provider });
  } catch (e) {
    const message = e instanceof Error ? e.message : "oauth_failed";
    return redirectToIntegrations({ error: message, provider });
  }
}
