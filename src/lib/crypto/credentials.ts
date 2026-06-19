import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { getIntegrationEncryptionSecret } from "@/lib/secrets";

const ALGO = "aes-256-gcm";
const VERSION = "v1";

function deriveKey(): Buffer {
  const secret = getIntegrationEncryptionSecret();
  return scryptSync(secret, "inkfit-integration-credentials", 32);
}

/** Encrypt OAuth tokens and secrets for database storage. */
export function encryptCredential(plaintext: string): string {
  const iv = randomBytes(12);
  const key = deriveKey();
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

/** Decrypt stored OAuth credentials. */
export function decryptCredential(payload: string): string {
  const [version, ivB64, tagB64, dataB64] = payload.split(":");
  if (version !== VERSION || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted credential format");
  }
  const key = deriveKey();
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
