"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  LifeBuoy,
  Activity,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin#users", label: "Users", icon: Users },
  { href: "/admin#subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin#content", label: "Content", icon: FileText },
  { href: "/admin#tickets", label: "Support", icon: LifeBuoy },
  { href: "/admin#system", label: "System", icon: Activity },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-[#08080a] lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-white/[0.06] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-600">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-content">InkFit</p>
          <p className="text-[10px] text-red-400">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              pathname === "/admin" && item.exact
                ? "bg-red-500/10 text-red-300"
                : "text-content-muted hover:bg-white/[0.04] hover:text-content"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-content-muted transition hover:bg-white/[0.04] hover:text-content"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to app
        </Link>
      </div>
    </aside>
  );
}

export function AdminMobileHeader() {
  return (
    <div className="flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#08080a] px-4 lg:hidden">
      <Logo />
      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
        ADMIN
      </span>
    </div>
  );
}
