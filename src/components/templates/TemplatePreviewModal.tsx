"use client";

import { X, Star, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  getCategoryMeta,
  formatUseCount,
  type TemplateWithMeta,
} from "@/lib/templates-marketplace";

interface TemplatePreviewModalProps {
  template: TemplateWithMeta | null;
  onClose: () => void;
  onFavorite: (id: string, favorite: boolean) => void;
  onUse: (template: TemplateWithMeta) => void;
}

export function TemplatePreviewModal({
  template,
  onClose,
  onFavorite,
  onUse,
}: TemplatePreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!template) return null;

  const category = getCategoryMeta(template.category);

  async function copyBody() {
    await navigator.clipboard.writeText(template!.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e] shadow-2xl">
        <div className={cn("relative shrink-0 bg-gradient-to-br p-6", template.gradient)}>
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
                {category.label}
              </span>
              <h2 className="mt-1 text-xl font-bold text-white">{template.title}</h2>
              <p className="mt-1 text-sm text-white/80">{template.description}</p>
              <p className="mt-2 text-xs text-white/60">
                {formatUseCount(template.useCount)} uses · by {template.author}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-black/30 p-2 text-white backdrop-blur-sm hover:bg-black/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-content-subtle"
              >
                #{tag}
              </span>
            ))}
          </div>
          <pre className="whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-black/30 p-4 font-mono text-xs leading-relaxed text-content-muted">
            {template.body}
          </pre>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 border-t border-white/[0.06] p-4">
          <button
            type="button"
            onClick={() => onFavorite(template.id, !template.favorite)}
            className="btn-secondary"
          >
            <Star
              className={cn(
                "h-4 w-4",
                template.favorite && "fill-amber-400 text-amber-400"
              )}
            />
            {template.favorite ? "Favorited" : "Favorite"}
          </button>
          <button type="button" onClick={copyBody} className="btn-secondary">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => onUse(template)}
            className="btn-primary ml-auto"
          >
            <ExternalLink className="h-4 w-4" />
            Use template
          </button>
        </div>
      </div>
    </div>
  );
}
