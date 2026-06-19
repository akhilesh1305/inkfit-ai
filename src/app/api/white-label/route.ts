import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import {
  DEFAULT_WHITE_LABEL,
  normalizeDomain,
  type DomainStatus,
  type WhiteLabelConfig,
} from "@/lib/white-label";
import { sanitizeLogoDataUrl } from "@/lib/logo-upload";

function mapRow(row: {
  id: string;
  enabled: boolean;
  brandName: string;
  logoDataUrl: string | null;
  customDomain: string | null;
  domainStatus: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  loginHeadline: string;
  loginSubheadline: string;
  loginTagline: string;
  portalWelcome: string;
  hidePoweredBy: boolean;
}): WhiteLabelConfig {
  return {
    id: row.id,
    enabled: row.enabled,
    brandName: row.brandName,
    logoDataUrl: row.logoDataUrl,
    customDomain: row.customDomain,
    domainStatus: row.domainStatus as DomainStatus,
    primaryColor: row.primaryColor,
    secondaryColor: row.secondaryColor,
    accentColor: row.accentColor,
    loginHeadline: row.loginHeadline,
    loginSubheadline: row.loginSubheadline,
    loginTagline: row.loginTagline,
    portalWelcome: row.portalWelcome,
    hidePoweredBy: row.hidePoweredBy,
  };
}

async function getOrCreate(userId: string): Promise<WhiteLabelConfig> {
  const existing = await prisma.whiteLabelSettings.findUnique({ where: { userId } });
  if (existing) return mapRow(existing);

  const row = await prisma.whiteLabelSettings.create({
    data: {
      userId,
      ...DEFAULT_WHITE_LABEL,
      logoDataUrl: null,
      customDomain: null,
      domainStatus: "none",
    },
  });
  return mapRow(row);
}

export async function GET() {
  try {
    const auth = await requirePermission("settings:white_label");
    if (!auth.ok) return auth.response;

    const config = await getOrCreate(auth.ctx.user.id);
    return NextResponse.json({ config });
  } catch {
    return NextResponse.json({ config: DEFAULT_WHITE_LABEL });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requirePermission("settings:white_label");
    if (!auth.ok) return auth.response;
    const userId = auth.ctx.user.id;

    const body = await req.json();

    if (body.action === "save") {
      const data = body.config as WhiteLabelConfig;
      if (!data?.brandName?.trim()) {
        return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
      }

      const logo = sanitizeLogoDataUrl(data.logoDataUrl);

      const row = await prisma.whiteLabelSettings.upsert({
        where: { userId },
        create: {
          userId,
          enabled: !!data.enabled,
          brandName: data.brandName.trim(),
          logoDataUrl: logo,
          customDomain: data.customDomain?.trim() || null,
          domainStatus: data.domainStatus ?? "none",
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          accentColor: data.accentColor,
          loginHeadline: data.loginHeadline.trim(),
          loginSubheadline: data.loginSubheadline.trim(),
          loginTagline: data.loginTagline.trim(),
          portalWelcome: data.portalWelcome.trim(),
          hidePoweredBy: !!data.hidePoweredBy,
        },
        update: {
          enabled: !!data.enabled,
          brandName: data.brandName.trim(),
          logoDataUrl: logo,
          customDomain: data.customDomain?.trim() || null,
          domainStatus: data.domainStatus ?? "none",
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          accentColor: data.accentColor,
          loginHeadline: data.loginHeadline.trim(),
          loginSubheadline: data.loginSubheadline.trim(),
          loginTagline: data.loginTagline.trim(),
          portalWelcome: data.portalWelcome.trim(),
          hidePoweredBy: !!data.hidePoweredBy,
        },
      });

      return NextResponse.json({ config: mapRow(row), saved: true });
    }

    if (body.action === "verify-domain") {
      const domain = normalizeDomain(String(body.domain ?? ""));
      if (!domain || !domain.includes(".")) {
        return NextResponse.json({ error: "Enter a valid domain" }, { status: 400 });
      }

      const row = await prisma.whiteLabelSettings.upsert({
        where: { userId },
        create: {
          userId,
          ...DEFAULT_WHITE_LABEL,
          customDomain: domain,
          domainStatus: "verified",
        },
        update: {
          customDomain: domain,
          domainStatus: "verified",
        },
      });

      return NextResponse.json({ config: mapRow(row) });
    }

    if (body.action === "remove-logo") {
      const row = await prisma.whiteLabelSettings.update({
        where: { userId },
        data: { logoDataUrl: null },
      });
      return NextResponse.json({ config: mapRow(row) });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
