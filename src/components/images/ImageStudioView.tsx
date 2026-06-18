"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, ImageIcon, Zap } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ImageGeneratorPanel } from "@/components/images/ImageGeneratorPanel";
import { ImageGallery } from "@/components/images/ImageGallery";
import type { GalleryImage, ImageStyleId, AspectRatioId } from "@/lib/image-studio";

export function ImageStudioView() {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/image");
    if (res.ok) {
      const data = await res.json();
      setItems(data.items ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function apiPost(body: Record<string, unknown>) {
    const res = await fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function handleGenerate(
    prompt: string,
    styleId: ImageStyleId,
    aspectRatio: AspectRatioId
  ) {
    setGenerating(true);
    setToast(null);
    const result = await apiPost({
      action: "generate",
      prompt,
      styleId,
      aspectRatio,
    });
    setGenerating(false);

    if (result.item) {
      setItems((prev) => [result.item, ...prev]);
      setHighlightId(result.item.id);
      setTimeout(() => setHighlightId(null), 3000);
      setToast(
        result.live
          ? "Image generated with AI"
          : "Preview image added (add OPENAI_API_KEY for DALL·E)"
      );
      setTimeout(() => setToast(null), 4000);
    }
  }

  async function handleFavorite(id: string, favorite: boolean) {
    const result = await apiPost({ action: "favorite", id, favorite });
    if (result.item) {
      setItems((prev) => prev.map((i) => (i.id === id ? result.item : i)));
    }
  }

  async function handleDelete(id: string) {
    await apiPost({ action: "delete", id });
    setItems((prev) => prev.filter((i) => i.id !== id));
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
            <ImageIcon className="h-7 w-7 text-brand-400" />
            AI Image Studio
          </span>
        }
        description="Premium AI image generation for marketing, social, and product visuals."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
          <Zap className="h-3.5 w-3.5" />
          DALL·E 3 ready
        </span>
      </PageHeader>

      {toast && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
          {toast}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
        <div className="xl:sticky xl:top-24 xl:self-start">
          <ImageGeneratorPanel onGenerate={handleGenerate} loading={generating} />
        </div>
        <ImageGallery
          items={items}
          onFavorite={handleFavorite}
          onDelete={handleDelete}
          highlightId={highlightId}
        />
      </div>
    </div>
  );
}
