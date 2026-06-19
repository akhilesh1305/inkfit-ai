const DEV_AUTH_SECRET = "inkfit-dev-secret-local-only";
const DEV_INTEGRATION_SECRET = "inkfit-dev-integration-key-local-only";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** JWT signing key — never falls back in production. */
export function getAuthSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    if (isProduction()) {
      throw new Error("AUTH_SECRET must be set in production");
    }
    return new TextEncoder().encode(DEV_AUTH_SECRET);
  }
  return new TextEncoder().encode(secret);
}

/** Key material for encrypting integration OAuth tokens. */
export function getIntegrationEncryptionSecret(): string {
  const key = process.env.INTEGRATION_ENCRYPTION_KEY?.trim();
  if (key) return key;

  const auth = process.env.AUTH_SECRET?.trim();
  if (auth) return auth;

  if (isProduction()) {
    throw new Error(
      "INTEGRATION_ENCRYPTION_KEY or AUTH_SECRET must be set in production"
    );
  }
  return DEV_INTEGRATION_SECRET;
}
