import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gateCredits, chargeAfterGate } from "@/lib/credit-api";
import { generateBrandVoiceProfile } from "@/lib/ai/generations";
import {
  getBrandKitForUser,
  getBrandVoiceForUser,
  upsertBrandVoiceProfile,
  upsertBrandKitForUser,
} from "@/lib/persistence";
import type { BrandVoiceFormData, GeneratedBrandProfile } from "@/lib/brand-voice";

function formatProfileForContext(
  form: BrandVoiceFormData,
  profile: GeneratedBrandProfile
): string {
  return `Brand: ${form.brandName}
Industry: ${form.industry}
Audience: ${form.targetAudience}
Style: ${form.writingStyle}

Tone: ${profile.tone}
Vocabulary: ${profile.vocabulary}
Writing Patterns: ${profile.writingPatterns}
Audience Style: ${profile.audienceStyle}`;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ profile: null });
    }

    const row = await getBrandVoiceForUser(session.id);
    if (!row) return NextResponse.json({ profile: null });

    let profileData: GeneratedBrandProfile;
    try {
      profileData = JSON.parse(row.profileData) as GeneratedBrandProfile;
    } catch {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({
      profile: {
        brandName: row.brandName,
        industry: row.industry ?? "",
        targetAudience: row.targetAudience,
        writingStyle: row.writingStyle,
        trainingSamples: row.trainingSamples ?? "",
        profile: profileData,
        savedAt: row.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const form = body.form as BrandVoiceFormData;

    if (body.action === "generate") {
      const gate = await gateCredits("content_generation");
      if (!gate.ok) return gate.response;

      const { profile, live } = await generateBrandVoiceProfile(form, {
        userId: session.id,
      });

      if (live) await chargeAfterGate(gate, "content_generation");
      return NextResponse.json({ profile, live });
    }

    if (body.action === "save") {
      const profile = body.profile as GeneratedBrandProfile;
      const voiceText = formatProfileForContext(form, profile);

      await upsertBrandVoiceProfile(session.id, {
        brandName: form.brandName,
        industry: form.industry || null,
        targetAudience: form.targetAudience,
        writingStyle: form.writingStyle,
        trainingSamples: form.trainingSamples || null,
        profileData: JSON.stringify(profile),
      });

      await prisma.onboardingProfile.upsert({
        where: { userId: session.id },
        create: { userId: session.id, brandVoice: voiceText },
        update: { brandVoice: voiceText },
      });

      const existing = await getBrandKitForUser(session.id);
      await upsertBrandKitForUser(session.id, {
        companyName: form.brandName || existing?.companyName || "My Brand",
        targetAudience: form.targetAudience || existing?.targetAudience || "",
        writingStyle: profile.writingPatterns.slice(0, 500),
        tone: profile.tone.slice(0, 200),
        industry: form.industry || existing?.industry || null,
        primaryColor: existing?.primaryColor ?? "#4f46e5",
        secondaryColor: existing?.secondaryColor ?? "#6366f1",
        accentColor: existing?.accentColor ?? "#818cf8",
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
