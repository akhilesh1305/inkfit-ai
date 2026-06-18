"use client";

import { Star, Copy, MoreHorizontal, Trash2, Pencil, Clock, TrendingUp } from "lucide-react";
import type { PromptItem } from "@/lib/prompt-library";
import { getCategoryMeta, truncateBody } from "@/lib/prompt-library";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PromptCardProps {
  prompt: PromptItem;
  compact?: boolean;
  onFavorite: (id: string, favorite: boolean) => void;
  onUse: (prompt: PromptItem) => void;
  onEdit: (prompt: PromptItem) => void;
  onDelete: (id: string) => void;
  onCopy: (body: string) => void;
}

export function PromptCard({
  prompt,
  compact,
  onFavorite,
  onUse,
  onEdit,
  onDelete,
  onCopy,
}: PromptCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = getCategoryMeta(prompt.category);

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-white/[0.06] bg-white/[0.02] transition",
        "hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-lg hover:shadow-black/20",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onUse(prompt)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-[10px] font-bold text-white",
                meta.gradient
              )}
            >
              {meta.icon}
            </span>
            <h3 className={cn("font-semibold text-white", compact ? "text-sm" : "text-base")}>
              {prompt.title}
            </h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-content-muted line-clamp-3">
            {truncateBody(prompt.body, compact ? 80 : 140)}
          </p>
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => onFavorite(prompt.id, !prompt.favorite)}
            className={cn(
              "rounded-lg p-1.5 transition",
              prompt.favorite
                ? "text-amber-400 hover:bg-amber-500/10"
                : "text-content-subtle opacity-0 group-hover:opacity-100 hover:bg-white/[0.06] hover:text-amber-400"
            )}
          >
            <Star className={cn("h-4 w-4", prompt.favorite && "fill-current")} />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg p-1.5 text-content-subtle opacity-0 transition group-hover:opacity-100 hover:bg-white/[0.06] hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-white/[0.08] bg-[#1a1a1c] py-1 shadow-xl">
                  <MenuItem icon={Copy} label="Copy" onClick={() => { onCopy(prompt.body); setMenuOpen(false); }} />
                  <MenuItem icon={Pencil} label="Edit" onClick={() => { onEdit(prompt); setMenuOpen(false); }} />
                  <MenuItem icon={Trash2} label="Delete" danger onClick={() => { onDelete(prompt.id); setMenuOpen(false); }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {prompt.tags.slice(0, compact ? 2 : 4).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-content-subtle"
          >
            #{tag}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-3 text-[10px] text-content-subtle">
          {prompt.useCount > 0 && (
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {prompt.useCount}
            </span>
          )}
          {prompt.lastUsedAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Used recently
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Copy;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-white/[0.06]",
        danger ? "text-red-400" : "text-content-muted hover:text-white"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

interface PromptRowProps {
  title: string;
  prompts: PromptItem[];
  onFavorite: PromptCardProps["onFavorite"];
  onUse: PromptCardProps["onUse"];
  onEdit: PromptCardProps["onEdit"];
  onDelete: PromptCardProps["onDelete"];
  onCopy: PromptCardProps["onCopy"];
}

export function PromptRowSection({
  title,
  prompts,
  onFavorite,
  onUse,
  onEdit,
  onDelete,
  onCopy,
}: PromptRowProps) {
  if (prompts.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {prompts.map((p) => (
          <PromptCard
            key={p.id}
            prompt={p}
            compact
            onFavorite={onFavorite}
            onUse={onUse}
            onEdit={onEdit}
            onDelete={onDelete}
            onCopy={onCopy}
          />
        ))}
      </div>
    </section>
  );
}
