"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Templates", href: "/#templates" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/#resources" },
  { label: "FAQ", href: "/#faq" },
];

interface MarketingHeaderProps {
  ctaHref?: string;
  ctaLabel?: string;
}

export function MarketingHeader({ ctaHref = "/register", ctaLabel = "Get Started Free" }: MarketingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-white/[0.06] bg-ink-bg/90 backdrop-blur-xl transition-all duration-500",
        scrolled && "shadow-lg shadow-black/20"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Logo size="lg" />

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3.5 py-2 text-sm font-medium text-content-muted transition duration-300 hover:bg-white/[0.06] hover:text-content"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="btn-secondary hidden !rounded-xl !px-4 !py-2 text-sm sm:inline-flex"
          >
            Login
          </Link>
          <Link href={ctaHref} className="btn-primary hidden !rounded-xl text-sm sm:inline-flex">
            {ctaLabel}
          </Link>
          <button
            type="button"
            className="btn-ghost !p-2 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

        <nav
          className={cn(
            "flex-col gap-1 px-6 py-4 lg:hidden",
            mobileOpen ? "flex border-t border-white/10 bg-ink-bg/95 backdrop-blur-xl" : "hidden"
          )}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-content-muted hover:bg-white/[0.06] hover:text-content"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="rounded-xl px-3 py-2.5 text-sm font-medium text-content-muted"
          >
            Login
          </Link>
          <Link href={ctaHref} onClick={() => setMobileOpen(false)} className="btn-primary mt-2 text-center text-sm">
            {ctaLabel}
          </Link>
        </nav>
    </header>
  );
}
