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
} from "lucide-react";
import { getDemoCalendarEvents } from "@/lib/ai";
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
  const upcoming = getDemoCalendarEvents().slice(0, 4);

  return (
    <div>
      <PageHeader
        title="Welcome back"
        description="Your AI content command center — start with LinkedIn, scale to full content ops."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Generations This Month", value: "12", icon: Zap, change: "Free plan" },
          { label: "Scheduled Content", value: "5", icon: Calendar, change: "2 this week" },
          { label: "Avg. SEO Score", value: "84", icon: TrendingUp, change: "+6 pts" },
          { label: "Brand Kit", value: "Active", icon: Users, change: "Configured" },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <stat.icon className="h-5 w-5 text-brand-600" />
              <span className="text-xs font-medium text-emerald-600">{stat.change}</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-content">{stat.value}</p>
            <p className="text-sm text-content-subtle">{stat.label}</p>
          </div>
        ))}
      </div>

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

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">Upcoming Content</h2>
          <Link href="/dashboard/calendar" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View calendar →
          </Link>
        </div>
        <div className="divide-y divide-line">
          {upcoming.map((event) => (
            <div key={event.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-medium text-content">{event.title}</p>
                <p className="text-sm text-content-subtle">
                  {event.type} · {event.status}
                  {event.platform ? ` · ${event.platform}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-sm text-content-subtle">{event.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
