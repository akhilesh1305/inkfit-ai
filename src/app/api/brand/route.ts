import { NextResponse } from "next/server";
import { DEFAULT_BRAND } from "@/lib/brand";
import { getBrandKitForUser, upsertBrandKitForUser } from "@/lib/persistence";
import { requirePermission } from "@/lib/auth-guard";
import { gateAuth } from "@/lib/credit-api";

export async function GET() {
  try {
    const auth = await gateAuth("content:read");
    if (!auth.ok) return auth.response;

    const brand = await getBrandKitForUser(auth.ctx.user.id);
    if (!brand) return NextResponse.json({ brand: DEFAULT_BRAND });

    return NextResponse.json({
      brand: {
        id: brand.id,
        companyName: brand.companyName,
        primaryColor: brand.primaryColor,
        secondaryColor: brand.secondaryColor,
        accentColor: brand.accentColor,
        targetAudience: brand.targetAudience,
        writingStyle: brand.writingStyle,
        tone: brand.tone,
        industry: brand.industry ?? "",
      },
    });
  } catch {
    return NextResponse.json({ brand: DEFAULT_BRAND });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requirePermission("settings:brand");
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const brand = await upsertBrandKitForUser(auth.ctx.user.id, {
      companyName: body.companyName,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      accentColor: body.accentColor,
      targetAudience: body.targetAudience,
      writingStyle: body.writingStyle,
      tone: body.tone,
      industry: body.industry || null,
    });

    return NextResponse.json({ brand });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
