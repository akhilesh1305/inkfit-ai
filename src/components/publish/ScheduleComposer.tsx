"use client";

import { useState } from "react";
import { Calendar, Clock, Loader2, Send, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PUBLISH_PLATFORMS,
  type PublishConnection,
  type PublishPlatformId,
  type PostStatus,
} from "@/lib/publishing";

interface ScheduleComposerProps {
  connections: PublishConnection[];
  onSubmit: (data: {
    platform: PublishPlatformId;
    title: string;
    content: string;
    status: PostStatus;
    scheduledAt: string | null;
  }) => Promise<void>;
  loading: boolean;
}

export function ScheduleComposer({ connections, onSubmit, loading }: ScheduleComposerProps) {
  const [platform, setPlatform] = useState<PublishPlatformId>("linkedin");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");

  const connectedPlatforms = PUBLISH_PLATFORMS.filter(
    (p) => connections.find((c) => c.platform === p.id)?.connected
  );

  async function handleSubmit(status: PostStatus) {
    if (!title.trim() || !content.trim()) return;

    let scheduledAt: string | null = null;
    if ((status === "scheduled" || status === "queued") && date) {
      scheduledAt = new Date(`${date}T${time}`).toISOString();
    }

    await onSubmit({ platform, title, content, status, scheduledAt });
    setTitle("");
    setContent("");
    setDate("");
  }

  const platformConnected = connections.find((c) => c.platform === platform)?.connected;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#12121a] via-[#0c0c0e] to-[#0a0a0a] p-6">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/20">
          <Send className="h-4 w-4 text-brand-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-content">Schedule a post</h2>
          <p className="text-xs text-content-subtle">Compose and queue across platforms</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">Platform</label>
          <div className="flex flex-wrap gap-2">
            {PUBLISH_PLATFORMS.map((p) => {
              const connected = connections.find((c) => c.platform === p.id)?.connected;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={!connected}
                  onClick={() => setPlatform(p.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition",
                    platform === p.id
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-300"
                      : "border-white/[0.06] text-content-muted",
                    !connected && "cursor-not-allowed opacity-40"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br text-[10px] font-bold text-white",
                      p.gradient
                    )}
                  >
                    {p.icon}
                  </span>
                  {p.name}
                </button>
              );
            })}
          </div>
          {!platformConnected && connectedPlatforms.length > 0 && (
            <p className="mt-2 text-xs text-amber-400">Connect {platform} to schedule posts</p>
          )}
        </div>

        <div>
          <label className="label">Title</label>
          <input
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post headline or internal label"
          />
        </div>

        <div>
          <label className="label">Content</label>
          <textarea
            className="input-field min-h-[140px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post…"
          />
          <p className="mt-1 text-right text-[10px] text-content-subtle">{content.length} chars</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Date
            </label>
            <input
              type="date"
              className="input-field"
              value={date}
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
              className="input-field"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            disabled={loading || !title.trim() || !content.trim()}
            onClick={() => handleSubmit("draft")}
            className="btn-secondary flex-1 sm:flex-none"
          >
            <Save className="h-4 w-4" />
            Save draft
          </button>
          <button
            type="button"
            disabled={loading || !title.trim() || !content.trim() || !date || !platformConnected}
            onClick={() => handleSubmit("scheduled")}
            className="btn-secondary flex-1 sm:flex-none"
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </button>
          <button
            type="button"
            disabled={loading || !title.trim() || !content.trim() || !platformConnected}
            onClick={() => handleSubmit("queued")}
            className="btn-primary flex-1 sm:flex-none"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Add to queue
          </button>
        </div>
      </div>
    </div>
  );
}
