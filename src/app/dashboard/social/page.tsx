"use client";

import { useState } from "react";
import { Loader2, Copy, Check, Share2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function SocialPage() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("LinkedIn");
  const [tone, setTone] = useState("Professional");
  const [hashtags, setHashtags] = useState(true);
  const [cta, setCta] = useState(true);
  const [count, setCount] = useState(3);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, tone, hashtags, cta, count }),
      });
      const data = await res.json();
      setResult(data.content ?? data.error ?? "Generation failed.");
    } catch {
      setResult("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Social Media Generator"
        description="LinkedIn posts, Instagram captions, and X threads with hashtags and CTAs."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleGenerate} className="card space-y-4">
          <div>
            <label className="label">Topic / Campaign *</label>
            <input className="input-field" placeholder="e.g. Product launch announcement" value={topic} onChange={(e) => setTopic(e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Platform</label>
              <select className="input-field" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option>LinkedIn</option>
                <option>Instagram</option>
                <option>X (Twitter)</option>
                <option>Facebook</option>
              </select>
            </div>
            <div>
              <label className="label">Tone</label>
              <select className="input-field" value={tone} onChange={(e) => setTone(e.target.value)}>
                <option>Professional</option>
                <option>Casual</option>
                <option>Marketing</option>
                <option>Bold</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Number of Posts</label>
              <select className="input-field" value={count} onChange={(e) => setCount(Number(e.target.value))}>
                <option value={1}>1</option>
                <option value={3}>3</option>
                <option value={5}>5</option>
              </select>
            </div>
            <div className="flex flex-col justify-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm text-content-muted">
                <input type="checkbox" checked={hashtags} onChange={(e) => setHashtags(e.target.checked)} className="rounded border-line text-brand-600" />
                Hashtag suggestions
              </label>
              <label className="flex items-center gap-2 text-sm text-content-muted">
                <input type="checkbox" checked={cta} onChange={(e) => setCta(e.target.checked)} className="rounded border-line text-brand-600" />
                CTA suggestions
              </label>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            Generate Posts
          </button>
        </form>

        <div className="card flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-heading">Generated Posts</h2>
            {result && (
              <button type="button" className="btn-secondary py-1.5 text-xs" onClick={async () => { await navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy All</>}
              </button>
            )}
          </div>
          <div className="output-panel">
            {loading ? (
              <div className="flex h-full min-h-[360px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              </div>
            ) : result || <p className="text-content-subtle">Posts with hashtags and CTAs appear here.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
