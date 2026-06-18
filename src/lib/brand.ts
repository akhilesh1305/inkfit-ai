export interface BrandKit {
  id?: string;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  targetAudience: string;
  writingStyle: string;
  tone: string;
  industry?: string;
}

export const DEFAULT_BRAND: BrandKit = {
  companyName: "",
  primaryColor: "#4f46e5",
  secondaryColor: "#6366f1",
  accentColor: "#818cf8",
  targetAudience: "",
  writingStyle: "",
  tone: "Professional",
  industry: "",
};

export function brandContext(brand: BrandKit): string {
  if (!brand.companyName) return "";
  return `
Brand: ${brand.companyName}
Target Audience: ${brand.targetAudience || "General business audience"}
Writing Style: ${brand.writingStyle || "Clear and engaging"}
Tone: ${brand.tone}
Industry: ${brand.industry || "Not specified"}
Brand Colors: Primary ${brand.primaryColor}, Secondary ${brand.secondaryColor}
Always keep content consistent with this brand identity.`.trim();
}
