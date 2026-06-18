"use client";

import { motion } from "framer-motion";
import { Rocket, Palette, Users, Building2, Zap, Shield } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { FadeIn } from "./AnimatedSections";

const useCases = [
  {
    icon: Rocket,
    title: "Founders",
    desc: "Build your personal brand and thought leadership.",
  },
  {
    icon: Palette,
    title: "Creators",
    desc: "Generate content consistently across platforms.",
  },
  {
    icon: Users,
    title: "Marketing Teams",
    desc: "Scale campaigns without increasing workload.",
  },
  {
    icon: Building2,
    title: "Agencies",
    desc: "Manage content for multiple clients efficiently.",
  },
  {
    icon: Zap,
    title: "Startups",
    desc: "Create blogs, SEO pages, and social content fast.",
  },
  {
    icon: Shield,
    title: "Enterprise Teams",
    desc: "Maintain content quality and brand consistency.",
  },
];

export function UseCasesSection() {
  return (
    <section className="section-alt py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <SectionHeading title="Built For Modern Content Teams" />
        </FadeIn>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <FadeIn key={uc.title} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.4 }}
                  className="card card-hover group"
                >
                  <div className="icon-gradient h-12 w-12">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-4 font-semibold text-content">{uc.title}</h3>
                  <p className="mt-2 text-sm text-content-muted">{uc.desc}</p>
                </motion.div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
