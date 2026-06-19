import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAuth } from "@/lib/auth-guard";
import { signOAuthState } from "@/lib/integrations/oauth-state";
import {
  getIntegrationAdapter,
  getIntegrationMeta,
  isValidProviderId,
} from "@/lib/integrations/registry";
import { oauthRedirectUri } from "@/lib/integrations/providers/base";
import type { IntegrationProviderId } from "@/lib/integrations/types";

type RouteParams = { params: Promise<{ provider: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { provider: providerParam } = await params;

  if (!isValidProviderId(providerParam)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const provider = providerParam as IntegrationProviderId;
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const adapter = getIntegrationAdapter(provider);
  if (!adapter.isOAuthConfigured()) {
    const integrationsUrl = new URL("/dashboard/integrations", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    integrationsUrl.searchParams.set("error", "oauth_not_configured");
    integrationsUrl.searchParams.set("provider", provider);
    return NextResponse.redirect(integrationsUrl);
  }

  const state = await signOAuthState({
    userId: auth.ctx.user.id,
    provider,
    nonce: randomBytes(16).toString("hex"),
    returnTo: "/dashboard/integrations",
  });

  const redirectUri = oauthRedirectUri(provider);
  const url = adapter.buildAuthorizationUrl({ redirectUri, state });
  return NextResponse.redirect(url);
}

export async function POST(_req: Request, { params }: RouteParams) {
  const { provider: providerParam } = await params;
  if (!isValidProviderId(providerParam)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }
  return NextResponse.json({
    provider: providerParam,
    name: getIntegrationMeta(providerParam as IntegrationProviderId).name,
    authorizeUrl: `/api/integrations/oauth/${providerParam}`,
  });
}
