"use client";

import { Pencil } from "lucide-react";
import type { CarouselSlide } from "@/lib/carousel-content";
import { getSlideRoleLabel } from "@/lib/carousel-content";
import { cn } from "@/lib/utils";

interface CarouselSlideListProps {
  slides: CarouselSlide[];
  activeIndex: number;
  editingId: string | null;
  onSelect: (index: number) => void;
  onEdit: (id: string | null) => void;
  onUpdate: (id: string, field: "title" | "body", value: string) => void;
}

export function CarouselSlideList({
  slides,
  activeIndex,
  editingId,
  onSelect,
  onEdit,
  onUpdate,
}: CarouselSlideListProps) {
  return (
    <div className="space-y-2">
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        const isEditing = editingId === slide.id;

        return (
          <div
            key={slide.id}
            className={cn(
              "rounded-xl border transition duration-300",
              isActive
                ? "border-brand-500/40 bg-brand-500/5 shadow-glow"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
            )}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => onSelect(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelect(index);
              }}
              className="flex w-full cursor-pointer items-center gap-3 p-3 text-left"
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                  slide.role === "hook" && "bg-brand-500/20 text-brand-300",
                  slide.role === "content" && "bg-accent-blue/20 text-blue-300",
                  slide.role === "cta" && "bg-accent-cyan/20 text-cyan-300"
                )}
              >
                {slide.number}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
                    {getSlideRoleLabel(slide.role)}
                  </span>
                </div>
                <p className="truncate text-sm font-medium text-content">
                  {slide.title}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(index);
                  onEdit(isEditing ? null : slide.id);
                }}
                className="btn-ghost !rounded-lg !p-2"
                aria-label="Edit slide"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>

            {isEditing && (
              <div className="space-y-3 border-t border-white/10 px-3 pb-3 pt-2">
                <div>
                  <label className="label text-xs">Title</label>
                  <input
                    className="input-field text-sm"
                    value={slide.title}
                    onChange={(e) => onUpdate(slide.id, "title", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label text-xs">Body</label>
                  <textarea
                    className="input-field min-h-[80px] resize-y text-sm"
                    value={slide.body}
                    onChange={(e) => onUpdate(slide.id, "body", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
