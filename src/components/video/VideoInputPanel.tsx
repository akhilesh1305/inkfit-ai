"use client";

import { FileText, ScrollText, Link2, AlignLeft } from "lucide-react";
import { INPUT_TYPES, type VideoInputType } from "@/lib/video-studio";
import { cn } from "@/lib/utils";

const TAB_ICONS = {
  blog: FileText,
  transcript: ScrollText,
  url: Link2,
  text: AlignLeft,
};

interface VideoInputPanelProps {
  inputType: VideoInputType;
  onInputTypeChange: (t: VideoInputType) => void;
  content: string;
  onContentChange: (v: string) => void;
  url: string;
  onUrlChange: (v: string) => void;
}

export function VideoInputPanel({
  inputType,
  onInputTypeChange,
  content,
  onContentChange,
  url,
  onUrlChange,
}: VideoInputPanelProps) {
  const meta = INPUT_TYPES.find((t) => t.id === inputType)!;

  return (
    <div className="card overflow-hidden p-0">
      <div className="flex flex-wrap gap-1 border-b border-white/[0.06] p-2">
        {INPUT_TYPES.map((t) => {
          const Icon = TAB_ICONS[t.id];
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onInputTypeChange(t.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition",
                inputType === t.id
                  ? "bg-brand-600 text-white"
                  : "text-content-muted hover:bg-white/[0.05] hover:text-white"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3 p-5">
        <p className="text-xs text-content-muted">{meta.hint}</p>

        {inputType === "url" ? (
          <>
            <input
              className="input-field"
              placeholder={meta.placeholder}
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
            />
            <textarea
              className="input-field min-h-[120px] resize-y text-sm"
              placeholder="Optional: paste article text if URL import fails…"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
            />
          </>
        ) : (
          <textarea
            className="input-field min-h-[220px] resize-y font-mono text-sm leading-relaxed"
            placeholder={meta.placeholder}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
          />
        )}

        <p className="text-right text-[10px] text-content-subtle">
          {content.trim().split(/\s+/).filter(Boolean).length} words
        </p>
      </div>
    </div>
  );
}
