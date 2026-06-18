"use client";

import { useState, useRef, useEffect } from "react";
import {
  Star,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Download,
  Archive,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CONTENT_TYPE_META,
  contentPreview,
  formatRelativeDate,
  exportContentTxt,
  type WorkspaceItem,
} from "@/lib/workspace";

interface WorkspaceContentCardProps {
  item: WorkspaceItem;
  view: "grid" | "list";
  onEdit: (item: WorkspaceItem) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
  onStatusChange: (id: string, status: WorkspaceItem["status"]) => void;
}

export function WorkspaceContentCard({
  item,
  view,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onStatusChange,
}: WorkspaceContentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const meta = CONTENT_TYPE_META[item.type];
  const Icon = meta.icon;

  useEffect(() => {
    if (!menuOpen) return;
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const statusColors = {
    draft: "bg-zinc-500/20 text-zinc-300",
    published: "bg-emerald-500/20 text-emerald-300",
    archived: "bg-amber-500/20 text-amber-300",
  };

  const cardBody = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${meta.color}22` }}
        >
          <Icon className="h-4 w-4" style={{ color: meta.color }} />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id, !item.favorite);
            }}
            className="rounded-lg p-1.5 text-content-subtle transition hover:bg-white/[0.06] hover:text-amber-400"
          >
            <Star
              className={cn("h-4 w-4", item.favorite && "fill-amber-400 text-amber-400")}
            />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="rounded-lg p-1.5 text-content-subtle transition hover:bg-white/[0.06] hover:text-content"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-white/10 bg-ink-surface py-1 shadow-xl">
                <MenuBtn icon={Pencil} label="Edit" onClick={() => { onEdit(item); setMenuOpen(false); }} />
                <MenuBtn icon={Copy} label="Duplicate" onClick={() => { onDuplicate(item.id); setMenuOpen(false); }} />
                <MenuBtn icon={Download} label="Export" onClick={() => { exportContentTxt(item); setMenuOpen(false); }} />
                {item.status !== "published" && (
                  <MenuBtn icon={Send} label="Mark published" onClick={() => { onStatusChange(item.id, "published"); setMenuOpen(false); }} />
                )}
                {item.status !== "archived" && (
                  <MenuBtn icon={Archive} label="Archive" onClick={() => { onStatusChange(item.id, "archived"); setMenuOpen(false); }} />
                )}
                <MenuBtn icon={Trash2} label="Delete" danger onClick={() => { onDelete(item.id); setMenuOpen(false); }} />
              </div>
            )}
          </div>
        </div>
      </div>

      <button type="button" onClick={() => onEdit(item)} className="mt-3 w-full text-left">
        <h3 className="line-clamp-2 font-semibold text-content group-hover:text-brand-300">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-content-subtle">
          {contentPreview(item.body)}
        </p>
      </button>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", statusColors[item.status])}>
          {item.status}
        </span>
        <span className="text-[10px] text-content-subtle">{formatRelativeDate(item.updatedAt)}</span>
      </div>

      {item.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-content-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </>
  );

  if (view === "list") {
    return (
      <div className="group flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/10 hover:bg-white/[0.04]">
        <div className="min-w-0 flex-1">{cardBody}</div>
      </div>
    );
  }

  return (
    <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-brand-500/20 hover:bg-white/[0.04] hover:shadow-glow">
      {cardBody}
    </div>
  );
}

function MenuBtn({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-white/[0.06]",
        danger ? "text-red-400" : "text-content-muted hover:text-content"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
