"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Search, BookMarked } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { KnowledgeUploadPanel } from "@/components/knowledge/KnowledgeUploadPanel";
import {
  KnowledgeCategoryFilter,
  KnowledgeDocumentList,
  KnowledgeStats,
} from "@/components/knowledge/KnowledgeDocumentList";
import {
  searchDocuments,
  type KnowledgeCategory,
  type KnowledgeDocument,
} from "@/lib/knowledge-base";

export function KnowledgeBaseView() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<KnowledgeCategory | "all">("all");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/knowledge");
    if (res.ok) {
      const data = await res.json();
      setDocuments(data.documents ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => searchDocuments(documents, search, category),
    [documents, search, category]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: documents.length };
    for (const d of documents) {
      counts[d.category] = (counts[d.category] ?? 0) + 1;
    }
    return counts;
  }, [documents]);

  const readyCount = documents.filter((d) => d.status === "ready").length;
  const activeCategories = new Set(documents.map((d) => d.category)).size;

  async function handleDelete(id: string) {
    if (!confirm("Remove this document from your knowledge base?")) return;
    await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    load();
  }

  async function handleCategoryChange(id: string, cat: KnowledgeCategory) {
    await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-category", id, category: cat }),
    });
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, category: cat } : d))
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            <BookMarked className="h-7 w-7 text-brand-400" />
            Knowledge Base
          </span>
        }
        description="Upload business knowledge — brand docs, product sheets, and websites. AI generation uses this context automatically."
      />

      <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 px-4 py-3 text-sm text-brand-200/90">
        <span className="font-medium text-brand-300">Use Knowledge Base</span>
        {" — "}
        LinkedIn, blog, SEO, and Marketing OS prompts include your indexed documents when generating content.
      </div>

      <KnowledgeStats
        total={documents.length}
        ready={readyCount}
        categories={activeCategories}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4 order-2 lg:order-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
            <input
              className="input-field w-full pl-10"
              placeholder="Search documents by name or content…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <KnowledgeCategoryFilter
            active={category}
            onChange={setCategory}
            counts={categoryCounts}
          />

          {loading ? (
            <div className="card flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
            </div>
          ) : (
            <KnowledgeDocumentList
              documents={filtered}
              search={search}
              category={category}
              onDelete={handleDelete}
              onCategoryChange={handleCategoryChange}
            />
          )}
        </div>

        <div className="order-1 lg:order-2 lg:sticky lg:top-6 lg:self-start">
          <KnowledgeUploadPanel onUploaded={load} />
        </div>
      </div>
    </div>
  );
}
