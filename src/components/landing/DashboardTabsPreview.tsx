"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Share2,
  Image as ImageIcon,
  Search,
  BarChart3,
  Calendar,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { FadeIn } from "./AnimatedSections";

const tabs = [
  { id: "writer", label: "AI Writer", icon: FileText },
  { id: "social", label: "Social Media Generator", icon: Share2 },
  { id: "image", label: "AI Image Creator", icon: ImageIcon },
  { id: "seo", label: "SEO Optimizer", icon: Search },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "calendar", label: "Content Calendar", icon: Calendar },
] as const;

type TabId = (typeof tabs)[number]["id"];

function WriterPanel() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-white/[0.08] bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-xs text-slate-500">Generated Blog Draft</p>
        <p className="mt-2 text-sm font-medium text-content">
          10 AI Marketing Trends Every Founder Should Know in 2026
        </p>
        <p className="mt-2 text-xs leading-relaxed text-content-muted">
          Artificial intelligence is no longer a nice-to-have for marketing teams — it&apos;s the engine behind
          faster content cycles, smarter personalization, and measurable ROI...
        </p>
      </div>
      <div className="flex gap-2">
        <span className="rounded-full bg-brand-100 px-2 py-1 text-[10px] font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">Tone: Professional</span>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">SEO Score: 92</span>
      </div>
    </div>
  );
}

function SocialPanel() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {["LinkedIn carousel draft", "Instagram caption"].map((t) => (
        <div key={t} className="rounded-lg border border-white/[0.08] p-3 dark:border-slate-700">
          <p className="text-xs font-medium text-content">{t}</p>
          <p className="mt-1 text-[10px] text-slate-500">Ready to publish · 2 min ago</p>
        </div>
      ))}
    </div>
  );
}

function ImagePanel() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="aspect-square rounded-lg bg-gradient-to-br from-brand-400/30 via-indigo-400/30 to-cyan-400/30"
        />
      ))}
    </div>
  );
}

function SeoPanel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-white/[0.08] p-3 dark:border-slate-700">
        <span className="text-xs text-content-muted">Keyword density</span>
        <span className="text-sm font-bold text-emerald-600">Optimal</span>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-white/[0.08] p-3 dark:border-slate-700">
        <span className="text-xs text-content-muted">Meta description</span>
        <span className="text-sm font-bold text-brand-600">Generated</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-brand-500 to-indigo-500" />
      </div>
      <p className="text-center text-[10px] text-slate-500">Overall SEO Score: 94/100</p>
    </div>
  );
}

function AnalyticsPanel() {
  const bars = [40, 65, 45, 80, 55, 90, 70];
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-emerald-500" />
        <span className="text-xs font-medium text-emerald-600">+24% engagement this week</span>
      </div>
      <div className="flex h-24 items-end justify-between gap-1">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="w-full rounded-t bg-gradient-to-t from-brand-600 to-brand-400"
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Views", value: "12.4K" },
          { label: "Clicks", value: "2.1K" },
          { label: "Shares", value: "486" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
            <p className="text-sm font-bold text-content">{m.value}</p>
            <p className="text-[9px] text-slate-500">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarPanel() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return (
    <div className="space-y-2">
      {days.map((d, i) => (
        <div key={d} className="flex items-center gap-3 rounded-lg border border-white/[0.08] p-2 dark:border-slate-700">
          <span className="w-8 text-[10px] font-medium text-slate-500">{d}</span>
          <div className={`h-2 flex-1 rounded-full ${i % 2 === 0 ? "bg-brand-500/60" : "bg-indigo-500/40"}`} />
          <span className="text-[10px] text-content-subtle">{i + 1} post{i !== 0 ? "s" : ""}</span>
        </div>
      ))}
    </div>
  );
}

const panels: Record<TabId, () => ReactNode> = {
  writer: WriterPanel,
  social: SocialPanel,
  image: ImagePanel,
  seo: SeoPanel,
  analytics: AnalyticsPanel,
  calendar: CalendarPanel,
};

export function DashboardTabsPreview() {
  const [active, setActive] = useState<TabId>("writer");
  const ActivePanel = panels[active];

  return (
    <section id="dashboard-preview" className="section-alt py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <SectionHeading
            title="Your Content Command Center"
            subtitle="Everything you need to create, optimize, and publish — in one dashboard."
          />
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="relative mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-50 shadow-2xl shadow-brand-500/10 dark:border-slate-800 dark:bg-slate-900">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-cyan-500/10 blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-2 border-b border-white/[0.08] bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto flex items-center gap-2 rounded-md bg-slate-100 px-4 py-1 text-xs text-slate-500 dark:bg-slate-800">
                  <Sparkles className="h-3 w-3 text-brand-500" />
                  app.inkfit.ai/dashboard
                </div>
              </div>

              <div className="flex gap-1 overflow-x-auto border-b border-white/[0.08] bg-white px-2 dark:border-slate-800 dark:bg-slate-900">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = active === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActive(tab.id)}
                      className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-[11px] font-medium transition sm:text-xs ${
                        isActive ? "tab-active" : "tab-inactive"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4 p-4 md:grid-cols-3 md:p-6">
                <div className="md:col-span-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-xl border border-white/[0.08] bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <ActivePanel />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Content Generated", value: "128", change: "+12%" },
                    { label: "Avg. AI Score", value: "94", change: "+3pts" },
                    { label: "Time Saved", value: "18h", change: "this week" },
                  ].map((card, i) => (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="rounded-xl border border-white/[0.08] bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <p className="text-[10px] text-slate-500">{card.label}</p>
                      <p className="text-2xl font-bold text-content">{card.value}</p>
                      <p className="text-[10px] font-medium text-emerald-600">{card.change}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
