import { trackAIGeneration } from "@/lib/ai/usage";
import type { AIProviderName } from "@/lib/ai/usage";

export type { AIProviderName };

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

export function hasOpenAIKey(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return !!key && key !== "sk-your-key-here" && key.startsWith("sk-");
}

export function hasGeminiKey(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return !!key && key.length > 10;
}

export function hasAnyAIProvider(): boolean {
  return hasOpenAIKey() || hasGeminiKey();
}

export function getActiveProvider(): AIProviderName {
  if (hasOpenAIKey()) return "openai";
  if (hasGeminiKey()) return "gemini";
  return "none";
}

const rateLimitBuckets = new Map<string, number[]>();
const RATE_LIMIT_MAX = 40;
const RATE_LIMIT_WINDOW_MS = 60_000;

export function checkRateLimit(key: string): void {
  const now = Date.now();
  const hits = (rateLimitBuckets.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    throw new AIServiceError(
      "AI rate limit exceeded. Please wait a moment and try again.",
      "RATE_LIMIT",
      true
    );
  }
  hits.push(now);
  rateLimitBuckets.set(key, hits);
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof AIServiceError
          ? error.retryable
          : error instanceof Error && /fetch|network|timeout/i.test(error.message);

      if (!retryable || attempt === maxAttempts - 1) break;
      await sleep(400 * Math.pow(2, attempt));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new AIServiceError(`${label} failed after retries`, "AI_ERROR", false);
}

async function callOpenAI(
  system: string,
  user: string,
  maxTokens: number
): Promise<{ text: string; provider: AIProviderName }> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new AIServiceError(
      `OpenAI error: ${body.slice(0, 200)}`,
      "OPENAI_ERROR",
      isRetryableStatus(res.status)
    );
  }

  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content ?? "",
    provider: "openai",
  };
}

async function callGemini(prompt: string): Promise<{ text: string; provider: AIProviderName }> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new AIServiceError(
      `Gemini error: ${body.slice(0, 200)}`,
      "GEMINI_ERROR",
      isRetryableStatus(res.status)
    );
  }

  const data = await res.json();
  return {
    text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
    provider: "gemini",
  };
}

export interface GenerateTextOptions {
  system: string;
  user: string;
  maxTokens?: number;
  brandContext?: string;
  userId?: string;
  feature?: string;
  rateLimitKey?: string;
}

export interface GenerateTextResult {
  text: string;
  provider: AIProviderName;
  live: boolean;
}

export async function generateText(opts: GenerateTextOptions): Promise<GenerateTextResult> {
  const {
    system,
    user,
    maxTokens = 2000,
    brandContext = "",
    userId,
    feature = "generate",
    rateLimitKey,
  } = opts;

  if (!hasAnyAIProvider()) {
    return { text: "", provider: "none", live: false };
  }

  const limitKey = rateLimitKey ?? userId ?? "global";
  checkRateLimit(limitKey);

  const systemPrompt = brandContext.trim()
    ? `${system}\n\n${brandContext.trim()}`
    : system;

  try {
    const result = await withRetry(async () => {
      if (hasOpenAIKey()) return callOpenAI(systemPrompt, user, maxTokens);
      return callGemini(`${systemPrompt}\n\n${user}`);
    }, feature);

    await trackAIGeneration({
      userId,
      feature,
      provider: result.provider,
      success: Boolean(result.text),
    });

    return { text: result.text, provider: result.provider, live: Boolean(result.text) };
  } catch (error) {
    await trackAIGeneration({
      userId,
      feature,
      provider: getActiveProvider(),
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/** @deprecated Use generateText — kept for backward compatibility */
export async function generate(
  system: string,
  user: string,
  maxTokens = 2000,
  knowledgeContext?: string
): Promise<string> {
  const { text } = await generateText({
    system,
    user,
    maxTokens,
    brandContext: knowledgeContext,
    feature: "legacy_generate",
  });
  return text;
}

export interface ImageGenerationResult {
  url: string;
  prompt: string;
  live: boolean;
}

export async function generateImageFromPrompt(
  fullPrompt: string,
  size: string,
  userId?: string
): Promise<ImageGenerationResult> {
  if (!hasOpenAIKey()) {
    return { url: "", prompt: fullPrompt, live: false };
  }

  checkRateLimit(userId ?? "global-image");

  try {
    const res = await withRetry(async () => {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ model: "dall-e-3", prompt: fullPrompt, size, n: 1 }),
      });

      if (!response.ok) {
        throw new AIServiceError(
          await response.text(),
          "OPENAI_IMAGE_ERROR",
          isRetryableStatus(response.status)
        );
      }
      return response;
    }, "image_generation");

    const data = await res.json();
    const url = data.data?.[0]?.url ?? "";

    await trackAIGeneration({
      userId,
      feature: "image_generation",
      provider: "openai",
      success: Boolean(url),
    });

    return { url, prompt: fullPrompt, live: Boolean(url) };
  } catch (error) {
    await trackAIGeneration({
      userId,
      feature: "image_generation",
      provider: "openai",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
    return { url: "", prompt: fullPrompt, live: false };
  }
}

export function parseAIJson<T>(raw: string): T {
  const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
  const start = cleaned.indexOf("{");
  const arrStart = cleaned.indexOf("[");
  const sliceFrom =
    start === -1 ? arrStart : arrStart === -1 ? start : Math.min(start, arrStart);
  const jsonSlice = sliceFrom >= 0 ? cleaned.slice(sliceFrom) : cleaned;
  return JSON.parse(jsonSlice) as T;
}
