"use client";

import {
  FileText,
  Linkedin,
  Image as ImageIcon,
  Calendar,
  Search,
  Palette,
  BarChart3,
  Send,
} from "lucide-react";
import { FadeIn, FeatureCard } from "./AnimatedSections";

const features = [
  {
    icon: Linkedin,
    title: "LinkedIn Growth Studio",
    desc: "Posts, carousels, comments & viral ideas",
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&q=80",
  },
  {
    icon: FileText,
    title: "AI Blog Writer",
    desc: "SEO headings, multiple tones, Word/PDF export",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80",
  },
  {
    icon: ImageIcon,
    title: "Image Generation",
    desc: "Social creatives, blog headers, ad visuals",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315346d?w=600&q=80",
  },
  {
    icon: Calendar,
    title: "Content Calendar",
    desc: "Monthly planner with AI topic suggestions",
    image: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=600&q=80",
  },
  {
    icon: Palette,
    title: "Brand Kit",
    desc: "Consistent voice across all AI content",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
  },
  {
    icon: Search,
    title: "SEO Toolkit",
    desc: "Keyword research, scores & meta generation",
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&q=80",
  },
  {
    icon: BarChart3,
    title: "Competitor Intel",
    desc: "Content gaps & trending topics",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  },
  {
    icon: Send,
    title: "Multi-Platform Publish",
    desc: "LinkedIn, Instagram, Facebook, WordPress",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="section-alt py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="text-center">
          <h2 className="text-3xl font-bold text-content">
            Everything you need to win at content
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-content-muted">
            Start with LinkedIn growth. Expand to blogs, SEO, and multi-platform publishing as you scale.
          </p>
        </FadeIn>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
