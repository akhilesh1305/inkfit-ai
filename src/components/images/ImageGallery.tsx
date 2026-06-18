"use client";

import { useState } from "react";
import {
  Download,
  Copy,
  Star,
  Trash2,
  Check,
  ImageIcon,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IMAGE_STYLES,
  copyToClipboard,
  downloadImage,
  getStyleById,
  type GalleryImage,
  type ImageStyleId,
} from "@/lib/image-studio";

interface ImageGalleryProps {
  items: GalleryImage[];
  onFavorite: (id: string, favorite: boolean) => void;
  onDelete: (id: string) => void;
  highlightId?: string | null;
}

export function ImageGallery({
  items,
  onFavorite,
  onDelete,
  highlightId,
}: ImageGalleryProps) {
  const [filter, setFilter] = useState<"all" | "favorites" | ImageStyleId>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered =
    filter === "all"
      ? items
      : filter === "favorites"
        ? items.filter((i) => i.favorite)
        : items.filter((i) => i.style === filter);

  async function handleCopy(item: GalleryImage) {
    const ok = await copyToClipboard(item.prompt);
    if (ok) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-content">Gallery</h2>
          <p className="text-xs text-content-subtle">{filtered.length} images</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="h-3.5 w-3.5 shrink-0 text-content-subtle" />
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterChip>
          <FilterChip active={filter === "favorites"} onClick={() => setFilter("favorites")}>
            ★ Favorites
          </FilterChip>
          {IMAGE_STYLES.map((s) => (
            <FilterChip
              key={s.id}
              active={filter === s.id}
              onClick={() => setFilter(s.id)}
            >
              {s.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <ImageIcon className="h-12 w-12 text-content-subtle" />
          <p className="mt-4 font-medium text-content">No images yet</p>
          <p className="mt-1 text-sm text-content-subtle">
            Generate your first image to fill the gallery
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
          {filtered.map((item) => {
            const style = getStyleById(item.style);
            const isNew = item.id === highlightId;
            return (
              <div
                key={item.id}
                className={cn(
                  "group mb-4 break-inside-avoid overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c0c0e] transition",
                  isNew && "ring-2 ring-brand-500/50 shadow-glow"
                )}
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition group-hover:opacity-100">
                    <div className="flex w-full gap-1 p-3">
                      <ActionBtn
                        icon={Download}
                        label="Download"
                        onClick={() =>
                          downloadImage(item.url, `inkfit-${item.id}.jpg`)
                        }
                      />
                      <ActionBtn
                        icon={copiedId === item.id ? Check : Copy}
                        label="Copy prompt"
                        onClick={() => handleCopy(item)}
                      />
                      <ActionBtn
                        icon={Star}
                        label="Favorite"
                        active={item.favorite}
                        onClick={() => onFavorite(item.id, !item.favorite)}
                      />
                      <ActionBtn
                        icon={Trash2}
                        label="Delete"
                        danger
                        onClick={() => onDelete(item.id)}
                      />
                    </div>
                  </div>
                  {item.favorite && (
                    <Star className="absolute right-2 top-2 h-4 w-4 fill-amber-400 text-amber-400 drop-shadow" />
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r text-white",
                        style.gradient
                      )}
                    >
                      {style.label}
                    </span>
                    <span className="text-[10px] text-content-subtle">{item.aspectRatio}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-content-muted">
                    {item.prompt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition",
        active
          ? "border-brand-500/40 bg-brand-500/15 text-brand-300"
          : "border-white/[0.06] text-content-subtle hover:text-content"
      )}
    >
      {children}
    </button>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  active,
  danger,
}: {
  icon: typeof Download;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex flex-1 items-center justify-center rounded-lg bg-black/50 py-2 backdrop-blur-sm transition hover:bg-black/70",
        danger && "hover:text-red-400",
        active && "text-amber-400"
      )}
    >
      <Icon className={cn("h-4 w-4", active && "fill-amber-400")} />
    </button>
  );
}
