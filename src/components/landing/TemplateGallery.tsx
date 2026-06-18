"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Linkedin,
  FileText,
  Search,
  ShoppingBag,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Megaphone,
  Youtube,
  Newspaper,
  Briefcase,
  Eye,
  X,
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { FadeIn } from "./AnimatedSections";

const templates = [
  {
    icon: Linkedin,
    title: "LinkedIn Posts",
    preview: "Thought leadership hooks, carousel outlines, and engagement-driven copy for professionals.",
  },
  {
    icon: FileText,
    title: "Blog Articles",
    preview: "Long-form articles with SEO headings, intros, and structured sections ready to publish.",
  },
  {
    icon: Search,
    title: "SEO Landing Pages",
    preview: "Keyword-optimized landing page copy with meta titles, descriptions, and CTAs.",
  },
  {
    icon: ShoppingBag,
    title: "Product Descriptions",
    preview: "Compelling product copy that highlights benefits, features, and conversion triggers.",
  },
  {
    icon: Mail,
    title: "Email Campaigns",
    preview: "Subject lines, preview text, and full email body copy for nurture and sales sequences.",
  },
  {
    icon: Instagram,
    title: "Instagram Captions",
    preview: "Scroll-stopping captions with hashtags, hooks, and call-to-actions for reels and posts.",
  },
  {
    icon: Facebook,
    title: "Facebook Posts",
    preview: "Community-focused posts optimized for engagement and shareability on Facebook.",
  },
  {
    icon: Twitter,
    title: "X/Twitter Threads",
    preview: "Viral thread structures with hooks, value-packed tweets, and strong closers.",
  },
  {
    icon: Megaphone,
    title: "Ad Copy",
    preview: "High-converting ad headlines and body copy for Google, Meta, and LinkedIn ads.",
  },
  {
    icon: Youtube,
    title: "YouTube Scripts",
    preview: "Video scripts with hooks, timestamps, CTAs, and retention-optimized pacing.",
  },
  {
    icon: Newspaper,
    title: "Newsletter Content",
    preview: "Weekly newsletter sections, curated intros, and subscriber-friendly formatting.",
  },
  {
    icon: Briefcase,
    title: "Case Studies",
    preview: "Client success stories with problem-solution-results structure and social proof.",
  },
];

export function TemplateGallery() {
  const [preview, setPreview] = useState<(typeof templates)[0] | null>(null);

  return (
    <section id="templates" className="section-alt py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <SectionHeading title="Content Templates For Every Need" />
        </FadeIn>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((t, i) => {
            const Icon = t.icon;
            return (
              <FadeIn key={t.title} delay={i * 0.04}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="group card flex flex-col p-5 transition-shadow "
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 transition group-hover:bg-brand-600 dark:bg-brand-950">
                    <Icon className="h-5 w-5 text-brand-600 transition group-hover:text-white dark:text-brand-400" />
                  </div>
                  <h3 className="mt-4 font-semibold text-content">{t.title}</h3>
                  <button
                    type="button"
                    onClick={() => setPreview(t)}
                    className="btn-ghost mt-auto !justify-start !px-0 !py-0 pt-3 text-brand-600 dark:text-brand-400"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                </motion.div>
              </FadeIn>
            );
          })}
        </div>
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setPreview(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card relative max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="btn-ghost absolute right-3 top-3 !p-2"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
                <preview.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-content">{preview.title}</h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-content-muted">{preview.preview}</p>
            <a href="/register" className="btn-primary mt-6 w-full">
              Use This Template
            </a>
          </motion.div>
        </div>
      )}
    </section>
  );
}
