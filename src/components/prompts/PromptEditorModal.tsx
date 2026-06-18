"use client";

import { useState } from "react";
import {
  X,
  Star,
  Loader2,
} from "lucide-react";
import type { PromptCategoryId, PromptCollection, PromptItem } from "@/lib/prompt-library";
import { PROMPT_CATEGORIES } from "@/lib/prompt-library";
import { cn } from "@/lib/utils";

interface PromptEditorModalProps {
  open: boolean;
  prompt?: PromptItem | null;
  collections: PromptCollection[];
  onClose: () => void;
  onSave: (data: {
    id?: string;
    title: string;
    body: string;
    category: PromptCategoryId;
    tags: string[];
    collectionId: string | null;
    favorite: boolean;
  }) => Promise<void>;
  saving?: boolean;
}

export function PromptEditorModal({
  open,
  prompt,
  collections,
  onClose,
  onSave,
  saving,
}: PromptEditorModalProps) {
  const [title, setTitle] = useState(prompt?.title ?? "");
  const [body, setBody] = useState(prompt?.body ?? "");
  const [category, setCategory] = useState<PromptCategoryId>(prompt?.category ?? "linkedin");
  const [tagsInput, setTagsInput] = useState(prompt?.tags.join(", ") ?? "");
  const [collectionId, setCollectionId] = useState<string | null>(prompt?.collectionId ?? null);
  const [favorite, setFavorite] = useState(prompt?.favorite ?? false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await onSave({
      id: prompt?.id,
      title,
      body,
      category,
      tags,
      collectionId,
      favorite,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/[0.1] bg-[#121214] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            {prompt ? "Edit prompt" : "New prompt"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-content-muted hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="label">Title</label>
            <input
              className="input-field mt-1.5 text-base font-medium"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Prompt name"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">Prompt body</label>
            <textarea
              className="input-field mt-1.5 min-h-[200px] resize-y font-mono text-sm leading-relaxed"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your prompt template… Use {{variables}} for placeholders."
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Category</label>
              <select
                className="input-field mt-1.5"
                value={category}
                onChange={(e) => setCategory(e.target.value as PromptCategoryId)}
              >
                {PROMPT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Collection</label>
              <select
                className="input-field mt-1.5"
                value={collectionId ?? ""}
                onChange={(e) => setCollectionId(e.target.value || null)}
              >
                <option value="">No collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Tags (comma-separated)</label>
            <input
              className="input-field mt-1.5"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. hook, b2b, engagement"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <button
              type="button"
              onClick={() => setFavorite((v) => !v)}
              className={cn(
                "rounded-lg p-2 transition",
                favorite ? "bg-amber-500/15 text-amber-400" : "bg-white/[0.04] text-content-muted"
              )}
            >
              <Star className={cn("h-4 w-4", favorite && "fill-current")} />
            </button>
            <span className="text-sm text-content-muted">Add to favorites</span>
          </label>

          <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving || !title.trim() || !body.trim()} className="btn-primary">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {prompt ? "Save changes" : "Create prompt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
