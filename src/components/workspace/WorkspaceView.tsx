"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, FolderKanban, Plus, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { WorkspaceToolbar, WorkspaceFolderNav } from "@/components/workspace/WorkspaceToolbar";
import { WorkspaceContentCard } from "@/components/workspace/WorkspaceContentCard";
import { WorkspaceEditorModal } from "@/components/workspace/WorkspaceEditorModal";
import {
  filterWorkspaceItems,
  type ContentType,
  type WorkspaceFolder,
  type WorkspaceItem,
  type WorkspaceTab,
} from "@/lib/workspace";

export function WorkspaceView() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [folders, setFolders] = useState<WorkspaceFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<WorkspaceTab>("recent");
  const [typeFilter, setTypeFilter] = useState<ContentType | "all">("all");
  const [folderFilter, setFolderFilter] = useState<string | "all" | "favorites">("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [editing, setEditing] = useState<WorkspaceItem | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/workspace");
    if (res.ok) {
      const data = await res.json();
      setItems(data.items ?? []);
      setFolders(data.folders ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const handler = () => {
      setLoading(true);
      load();
    };
    window.addEventListener("inkfit-workspace-change", handler);
    return () => window.removeEventListener("inkfit-workspace-change", handler);
  }, [load]);

  const filtered = useMemo(
    () =>
      filterWorkspaceItems(items, {
        tab,
        typeFilter,
        folderId: folderFilter,
        query,
      }),
    [items, tab, typeFilter, folderFilter, query]
  );

  async function apiPost(body: Record<string, unknown>) {
    const res = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function handleDuplicate(id: string) {
    const result = await apiPost({ action: "duplicate", id });
    if (result.item) setItems((prev) => [result.item, ...prev]);
  }

  async function handleDelete(id: string) {
    await apiPost({ action: "delete", id });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleToggleFavorite(id: string, favorite: boolean) {
    const result = await apiPost({ action: "update", id, favorite });
    if (result.item) {
      setItems((prev) => prev.map((i) => (i.id === id ? result.item : i)));
    }
  }

  async function handleStatusChange(id: string, status: WorkspaceItem["status"]) {
    const result = await apiPost({ action: "update", id, status });
    if (result.item) {
      setItems((prev) => prev.map((i) => (i.id === id ? result.item : i)));
    }
  }

  async function handleSave(data: {
    id: string;
    title: string;
    body: string;
    type: ContentType;
    status: WorkspaceItem["status"];
    folderId?: string;
    tags: string[];
    favorite: boolean;
  }) {
    const result = await apiPost({ action: "update", ...data });
    if (result.item) {
      setItems((prev) => prev.map((i) => (i.id === data.id ? result.item : i)));
    }
  }

  async function handleCreateFolder(name: string) {
    const result = await apiPost({ action: "create-folder", name });
    if (result.folder) setFolders((prev) => [...prev, result.folder]);
  }

  async function handleNewContent() {
    const result = await apiPost({
      action: "create",
      title: "Untitled",
      body: "",
      type: typeFilter === "all" ? "blog" : typeFilter,
      status: "draft",
    });
    if (result.item) {
      setItems((prev) => [result.item, ...prev]);
      setEditing(result.item);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <FolderKanban className="h-7 w-7 text-brand-400" />
            Content Workspace
          </span>
        }
        description="Your central hub for all generated content — organize, search, and manage everything in one place."
      >
        <button type="button" onClick={handleNewContent} className="btn-primary">
          <Plus className="h-4 w-4" />
          New content
        </button>
      </PageHeader>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <WorkspaceFolderNav
              folders={folders}
              activeFolder={folderFilter}
              onFolderChange={setFolderFilter}
              onCreateFolder={handleCreateFolder}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 overflow-x-auto lg:hidden">
            <div className="flex min-w-max gap-2 pb-1">
              <MobileFolderChip
                label="All"
                active={folderFilter === "all"}
                onClick={() => setFolderFilter("all")}
              />
              <MobileFolderChip
                label="★ Favorites"
                active={folderFilter === "favorites"}
                onClick={() => setFolderFilter("favorites")}
              />
              {folders.map((f) => (
                <MobileFolderChip
                  key={f.id}
                  label={f.name}
                  active={folderFilter === f.id}
                  color={f.color}
                  onClick={() => setFolderFilter(f.id)}
                />
              ))}
            </div>
          </div>

          <WorkspaceToolbar
            tab={tab}
            onTabChange={setTab}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            query={query}
            onQueryChange={setQuery}
            view={view}
            onViewChange={setView}
            itemCount={filtered.length}
          />

          {filtered.length === 0 ? (
            <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
              <FileText className="h-12 w-12 text-content-subtle" />
              <p className="mt-4 font-medium text-content">No content found</p>
              <p className="mt-1 max-w-sm text-sm text-content-subtle">
                Try adjusting filters or create new content from any generator tool.
              </p>
              <button type="button" onClick={handleNewContent} className="btn-primary mt-6">
                <Plus className="h-4 w-4" />
                Create content
              </button>
            </div>
          ) : (
            <div
              className={
                view === "grid"
                  ? "mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  : "mt-6 flex flex-col gap-3"
              }
            >
              {filtered.map((item) => (
                <WorkspaceContentCard
                  key={item.id}
                  item={item}
                  view={view}
                  onEdit={setEditing}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <WorkspaceEditorModal
        item={editing}
        folders={folders}
        open={!!editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </div>
  );
}

function MobileFolderChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-brand-500/40 bg-brand-500/15 text-brand-300"
          : "border-white/10 bg-white/[0.03] text-content-muted"
      }`}
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
      {label}
    </button>
  );
}
