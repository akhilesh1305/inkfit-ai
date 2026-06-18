"use client";

import { useState } from "react";
import { Loader2, Image as ImageIcon, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const USE_CASES = [
  { id: "social media creative", label: "Social Media Creative" },
  { id: "blog feature image", label: "Blog Feature Image" },
  { id: "marketing ad creative", label: "Ad Creative" },
  { id: "LinkedIn banner", label: "LinkedIn Banner" },
];

export default function ImagesPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Modern minimalist");
  const [size, setSize] = useState("1024x1024");
  const [useCase, setUseCase] = useState("social media creative");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setImageUrl("");
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, size, useCase }),
      });
      const data = await res.json();
      setImageUrl(data.url ?? "");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="AI Image Generation"
        description="Marketing images, social creatives, blog headers, and ad visuals."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleGenerate} className="card space-y-4">
          <div>
            <label className="label">Use Case</label>
            <select className="input-field" value={useCase} onChange={(e) => setUseCase(e.target.value)}>
              {USE_CASES.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Image Description *</label>
            <textarea className="input-field min-h-[100px] resize-y" placeholder="Describe your marketing image..." value={prompt} onChange={(e) => setPrompt(e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Style</label>
              <select className="input-field" value={style} onChange={(e) => setStyle(e.target.value)}>
                <option>Modern minimalist</option>
                <option>Corporate professional</option>
                <option>Bold & colorful</option>
                <option>Flat illustration</option>
                <option>Photorealistic</option>
              </select>
            </div>
            <div>
              <label className="label">Size</label>
              <select className="input-field" value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="1024x1024">Square</option>
                <option value="1792x1024">Landscape</option>
                <option value="1024x1792">Portrait</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            Generate Image
          </button>
        </form>

        <div className="card">
          <h2 className="mb-4 text-heading">Preview</h2>
          <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-surface-muted">
            {loading ? (
              <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
            ) : imageUrl ? (
              <div className="relative w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={prompt} className="w-full rounded-lg" />
                <a href={imageUrl} download className="btn-secondary absolute bottom-4 right-4">
                  <Download className="h-4 w-4" /> Download
                </a>
              </div>
            ) : (
              <p className="text-content-subtle">Generated image appears here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
