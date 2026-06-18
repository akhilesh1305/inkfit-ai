"use client";

import { motion } from "framer-motion";
import { Lightbulb, Sparkles, Pencil, Send } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { FadeIn } from "./AnimatedSections";

const steps = [
  {
    icon: Lightbulb,
    title: "Describe Your Idea",
    desc: "Tell InkFit AI what you want — a blog, social post, ad, or SEO page.",
  },
  {
    icon: Sparkles,
    title: "AI Generates Content",
    desc: "Our AI crafts on-brand copy using your Brand Kit and preferred tone.",
  },
  {
    icon: Pencil,
    title: "Customize & Edit",
    desc: "Refine, regenerate sections, and export to Word or PDF.",
  },
  {
    icon: Send,
    title: "Publish Everywhere",
    desc: "Schedule and publish to LinkedIn, Instagram, Facebook, and more.",
  },
];

export function WorkflowSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <SectionHeading title="How InkFit AI Works" />
        </FadeIn>

        <div className="relative mt-12">
          <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-brand-500 via-indigo-500 to-cyan-500 md:left-1/2 md:block md:-translate-x-px" />

          <div className="space-y-8 md:space-y-12">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isEven = i % 2 === 0;
              return (
                <FadeIn key={step.title} delay={i * 0.1}>
                  <div className={`relative flex flex-col gap-4 md:flex-row md:items-center ${isEven ? "" : "md:flex-row-reverse"}`}>
                    <div className={`flex-1 ${isEven ? "md:text-right" : "md:text-left"}`}>
                      <motion.div
                        whileInView={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                        viewport={{ once: true }}
                        className={`card inline-block max-w-md ${isEven ? "md:ml-auto" : ""}`}
                      >
                        <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                          Step {i + 1}
                        </span>
                        <h3 className="mt-1 text-lg font-semibold text-content">{step.title}</h3>
                        <p className="mt-2 text-sm text-content-muted">{step.desc}</p>
                      </motion.div>
                    </div>

                    <div className="relative z-10 flex justify-center md:absolute md:left-1/2 md:-translate-x-1/2">
                      <motion.div
                        whileInView={{ scale: 1 }}
                        initial={{ scale: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent-blue shadow-lg shadow-brand-500/30"
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </motion.div>
                    </div>

                    <div className="hidden flex-1 md:block" />
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
