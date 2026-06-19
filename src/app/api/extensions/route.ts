import { NextResponse } from "next/server";
import { gateAuth } from "@/lib/credit-api";
import { prisma } from "@/lib/prisma";
import { EXTENSION_PROTOCOL_VERSION } from "@/lib/extension-protocol";
import {
  INTEGRATIONS,
  DEMO_WEBSITES,
  LATEST_EXTENSION_VERSION,
  buildUsageSummary,
  normalizeDomain,
  resolveInstallState,
  type ConnectedWebsite,
  type ExtensionIntegration,
  type ExtensionStatus,
  type ExtensionsDashboard,
  type IntegrationPlatform,
} from "@/lib/extensions";

async function seedUser(userId: string) {
  const settings = await prisma.extensionSettings.findUnique({ where: { userId } });
  if (!settings) {
    await prisma.extensionSettings.create({
      data: {
        userId,
        installed: true,
        version: LATEST_EXTENSION_VERSION,
        lastSeenAt: new Date(),
      },
    });
  }

  const intCount = await prisma.extensionIntegration.count({ where: { userId } });
  if (intCount === 0) {
    for (const meta of INTEGRATIONS) {
      const isLinkedInOrGmail = meta.id === "linkedin" || meta.id === "gmail";
      await prisma.extensionIntegration.create({
        data: {
          userId,
          platform: meta.id,
          connected: isLinkedInOrGmail,
          account: isLinkedInOrGmail ? `user@${meta.hostPatterns[0]}` : null,
          usageCount: isLinkedInOrGmail ? (meta.id === "linkedin" ? 24 : 16) : 0,
          lastUsedAt: isLinkedInOrGmail ? new Date() : null,
        },
      });
    }
  }

  const siteCount = await prisma.extensionWebsite.count({ where: { userId } });
  if (siteCount === 0) {
    for (const site of DEMO_WEBSITES) {
      await prisma.extensionWebsite.create({
        data: {
          userId,
          domain: site.domain,
          label: site.label,
          status: site.status,
          lastSyncAt: site.lastSyncAt ? new Date(site.lastSyncAt) : null,
        },
      });
    }
  }
}

function mapDashboard(
  settings: {
    installed: boolean;
    version: string | null;
    lastSeenAt: Date | null;
  },
  integrations: {
    platform: string;
    connected: boolean;
    account: string | null;
    usageCount: number;
    lastUsedAt: Date | null;
  }[],
  websites: {
    id: string;
    domain: string;
    label: string | null;
    status: string;
    lastSyncAt: Date | null;
  }[]
): ExtensionsDashboard {
  const mappedIntegrations: ExtensionIntegration[] = integrations.map((row) => ({
    platform: row.platform as IntegrationPlatform,
    connected: row.connected,
    account: row.account,
    usageCount: row.usageCount,
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
  }));

  const status: ExtensionStatus = {
    installed: settings.installed,
    version: settings.version,
    lastSeenAt: settings.lastSeenAt?.toISOString() ?? null,
    installState: resolveInstallState(settings.installed, settings.version),
    latestVersion: LATEST_EXTENSION_VERSION,
  };

  const mappedWebsites: ConnectedWebsite[] = websites.map((w) => ({
    id: w.id,
    domain: w.domain,
    label: w.label,
    status: w.status as ConnectedWebsite["status"],
    lastSyncAt: w.lastSyncAt?.toISOString() ?? null,
  }));

  return {
    status,
    integrations: mappedIntegrations,
    websites: mappedWebsites,
    usage: buildUsageSummary(mappedIntegrations),
  };
}

export async function GET() {
  try {
    const auth = await gateAuth("content:read");
    if (!auth.ok) return auth.response;
    const userId = auth.ctx.user.id;

    await seedUser(userId);

    const [settings, integrations, websites] = await Promise.all([
      prisma.extensionSettings.findUniqueOrThrow({ where: { userId } }),
      prisma.extensionIntegration.findMany({ where: { userId } }),
      prisma.extensionWebsite.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      dashboard: mapDashboard(settings, integrations, websites),
      protocolVersion: EXTENSION_PROTOCOL_VERSION,
    });
  } catch {
    const { buildDemoDashboard } = await import("@/lib/extensions");
    return NextResponse.json({
      dashboard: buildDemoDashboard(),
      protocolVersion: EXTENSION_PROTOCOL_VERSION,
    });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await gateAuth("content:write");
    if (!auth.ok) return auth.response;
    const userId = auth.ctx.user.id;

    const body = await req.json();
    await seedUser(userId);

    if (body.action === "toggle-integration") {
      const platform = String(body.platform) as IntegrationPlatform;
      const connected = !!body.connected;

      await prisma.extensionIntegration.updateMany({
        where: { userId: userId, platform },
        data: {
          connected,
          account: connected ? body.account ?? `user@${platform}.com` : null,
          lastUsedAt: connected ? new Date() : undefined,
        },
      });

      return NextResponse.json({ ok: true });
    }

    if (body.action === "add-website") {
      const domain = normalizeDomain(String(body.domain ?? ""));
      if (!domain.includes(".")) {
        return NextResponse.json({ error: "Valid domain required" }, { status: 400 });
      }

      await prisma.extensionWebsite.upsert({
        where: { userId_domain: { userId: userId, domain } },
        create: {
          userId: userId,
          domain,
          label: body.label?.trim() || domain,
          status: "active",
          lastSyncAt: new Date(),
        },
        update: {
          label: body.label?.trim() || domain,
          status: "active",
          lastSyncAt: new Date(),
        },
      });

      return NextResponse.json({ ok: true });
    }

    if (body.action === "remove-website") {
      await prisma.extensionWebsite.deleteMany({
        where: { id: body.id, userId: userId },
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "toggle-website") {
      const status = body.status === "active" ? "active" : "paused";
      await prisma.extensionWebsite.updateMany({
        where: { id: body.id, userId: userId },
        data: { status },
      });
      return NextResponse.json({ ok: true });
    }

    /** Future: called by browser extension on install / heartbeat */
    if (body.action === "extension-ping") {
      const version = String(body.version ?? LATEST_EXTENSION_VERSION);
      await prisma.extensionSettings.upsert({
        where: { userId: userId },
        create: {
          userId: userId,
          installed: true,
          version,
          lastSeenAt: new Date(),
        },
        update: {
          installed: true,
          version,
          lastSeenAt: new Date(),
        },
      });
      return NextResponse.json({
        ok: true,
        protocolVersion: EXTENSION_PROTOCOL_VERSION,
        latestVersion: LATEST_EXTENSION_VERSION,
      });
    }

    if (body.action === "mark-installed") {
      await prisma.extensionSettings.upsert({
        where: { userId: userId },
        create: {
          userId: userId,
          installed: true,
          version: LATEST_EXTENSION_VERSION,
          lastSeenAt: new Date(),
        },
        update: {
          installed: true,
          version: LATEST_EXTENSION_VERSION,
          lastSeenAt: new Date(),
        },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
