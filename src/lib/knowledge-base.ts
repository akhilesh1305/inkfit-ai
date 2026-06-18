export type KnowledgeCategory =
  | "brand"
  | "product"
  | "sales"
  | "support"
  | "marketing"
  | "general";

export type KnowledgeSourceType = "pdf" | "docx" | "txt" | "url";

export type KnowledgeStatus = "processing" | "ready" | "error";

export interface KnowledgeCategoryMeta {
  id: KnowledgeCategory;
  label: string;
  description: string;
  gradient: string;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  category: KnowledgeCategory;
  sourceType: KnowledgeSourceType;
  sourceUrl: string | null;
  content: string;
  status: KnowledgeStatus;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

export const KNOWLEDGE_CATEGORIES: KnowledgeCategoryMeta[] = [
  {
    id: "brand",
    label: "Brand",
    description: "Voice, guidelines, positioning",
    gradient: "from-violet-600 to-purple-700",
  },
  {
    id: "product",
    label: "Product",
    description: "Features, specs, roadmaps",
    gradient: "from-brand-600 to-cyan-700",
  },
  {
    id: "sales",
    label: "Sales",
    description: "Decks, battlecards, ICP",
    gradient: "from-emerald-600 to-teal-700",
  },
  {
    id: "support",
    label: "Support",
    description: "FAQs, help docs, policies",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Campaigns, personas, messaging",
    gradient: "from-pink-600 to-rose-700",
  },
  {
    id: "general",
    label: "General",
    description: "Company-wide knowledge",
    gradient: "from-zinc-500 to-zinc-700",
  },
];

export const STATUS_META: Record<
  KnowledgeStatus,
  { label: string; color: string; bg: string }
> = {
  processing: { label: "Processing", color: "text-amber-400", bg: "bg-amber-500/15" },
  ready: { label: "Ready", color: "text-emerald-400", bg: "bg-emerald-500/15" },
  error: { label: "Error", color: "text-red-400", bg: "bg-red-500/15" },
};

export const SOURCE_META: Record<
  KnowledgeSourceType,
  { label: string; ext: string }
> = {
  pdf: { label: "PDF", ext: ".pdf" },
  docx: { label: "DOCX", ext: ".docx" },
  txt: { label: "TXT", ext: ".txt" },
  url: { label: "URL", ext: "" },
};

export const DEMO_DOCUMENTS: Omit<
  KnowledgeDocument,
  "id" | "createdAt" | "updatedAt"
>[] = [
  {
    name: "Brand Guidelines 2026.pdf",
    category: "brand",
    sourceType: "pdf",
    sourceUrl: null,
    content:
      "InkFit AI brand voice: confident, clear, founder-friendly. Primary colors violet and cyan. Always lead with outcomes, not features. Avoid jargon. Tone is professional but approachable.",
    status: "ready",
    fileSize: 245000,
  },
  {
    name: "Product Overview.docx",
    category: "product",
    sourceType: "docx",
    sourceUrl: null,
    content:
      "InkFit AI is an all-in-one AI content studio: LinkedIn, SEO, blogs, images, publishing, and marketing strategy. Plans: Free, Creator, Pro, Agency. Key differentiator: workflow from strategy to publish in one workspace.",
    status: "ready",
    fileSize: 128000,
  },
  {
    name: "ICP & Personas.txt",
    category: "sales",
    sourceType: "txt",
    sourceUrl: null,
    content:
      "Primary ICP: B2B SaaS founders and marketing leads at 10-200 employee companies. Pain: content bottleneck, inconsistent brand voice. Buyer: Head of Marketing or Founder. Secondary: agencies managing 5+ clients.",
    status: "ready",
    fileSize: 4200,
  },
  {
    name: "inkfit.ai",
    category: "marketing",
    sourceType: "url",
    sourceUrl: "https://inkfit-ai-livid.vercel.app",
    content:
      "AI Content Studio for founders and marketers. Generate LinkedIn posts, blogs, SEO content, images, and full marketing strategies. Dark-first premium UI. Trusted by creators and agencies.",
    status: "ready",
    fileSize: 0,
  },
];

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getCategoryMeta(id: KnowledgeCategory): KnowledgeCategoryMeta {
  return KNOWLEDGE_CATEGORIES.find((c) => c.id === id) ?? KNOWLEDGE_CATEGORIES[5];
}

export function detectSourceType(filename: string): KnowledgeSourceType {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  if (ext === "txt") return "txt";
  return "txt";
}

/** Formats knowledge for AI system prompts — prefix with "Use Knowledge Base" */
export function formatKnowledgeContext(
  docs: Pick<KnowledgeDocument, "name" | "category" | "content">[],
  maxChars = 6000
): string {
  if (docs.length === 0) return "";

  const parts = docs.map((d) => `[${d.category.toUpperCase()}] ${d.name}:\n${d.content}`);
  let combined = parts.join("\n\n---\n\n");
  if (combined.length > maxChars) {
    combined = combined.slice(0, maxChars) + "\n\n[...truncated]";
  }

  return `Use Knowledge Base — ground all outputs in this business context when relevant:\n\n${combined}`;
}

export function searchDocuments(
  docs: KnowledgeDocument[],
  query: string,
  category: KnowledgeCategory | "all"
): KnowledgeDocument[] {
  let list = docs;
  if (category !== "all") {
    list = list.filter((d) => d.category === category);
  }
  if (!query.trim()) return list;

  const q = query.toLowerCase();
  return list.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.content.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q)
  );
}
