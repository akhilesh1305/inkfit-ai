"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LayoutTemplate,
  TrendingUp,
  Flame,
  Star,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplatePreviewModal } from "@/components/templates/TemplatePreviewModal";
import { cn } from "@/lib/utils";
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
  type TemplateWithMeta,
} from "@/lib/templates-marketplace";

export function TemplateMarketplaceView() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateWithMeta[]>([]);
  const [trending, setTrending] = useState<TemplateWithMeta[]>([]);
  const [mostUsed, setMostUsed] = useState<TemplateWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<TemplateCategory | "all" | "favorites">("all");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<TemplateWithMeta | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/templates");
    if (res.ok) {
      const data = await res.json();
      setTemplates(data.templates ?? []);
      setTrending(data.trending ?? []);
      setMostUsed(data.mostUsed ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function apiPost(body: Record<string, unknown>) {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function updateTemplate(id: string, patch: Partial<TemplateWithMeta>) {
    const updater = (list: TemplateWithMeta[]) =>
      list.map((t) => (t.id === id ? { ...t, ...patch } : t));
    setTemplates(updater);
    setTrending(updater);
    setMostUsed(updater);
    if (preview?.id === id) setPreview((p) => (p ? { ...p, ...patch } : p));
  }

  async function handleFavorite(id: string, favorite: boolean) {
    await apiPost({ action: "favorite", templateId: id, favorite });
    updateTemplate(id, { favorite });
    showToast(favorite ? "Added to favorites" : "Removed from favorites");
  }

  async function handleUse(template: TemplateWithMeta) {
    const result = await apiPost({ action: "use", templateId: template.id });
    if (result.ok) {
      updateTemplate(template.id, { useCount: result.useCount });
      setPreview(null);
      showToast("Template added to Workspace");
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "inkfit-template",
          JSON.stringify({ title: template.title, body: template.body })
        );
      }
      router.push(result.route ?? "/dashboard/workspace");
    }
  }

  const filtered = useMemo(() => {
    let list = templates;
    if (category === "favorites") {
      list = list.filter((t) => t.favorite);
    } else if (category !== "all") {
      list = list.filter((t) => t.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return list;
  }, [templates, category, search]);

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
            <LayoutTemplate className="h-7 w-7 text-brand-400" />
            Template Marketplace
          </span>
        }
        description="Browse proven templates for LinkedIn, SEO, blogs, email, and carousels."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
          {templates.length} templates
        </span>
      </PageHeader>

      {toast && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
          {toast}
        </div>
      )}

      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-content">Trending Templates</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {trending.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              compact
              onPreview={setPreview}
              onFavorite={handleFavorite}
              onUse={handleUse}
            />
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-400" />
          <h2 className="text-sm font-semibold text-content">Most Used Templates</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mostUsed.map((t) => (
            <TemplateCard
              key={`used-${t.id}`}
              template={t}
              onPreview={setPreview}
              onFavorite={handleFavorite}
              onUse={handleUse}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-content">Browse all templates</h2>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
            <input
              className="input-field w-full pl-9 text-sm"
              placeholder="Search templates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
            All
          </FilterChip>
          <FilterChip
            active={category === "favorites"}
            onClick={() => setCategory("favorites")}
          >
            <Star className="h-3 w-3" />
            Favorites
          </FilterChip>
          {TEMPLATE_CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              active={category === c.id}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <LayoutTemplate className="mx-auto h-10 w-10 text-content-subtle" />
            <p className="mt-3 font-medium text-content">No templates found</p>
            <p className="text-sm text-content-subtle">Try a different category or search</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onPreview={setPreview}
                onFavorite={handleFavorite}
                onUse={handleUse}
              />
            ))}
          </div>
        )}
      </section>

      <TemplatePreviewModal
        template={preview}
        onClose={() => setPreview(null)}
        onFavorite={handleFavorite}
        onUse={handleUse}
      />
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
        "flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-brand-500/40 bg-brand-500/15 text-brand-300"
          : "border-white/[0.06] text-content-subtle hover:text-content"
      )}
    >
      {children}
    </button>
  );
}
