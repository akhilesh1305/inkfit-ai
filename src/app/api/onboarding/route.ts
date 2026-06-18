import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generate, hasGeminiKey, hasOpenAIKey } from "@/lib/ai";
import { getKnowledgeContextForUser } from "@/lib/knowledge-context";
import {
  DEFAULT_ONBOARDING_FORM,
  generateOnboardingProfile,
  parseGeneratedProfile,
  type GeneratedOnboardingProfile,
  type OnboardingFormData,
} from "@/lib/onboarding";

function mapRow(row: {
  completed: boolean;
  businessName: string | null;
  websiteUrl: string | null;
  industry: string | null;
  companySize: string | null;
  audienceType: string | null;
  goals: string | null;
  mainChallenges: string | null;
  contentGoals: string | null;
  brandVoice: string | null;
  generatedData: string | null;
}) {
  const contentGoals = row.contentGoals ? JSON.parse(row.contentGoals) : [];
  return {
    completed: row.completed,
    businessName: row.businessName ?? "",
    websiteUrl: row.websiteUrl ?? "",
    industry: row.industry ?? "",
    companySize: row.companySize ?? "",
    audienceType: row.audienceType ?? "",
    goals: row.goals ?? "",
    mainChallenges: row.mainChallenges ?? "",
    contentGoals,
    brandVoice: row.brandVoice ?? "professional",
    generated: parseGeneratedProfile(row.generatedData),
  };
}

async function enhanceWithAI(
  form: OnboardingFormData,
  base: GeneratedOnboardingProfile,
  knowledgeContext?: string
): Promise<GeneratedOnboardingProfile> {
  if (!hasGeminiKey() && !hasOpenAIKey()) return base;

  try {
    const raw = await generate(
      `Onboarding strategist. Return ONLY valid JSON:
{
  "contentPillars": [{ "title", "description" }] (4 items),
  "brandVoiceSummary": { "tone", "vocabulary", "writingPatterns", "audienceStyle" },
  "suggestedStrategy": "markdown string",
  "initialCalendar": [{ "day", "title", "type", "platform" }] (5 weekdays)
}`,
      `Business: ${form.businessName}
Industry: ${form.industry}
Audience: ${form.audienceType} — ${form.goals}
Challenges: ${form.mainChallenges}
Content goals: ${form.contentGoals.join(", ")}
Brand voice: ${form.brandVoice}`,
      3500,
      knowledgeContext
    );
    const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, ""));
    return {
      contentPillars: parsed.contentPillars?.length >= 3 ? parsed.contentPillars : base.contentPillars,
      brandVoiceSummary: { ...base.brandVoiceSummary, ...parsed.brandVoiceSummary },
      suggestedStrategy: parsed.suggestedStrategy ?? base.suggestedStrategy,
      initialCalendar:
        parsed.initialCalendar?.length >= 3 ? parsed.initialCalendar : base.initialCalendar,
    };
  } catch {
    return base;
  }
}

async function syncBrandKit(
  userId: string,
  form: OnboardingFormData,
  generated: GeneratedOnboardingProfile
) {
  const voice = form.brandVoice;
  const toneMap: Record<string, string> = {
    professional: "Professional",
    casual: "Casual",
    friendly: "Friendly",
    technical: "Authoritative",
    luxury: "Marketing",
    creative: "Conversational",
  };

  const data = {
    companyName: form.businessName,
    primaryColor: "#7C3AED",
    secondaryColor: "#06B6D4",
    accentColor: "#A78BFA",
    targetAudience: form.goals || form.audienceType,
    writingStyle: voice,
    tone: toneMap[voice] ?? "Professional",
    industry: form.industry || null,
  };

  const existing = await prisma.brandKit.findFirst();
  if (existing) {
    await prisma.brandKit.update({ where: { id: existing.id }, data });
  } else {
    await prisma.brandKit.create({ data });
  }

  await prisma.personalBrandProfile.upsert({
    where: { userId },
    create: {
      userId,
      name: form.businessName,
      industry: form.industry,
      targetAudience: form.goals,
      platform: "LinkedIn",
      outputData: JSON.stringify({
        metrics: {
          personalBrandScore: 72,
          consistency: 70,
          thoughtLeadership: 74,
          contentQuality: 71,
          engagementPotential: 75,
        },
        source: "onboarding",
        pillars: generated.contentPillars,
      }),
    },
    update: {
      name: form.businessName,
      industry: form.industry,
      targetAudience: form.goals,
    },
  });
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const row = await prisma.onboardingProfile.findUnique({
      where: { userId: session.id },
    });

    if (!row) {
      return NextResponse.json({
        ...DEFAULT_ONBOARDING_FORM,
        completed: true,
        generated: null,
      });
    }

    return NextResponse.json(mapRow(row));
  } catch {
    return NextResponse.json({ ...DEFAULT_ONBOARDING_FORM, completed: false, generated: null });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "save") {
      const form = body.form as OnboardingFormData;
      await prisma.onboardingProfile.upsert({
        where: { userId: session.id },
        create: {
          userId: session.id,
          businessName: form.businessName,
          websiteUrl: form.websiteUrl || null,
          industry: form.industry,
          companySize: form.companySize || null,
          audienceType: form.audienceType || null,
          goals: form.goals,
          mainChallenges: form.mainChallenges,
          contentGoals: JSON.stringify(form.contentGoals ?? []),
          brandVoice: form.brandVoice,
        },
        update: {
          businessName: form.businessName,
          websiteUrl: form.websiteUrl || null,
          industry: form.industry,
          companySize: form.companySize || null,
          audienceType: form.audienceType || null,
          goals: form.goals,
          mainChallenges: form.mainChallenges,
          contentGoals: JSON.stringify(form.contentGoals ?? []),
          brandVoice: form.brandVoice,
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "complete") {
      const form = body.form as OnboardingFormData;
      const base = generateOnboardingProfile(form);
      const kb = await getKnowledgeContextForUser(session.id);
      const generated = await enhanceWithAI(form, base, kb);

      await prisma.onboardingProfile.upsert({
        where: { userId: session.id },
        create: {
          userId: session.id,
          completed: true,
          businessName: form.businessName,
          websiteUrl: form.websiteUrl || null,
          industry: form.industry,
          companySize: form.companySize || null,
          audienceType: form.audienceType || null,
          goals: form.goals,
          mainChallenges: form.mainChallenges,
          contentGoals: JSON.stringify(form.contentGoals ?? []),
          brandVoice: form.brandVoice,
          generatedData: JSON.stringify(generated),
        },
        update: {
          completed: true,
          businessName: form.businessName,
          websiteUrl: form.websiteUrl || null,
          industry: form.industry,
          companySize: form.companySize || null,
          audienceType: form.audienceType || null,
          goals: form.goals,
          mainChallenges: form.mainChallenges,
          contentGoals: JSON.stringify(form.contentGoals ?? []),
          brandVoice: form.brandVoice,
          generatedData: JSON.stringify(generated),
        },
      });

      await syncBrandKit(session.id, form, generated);

      return NextResponse.json({ completed: true, generated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
