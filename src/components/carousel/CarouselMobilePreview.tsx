"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CarouselSlide } from "@/lib/carousel-content";
import { getSlideRoleLabel } from "@/lib/carousel-content";
import { cn } from "@/lib/utils";

interface CarouselMobilePreviewProps {
  slides: CarouselSlide[];
  topic: string;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}

export function CarouselMobilePreview({
  slides,
  topic,
  activeIndex,
  onActiveIndexChange,
}: CarouselMobilePreviewProps) {
  const slide = slides[activeIndex];

  if (!slide) {
    return (
      <div className="flex justify-center">
        <div className="w-[280px] rounded-[2.5rem] border border-white/10 bg-ink-surface p-3 shadow-card">
          <div className="flex aspect-[9/19] items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-ink-bg">
            <p className="px-6 text-center text-sm text-content-subtle">
              Generate a carousel to preview slides
            </p>
          </div>
        </div>
      </div>
    );
  }

  const roleAccent = {
    hook: "from-brand-600/30 to-accent-blue/20",
    content: "from-accent-blue/25 to-accent-cyan/15",
    cta: "from-accent-cyan/25 to-emerald-500/15",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Phone frame */}
      <div className="relative w-[280px] rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-white/10 to-white/[0.03] p-3 shadow-card">
        <div className="absolute left-1/2 top-4 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/80" />
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-ink-bg">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className={cn(
                "relative flex aspect-square flex-col justify-between bg-gradient-to-br p-5",
                roleAccent[slide.role]
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-ink-bg/40 via-transparent to-ink-bg/60" />

              <div className="relative">
                <span
                  className={cn(
                    "inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                    slide.role === "hook" && "bg-brand-500/30 text-brand-300",
                    slide.role === "content" && "bg-accent-blue/30 text-blue-300",
                    slide.role === "cta" && "bg-accent-cyan/30 text-cyan-300"
                  )}
                >
                  {getSlideRoleLabel(slide.role)}
                  {slide.role === "content" && ` · ${slide.number}`}
                </span>
              </div>

              <div className="relative flex flex-1 flex-col justify-center py-4">
                <h3 className="text-lg font-bold leading-snug text-white">
                  {slide.title}
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-white/75">
                  {slide.body}
                </p>
              </div>

              <div className="relative flex items-center justify-between text-[10px] text-white/40">
                <span className="truncate pr-2">{topic}</span>
                <span>{activeIndex + 1}/{slides.length}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onActiveIndexChange(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          className="btn-ghost !rounded-full !p-2 disabled:opacity-30"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onActiveIndexChange(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === activeIndex
                  ? "w-6 bg-gradient-to-r from-brand-500 to-accent-blue"
                  : "w-2 bg-white/20 hover:bg-white/40"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => onActiveIndexChange(Math.min(slides.length - 1, activeIndex + 1))}
          disabled={activeIndex === slides.length - 1}
          className="btn-ghost !rounded-full !p-2 disabled:opacity-30"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
