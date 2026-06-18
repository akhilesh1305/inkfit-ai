"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Link2, Loader2, FileText } from "lucide-react";
import { extractTextFromFile } from "@/lib/brand-voice-files";
import {
  KNOWLEDGE_CATEGORIES,
  detectSourceType,
  type KnowledgeCategory,
} from "@/lib/knowledge-base";
import { cn } from "@/lib/utils";

interface KnowledgeUploadPanelProps {
  onUploaded: () => void;
}

export function KnowledgeUploadPanel({ onUploaded }: KnowledgeUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"file" | "url">("file");
  const [category, setCategory] = useState<KnowledgeCategory>("general");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const content = await extractTextFromFile(file);
      if (!content.trim()) {
        setError("No readable text found in this file.");
        return;
      }
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upload",
          name: file.name,
          category,
          sourceType: detectSourceType(file.name),
          content,
          fileSize: file.size,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Upload failed");
      }
      onUploaded();
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function importUrl() {
    setError("");
    if (!url.trim().startsWith("http")) {
      setError("Enter a valid URL (https://...)");
      return;
    }
    setUploading(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import-url", url: url.trim(), category }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Import failed");
      }
      setUrl("");
      onUploaded();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
        <div>
          <h2 className="section-title">Add knowledge</h2>
          <p className="mt-0.5 text-xs text-content-muted">
            PDF, DOCX, TXT, or website URL — used in AI generation
          </p>
        </div>
        <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
          {(["file", "url"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                tab === t
                  ? "bg-brand-600 text-white shadow"
                  : "text-content-muted hover:text-white"
              )}
            >
              {t === "file" ? "Upload file" : "Website URL"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-content-muted">
            Category
          </label>
          <select
            className="input-field w-full max-w-xs text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as KnowledgeCategory)}
          >
            {KNOWLEDGE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {tab === "file" ? (
          <div
            className={cn(
              "relative rounded-xl border border-dashed p-10 text-center transition",
              dragOver
                ? "border-brand-500/50 bg-brand-500/10"
                : "border-white/15 bg-white/[0.02] hover:border-brand-500/30 hover:bg-white/[0.04]"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
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
              <div className="flex flex-col items-center gap-2 text-content-muted">
                <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
                <p className="text-sm">Extracting & indexing…</p>
              </div>
            ) : (
              <>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/15">
                  <Upload className="h-6 w-6 text-brand-400" />
                </div>
                <p className="text-sm font-medium text-white">
                  Drop PDF, DOCX, or TXT here
                </p>
                <p className="mt-1 text-xs text-content-muted">or click to browse</p>
                <button
                  type="button"
                  className="btn-primary mt-4 !px-4 !py-2 text-sm"
                  onClick={() => inputRef.current?.click()}
                >
                  Choose file
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
              <input
                className="input-field w-full pl-10"
                placeholder="https://yourcompany.com/about"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && importUrl()}
              />
            </div>
            <button
              type="button"
              className="btn-primary shrink-0"
              onClick={importUrl}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import URL"}
            </button>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
          {["PDF", "DOCX", "TXT", "URL"].map((fmt) => (
            <span
              key={fmt}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-content-muted"
            >
              <FileText className="h-3 w-3" />
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
