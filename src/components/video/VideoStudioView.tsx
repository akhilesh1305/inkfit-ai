"use client";

import { useState } from "react";
import { Clapperboard, Loader2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { VideoInputPanel } from "@/components/video/VideoInputPanel";
import { VideoResultsPanel } from "@/components/video/VideoResultsPanel";
import { generateVideoStudio, type VideoInputType, type VideoStudioOutput } from "@/lib/video-studio";

export function VideoStudioView() {
  const [inputType, setInputType] = useState<VideoInputType>("blog");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [output, setOutput] = useState<VideoStudioOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canGenerate =
    inputType === "url"
      ? url.trim().startsWith("http") || content.trim().length >= 50
      : content.trim().length >= 50;

  async function handleGenerate() {
    if (!canGenerate || loading) return;
    setError("");
    setLoading(true);
    setOutput(null);

    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputType, content, url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed");
        setOutput(
          generateVideoStudio({
            inputType,
            content: content || "Sample content for video script generation about building a personal brand and growing on social media with consistent content.",
          })
        );
        return;
      }
      setOutput(data.output);
    } catch {
      setOutput(
        generateVideoStudio({
          inputType,
          content,
        })
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Clapperboard className="h-7 w-7 text-brand-400" />
            Video &amp; Podcast Studio
          </span>
        }
        description="Turn blogs, transcripts, and URLs into YouTube scripts, podcast episodes, Shorts, Reels, hooks, and CTAs."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "YouTube & Podcast", desc: "Long-form scripts with beats and segments" },
          { title: "Shorts & Reels", desc: "Vertical scripts optimized for retention" },
          { title: "Hooks & CTAs", desc: "Scroll-stopping openers and closes" },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent px-4 py-3"
          >
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-0.5 text-xs text-content-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,400px)_1fr]">
        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <VideoInputPanel
            inputType={inputType}
            onInputTypeChange={setInputType}
            content={content}
            onContentChange={setContent}
            url={url}
            onUrlChange={setUrl}
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
                Generating scripts…
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate video scripts
              </>
            )}
          </button>
          {error && (
            <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              {error} — showing template output.
            </p>
          )}
        </div>

        <VideoResultsPanel output={output} loading={loading} />
      </div>
    </div>
  );
}
