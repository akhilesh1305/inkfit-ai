import { prisma } from "@/lib/prisma";
import { encryptCredential, decryptCredential } from "@/lib/crypto/credentials";
import {
  getIntegrationAdapter,
  getIntegrationMeta,
  listIntegrationProviders,
} from "@/lib/integrations/registry";
import type {
  IntegrationConnectionStatus,
  IntegrationConnectionView,
  IntegrationProviderId,
  IntegrationSyncStatus,
  OAuthTokens,
} from "@/lib/integrations/types";

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function mapSyncStatus(status: string | null | undefined): IntegrationSyncStatus {
  if (status === "success" || status === "error" || status === "pending") return status;
  return "never";
}

export function toConnectionView(
  row: {
    provider: string;
    status: string;
    accountLabel: string | null;
    accountEmail: string | null;
    profileImage: string | null;
    scopes: string;
    metadata: string;
    lastSyncAt: Date | null;
    lastSyncStatus: string | null;
    lastSyncError: string | null;
  },
  providerId: IntegrationProviderId
): IntegrationConnectionView {
  const adapter = getIntegrationAdapter(providerId);
  return {
    provider: providerId,
    status: row.status as IntegrationConnectionStatus,
    accountLabel: row.accountLabel,
    accountEmail: row.accountEmail,
    profileImage: row.profileImage,
    scopes: parseJson<string[]>(row.scopes, []),
    metadata: parseJson<Record<string, unknown>>(row.metadata, {}),
    lastSyncAt: row.lastSyncAt?.toISOString() ?? null,
    lastSyncStatus: mapSyncStatus(row.lastSyncStatus),
    lastSyncError: row.lastSyncError,
    oauthConfigured: adapter.isOAuthConfigured(),
    connected: row.status === "connected",
  };
}

export async function getConnectionRow(userId: string, provider: IntegrationProviderId) {
  return prisma.integrationConnection.findUnique({
    where: { userId_provider: { userId, provider } },
  });
}

export async function listConnectionsForUser(userId: string): Promise<IntegrationConnectionView[]> {
  const providers = listIntegrationProviders();
  const rows = await prisma.integrationConnection.findMany({ where: { userId } });
  const byProvider = new Map(rows.map((r) => [r.provider, r]));

  return providers.map((meta) => {
    const row = byProvider.get(meta.id);
    if (!row) {
      const adapter = getIntegrationAdapter(meta.id);
      return {
        provider: meta.id,
        status: "disconnected" as const,
        accountLabel: null,
        accountEmail: null,
        profileImage: null,
        scopes: [],
        metadata: {},
        lastSyncAt: null,
        lastSyncStatus: "never" as const,
        lastSyncError: null,
        oauthConfigured: adapter.isOAuthConfigured(),
        connected: false,
      };
    }
    return toConnectionView(row, meta.id);
  });
}

export async function saveOAuthConnection(
  userId: string,
  provider: IntegrationProviderId,
  tokens: OAuthTokens,
  account: {
    accountId: string;
    accountLabel: string;
    accountEmail?: string;
    profileImage?: string;
  },
  metadata: Record<string, unknown> = {}
) {
  return prisma.integrationConnection.upsert({
    where: { userId_provider: { userId, provider } },
    create: {
      userId,
      provider,
      status: "connected",
      accountId: account.accountId,
      accountLabel: account.accountLabel,
      accountEmail: account.accountEmail ?? null,
      profileImage: account.profileImage ?? null,
      encryptedAccessToken: encryptCredential(tokens.accessToken),
      encryptedRefreshToken: tokens.refreshToken
        ? encryptCredential(tokens.refreshToken)
        : null,
      tokenExpiresAt: tokens.expiresAt ?? null,
      scopes: JSON.stringify(tokens.scopes ?? []),
      metadata: JSON.stringify(metadata),
      lastSyncAt: new Date(),
      lastSyncStatus: "success",
      lastSyncError: null,
    },
    update: {
      status: "connected",
      accountId: account.accountId,
      accountLabel: account.accountLabel,
      accountEmail: account.accountEmail ?? null,
      profileImage: account.profileImage ?? null,
      encryptedAccessToken: encryptCredential(tokens.accessToken),
      encryptedRefreshToken: tokens.refreshToken
        ? encryptCredential(tokens.refreshToken)
        : null,
      tokenExpiresAt: tokens.expiresAt ?? null,
      scopes: JSON.stringify(tokens.scopes ?? []),
      metadata: JSON.stringify(metadata),
      lastSyncAt: new Date(),
      lastSyncStatus: "success",
      lastSyncError: null,
    },
  });
}

