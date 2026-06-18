import {
  FileText,
  Linkedin,
  Search,
  Layers,
  Mail,
  type LucideIcon,
} from "lucide-react";

export type ContentType = "blog" | "linkedin" | "seo" | "carousel" | "email";
export type ContentStatus = "draft" | "published" | "archived";
export type WorkspaceTab = "recent" | "drafts" | "published" | "archived";

export interface WorkspaceFolder {
  id: string;
  name: string;
  color: string;
}

export interface WorkspaceItem {
  id: string;
  title: string;
  body: string;
  type: ContentType;
  status: ContentStatus;
  folderId?: string;
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CONTENT_TYPE_META: Record<
  ContentType,
  { label: string; icon: LucideIcon; color: string }
> = {
  blog: { label: "Blog", icon: FileText, color: "#6366f1" },
  linkedin: { label: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  seo: { label: "SEO Article", icon: Search, color: "#10b981" },
  carousel: { label: "Carousel", icon: Layers, color: "#f59e0b" },
  email: { label: "Email", icon: Mail, color: "#ec4899" },
};

export const WORKSPACE_TABS: { id: WorkspaceTab; label: string }[] = [
  { id: "recent", label: "Recent" },
  { id: "drafts", label: "Drafts" },
  { id: "published", label: "Published" },
  { id: "archived", label: "Archived" },
];

export const DEMO_FOLDERS: Omit<WorkspaceFolder, "id">[] = [
  { name: "Product Launch", color: "#7C3AED" },
  { name: "Q2 Campaign", color: "#06b6d4" },
  { name: "Personal Brand", color: "#f59e0b" },
];

export const DEMO_CONTENT: Omit<WorkspaceItem, "id" | "createdAt" | "updatedAt">[] = [
  {
    title: "10 AI Marketing Trends for 2026",
    body: "# 10 AI Marketing Trends\n\nArtificial intelligence is reshaping how teams plan, create, and distribute content...",
    type: "blog",
    status: "published",
    folderId: undefined,
    tags: ["AI", "Marketing", "Trends"],
    favorite: true,
  },
  {
    title: "Why founders should invest in content systems",
    body: "🚀 Most founders treat content as a side project.\n\nThe ones winning in 2026 treat it as infrastructure...",
    type: "linkedin",
    status: "draft",
    tags: ["Founders", "Content Strategy"],
    favorite: true,
  },
  {
    title: "AI Content Studio — Landing Page SEO",
    body: "Meta Title: InkFit AI | AI Content Studio for Teams\n\nMeta Description: Generate blogs, LinkedIn posts, and SEO content in minutes.",
    type: "seo",
    status: "published",
    tags: ["SEO", "Landing Page"],
    favorite: false,
  },
  {
    title: "5 Content Tips Carousel",
    body: "Slide 1: Hook — Stop posting without a system\nSlide 2: Batch your ideas weekly\nSlide 3: Repurpose everything\nSlide 4: Use AI for drafts, not final copy\nSlide 5: CTA — Start with InkFit AI",
    type: "carousel",
    status: "draft",
    tags: ["Carousel", "Tips"],
    favorite: false,
  },
  {
    title: "Newsletter Launch — Welcome Email",
    body: "Subject: Your content engine is ready ✨\n\nHi there,\n\nWelcome to InkFit AI! Here's how to get your first win in 10 minutes...",
    type: "email",
    status: "published",
    tags: ["Newsletter", "Onboarding"],
    favorite: false,
  },
  {
    title: "Remote Work Culture Blog Draft",
    body: "## Introduction\n\nRemote-first teams need async communication and intentional culture building...",
    type: "blog",
    status: "archived",
    tags: ["Remote", "Culture"],
    favorite: false,
  },
  {
    title: "LinkedIn Thread: Building in Public",
    body: "1/ I shipped 12 content pieces last week with AI assistance.\n\n2/ Here's the exact workflow I used...",
    type: "linkedin",
    status: "published",
    tags: ["Build in Public"],
    favorite: false,
  },
];

export function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function filterWorkspaceItems(
  items: WorkspaceItem[],
  opts: {
    tab: WorkspaceTab;
    typeFilter: ContentType | "all";
    folderId: string | "all" | "favorites";
    query: string;
  }
): WorkspaceItem[] {
  let result = [...items];

  if (opts.folderId === "favorites") {
    result = result.filter((i) => i.favorite);
  } else if (opts.folderId !== "all") {
    result = result.filter((i) => i.folderId === opts.folderId);
  }

  if (opts.typeFilter !== "all") {
    result = result.filter((i) => i.type === opts.typeFilter);
  }

  switch (opts.tab) {
    case "drafts":
      result = result.filter((i) => i.status === "draft");
      break;
    case "published":
      result = result.filter((i) => i.status === "published");
      break;
    case "archived":
      result = result.filter((i) => i.status === "archived");
      break;
    default:
      result = result.filter((i) => i.status !== "archived");
  }

  if (opts.query.trim()) {
    const q = opts.query.toLowerCase();
    result = result.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.body.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return result.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function exportContentTxt(item: WorkspaceItem) {
  const blob = new Blob([`${item.title}\n\n${item.body}`], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${item.title.slice(0, 40).replace(/[^a-z0-9]/gi, "-")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function contentPreview(body: string, max = 120): string {
  const flat = body.replace(/^#+\s*/gm, "").replace(/\n+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}

export function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
