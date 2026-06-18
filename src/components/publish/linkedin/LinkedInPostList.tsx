"use client";

import { Trash2, Send, Clock, Eye, Heart, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  POST_STATUS_META,
  formatPostDate,
  formatNumber,
  type ScheduledPost,
} from "@/lib/publishing";

interface LinkedInPostListProps {
  posts: ScheduledPost[];
  emptyTitle: string;
  emptyDescription: string;
  onDelete?: (id: string) => void;
  onPublish?: (id: string) => void;
  showSchedule?: boolean;
  showMetrics?: boolean;
}

export function LinkedInPostList({
  posts,
  emptyTitle,
  emptyDescription,
  onDelete,
  onPublish,
  showSchedule,
  showMetrics,
}: LinkedInPostListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#0A66C2]/20 bg-[#0A66C2]/[0.02] py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A66C2]/20 text-lg font-bold text-[#0A66C2]">
          in
        </div>
        <p className="mt-3 font-medium text-white">{emptyTitle}</p>
        <p className="mt-1 max-w-sm text-sm text-content-muted">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <LinkedInPostCard
          key={post.id}
          post={post}
          onDelete={onDelete}
          onPublish={onPublish}
          showSchedule={showSchedule}
          showMetrics={showMetrics}
        />
      ))}
    </div>
  );
}

function LinkedInPostCard({
  post,
  onDelete,
  onPublish,
  showSchedule,
  showMetrics,
}: {
  post: ScheduledPost;
  onDelete?: (id: string) => void;
  onPublish?: (id: string) => void;
  showSchedule?: boolean;
  showMetrics?: boolean;
}) {
  const meta = POST_STATUS_META[post.status];

  return (
    <div className="group rounded-xl border border-white/[0.06] bg-[#0c0c0e] p-4 transition hover:border-[#0A66C2]/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#0A66C2] text-[10px] font-bold text-white">
              in
            </span>
            <h3 className="truncate text-sm font-semibold text-white">{post.title}</h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                meta.bg,
                meta.color
              )}
            >
              {meta.label}
            </span>
          </div>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-content-muted whitespace-pre-wrap">
            {post.content}
          </p>

          {showSchedule && post.scheduledAt && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-brand-300">
              <Clock className="h-3.5 w-3.5" />
              Scheduled {formatPostDate(post.scheduledAt)}
            </p>
          )}

          {post.status === "published" && post.publishedAt && (
            <p className="mt-2 text-xs text-content-subtle">
              Published {formatPostDate(post.publishedAt)}
            </p>
          )}

          {showMetrics && post.status === "published" && (
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-content-muted">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-cyan-400" />
                {formatNumber(post.impressions)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-pink-400" />
                {formatNumber(post.engagements)}
              </span>
              <span className="flex items-center gap-1">
                <MousePointerClick className="h-3.5 w-3.5 text-brand-400" />
                {formatNumber(post.clicks)}
              </span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
          {onPublish && post.status !== "published" && (
            <button
              type="button"
              title="Publish now"
              onClick={() => onPublish(post.id)}
              className="rounded-lg border border-white/[0.06] p-2 text-content-muted hover:border-emerald-500/30 hover:text-emerald-400"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              title="Delete"
              onClick={() => onDelete(post.id)}
              className="rounded-lg border border-white/[0.06] p-2 text-content-muted hover:border-red-500/30 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function LinkedInQueueView({
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
    <LinkedInPostList
      posts={queued}
      emptyTitle="Post queue is empty"
      emptyDescription="Schedule posts to see them in your LinkedIn publishing queue"
      onDelete={onDelete}
      onPublish={onPublish}
      showSchedule
    />
  );
}

export function LinkedInDraftsView({
  posts,
  onDelete,
  onPublish,
}: {
  posts: ScheduledPost[];
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
}) {
  return (
    <LinkedInPostList
      posts={posts.filter((p) => p.status === "draft")}
      emptyTitle="No drafts"
      emptyDescription="Save posts as drafts while you refine your LinkedIn copy"
      onDelete={onDelete}
      onPublish={onPublish}
    />
  );
}

export function LinkedInPublishedView({ posts }: { posts: ScheduledPost[] }) {
  const published = posts
    .filter((p) => p.status === "published")
    .sort((a, b) => {
      const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return db - da;
    });

  return (
    <LinkedInPostList
      posts={published}
      emptyTitle="Nothing published yet"
      emptyDescription="Published LinkedIn posts will appear here with performance metrics"
      showMetrics
    />
  );
}
