export interface AdminKpis {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  contentGenerated: number;
  openTickets: number;
  userGrowthPercent: number;
  revenueGrowthPercent: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: "active" | "suspended" | "invited";
  contentCount: number;
  joinedAt: string;
  lastActive: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  user: string;
  email: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  category: string;
}

export interface SystemService {
  id: string;
  name: string;
  status: "operational" | "degraded" | "down";
  latencyMs: number;
  uptime: string;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  subscriptions: number;
}

export interface UserGrowthPoint {
  month: string;
  users: number;
  signups: number;
}

export interface ContentGenPoint {
  month: string;
  total: number;
  linkedin: number;
  blog: number;
  seo: number;
}

export interface PlanBreakdown {
  plan: string;
  count: number;
  color: string;
}

export const ADMIN_KPIS: AdminKpis = {
  totalUsers: 1248,
  activeSubscriptions: 386,
  monthlyRevenue: 284500,
  contentGenerated: 48200,
  openTickets: 12,
  userGrowthPercent: 18.4,
  revenueGrowthPercent: 22.1,
};

export const REVENUE_TREND: RevenuePoint[] = [
  { month: "Jan", revenue: 142000, subscriptions: 210 },
  { month: "Feb", revenue: 158000, subscriptions: 228 },
  { month: "Mar", revenue: 171000, subscriptions: 245 },
  { month: "Apr", revenue: 189000, subscriptions: 268 },
  { month: "May", revenue: 241000, subscriptions: 312 },
  { month: "Jun", revenue: 284500, subscriptions: 386 },
];

export const USER_GROWTH: UserGrowthPoint[] = [
  { month: "Jan", users: 620, signups: 84 },
  { month: "Feb", users: 710, signups: 90 },
  { month: "Mar", users: 820, signups: 110 },
  { month: "Apr", users: 940, signups: 120 },
  { month: "May", users: 1080, signups: 140 },
  { month: "Jun", users: 1248, signups: 168 },
];

export const CONTENT_GEN_TREND: ContentGenPoint[] = [
  { month: "Jan", total: 5200, linkedin: 2100, blog: 1200, seo: 900 },
  { month: "Feb", total: 6100, linkedin: 2400, blog: 1400, seo: 1000 },
  { month: "Mar", total: 7200, linkedin: 2800, blog: 1600, seo: 1200 },
  { month: "Apr", total: 8100, linkedin: 3100, blog: 1800, seo: 1400 },
  { month: "May", total: 9400, linkedin: 3600, blog: 2100, seo: 1600 },
  { month: "Jun", total: 11200, linkedin: 4200, blog: 2500, seo: 1900 },
];

export const PLAN_BREAKDOWN: PlanBreakdown[] = [
  { plan: "Free", count: 862, color: "#71717a" },
  { plan: "Creator", count: 248, color: "#3B82F6" },
  { plan: "Pro", count: 98, color: "#7C3AED" },
  { plan: "Agency", count: 40, color: "#10B981" },
];

export const DEMO_TICKETS: SupportTicket[] = [
  {
    id: "TKT-1042",
    subject: "Billing charged twice for Pro plan",
    user: "Ananya Reddy",
    email: "ananya@tech.co",
    priority: "urgent",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    category: "Billing",
  },
  {
    id: "TKT-1041",
    subject: "LinkedIn export formatting issue",
    user: "Marcus Webb",
    email: "marcus@agency.io",
    priority: "medium",
    status: "in_progress",
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    category: "Product",
  },
  {
    id: "TKT-1040",
    subject: "Request for API access (Agency)",
    user: "Lisa Park",
    email: "lisa@saas.com",
    priority: "low",
    status: "open",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    category: "Sales",
  },
  {
    id: "TKT-1039",
    subject: "Gemini API key not working on image gen",
    user: "Rahul Mehta",
    email: "rahul@startup.in",
    priority: "high",
    status: "in_progress",
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    category: "Technical",
  },
  {
    id: "TKT-1038",
    subject: "Team seat invitation expired",
    user: "Emma Collins",
    email: "emma@marketing.uk",
    priority: "medium",
    status: "resolved",
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    category: "Account",
  },
];

export const SYSTEM_SERVICES: SystemService[] = [
  { id: "api", name: "API Gateway", status: "operational", latencyMs: 42, uptime: "99.98%" },
  { id: "db", name: "PostgreSQL (Neon)", status: "operational", latencyMs: 18, uptime: "99.99%" },
  { id: "ai", name: "AI Providers", status: "operational", latencyMs: 890, uptime: "99.92%" },
  { id: "stripe", name: "Stripe Billing", status: "operational", latencyMs: 156, uptime: "99.97%" },
  { id: "storage", name: "Asset CDN", status: "degraded", latencyMs: 210, uptime: "99.85%" },
  { id: "email", name: "Email Delivery", status: "operational", latencyMs: 320, uptime: "99.94%" },
];

export function isAdminEmail(email: string): boolean {
  const list = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (list && list.length > 0) {
    return list.includes(email.toLowerCase());
  }
  return process.env.NODE_ENV === "development";
}

export function formatRevenue(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
  return `₹${amount}`;
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export const TICKET_PRIORITY_STYLES = {
  low: "bg-zinc-500/15 text-zinc-400",
  medium: "bg-brand-500/15 text-brand-300",
  high: "bg-amber-500/15 text-amber-400",
  urgent: "bg-red-500/15 text-red-400",
};

export const TICKET_STATUS_STYLES = {
  open: "bg-red-500/15 text-red-400",
  in_progress: "bg-amber-500/15 text-amber-400",
  resolved: "bg-emerald-500/15 text-emerald-400",
};

export const SERVICE_STATUS_STYLES = {
  operational: { color: "text-emerald-400", bg: "bg-emerald-500", label: "Operational" },
  degraded: { color: "text-amber-400", bg: "bg-amber-500", label: "Degraded" },
  down: { color: "text-red-400", bg: "bg-red-500", label: "Down" },
};