export async function connectDemo(
  userId: string,
  provider: IntegrationProviderId,
  metadata: Record<string, unknown> = {}
) {
  const adapter = getIntegrationAdapter(provider);
  const demoToken = `demo_${provider}_${userId}`;
  const account = await adapter.fetchAccountInfo(demoToken, metadata);
  return saveOAuthConnection(
    userId,
    provider,
    { accessToken: demoToken, scopes: ["demo"] },
    account,
    { ...metadata, mode: "demo" }
  );
}

export async function disconnectIntegration(userId: string, provider: IntegrationProviderId) {
  await prisma.integrationConnection.upsert({
    where: { userId_provider: { userId, provider } },
    create: {
      userId,
      provider,
      status: "disconnected",
    },
    update: {
      status: "disconnected",
      encryptedAccessToken: null,
      encryptedRefreshToken: null,
      tokenExpiresAt: null,
      accountId: null,
      accountLabel: null,
      accountEmail: null,
      profileImage: null,
      lastSyncError: null,
    },
  });
}

export async function getDecryptedAccessToken(
  userId: string,
  provider: IntegrationProviderId
): Promise<{ accessToken: string; refreshToken?: string; metadata: Record<string, unknown> } | null> {
  const row = await getConnectionRow(userId, provider);
  if (!row || row.status !== "connected" || !row.encryptedAccessToken) return null;

  const accessToken = decryptCredential(row.encryptedAccessToken);
  const refreshToken = row.encryptedRefreshToken
    ? decryptCredential(row.encryptedRefreshToken)
    : undefined;
  const metadata = parseJson<Record<string, unknown>>(row.metadata, {});

  if (
    row.tokenExpiresAt &&
    row.tokenExpiresAt.getTime() < Date.now() + 60_000 &&
    refreshToken
  ) {
    const adapter = getIntegrationAdapter(provider);
    try {
      const refreshed = await adapter.refreshTokens(refreshToken);
      await saveOAuthConnection(userId, provider, refreshed, {
        accountId: row.accountId ?? provider,
        accountLabel: row.accountLabel ?? getIntegrationMeta(provider).name,
        accountEmail: row.accountEmail ?? undefined,
        profileImage: row.profileImage ?? undefined,
      }, metadata);
      return {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken ?? refreshToken,
        metadata,
      };
    } catch {
      await prisma.integrationConnection.update({
        where: { userId_provider: { userId, provider } },
        data: { status: "error", lastSyncError: "Token refresh failed" },
      });
      return null;
    }
  }

  return { accessToken, refreshToken, metadata };
}

export async function updateSyncStatus(
  userId: string,
  provider: IntegrationProviderId,
  status: IntegrationSyncStatus,
  error?: string
) {
  await prisma.integrationConnection.update({
    where: { userId_provider: { userId, provider } },
    data: {
      lastSyncAt: new Date(),
      lastSyncStatus: status,
      lastSyncError: error ?? null,
      status: status === "error" ? "error" : "connected",
    },
  });
}

export async function markSyncing(userId: string, provider: IntegrationProviderId) {
  await prisma.integrationConnection.update({
    where: { userId_provider: { userId, provider } },
    data: { status: "syncing", lastSyncStatus: "pending" },
  });
}
