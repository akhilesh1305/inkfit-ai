import { SignJWT, jwtVerify } from "jose";
import type { IntegrationProviderId } from "@/lib/integrations/types";
import { getAuthSecretKey } from "@/lib/secrets";

const TTL = "15m";

function getSecret() {
  return getAuthSecretKey();
}

export interface OAuthStatePayload {
  userId: string;
  provider: IntegrationProviderId;
  nonce: string;
  returnTo?: string;
  metadata?: Record<string, string>;
}

export async function signOAuthState(payload: OAuthStatePayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TTL)
    .sign(getSecret());
}

export async function verifyOAuthState(token: string): Promise<OAuthStatePayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = String(payload.userId ?? "");
    const provider = String(payload.provider ?? "") as IntegrationProviderId;
    const nonce = String(payload.nonce ?? "");
    if (!userId || !provider || !nonce) return null;
    return {
      userId,
      provider,
      nonce,
      returnTo: payload.returnTo ? String(payload.returnTo) : undefined,
      metadata: payload.metadata as Record<string, string> | undefined,
    };
  } catch {
    return null;
  }
}
