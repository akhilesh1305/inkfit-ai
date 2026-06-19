"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Share2,
  Image,
  Search,
  ScanLine,
  Calendar,
  CreditCard,
  Menu,
  X,
  Palette,
  Mic2,
  Linkedin,
  Send,
  BarChart3,
  Lightbulb,
  Repeat2,
  LogOut,
  Layers,
  Users,
  Building2,
  Briefcase,
  Globe,
  UserCircle,
  Bot,
  FolderKanban,
  Target,
  LayoutTemplate,
  Cpu,
  UsersRound,
  TrendingUp,
  BookMarked,
  Sparkles,
  Puzzle,
  Plug,
  Clapperboard,
  Coins,
  GitBranch,
  LineChart,
  BookText,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { canAccessNav } from "@/lib/nav-access";
import { useAuthContext } from "@/hooks/use-dashboard-queries";

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/employee", label: "AI Employee", icon: Briefcase, featured: true },
      { href: "/dashboard/marketing-os", label: "Marketing OS", icon: Cpu },
      { href: "/dashboard/trends", label: "Trend Discovery", icon: TrendingUp },
      { href: "/dashboard/knowledge", label: "Knowledge Base", icon: BookMarked },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/performance", label: "Performance", icon: LineChart },
      { href: "/dashboard/agent", label: "Content Agent", icon: Bot },
      { href: "/dashboard/workflows", label: "Workflows", icon: GitBranch },
      { href: "/dashboard/workspace", label: "Workspace", icon: FolderKanban },
      { href: "/dashboard/workspaces", label: "Workspaces", icon: LayoutGrid },
      { href: "/dashboard/templates", label: "Templates", icon: LayoutTemplate },
      { href: "/dashboard/prompts", label: "Prompt Library", icon: BookText },
      { href: "/dashboard/projects", label: "Campaigns", icon: Target },
    ],
  },
  {
    label: "Create",
    items: [
      { href: "/dashboard/linkedin", label: "LinkedIn Studio", icon: Linkedin },
      { href: "/dashboard/carousel", label: "Carousel", icon: Layers },
      { href: "/dashboard/blog", label: "Blog Writer", icon: FileText },
      { href: "/dashboard/social", label: "Social Posts", icon: Share2 },
      { href: "/dashboard/repurpose", label: "Content Repurposer", icon: Repeat2 },
      { href: "/dashboard/website-generator", label: "Website Generator", icon: Globe },
      { href: "/dashboard/landing-pages", label: "Landing Pages", icon: LayoutTemplate },
      { href: "/dashboard/images", label: "Image Studio", icon: Image },
      { href: "/dashboard/video", label: "Video & Podcast", icon: Clapperboard },
    ],
  },
  {
    label: "Optimize",
    items: [
      { href: "/dashboard/seo", label: "SEO Writer", icon: Search },
      { href: "/dashboard/analyzer", label: "Content Analyzer", icon: ScanLine },
      { href: "/dashboard/marketing-strategy", label: "Marketing Strategist", icon: Briefcase },
      { href: "/dashboard/competitors", label: "Competitor Intel", icon: BarChart3 },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/dashboard/brand", label: "Brand Kit", icon: Palette },
      { href: "/dashboard/brand-voice", label: "Brand Voice", icon: Mic2 },
      { href: "/dashboard/personal-brand", label: "Personal Brand", icon: UserCircle },
      { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
      { href: "/dashboard/team", label: "Team", icon: Users },
      { href: "/dashboard/clients", label: "Clients", icon: Building2 },
      { href: "/dashboard/white-label", label: "White Label", icon: Sparkles },
      { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
      { href: "/dashboard/credits", label: "AI Credits", icon: Coins },
      { href: "/dashboard/referrals", label: "Referrals", icon: UsersRound },
      { href: "/dashboard/publish", label: "Publishing Center", icon: Send },
      { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
      { href: "/dashboard/publish/linkedin", label: "LinkedIn Publishing", icon: Linkedin },
      { href: "/dashboard/extensions", label: "Extension", icon: Puzzle },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: authContext } = useAuthContext();
  const permissions = authContext?.permissions ?? null;
  const isSuperAdmin = authContext?.platformRole === "super_admin";

  const canSee = (href: string) => {
    if (!permissions) return true;
    return canAccessNav(href, permissions);
  };

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-white/[0.08] bg-ink-bg/90 px-4 backdrop-blur-xl lg:hidden">
        <button type="button" className="btn-ghost !p-2" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <Logo size="md" />
        <div className="h-9 w-9" aria-hidden />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.08] bg-ink-surface/95 backdrop-blur-xl transition-transform duration-300 lg:z-40 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-5">
          <Logo size="lg" onClick={() => setOpen(false)} />
          <button type="button" className="btn-ghost !p-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto p-4">
          {isSuperAdmin && (
            <div>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
                Admin
              </p>
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={cn("nav-link", isActive("/admin") && "nav-link-active")}
              >
                <Cpu className="h-4 w-4 shrink-0" />
                Platform Admin
              </Link>
            </div>
          )}
          {navSections.map((section) => {
            const visibleItems = section.items.filter((item) => canSee(item.href));
            if (visibleItems.length === 0) return null;
            return (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  const featured = "featured" in item && item.featured;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "nav-link",
                        active && "nav-link-active",
                        featured && !active && "border border-brand-500/20 bg-brand-500/5"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {featured && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-300">
                          New
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-white/[0.08] p-4">
          {canSee("/dashboard/billing") && (
          <Link href="/dashboard/billing" className={cn("nav-link", isActive("/dashboard/billing") && "nav-link-active")}>
            <CreditCard className="h-4 w-4 shrink-0" />
            Billing
          </Link>
          )}
          <button type="button" onClick={logout} className="nav-link w-full">
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 via-accent-blue to-accent-cyan p-4 text-white shadow-glow">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <p className="text-xs font-medium opacity-90">Creator Plan</p>
            </div>
            <p className="mt-1 text-lg font-bold">₹499/mo</p>
            <p className="mt-0.5 text-xs opacity-75">12 / 150 generations</p>
          </div>
        </div>
      </aside>
    </>
  );
}
