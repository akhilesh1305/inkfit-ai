/**
 * InkFit Browser Extension — shared protocol types.
 * Import from extension package and web app for consistent messaging.
 */

export const EXTENSION_PROTOCOL_VERSION = "1.0.0";

export const EXTENSION_MESSAGE_TYPES = {
  PING: "INKFIT_PING",
  AUTH_REQUEST: "INKFIT_AUTH_REQUEST",
  AUTH_TOKEN: "INKFIT_AUTH_TOKEN",
  CONTENT_CAPTURE: "INKFIT_CONTENT_CAPTURE",
  CONTENT_INSERT: "INKFIT_CONTENT_INSERT",
  INTEGRATION_STATUS: "INKFIT_INTEGRATION_STATUS",
  SYNC_WEBSITES: "INKFIT_SYNC_WEBSITES",
} as const;

export type ExtensionMessageType =
  (typeof EXTENSION_MESSAGE_TYPES)[keyof typeof EXTENSION_MESSAGE_TYPES];

export interface ExtensionPingPayload {
  version: string;
  browser: "chrome" | "edge" | "brave";
  installedAt?: string;
}

export interface ExtensionAuthTokenPayload {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface ExtensionContentCapturePayload {
  platform: string;
  url: string;
  title: string;
  selection?: string;
  html?: string;
}

export interface ExtensionContentInsertPayload {
  platform: string;
  url: string;
  content: string;
  format: "plain" | "html" | "markdown";
}

export interface ExtensionMessage<T = unknown> {
  type: ExtensionMessageType;
  protocolVersion: string;
  requestId: string;
  timestamp: string;
  payload: T;
}

export interface ExtensionMessageResponse<T = unknown> {
  ok: boolean;
  requestId: string;
  payload?: T;
  error?: string;
}

/** Origin allowlist for postMessage from extension content scripts */
export const EXTENSION_ALLOWED_ORIGINS = [
  "chrome-extension://",
  "https://inkfit-ai-livid.vercel.app",
  "http://localhost:3000",
] as const;

export function isExtensionOrigin(origin: string): boolean {
  return EXTENSION_ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
}

export function createExtensionMessage<T>(
  type: ExtensionMessageType,
  payload: T
): ExtensionMessage<T> {
  return {
    type,
    protocolVersion: EXTENSION_PROTOCOL_VERSION,
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    payload,
  };
}
