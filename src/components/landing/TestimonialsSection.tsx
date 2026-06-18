"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { FadeIn } from "./AnimatedSections";

const testimonials = [
  {
    name: "Priya Sharma",
    company: "GrowthStack Agency",
    text: "InkFit AI cut our content production time by 70%. Our clients love the consistent brand voice across every deliverable.",
    avatar: "PS",
  },
  {
    name: "James Chen",
    company: "NovaStart Inc.",
    text: "As a solo founder, I publish daily on LinkedIn without hiring a copywriter. The AI actually understands my tone.",
    avatar: "JC",
  },
  {
    name: "Sarah Mitchell",
    company: "BrightPath Marketing",
    text: "We manage 12 client accounts and InkFit AI is the backbone of our content workflow. SEO scores improved across the board.",
    avatar: "SM",
  },
  {
    name: "Arjun Patel",
    company: "TechVentures",
    text: "The Brand Kit feature alone is worth it. Every blog, social post, and email sounds like us — not generic AI slop.",
    avatar: "AP",
  },
  {
    name: "Emily Rodriguez",
    company: "Creator Labs",
    text: "I went from posting once a week to five times a week. The template gallery and calendar keep me organized and consistent.",
    avatar: "ER",
  },
  {
    name: "David Okonkwo",
    company: "ScaleUp Digital",
    text: "Our team replaced four separate tools with InkFit AI. The unified dashboard and analytics are a game changer for agencies.",
    avatar: "DO",
  },
];

export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const visible = 3;
  const maxIndex = testimonials.length - visible;

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [paused, maxIndex]);

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <SectionHeading title="Loved By Growing Businesses" />
        </FadeIn>

        <div
          className="relative mt-10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="overflow-hidden">
            <motion.div
              animate={{ x: `-${index * (100 / visible)}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex"
            >
              {testimonials.map((t) => (
                <div key={t.name} className="w-full shrink-0 px-2 sm:w-1/2 lg:w-1/3">
                  <div className="card flex h-full flex-col">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-content-muted">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="mt-4 flex items-center gap-3 border-t border-white/[0.08] pt-4 dark:border-slate-800">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-accent-blue text-xs font-bold text-white">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-content">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.company}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIndex((i) => (i <= 0 ? maxIndex : i - 1))}
              className="btn-ghost !p-2"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-brand-600" : "w-1.5 bg-slate-300 dark:bg-slate-700"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIndex((i) => (i >= maxIndex ? 0 : i + 1))}
              className="btn-ghost !p-2"
              aria-label="Next testimonials"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
