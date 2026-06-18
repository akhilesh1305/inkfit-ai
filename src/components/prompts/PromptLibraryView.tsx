"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Search,
  Sparkles,
  Star,
  LayoutGrid,
  Hash,
} from "lucide-react";
import { PromptEditorModal } from "@/components/prompts/PromptEditorModal";
import { PromptCard, PromptRowSection } from "@/components/prompts/PromptCard";
import {
  filterPrompts,
  PROMPT_CATEGORIES,
  type PromptCategoryId,
  type PromptCollection,
  type PromptItem,
} from "@/lib/prompt-library";
import { cn } from "@/lib/utils";

export function PromptLibraryView() {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [collections, setCollections] = useState<PromptCollection[]>([]);
  const [mostUsed, setMostUsed] = useState<PromptItem[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<PromptItem[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<PromptCategoryId | "all">("all");
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/prompts");
    if (res.ok) {
      const data = await res.json();
      setPrompts(data.prompts ?? []);
      setCollections(data.collections ?? []);
      setMostUsed(data.mostUsed ?? []);
      setRecentlyUsed(data.recentlyUsed ?? []);
      setAllTags(data.tags ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      filterPrompts(prompts, {
        search,
        category,
        collectionId,
        tag: activeTag,
        favoritesOnly,
      }),
    [prompts, search, category, collectionId, activeTag, favoritesOnly]
  );

  async function apiPost(body: Record<string, unknown>) {
    const res = await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { res, data: await res.json() };
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function openCreate() {
    setEditingPrompt(null);
    setEditorOpen(true);
  }

  function openEdit(prompt: PromptItem) {
    setEditingPrompt(prompt);
    setEditorOpen(true);
  }

  async function handleSave(data: {
    id?: string;
    title: string;
    body: string;
    category: PromptCategoryId;
    tags: string[];
    collectionId: string | null;
    favorite: boolean;
  }) {
    setSaving(true);
    const action = data.id ? "update" : "create";
    const { res, data: result } = await apiPost({ action, ...data });
    setSaving(false);

    if (res.ok && result.prompt) {
      if (data.id) {
        setPrompts((prev) => prev.map((p) => (p.id === data.id ? result.prompt : p)));
      } else {
        setPrompts((prev) => [result.prompt, ...prev]);
      }
      setEditorOpen(false);
      showToast(data.id ? "Prompt saved" : "Prompt created");
      await load();
    }
  }

  async function handleFavorite(id: string, favorite: boolean) {
    const { res, data } = await apiPost({ action: "favorite", id, favorite });
    if (res.ok && data.prompt) {
      setPrompts((prev) => prev.map((p) => (p.id === id ? data.prompt : p)));
    }
  }

  async function handleUse(prompt: PromptItem) {
    const { res, data } = await apiPost({ action: "use", id: prompt.id });
    if (res.ok && data.prompt) {
      setPrompts((prev) => prev.map((p) => (p.id === prompt.id ? data.prompt : p)));
      await load();
    }
    await navigator.clipboard.writeText(prompt.body);
    showToast("Prompt copied — ready to paste");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this prompt?")) return;
    await apiPost({ action: "delete", id });
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    showToast("Prompt deleted");
    await load();
  }

  function handleCopy(body: string) {
    navigator.clipboard.writeText(body);
    showToast("Copied to clipboard");
  }

  async function handleNewCollection() {
    const name = prompt("Collection name");
    if (!name?.trim()) return;
    const { res, data } = await apiPost({
      action: "create-collection",
      name: name.trim(),
    });
    if (res.ok && data.collection) {
      setCollections((prev) => [...prev, data.collection]);
      showToast("Collection created");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const showHighlights = !search && !activeTag && category === "all" && !collectionId && !favoritesOnly;

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col lg:h-[calc(100vh-5rem)]">
      {/* Notion-style header */}
      <header className="mb-4 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-700 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Prompt Library</h1>
              <p className="text-sm text-content-muted">
                {prompts.length} prompts · {collections.length} collections
              </p>
            </div>
          </div>
          <button type="button" onClick={openCreate} className="btn-primary">
            <Plus className="h-4 w-4" />
            New prompt
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0c]">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-white/[0.06] lg:flex">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-content-subtle" />
              <input
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-2 pl-8 pr-3 text-xs text-white placeholder:text-content-subtle outline-none focus:border-brand-500/40"
                placeholder="Search prompts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
            <SidebarSection title="Library">
              <SidebarItem
                icon={<LayoutGrid className="h-3.5 w-3.5" />}
                label="All prompts"
                active={category === "all" && !collectionId && !favoritesOnly}
                onClick={() => {
                  setCategory("all");
                  setCollectionId(null);
                  setFavoritesOnly(false);
                  setActiveTag(null);
                }}
              />
              <SidebarItem
                icon={<Star className="h-3.5 w-3.5" />}
                label="Favorites"
                active={favoritesOnly}
                onClick={() => {
                  setFavoritesOnly(true);
                  setCollectionId(null);
                  setCategory("all");
                }}
              />
            </SidebarSection>

            <SidebarSection title="Categories">
              {PROMPT_CATEGORIES.map((cat) => (
                <SidebarItem
                  key={cat.id}
                  icon={
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br text-[8px] font-bold text-white",
                        cat.gradient
                      )}
                    >
                      {cat.icon}
                    </span>
                  }
                  label={cat.label}
                  active={category === cat.id && !collectionId}
                  onClick={() => {
                    setCategory(cat.id);
                    setCollectionId(null);
                    setFavoritesOnly(false);
                  }}
                />
              ))}
            </SidebarSection>

            <SidebarSection
              title="Collections"
              action={
                <button
                  type="button"
                  onClick={handleNewCollection}
                  className="text-content-subtle hover:text-white"
                >
                  <Plus className="h-3 w-3" />
                </button>
              }
            >
              {collections.map((coll) => (
                <SidebarItem
                  key={coll.id}
                  icon={<span className="text-sm">{coll.icon}</span>}
                  label={coll.name}
                  count={coll.promptCount}
                  active={collectionId === coll.id}
                  onClick={() => {
                    setCollectionId(coll.id);
                    setCategory("all");
                    setFavoritesOnly(false);
                  }}
                />
              ))}
            </SidebarSection>

            {allTags.length > 0 && (
              <SidebarSection title="Tags">
                {allTags.slice(0, 12).map((tag) => (
                  <SidebarItem
                    key={tag}
                    icon={<Hash className="h-3 w-3" />}
                    label={tag}
                    active={activeTag === tag}
                    onClick={() => {
                      setActiveTag(activeTag === tag ? null : tag);
                      setFavoritesOnly(false);
                    }}
                  />
                ))}
              </SidebarSection>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Mobile search */}
          <div className="relative mb-4 lg:hidden">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
            <input
              className="input-field pl-10"
              placeholder="Search prompts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Mobile category pills */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            <Pill active={category === "all" && !favoritesOnly} onClick={() => { setCategory("all"); setFavoritesOnly(false); }}>
              All
            </Pill>
            <Pill active={favoritesOnly} onClick={() => setFavoritesOnly(true)}>
              ★ Favorites
            </Pill>
            {PROMPT_CATEGORIES.map((c) => (
              <Pill key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                {c.label}
              </Pill>
            ))}
          </div>

          <div className="space-y-8">
            {showHighlights && (
              <>
                <PromptRowSection
                  title="Most used"
                  prompts={mostUsed}
                  onFavorite={handleFavorite}
                  onUse={handleUse}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                />
                <PromptRowSection
                  title="Recently used"
                  prompts={recentlyUsed}
                  onFavorite={handleFavorite}
                  onUse={handleUse}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                />
              </>
            )}

            <section>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
                {favoritesOnly
                  ? "Favorites"
                  : collectionId
                    ? collections.find((c) => c.id === collectionId)?.name ?? "Collection"
                    : category !== "all"
                      ? PROMPT_CATEGORIES.find((c) => c.id === category)?.label
                      : search
                        ? `Results for "${search}"`
                        : "All prompts"}
                <span className="ml-2 text-content-subtle">({filtered.length})</span>
              </h2>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
                  <Sparkles className="h-10 w-10 text-content-subtle" />
                  <p className="mt-3 font-medium text-white">No prompts found</p>
                  <p className="mt-1 text-sm text-content-muted">
                    Create a new prompt or adjust your filters
                  </p>
                  <button type="button" onClick={openCreate} className="btn-primary mt-4">
                    <Plus className="h-4 w-4" />
                    Create prompt
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((p) => (
                    <PromptCard
                      key={p.id}
                      prompt={p}
                      onFavorite={handleFavorite}
                      onUse={handleUse}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onCopy={handleCopy}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <PromptEditorModal
        key={editingPrompt?.id ?? "new"}
        open={editorOpen}
        prompt={editingPrompt}
        collections={collections}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        saving={saving}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-white/10 bg-[#1a1a1c] px-4 py-2.5 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function SidebarSection({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between px-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
          {title}
        </p>
        {action}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition",
        active
          ? "bg-white/[0.08] font-medium text-white"
          : "text-content-muted hover:bg-white/[0.04] hover:text-white"
      )}
    >
      <span className="shrink-0 opacity-80">{icon}</span>
      <span className="truncate flex-1">{label}</span>
      {count != null && count > 0 && (
        <span className="text-[10px] text-content-subtle">{count}</span>
      )}
    </button>
  );
}

function Pill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition",
        active
          ? "bg-brand-500/20 text-brand-300"
          : "bg-white/[0.04] text-content-muted hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
