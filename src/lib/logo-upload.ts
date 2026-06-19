const ALLOWED_PREFIXES = [
  "data:image/png;base64,",
  "data:image/jpeg;base64,",
  "data:image/jpg;base64,",
  "data:image/webp;base64,",
] as const;

const MAX_LOGO_LENGTH = 600_000;

/** Allow only raster image data URIs; reject SVG and other types (XSS risk). */
export function sanitizeLogoDataUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;

  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes("svg") || lower.startsWith("data:image/svg")) {
    return null;
  }

  if (!ALLOWED_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
    return null;
  }

  if (trimmed.length > MAX_LOGO_LENGTH) {
    return null;
  }

  return trimmed;
}
