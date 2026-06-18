"use client";

import { useState } from "react";
import { Linkedin, Loader2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { LinkedInPostEditor } from "@/components/linkedin/LinkedInPostEditor";
import {
  LINKEDIN_CONTENT_TYPES,
  generateLinkedInPost,
  type LinkedInContentType,
  type LinkedInPostOutput,
} from "@/lib/linkedin-content";
import { cn } from "@/lib/utils";

export default function LinkedInPage() {
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [contentType, setContentType] = useState<LinkedInContentType>("thought-leadership");
  const [output, setOutput] = useState<LinkedInPostOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const canGenerate = topic.trim().length >= 3 && targetAudience.trim().length >= 3;

  async function handleGenerate() {
    if (!canGenerate || loading) return;
    setLoading(true);
    setOutput(null);
    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "post",
          topic: topic.trim(),
          targetAudience: targetAudience.trim(),
          contentType,
        }),
      });
      const data = await res.json();
      if (data.post) {
        setOutput(data.post);
      } else {
        setOutput(
          generateLinkedInPost({
            topic: topic.trim(),
            targetAudience: targetAudience.trim(),
            contentType,
          })
        );
      }
    } catch {
      setOutput(
        generateLinkedInPost({
          topic: topic.trim(),
          targetAudience: targetAudience.trim(),
          contentType,
        })
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Linkedin className="h-7 w-7 text-[#0A66C2]" />
            LinkedIn Content Generator
          </span>
        }
        description="Generate hook-driven LinkedIn posts tailored to your audience and content style."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="card space-y-4">
            <h2 className="section-title">Post Details</h2>
            <div>
              <label className="label" htmlFor="topic">Topic</label>
              <input
                id="topic"
                className="input-field"
                placeholder="e.g. AI content marketing for startups"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="audience">Target Audience</label>
              <input
                id="audience"
                className="input-field"
                placeholder="e.g. B2B founders and marketing leaders"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">Content Type</h2>
            <p className="mt-1 text-sm text-content-muted">Select the format for your post.</p>
            <div className="mt-4 space-y-2">
              {LINKEDIN_CONTENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setContentType(type.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition duration-300",
                    contentType === type.id
                      ? "border-[#0A66C2]/50 bg-[#0A66C2]/10 shadow-glow"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                      contentType === type.id
                        ? "border-[#0A66C2] bg-[#0A66C2]"
                        : "border-white/20"
                    )}
                  >
                    {contentType === type.id && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-content">{type.label}</p>
                    <p className="mt-0.5 text-xs text-content-subtle">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className="btn-primary w-full py-3.5"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate
              </>
            )}
          </button>
        </div>

        <LinkedInPostEditor
          output={output}
          loading={loading}
          onRegenerate={handleGenerate}
        />
      </div>
    </div>
  );
}
