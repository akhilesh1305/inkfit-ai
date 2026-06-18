"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { extractTextFromFile } from "@/lib/brand-voice-files";
import type { BrandVoiceFormData } from "@/lib/brand-voice";

interface StepTrainingDataProps {
  data: BrandVoiceFormData;
  onChange: (patch: Partial<BrandVoiceFormData>) => void;
}

export function StepTrainingData({ data, onChange }: StepTrainingDataProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) {
        setError("No readable text found in this file.");
        return;
      }
      const combined = data.trainingSamples
        ? `${data.trainingSamples.trim()}\n\n---\n\n${text}`
        : text;
      onChange({ trainingSamples: combined.slice(0, 50000) });
      setFileName(file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read file.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card space-y-4"
    >
      <div>
        <h2 className="section-title">Training Data</h2>
        <p className="mt-1 text-sm text-content-muted">
          Paste sample content or upload files so InkFit AI learns your voice.
        </p>
      </div>

      <textarea
        className="input-field min-h-[200px] resize-y"
        placeholder="Paste blog posts, emails, social captions, or any content that represents your brand voice..."
        value={data.trainingSamples}
        onChange={(e) => onChange({ trainingSamples: e.target.value.slice(0, 50000) })}
      />

      <div
        className="relative rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center transition hover:border-brand-500/30 hover:bg-white/[0.04]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,text/plain"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-400" />
        ) : (
          <Upload className="mx-auto h-8 w-8 text-brand-400" />
        )}
        <p className="mt-3 text-sm font-medium text-content">
          Drag & drop or{" "}
          <button
            type="button"
            className="text-brand-400 underline-offset-2 hover:underline"
            onClick={() => inputRef.current?.click()}
          >
            browse files
          </button>
        </p>
        <p className="mt-1 text-xs text-content-subtle">PDF, DOCX, or TXT — up to 10MB</p>
      </div>

      {fileName && (
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-content-muted">
            <FileText className="h-4 w-4 text-brand-400" />
            {fileName} imported
          </div>
          <button type="button" className="btn-ghost !p-1" onClick={() => setFileName(null)} aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <p className="text-xs text-content-subtle">
        {data.trainingSamples.length.toLocaleString()} characters · more samples = better voice matching
      </p>
    </motion.div>
  );
}
