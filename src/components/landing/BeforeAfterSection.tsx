"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { FadeIn } from "./AnimatedSections";
import { GlassCard } from "@/components/ui/glass-card";

const withoutItems = [
  "Hours spent writing",
  "Multiple tools",
  "Writer's block",
  "Inconsistent branding",
  "Manual SEO optimization",
];

const withItems = [
  "Content in minutes",
  "One unified platform",
  "Endless content ideas",
  "Consistent brand voice",
  "AI-powered SEO",
];

export function BeforeAfterSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <SectionHeading title="Why Teams Choose InkFit AI" />
        </FadeIn>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <FadeIn delay={0.1}>
            <GlassCard className="border-red-200/50 p-6 dark:border-red-900/30">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                Without InkFit AI
              </h3>
              <ul className="mt-5 space-y-3">
                {withoutItems.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 text-content-muted"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                      <X className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </GlassCard>
          </FadeIn>

          <FadeIn delay={0.2}>
            <GlassCard className="border-emerald-200/50 p-6 dark:border-emerald-900/30">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                With InkFit AI
              </h3>
              <ul className="mt-5 space-y-3">
                {withItems.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 text-content-muted"
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 300 }}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </motion.span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </GlassCard>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
