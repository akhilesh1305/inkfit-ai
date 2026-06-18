import Link from "next/link";
import { Linkedin, Twitter, Instagram, Github } from "lucide-react";
import { Logo } from "@/components/Logo";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Templates", href: "/#templates" },
  ],
  Resources: [
    { label: "Blog", href: "/#resources" },
    { label: "Documentation", href: "/register" },
    { label: "Help Center", href: "/#faq" },
  ],
  Company: [
    { label: "About", href: "/register" },
    { label: "Contact", href: "/register" },
    { label: "Careers", href: "/register" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/register" },
    { label: "Terms", href: "/register" },
  ],
};

const socials = [
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com", label: "X" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-ink-surface/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo size="xl" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-content-muted">
              AI-powered content studio for founders, creators, and growing businesses.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-content-subtle transition duration-300 hover:border-brand-500/40 hover:text-brand-400 hover:shadow-glow"
                    aria-label={s.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-content">{title}</h4>
              <ul className="mt-5 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-content-muted transition duration-300 hover:text-brand-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-8 text-center text-sm text-content-subtle">
          <p>© 2026 InkFit AI · AI Content Platform for Businesses</p>
        </div>
      </div>
    </footer>
  );
}
