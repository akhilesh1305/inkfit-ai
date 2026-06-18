"use client";

import { useState, useEffect } from "react";
import { X, Save, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CONTENT_TYPE_META,
  type ContentType,
  type ContentStatus,
  type WorkspaceItem,
  type WorkspaceFolder,
} from "@/lib/workspace";

interface WorkspaceEditorModalProps {
  item: WorkspaceItem | null;
  folders: WorkspaceFolder[];
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    id: string;
    title: string;
    body: string;
    type: ContentType;
    status: ContentStatus;
    folderId?: string;
    tags: string[];
    favorite: boolean;
  }) => void;
}

export function WorkspaceEditorModal({
  item,
  folders,
  open,
  onClose,
  onSave,
}: WorkspaceEditorModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<ContentType>("blog");
  const [status, setStatus] = useState<ContentStatus>("draft");
  const [folderId, setFolderId] = useState<string>("");
  const [tagsInput, setTagsInput] = useState("");
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setBody(item.body);
    setType(item.type);
    setStatus(item.status);
    setFolderId(item.folderId ?? "");
    setTagsInput(item.tags.join(", "));
    setFavorite(item.favorite);
  }, [item]);

  if (!open || !item) return null;

  function handleSave() {
    if (!item) return;
    onSave({
      id: item.id,
      title,
      body,
      type,
      status,
      folderId: folderId || undefined,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      favorite,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-ink-surface shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <h2 className="text-lg font-semibold text-content">Edit content</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFavorite(!favorite)}
              className={cn(
                "rounded-lg p-2 transition",
                favorite ? "text-amber-400" : "text-content-subtle hover:text-amber-400"
              )}
            >
              <Star className={cn("h-5 w-5", favorite && "fill-amber-400")} />
            </button>
            <button type="button" onClick={onClose} className="btn-ghost !p-2">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-0 bg-transparent text-2xl font-bold text-content outline-none placeholder:text-content-subtle"
            placeholder="Untitled"
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContentType)}
                className="input-field w-full"
              >
                {(Object.keys(CONTENT_TYPE_META) as ContentType[]).map((t) => (
                  <option key={t} value={t}>
                    {CONTENT_TYPE_META[t].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
                className="input-field w-full"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="label">Folder</label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="input-field w-full"
              >
                <option value="">No folder</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Tags (comma separated)</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="AI, Marketing, Launch"
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="label">Content</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              className="input-field w-full resize-y font-mono text-sm leading-relaxed"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/[0.08] px-5 py-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="btn-primary">
            <Save className="h-4 w-4" />
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
