export type WritingStyleId =
  | "professional"
  | "friendly"
  | "casual"
  | "luxury"
  | "technical"
  | "creative";

export interface WritingStyleOption {
  id: WritingStyleId;
  label: string;
  description: string;
}

export const WRITING_STYLES: WritingStyleOption[] = [
  {
    id: "professional",
    label: "Professional",
    description: "Clear, credible, and business-appropriate",
  },
  {
    id: "friendly",
    label: "Friendly",
    description: "Warm, approachable, and conversational",
  },
  {
    id: "casual",
    label: "Casual",
    description: "Relaxed, direct, and easy-going",
  },
  {
    id: "luxury",
    label: "Luxury",
    description: "Refined, elegant, and premium",
  },
  {
    id: "technical",
    label: "Technical",
    description: "Precise, detailed, and expert-led",
  },
  {
    id: "creative",
    label: "Creative",
    description: "Bold, expressive, and imaginative",
  },
];

export interface BrandVoiceFormData {
  brandName: string;
  industry: string;
  targetAudience: string;
  writingStyle: WritingStyleId;
  trainingSamples: string;
}

export interface GeneratedBrandProfile {
  tone: string;
  vocabulary: string;
  writingPatterns: string;
  audienceStyle: string;
}

export interface SavedBrandVoiceProfile extends BrandVoiceFormData {
  profile: GeneratedBrandProfile;
  savedAt: string;
}

const STORAGE_KEY = "inkfit-brand-voice-profile";

export function loadBrandVoiceProfile(): SavedBrandVoiceProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedBrandVoiceProfile;
  } catch {
    return null;
  }
}

export function saveBrandVoiceProfile(data: SavedBrandVoiceProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearBrandVoiceProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}

const STYLE_TONE: Record<WritingStyleId, string> = {
  professional:
    "Authoritative yet accessible — confident statements, minimal fluff, and a focus on clarity and credibility.",
  friendly:
    "Warm and inclusive — uses second person, encouraging language, and a helpful mentor-like presence.",
  casual:
    "Relaxed and conversational — short sentences, everyday language, and an authentic peer-to-peer feel.",
  luxury:
    "Sophisticated and aspirational — refined word choice, sensory details, and an exclusive premium tone.",
  technical:
    "Expert and precise — domain terminology, structured explanations, and evidence-backed assertions.",
  creative:
    "Expressive and memorable — vivid metaphors, varied rhythm, and distinctive phrasing that stands out.",
};

function wordStats(text: string) {
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? [];
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  return { wordCount: words.length, top };
}

function avgSentenceLength(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (!sentences.length) return 0;
  const words = sentences.reduce((n, s) => n + s.trim().split(/\s+/).length, 0);
  return Math.round(words / sentences.length);
}

export function generateBrandProfile(data: BrandVoiceFormData): GeneratedBrandProfile {
  const { brandName, industry, targetAudience, writingStyle, trainingSamples } = data;
  const stats = wordStats(trainingSamples);
  const avgLen = avgSentenceLength(trainingSamples);
  const hasSamples = trainingSamples.trim().length > 50;

  const tone = hasSamples
    ? `${STYLE_TONE[writingStyle]} Analysis of your samples suggests a ${avgLen > 18 ? "more expansive" : avgLen < 12 ? "punchy, concise" : "balanced"} delivery suited for ${industry || "your industry"}.`
    : STYLE_TONE[writingStyle];

  const topWords = stats.top.map(([w]) => w).join(", ") || "brand, value, growth, solution";
  const vocabulary = hasSamples
    ? `Frequently used terms: ${topWords}. Vocabulary aligns with ${writingStyle} communication — ${writingStyle === "technical" ? "precise and domain-specific" : writingStyle === "luxury" ? "elevated and selective" : "clear and audience-appropriate"} word choices for ${brandName || "your brand"}.`
    : `Recommended vocabulary for ${writingStyle} ${industry || "brands"}: focus on clarity, benefit-driven language, and terms your audience (${targetAudience || "readers"}) already uses.`;

  const writingPatterns = hasSamples
    ? `Average sentence length: ~${avgLen} words. ${avgLen < 14 ? "Favors short, scannable paragraphs and direct hooks." : "Uses developed paragraphs with supporting detail."} Maintains consistent ${writingStyle} voice across long-form and social formats.`
    : `Default ${writingStyle} patterns: structured openings, value-led body copy, and clear calls-to-action. InkFit AI will mirror this rhythm in generated content.`;

  const audienceStyle = `Content tailored for ${targetAudience || "your target audience"} in the ${industry || "general"} space. Messaging prioritizes their goals, pain points, and preferred channels while staying true to ${brandName || "your brand"}'s ${writingStyle} identity.`;

  return { tone, vocabulary, writingPatterns, audienceStyle };
}
