"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, BarChart3, FileText, Share2 } from "lucide-react";

const stats = [
  { label: "Blog posts", value: "128" },
  { label: "Social posts", value: "342" },
  { label: "SEO score", value: "94" },
];

export function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-20 max-w-4xl"
    >
      <div className="absolute -inset-6 rounded-4xl bg-gradient-to-r from-brand-600/25 via-accent-blue/20 to-accent-cyan/20 blur-3xl" />

      <div className="animate-float-slow relative overflow-hidden rounded-2xl border border-white/[0.12] bg-ink-surface/90 shadow-glow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400/80" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-lg bg-white/[0.05] px-4 py-1 text-xs text-content-muted">
            <Sparkles className="h-3 w-3 text-brand-400" />
            app.inkfit.ai/dashboard
          </div>
        </div>

        <div className="grid md:grid-cols-5">
          <div className="hidden border-r border-white/[0.06] bg-white/[0.02] p-4 md:col-span-1 md:block">
            <div className="mb-4 flex items-center gap-2">
              <div className="icon-gradient h-7 w-7">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-content">InkFit AI</span>
            </div>
            {["Dashboard", "Blog", "Social", "SEO"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className={`mb-1 rounded-lg px-2 py-1.5 text-[10px] ${
                  i === 0
                    ? "bg-brand-600/20 font-medium text-brand-300"
                    : "text-content-subtle"
                }`}
              >
                {item}
              </motion.div>
            ))}
          </div>

          <div className="p-4 md:col-span-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-content-subtle">Welcome back</p>
                <p className="text-sm font-semibold text-content">Content Command Center</p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400"
              >
                AI Active
              </motion.div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.15 }}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3"
                >
                  <p className="text-lg font-bold text-gradient">{s.value}</p>
                  <p className="text-[9px] text-content-subtle">{s.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="relative mb-3 overflow-hidden rounded-xl border border-white/[0.08]">
              <Image
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
                alt="Analytics dashboard preview"
                width={800}
                height={200}
                className="h-28 w-full object-cover object-top"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-bg/90 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-brand-400" />
                <span className="text-[10px] font-medium text-content-muted">Performance trending up +24%</span>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { icon: FileText, text: "Blog: Q2 Product Launch Guide", status: "Scheduled" },
                { icon: Share2, text: "LinkedIn: 5 growth hacks carousel", status: "Draft" },
              ].map((row, i) => (
                <motion.div
                  key={row.text}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 + i * 0.2 }}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <row.icon className="h-3.5 w-3.5 text-brand-400" />
                    <span className="text-[10px] text-content-muted">{row.text}</span>
                  </div>
                  <span className="text-[9px] text-content-subtle">{row.status}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}
