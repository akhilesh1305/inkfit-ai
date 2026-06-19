import Link from "next/link";
import {
  FileText,
  Share2,
  Image,
  Search,
  Calendar,
  ArrowRight,
  TrendingUp,
  Users,
  Zap,
  Linkedin,
  Palette,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { DashboardHomeStats } from "@/components/dashboard/DashboardHomeStats";
import { DashboardUpcomingContent } from "@/components/dashboard/DashboardUpcomingContent";
import { PageHeader } from "@/components/PageHeader";

const features = [
  { href: "/dashboard/linkedin", icon: Linkedin, title: "LinkedIn Studio", description: "Carousels, comments & viral ideas", color: "bg-sky-500" },
  { href: "/dashboard/blog", icon: FileText, title: "Blog Writer", description: "SEO posts with Word/PDF export", color: "bg-blue-500" },
  { href: "/dashboard/social", icon: Share2, title: "Social Posts", description: "LinkedIn, Instagram, X with CTAs", color: "bg-purple-500" },
  { href: "/dashboard/images", icon: Image, title: "Image Generator", description: "Marketing & ad creatives", color: "bg-pink-500" },
  { href: "/dashboard/seo", icon: Search, title: "SEO Toolkit", description: "Scores, meta tags & keywords", color: "bg-emerald-500" },
  { href: "/dashboard/brand", icon: Palette, title: "Brand Kit", description: "Consistent AI voice & colors", color: "bg-orange-500" },
  { href: "/dashboard/calendar", icon: Calendar, title: "Content Calendar", description: "Plan & schedule with AI topics", color: "bg-amber-500" },
];

export default function DashboardPage() {
  return (
    <div>
      <Link
        href="/dashboard/employee"
        className="group mb-8 block overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-600/15 via-violet-600/10 to-cyan-600/10 p-6 transition hover:border-brand-500/50 hover:shadow-glow sm:p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                Flagship Feature
              </span>
              <Sparkles className="h-4 w-4 text-brand-400" />
            </div>
            <h2 className="text-2xl font-bold text-content sm:text-3xl">
              AI Marketing Employee
            </h2>
            <p className="mt-2 text-sm text-content-muted sm:text-base">
              Enter one business goal. Your autonomous AI manager builds strategy, content pillars,
              posts, images, and a publishing schedule — then you approve and publish.
            </p>
            <ul className="mt-4 grid gap-1.5 text-xs text-content-muted sm:grid-cols-2">
              {[
                "Marketing strategy",
                "Content pillars",
                "Social posts & blog ideas",
                "AI image assets",
                "14-day publishing schedule",
                "One-click calendar sync",
              ].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 shrink-0 text-amber-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-3 sm:items-end">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-700 shadow-lg">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <span className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-brand-500">
              Launch Autonomous Mode
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>

      <PageHeader
        title="Welcome back"
        description="Your AI content command center — or let AI Employee run the full pipeline for you."
      />

      <DashboardHomeStats />

      <h2 className="section-title mb-4">Quick Actions</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="card group flex items-start gap-4 transition hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${f.color}`}>
              <f.icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-content group-hover:text-brand-600">{f.title}</h3>
              <p className="mt-0.5 text-sm text-content-subtle">{f.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-content-subtle transition group-hover:text-brand-600" />
          </Link>
        ))}
      </div>

      <DashboardUpcomingContent />
    </div>
  );
}
