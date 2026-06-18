"use client";

import { Eye, Star, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCategoryMeta,
  formatUseCount,
  type TemplateWithMeta,
} from "@/lib/templates-marketplace";

interface TemplateCardProps {
  template: TemplateWithMeta;
  onPreview: (template: TemplateWithMeta) => void;
  onFavorite: (id: string, favorite: boolean) => void;
  onUse: (template: TemplateWithMeta) => void;
  compact?: boolean;
}

export function TemplateCard({
  template,
  onPreview,
  onFavorite,
  onUse,
  compact,
}: TemplateCardProps) {
  const category = getCategoryMeta(template.category);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c0e] transition hover:border-white/12 hover:shadow-lg hover:shadow-brand-500/5",
        compact && "min-w-[260px] shrink-0"
      )}
    >
      <div
        className={cn(
          "relative h-28 bg-gradient-to-br p-4",
          template.gradient
        )}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex items-start justify-between">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg bg-black/30 text-xs font-bold text-white backdrop-blur-sm",
              category.gradient
            )}
          >
            {category.icon}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(template.id, !template.favorite);
            }}
            className="rounded-lg bg-black/30 p-1.5 backdrop-blur-sm transition hover:bg-black/50"
            aria-label={template.favorite ? "Unfavorite" : "Favorite"}
          >
            <Star
              className={cn(
                "h-4 w-4",
                template.favorite ? "fill-amber-400 text-amber-400" : "text-white/80"
              )}
            />
          </button>
        </div>
        {template.trending && (
          <span className="absolute bottom-3 left-4 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            <TrendingUp className="h-3 w-3" />
            Trending
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-content-subtle">
            {category.label}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] text-content-subtle">
            <Users className="h-3 w-3" />
            {formatUseCount(template.useCount)}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-content line-clamp-1">{template.title}</h3>
        <p className="mt-1 flex-1 text-xs leading-relaxed text-content-muted line-clamp-2">
          {template.description}
        </p>
        <p className="mt-2 truncate font-mono text-[10px] text-content-subtle">
          {template.preview}
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onPreview(template)}
            className="btn-secondary flex-1 py-2 text-xs"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => onUse(template)}
            className="btn-primary flex-1 py-2 text-xs"
          >
            Use
          </button>
        </div>
      </div>
    </article>
  );
}
