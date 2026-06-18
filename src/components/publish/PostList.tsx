"use client";

import { Trash2, Calendar, Send, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getPlatformById,
  POST_STATUS_META,
  formatPostDate,
  type ScheduledPost,
} from "@/lib/publishing";

interface PostListProps {
  posts: ScheduledPost[];
  emptyTitle: string;
  emptyDescription: string;
  onDelete?: (id: string) => void;
  onPublish?: (id: string) => void;
  showSchedule?: boolean;
}

export function PostList({
  posts,
  emptyTitle,
  emptyDescription,
  onDelete,
  onPublish,
  showSchedule = false,
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
        <Calendar className="h-10 w-10 text-content-subtle" />
        <p className="mt-3 font-medium text-content">{emptyTitle}</p>
        <p className="mt-1 text-sm text-content-subtle">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onDelete={onDelete}
          onPublish={onPublish}
          showSchedule={showSchedule}
        />
      ))}
    </div>
  );
}

function PostCard({
  post,
  onDelete,
  onPublish,
  showSchedule,
}: {
  post: ScheduledPost;
  onDelete?: (id: string) => void;
  onPublish?: (id: string) => void;
  showSchedule?: boolean;
}) {
  const platform = getPlatformById(post.platform);
  const meta = POST_STATUS_META[post.status];

  return (
    <div className="group rounded-xl border border-white/[0.06] bg-[#0c0c0e] p-4 transition hover:border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white",
              platform.gradient
            )}
          >
            {platform.icon}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-content">{post.title}</h3>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", meta.bg, meta.color)}>
                {meta.label}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-content-muted">{post.content}</p>
            {showSchedule && post.scheduledAt && (
              <p className="mt-2 flex items-center gap-1 text-[11px] text-content-subtle">
                <Clock className="h-3 w-3" />
                {formatPostDate(post.scheduledAt)}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
          {onPublish && post.status !== "published" && (
            <button
              type="button"
              title="Publish now"
              onClick={() => onPublish(post.id)}
              className="rounded-lg border border-white/[0.06] p-2 text-content-muted hover:text-emerald-400"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              title="Delete"
              onClick={() => onDelete(post.id)}
              className="rounded-lg border border-white/[0.06] p-2 text-content-muted hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PostQueueView({
  posts,
  onDelete,
  onPublish,
}: {
  posts: ScheduledPost[];
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
}) {
  const queued = posts
    .filter((p) => p.status === "queued" || p.status === "scheduled")
    .sort((a, b) => {
      if (!a.scheduledAt) return 1;
      if (!b.scheduledAt) return -1;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });

  return (
    <PostList
      posts={queued}
      emptyTitle="Queue is empty"
      emptyDescription="Schedule posts to see them in your publishing queue"
      onDelete={onDelete}
      onPublish={onPublish}
      showSchedule
    />
  );
}

export function DraftsPanel({
  posts,
  onDelete,
  onPublish,
}: {
  posts: ScheduledPost[];
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
}) {
  const drafts = posts.filter((p) => p.status === "draft");
  return (
    <PostList
      posts={drafts}
      emptyTitle="No drafts"
      emptyDescription="Save posts as drafts while you refine your copy"
      onDelete={onDelete}
      onPublish={onPublish}
    />
  );
}

export function PublishedPanel({ posts }: { posts: ScheduledPost[] }) {
  const published = posts
    .filter((p) => p.status === "published")
    .sort((a, b) => {
      const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return db - da;
    });

  if (published.length === 0) {
    return (
      <PostList
        posts={[]}
        emptyTitle="Nothing published yet"
        emptyDescription="Published posts will appear here with performance data"
      />
    );
  }

  return (
    <div className="space-y-3">
      {published.map((post) => {
        const platform = getPlatformById(post.platform);
        return (
          <div
            key={post.id}
            className="rounded-xl border border-white/[0.06] bg-[#0c0c0e] p-4"
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white",
                  platform.gradient
                )}
              >
                {platform.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-content">{post.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-content-muted">{post.content}</p>
                <p className="mt-2 text-[11px] text-content-subtle">
                  Published {formatPostDate(post.publishedAt)}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Metric label="Impressions" value={post.impressions} />
                  <Metric label="Engagements" value={post.engagements} />
                  <Metric label="Clicks" value={post.clicks} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-2 py-1.5 text-center">
      <p className="text-sm font-semibold text-content">
        {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
      </p>
      <p className="text-[9px] text-content-subtle">{label}</p>
    </div>
  );
}
