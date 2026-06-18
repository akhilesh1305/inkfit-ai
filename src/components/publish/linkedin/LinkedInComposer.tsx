"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import {
  Calendar,
  Clock,
  Loader2,
  Send,
  Save,
  Zap,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LINKEDIN_CHAR_LIMIT,
  SUGGESTED_TIMES,
  type LinkedInConnection,
} from "@/lib/linkedin-publishing";
import { LinkedInPostPreview } from "@/components/publish/linkedin/LinkedInPostPreview";

type PublishMode = "immediate" | "scheduled";

interface LinkedInComposerProps {
  connection: LinkedInConnection;
  onPublish: (data: {
    title: string;
    content: string;
    mode: PublishMode;
    scheduledAt: string | null;
    saveAsDraft?: boolean;
  }) => Promise<void>;
  loading: boolean;
}

export function LinkedInComposer({ connection, onPublish, loading }: LinkedInComposerProps) {
  const [mode, setMode] = useState<PublishMode>("scheduled");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [time, setTime] = useState("09:00");

  const charCount = content.length;
  const overLimit = charCount > LINKEDIN_CHAR_LIMIT;
  const canSubmit = content.trim().length > 0 && !overLimit && connection.connected;

  async function handleDraft() {
    if (!content.trim()) return;
    await onPublish({
      title: title.trim() || "LinkedIn draft",
      content,
      mode: "scheduled",
      scheduledAt: null,
      saveAsDraft: true,
    });
    setTitle("");
    setContent("");
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    if (mode === "immediate") {
      await onPublish({
        title: title.trim() || content.split("\n")[0].slice(0, 80),
        content,
        mode: "immediate",
        scheduledAt: null,
      });
    } else {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      await onPublish({
        title: title.trim() || content.split("\n")[0].slice(0, 80),
        content,
        mode: "scheduled",
        scheduledAt,
      });
    }
    setTitle("");
    setContent("");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#12121a] via-[#0c0c0e] to-[#0a0a0a] p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A66C2]/20">
              <Send className="h-4 w-4 text-[#0A66C2]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Compose post</h2>
              <p className="text-xs text-content-muted">Publish immediately or schedule</p>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mb-5 flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          <button
            type="button"
            onClick={() => setMode("immediate")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition",
              mode === "immediate"
                ? "bg-gradient-to-r from-[#0A66C2] to-[#004182] text-white shadow-md"
                : "text-content-muted hover:text-white"
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            Publish now
          </button>
          <button
            type="button"
            onClick={() => setMode("scheduled")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition",
              mode === "scheduled"
                ? "bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md"
                : "text-content-muted hover:text-white"
            )}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Schedule
          </button>
        </div>

        {!connection.connected && (
          <div className="mb-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            Connect your LinkedIn account above to publish posts.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="label">Headline (optional)</label>
            <input
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Internal label or hook line"
            />
          </div>

          <div>
            <label className="label">Post content</label>
            <textarea
              className="input-field min-h-[180px] resize-none font-[inherit] leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, insights, or story…"
            />
            <div className="mt-1.5 flex justify-between text-[10px]">
              <span className="text-content-subtle">LinkedIn limit: {LINKEDIN_CHAR_LIMIT}</span>
              <span className={cn(overLimit ? "text-red-400" : "text-content-subtle")}>
                {charCount} / {LINKEDIN_CHAR_LIMIT}
              </span>
            </div>
          </div>

          {mode === "scheduled" && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
              <p className="text-xs font-semibold text-white">Schedule for</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Date
                  </label>
                  <input
                    type="date"
                    className="input-field mt-1.5"
                    value={date}
                    min={format(new Date(), "yyyy-MM-dd")}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Time
                  </label>
                  <input
                    type="time"
                    className="input-field mt-1.5"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-content-subtle">
                  Suggested times
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TIMES.map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => setTime(slot.value)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-left transition",
                        time === slot.value
                          ? "border-brand-500/40 bg-brand-500/15 text-brand-300"
                          : "border-white/[0.06] text-content-muted hover:border-white/15"
                      )}
                    >
                      <span className="block text-xs font-semibold">{slot.label}</span>
                      <span className="text-[10px] opacity-70">{slot.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={loading || !content.trim()}
              onClick={handleDraft}
              className="btn-secondary"
            >
              <Save className="h-4 w-4" />
              Save draft
            </button>
            <button
              type="button"
              disabled={loading || !canSubmit || (mode === "scheduled" && !date)}
              onClick={handleSubmit}
              className="btn-primary flex-1 sm:flex-none"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "immediate" ? (
                <Zap className="h-4 w-4" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              {mode === "immediate" ? "Publish now" : "Schedule post"}
            </button>
          </div>
        </div>
      </div>

      <LinkedInPostPreview connection={connection} content={content} title={title || undefined} />
    </div>
  );
}
