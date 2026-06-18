"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Share2,
  Image,
  Search,
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
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/agent", label: "Content Agent", icon: Bot },
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
      { href: "/dashboard/images", label: "Images", icon: Image },
    ],
  },
  {
    label: "Optimize",
    items: [
      { href: "/dashboard/seo", label: "SEO Writer", icon: Search },
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
      { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
      { href: "/dashboard/publish", label: "Publishing", icon: Send },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
        <ThemeToggle />
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
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn("nav-link", active && "nav-link-active")}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-3 border-t border-white/[0.08] p-4">
          <Link href="/dashboard/billing" className={cn("nav-link", isActive("/dashboard/billing") && "nav-link-active")}>
            <CreditCard className="h-4 w-4 shrink-0" />
            Billing
          </Link>
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
