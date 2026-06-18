"use client";

import { useState } from "react";
import {
  Search,
  Star,
  FolderOpen,
  LayoutGrid,
  List,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CONTENT_TYPE_META,
  WORKSPACE_TABS,
  type ContentType,
  type WorkspaceTab,
  type WorkspaceFolder,
} from "@/lib/workspace";

interface WorkspaceToolbarProps {
  tab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  typeFilter: ContentType | "all";
  onTypeFilterChange: (type: ContentType | "all") => void;
  query: string;
  onQueryChange: (q: string) => void;
  view: "grid" | "list";
  onViewChange: (v: "grid" | "list") => void;
  itemCount: number;
}

export function WorkspaceToolbar({
  tab,
  onTabChange,
  typeFilter,
  onTypeFilterChange,
  query,
  onQueryChange,
  view,
  onViewChange,
  itemCount,
}: WorkspaceToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
          <input
            type="search"
            placeholder="Search content, tags…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="input-field w-full pl-10"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle hover:text-content"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-content-subtle">{itemCount} items</span>
          <div className="flex rounded-xl border border-white/10 p-0.5">
            <button
              type="button"
              onClick={() => onViewChange("grid")}
              className={cn(
                "rounded-lg p-2 transition",
                view === "grid" ? "bg-white/10 text-content" : "text-content-subtle hover:text-content"
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewChange("list")}
              className={cn(
                "rounded-lg p-2 transition",
                view === "list" ? "bg-white/10 text-content" : "text-content-subtle hover:text-content"
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-white/[0.08] pb-px">
        {WORKSPACE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition",
              tab === t.id
                ? "border-brand-500 text-brand-300"
                : "border-transparent text-content-subtle hover:text-content"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onTypeFilterChange("all")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition",
            typeFilter === "all"
              ? "bg-brand-500/20 text-brand-300"
              : "bg-white/[0.04] text-content-subtle hover:bg-white/[0.08] hover:text-content"
          )}
        >
          All types
        </button>
        {(Object.keys(CONTENT_TYPE_META) as ContentType[]).map((type) => {
          const meta = CONTENT_TYPE_META[type];
          const Icon = meta.icon;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onTypeFilterChange(type)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                typeFilter === type
                  ? "bg-brand-500/20 text-brand-300"
                  : "bg-white/[0.04] text-content-subtle hover:bg-white/[0.08] hover:text-content"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface WorkspaceFolderNavProps {
  folders: WorkspaceFolder[];
  activeFolder: string | "all" | "favorites";
  onFolderChange: (id: string | "all" | "favorites") => void;
  onCreateFolder: (name: string) => void;
}

export function WorkspaceFolderNav({
  folders,
  activeFolder,
  onFolderChange,
  onCreateFolder,
}: WorkspaceFolderNavProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  function submitFolder() {
    if (!name.trim()) return;
    onCreateFolder(name.trim());
    setName("");
    setAdding(false);
  }

  return (
    <div className="space-y-1">
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
        Library
      </p>
      <button
        type="button"
        onClick={() => onFolderChange("all")}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition",
          activeFolder === "all"
            ? "bg-white/[0.08] text-content"
            : "text-content-muted hover:bg-white/[0.04] hover:text-content"
        )}
      >
        <FolderOpen className="h-4 w-4 shrink-0 text-content-subtle" />
        All content
      </button>
      <button
        type="button"
        onClick={() => onFolderChange("favorites")}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition",
          activeFolder === "favorites"
            ? "bg-white/[0.08] text-content"
            : "text-content-muted hover:bg-white/[0.04] hover:text-content"
        )}
      >
        <Star className="h-4 w-4 shrink-0 text-amber-400" />
        Favorites
      </button>

      <p className="mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
        Folders
      </p>
      {folders.map((folder) => (
        <button
          key={folder.id}
          type="button"
          onClick={() => onFolderChange(folder.id)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition",
            activeFolder === folder.id
              ? "bg-white/[0.08] text-content"
              : "text-content-muted hover:bg-white/[0.04] hover:text-content"
          )}
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: folder.color }}
          />
          <span className="truncate">{folder.name}</span>
        </button>
      ))}

      {adding ? (
        <div className="mt-1 flex gap-1 px-1">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitFolder();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Folder name"
            className="input-field flex-1 py-1.5 text-sm"
          />
          <button type="button" onClick={submitFolder} className="btn-primary !px-2 !py-1.5 text-xs">
            Add
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-content-subtle transition hover:bg-white/[0.04] hover:text-content"
        >
          <Plus className="h-4 w-4" />
          New folder
        </button>
      )}
    </div>
  );
}
