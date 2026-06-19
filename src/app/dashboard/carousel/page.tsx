"use client";

import { useState } from "react";
import { Layers, Loader2, Sparkles, FileDown, ImageDown } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CarouselMobilePreview } from "@/components/carousel/CarouselMobilePreview";
import { CarouselSlideList } from "@/components/carousel/CarouselSlideList";
import {
  generateCarousel,
  type CarouselData,
} from "@/lib/carousel-content";
import {
  downloadCarouselPdf,
  downloadSlidePng,
  downloadAllSlidesPng,
} from "@/lib/carousel-export";

export default function CarouselPage() {
  const [topic, setTopic] = useState("");
  const [carousel, setCarousel] = useState<CarouselData | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canGenerate = topic.trim().length >= 3;
  const slides = carousel?.slides ?? [];

  async function handleGenerate() {
    if (!canGenerate || loading) return;
    setLoading(true);
    setCarousel(null);
    setEditingId(null);
    try {
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      if (data.carousel) {
        setCarousel(data.carousel);
      } else {
        setCarousel(generateCarousel(topic.trim()));
      }
    } catch {
      setCarousel(generateCarousel(topic.trim()));
    }
    setActiveIndex(0);
    setLoading(false);
  }

  function updateSlide(id: string, field: "title" | "body", value: string) {
    if (!carousel) return;
    setCarousel({
      ...carousel,
      slides: carousel.slides.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    });
  }

  function handleDownloadPdf() {
    if (!carousel) return;
    void downloadCarouselPdf(carousel);
  }

  function handleDownloadPng() {
    if (!carousel || !slides[activeIndex]) return;
    downloadSlidePng(slides[activeIndex], carousel.topic);
  }

  function handleDownloadAllPng() {
    if (!carousel) return;
    downloadAllSlidesPng(carousel);
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Layers className="h-7 w-7 text-brand-400" />
            Carousel Generator
          </span>
        }
        description="Create 10-slide LinkedIn carousels with hook, content, and CTA — preview, edit, and export."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <div className="card space-y-4">
            <h2 className="section-title">Topic</h2>
            <input
              className="input-field"
              placeholder="e.g. LinkedIn growth for founders"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate || loading}
              className="btn-primary w-full py-3.5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating slides...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Carousel
                </>
              )}
            </button>
          </div>

          {slides.length > 0 && (
            <div className="card">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="section-title">Edit Slides</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="btn-secondary !px-3 !py-1.5 text-xs"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    className="btn-secondary !px-3 !py-1.5 text-xs"
                  >
                    <ImageDown className="h-3.5 w-3.5" />
                    Download PNG
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadAllPng}
                    className="btn-ghost !px-3 !py-1.5 text-xs"
                  >
                    All PNGs
                  </button>
                </div>
              </div>
              <CarouselSlideList
                slides={slides}
                activeIndex={activeIndex}
                editingId={editingId}
                onSelect={setActiveIndex}
                onEdit={setEditingId}
                onUpdate={updateSlide}
              />
            </div>
          )}
        </div>

        <div className="card flex flex-col items-center justify-center py-8">
          <h2 className="mb-6 self-start section-title">Slide Preview</h2>
          <CarouselMobilePreview
            slides={slides}
            topic={carousel?.topic ?? topic}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
          />
        </div>
      </div>
    </div>
  );
}
