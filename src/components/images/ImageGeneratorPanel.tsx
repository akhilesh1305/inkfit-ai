"use client";

import { useState } from "react";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IMAGE_STYLES,
  ASPECT_RATIOS,
  type ImageStyleId,
  type AspectRatioId,
} from "@/lib/image-studio";

interface ImageGeneratorPanelProps {
  onGenerate: (prompt: string, styleId: ImageStyleId, aspectRatio: AspectRatioId) => void;
  loading: boolean;
}

const PROMPT_SUGGESTIONS = [
  "AI content dashboard floating in dark space",
  "Minimal product launch hero with gradient",
  "LinkedIn banner for marketing agency",
  "3D icons representing blog, social, SEO",
];

export function ImageGeneratorPanel({ onGenerate, loading }: ImageGeneratorPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [styleId, setStyleId] = useState<ImageStyleId>("modern-saas");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("1:1");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    onGenerate(prompt.trim(), styleId, aspectRatio);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#12121a] via-[#0c0c0e] to-[#0a0a0a] p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-cyan-500 shadow-glow">
            <Wand2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-content">Generate</h2>
            <p className="text-xs text-content-subtle">Describe your vision</p>
          </div>
        </div>

        <div className="relative mt-5">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A premium SaaS hero image with abstract gradients and floating UI elements…"
            rows={4}
            className="input-field w-full resize-none bg-black/30 text-sm leading-relaxed"
            required
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PROMPT_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPrompt(s)}
                className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] text-content-subtle transition hover:border-brand-500/30 hover:text-brand-300"
              >
                {s.slice(0, 32)}…
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
          Style
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {IMAGE_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setStyleId(style.id)}
              className={cn(
                "group relative overflow-hidden rounded-xl border p-3 text-left transition",
                styleId === style.id
                  ? "border-brand-500/50 ring-1 ring-brand-500/30"
                  : "border-white/[0.06] hover:border-white/15"
              )}
            >
              <div
                className={cn(
                  "mb-2 h-10 rounded-lg bg-gradient-to-br opacity-90",
                  style.gradient
                )}
              />
              <p className="text-xs font-semibold text-content">{style.label}</p>
              <p className="mt-0.5 line-clamp-2 text-[10px] text-content-subtle">
                {style.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
          Aspect ratio
        </p>
        <div className="flex flex-wrap gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.id}
              type="button"
              onClick={() => setAspectRatio(ratio.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition",
                aspectRatio === ratio.id
                  ? "border-brand-500/50 bg-brand-500/10 text-brand-300"
                  : "border-white/[0.06] text-content-muted hover:border-white/15 hover:text-content"
              )}
            >
              <span className="text-base leading-none opacity-60">{ratio.icon}</span>
              <span className="font-medium">{ratio.label}</span>
              <span className="text-[10px] text-content-subtle">{ratio.id}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!prompt.trim() || loading}
        className="btn-primary w-full py-3.5 text-base shadow-glow"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Generate image
          </>
        )}
      </button>
    </form>
  );
}
