"use client";

import { format } from "date-fns";
import {
  FileText,
  Globe,
  Trash2,
  MoreHorizontal,
  Search,
  BookOpen,
  Sparkles,
} from "lucide-react";
import {
  KNOWLEDGE_CATEGORIES,
  STATUS_META,
  SOURCE_META,
  formatFileSize,
  getCategoryMeta,
  type KnowledgeCategory,
  type KnowledgeDocument,
  type KnowledgeSourceType,
} from "@/lib/knowledge-base";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface KnowledgeDocumentListProps {
  documents: KnowledgeDocument[];
  search: string;
  category: KnowledgeCategory | "all";
  onDelete: (id: string) => void;
  onCategoryChange: (id: string, category: KnowledgeCategory) => void;
}

function SourceIcon({ type }: { type: KnowledgeSourceType }) {
  if (type === "url") return <Globe className="h-4 w-4 text-cyan-400" />;
  return <FileText className="h-4 w-4 text-violet-400" />;
}

export function KnowledgeDocumentList({
  documents,
  search,
  category,
  onDelete,
  onCategoryChange,
}: KnowledgeDocumentListProps) {
  const [menuId, setMenuId] = useState<string | null>(null);

  if (documents.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
          <BookOpen className="h-7 w-7 text-content-muted" />
        </div>
        <h3 className="font-semibold text-white">No documents yet</h3>
        <p className="mt-1 max-w-sm text-sm text-content-muted">
          {search || category !== "all"
            ? "No matches for your filters. Try a different search or category."
            : "Upload brand docs, product sheets, or import a website to power AI generation."}
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="hidden grid-cols-[1fr_120px_100px_100px_48px] gap-4 border-b border-white/[0.06] bg-white/[0.02] px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-content-muted md:grid">
        <span>Document</span>
        <span>Category</span>
        <span>Uploaded</span>
        <span>Status</span>
        <span />
      </div>

      <ul className="divide-y divide-white/[0.06]">
        {documents.map((doc) => {
          const cat = getCategoryMeta(doc.category);
          const status = STATUS_META[doc.status];
          const source = SOURCE_META[doc.sourceType];

          return (
            <li
              key={doc.id}
              className="group grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-white/[0.02] md:grid-cols-[1fr_120px_100px_100px_48px] md:items-center md:gap-4"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                    cat.gradient
                  )}
                >
                  <SourceIcon type={doc.sourceType} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{doc.name}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-content-muted">
                    <span>{source.label}</span>
                    {doc.fileSize > 0 && (
                      <>
                        <span className="text-white/20">·</span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                      </>
                    )}
                    {doc.sourceUrl && (
                      <>
                        <span className="text-white/20">·</span>
                        <a
                          href={doc.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-brand-400 hover:underline"
                        >
                          {doc.sourceUrl.replace(/^https?:\/\//, "")}
                        </a>
                      </>
                    )}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-content-muted/80 md:hidden">
                    {doc.content.slice(0, 120)}…
                  </p>
                </div>
              </div>

              <div className="md:contents">
                <select
                  className="input-field !py-1.5 text-xs md:w-full"
                  value={doc.category}
                  onChange={(e) =>
                    onCategoryChange(doc.id, e.target.value as KnowledgeCategory)
                  }
                >
                  {KNOWLEDGE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <span className="text-xs text-content-muted md:text-center">
                  {format(new Date(doc.createdAt), "MMM d, yyyy")}
                </span>

                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                    status.bg,
                    status.color
                  )}
                >
                  {status.label}
                </span>

                <div className="relative justify-self-end">
                  <button
                    type="button"
                    className="btn-ghost !p-2 opacity-60 group-hover:opacity-100"
                    onClick={() => setMenuId(menuId === doc.id ? null : doc.id)}
                    aria-label="Actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {menuId === doc.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuId(null)}
                      />
                      <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-white/10 bg-ink-bg py-1 shadow-xl">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-white/[0.05]"
                          onClick={() => {
                            setMenuId(null);
                            onDelete(doc.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface KnowledgeStatsProps {
  total: number;
  ready: number;
  categories: number;
}

export function KnowledgeStats({ total, ready, categories }: KnowledgeStatsProps) {
  const items = [
    { label: "Documents", value: total, icon: BookOpen },
    { label: "Ready for AI", value: ready, icon: Sparkles },
    { label: "Categories", value: categories, icon: Search },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="card flex items-center gap-4 border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15">
            <item.icon className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{item.value}</p>
            <p className="text-xs text-content-muted">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function KnowledgeCategoryFilter({
  active,
  onChange,
  counts,
}: {
  active: KnowledgeCategory | "all";
  onChange: (c: KnowledgeCategory | "all") => void;
  counts: Record<string, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs font-medium transition",
          active === "all"
            ? "border-brand-500/50 bg-brand-500/15 text-brand-300"
            : "border-white/10 text-content-muted hover:border-white/20 hover:text-white"
        )}
      >
        All ({counts.all ?? 0})
      </button>
      {KNOWLEDGE_CATEGORIES.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition",
            active === c.id
              ? "border-brand-500/50 bg-brand-500/15 text-brand-300"
              : "border-white/10 text-content-muted hover:border-white/20 hover:text-white"
          )}
        >
          {c.label} ({counts[c.id] ?? 0})
        </button>
      ))}
    </div>
  );
}
