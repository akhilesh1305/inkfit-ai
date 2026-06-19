import { NextResponse } from "next/server";

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const buckets = new Map<string, number[]>();

function prune(key: string, now: number, windowMs: number): number[] {
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  buckets.set(key, hits);
  return hits;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const hits = prune(key, now, config.windowMs);

  if (hits.length >= config.maxAttempts) {
    const oldest = hits[0] ?? now;
    const retryAfterSec = Math.ceil((config.windowMs - (now - oldest)) / 1000);
    return { ok: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  hits.push(now);
  buckets.set(key, hits);
  return { ok: true };
}

export function rateLimitResponse(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    }
  );
}

export const AUTH_RATE_LIMITS = {
  login: { maxAttempts: 10, windowMs: 15 * 60 * 1000 },
  register: { maxAttempts: 5, windowMs: 60 * 60 * 1000 },
} as const;
