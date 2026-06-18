import {
  FileText,
  Linkedin,
  Layers,
  Search,
  Image,
  type LucideIcon,
} from "lucide-react";

export type CampaignStatus = "active" | "paused" | "completed";
export type KanbanColumn = "ideas" | "in_progress" | "review" | "published";
export type CampaignContentType = "blog" | "linkedin" | "carousel" | "seo" | "image";

export interface Campaign {
  id: string;
  name: string;
  description: string;
  goal: string;
  status: CampaignStatus;
  dueDate?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignItem {
  id: string;
  campaignId: string;
  title: string;
  type: CampaignContentType;
  column: KanbanColumn;
  body: string;
  dueDate?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const KANBAN_COLUMNS: { id: KanbanColumn; label: string; hint: string }[] = [
  { id: "ideas", label: "Ideas", hint: "Backlog & concepts" },
  { id: "in_progress", label: "In Progress", hint: "Being created" },
  { id: "review", label: "Review", hint: "Ready for approval" },
  { id: "published", label: "Published", hint: "Live content" },
];

export const CONTENT_TYPE_META: Record<
  CampaignContentType,
  { label: string; icon: LucideIcon; color: string }
> = {
  blog: { label: "Blog", icon: FileText, color: "#6366f1" },
  linkedin: { label: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  carousel: { label: "Carousel", icon: Layers, color: "#f59e0b" },
  seo: { label: "SEO", icon: Search, color: "#10b981" },
  image: { label: "Image", icon: Image, color: "#ec4899" },
};

export const CAMPAIGN_STATUS_META: Record<
  CampaignStatus,
  { label: string; color: string }
> = {
  active: { label: "Active", color: "#22c55e" },
  paused: { label: "Paused", color: "#f59e0b" },
  completed: { label: "Completed", color: "#6366f1" },
};

export const DEMO_CAMPAIGNS: Omit<Campaign, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Q2 Product Launch",
    description: "Full-funnel content campaign for the spring product release.",
    goal: "Generate 500 signups and 50 demo requests",
    status: "active",
    dueDate: "2026-06-30",
    color: "#6366f1",
  },
  {
    name: "Founder Personal Brand",
    description: "Weekly LinkedIn and thought leadership content.",
    goal: "Grow LinkedIn following by 2,000",
    status: "active",
    dueDate: "2026-07-15",
    color: "#06b6d4",
  },
  {
    name: "SEO Content Sprint",
    description: "10 pillar pages targeting high-intent keywords.",
    goal: "Rank top 10 for 5 target keywords",
    status: "paused",
    dueDate: "2026-08-01",
    color: "#10b981",
  },
];

export function demoItems(campaignIds: string[]): CampaignItem[] {
  const now = new Date().toISOString();
  const templates: Omit<CampaignItem, "id" | "createdAt" | "updatedAt">[] = [
    { campaignId: campaignIds[0], title: "Launch announcement blog", type: "blog", column: "published", body: "", sortOrder: 0 },
    { campaignId: campaignIds[0], title: "Founder launch LinkedIn post", type: "linkedin", column: "review", body: "", sortOrder: 0 },
    { campaignId: campaignIds[0], title: "Feature carousel — 7 slides", type: "carousel", column: "in_progress", body: "", sortOrder: 0 },
    { campaignId: campaignIds[0], title: "Product landing page SEO", type: "seo", column: "in_progress", body: "", sortOrder: 1 },
    { campaignId: campaignIds[0], title: "Hero banner creative", type: "image", column: "ideas", body: "", sortOrder: 0 },
    { campaignId: campaignIds[1], title: "Weekly insight #12", type: "linkedin", column: "published", body: "", sortOrder: 0 },
    { campaignId: campaignIds[1], title: "Behind the scenes carousel", type: "carousel", column: "ideas", body: "", sortOrder: 0 },
    { campaignId: campaignIds[2], title: "AI content tools comparison", type: "seo", column: "ideas", body: "", sortOrder: 0 },
    { campaignId: campaignIds[2], title: "Pillar page draft", type: "blog", column: "in_progress", body: "", sortOrder: 0 },
  ];

  return templates.map((t, i) => ({
    id: `demo-item-${i}`,
    ...t,
    dueDate: undefined,
    createdAt: now,
    updatedAt: now,
  }));
}

export function computeProgress(items: CampaignItem[]): number {
  if (items.length === 0) return 0;
  const published = items.filter((i) => i.column === "published").length;
  return Math.round((published / items.length) * 100);
}

export function formatDueDate(iso?: string): string {
  if (!iso) return "No due date";
  return new Date(iso + (iso.includes("T") ? "" : "T12:00:00")).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isOverdue(iso?: string): boolean {
  if (!iso) return false;
  const d = new Date(iso + (iso.includes("T") ? "" : "T23:59:59"));
  return d < new Date();
}
