import { prisma } from "@/lib/prisma";
import { brandContext, type BrandKit } from "@/lib/brand";
import { getKnowledgeContextForUser } from "@/lib/knowledge-context";
import { getBrandKitForUser } from "@/lib/persistence";

export interface AIContext {
  brand?: BrandKit;
  brandVoiceNotes?: string;
  knowledgeContext: string;
}

function mapBrandRow(brand: {
  id: string;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  targetAudience: string;
  writingStyle: string;
  tone: string;
  industry: string | null;
}): BrandKit {
  return {
    id: brand.id,
    companyName: brand.companyName,
    primaryColor: brand.primaryColor,
    secondaryColor: brand.secondaryColor,
    accentColor: brand.accentColor,
    targetAudience: brand.targetAudience,
    writingStyle: brand.writingStyle,
    tone: brand.tone,
    industry: brand.industry ?? undefined,
  };
}

export async function getBrandKit(userId: string): Promise<BrandKit | undefined> {
  try {
    const brand = await getBrandKitForUser(userId);
    if (!brand) return undefined;
    return mapBrandRow(brand);
  } catch {
    return undefined;
  }
}

export async function buildAIContext(userId: string): Promise<AIContext> {
  const brandRow = await getBrandKitForUser(userId);
  const brand = brandRow ? mapBrandRow(brandRow) : undefined;
  let brandVoiceNotes = "";

  try {
    const voice = await prisma.brandVoiceProfile.findUnique({
      where: { userId },
      select: { profileData: true, brandName: true },
    });
    if (voice?.profileData) {
      const parsed = JSON.parse(voice.profileData) as { tone?: string; vocabulary?: string };
      brandVoiceNotes = `Brand: ${voice.brandName}\nTone: ${parsed.tone ?? ""}\nVocabulary: ${parsed.vocabulary ?? ""}`;
    }

    const onboarding = await prisma.onboardingProfile.findUnique({
      where: { userId },
      select: { brandVoice: true },
    });
    if (onboarding?.brandVoice?.trim() && !brandVoiceNotes) {
      brandVoiceNotes = onboarding.brandVoice.trim();
    }
  } catch {
    /* ignore */
  }

  const knowledgeContext = await getKnowledgeContextForUser(userId);

  return { brand, brandVoiceNotes, knowledgeContext };
}

export function formatBrandContext(ctx: AIContext): string {
  const parts: string[] = [];

  if (ctx.brand) {
    const kit = brandContext(ctx.brand);
    if (kit) parts.push(kit);
  }

  if (ctx.brandVoiceNotes) {
    parts.push(`## Brand Voice Profile\n${ctx.brandVoiceNotes}`);
  }

  if (ctx.knowledgeContext?.trim()) {
    parts.push(ctx.knowledgeContext.trim());
  }

  return parts.join("\n\n");
}
