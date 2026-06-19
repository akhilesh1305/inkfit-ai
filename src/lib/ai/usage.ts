import { prisma } from "@/lib/prisma";

export type AIProviderName = "openai" | "gemini" | "none";

export interface AIGenerationLogEntry {
  userId?: string;
  feature: string;
  provider: AIProviderName;
  tokens?: number;
  success: boolean;
  error?: string;
}

export async function trackAIGeneration(entry: AIGenerationLogEntry): Promise<void> {
  try {
    if (entry.userId) {
      await prisma.aiGenerationLog.create({
        data: {
          userId: entry.userId,
          feature: entry.feature,
          provider: entry.provider,
          tokens: entry.tokens ?? null,
          success: entry.success,
          error: entry.error ?? null,
        },
      });
    }
  } catch {
    /* non-blocking */
  }
}
