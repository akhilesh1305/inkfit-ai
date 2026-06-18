"use client";

import { useCallback, useEffect, useState } from "react";
import { Linkedin, PenLine, Calendar, ListOrdered, FileText, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { LinkedInConnectCard } from "@/components/publish/linkedin/LinkedInConnectCard";
import { LinkedInComposer } from "@/components/publish/linkedin/LinkedInComposer";
import { LinkedInStatsBar } from "@/components/publish/linkedin/LinkedInStatsBar";
import { LinkedInCalendarView } from "@/components/publish/linkedin/LinkedInCalendarView";
import {
  LinkedInQueueView,
  LinkedInDraftsView,
  LinkedInPublishedView,
} from "@/components/publish/linkedin/LinkedInPostList";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScheduledPost } from "@/lib/publishing";
import type { LinkedInConnection, LinkedInPublishStats } from "@/lib/linkedin-publishing";

type TabId = "compose" | "calendar" | "queue" | "drafts" | "published";

const TABS: { id: TabId; label: string; icon: typeof PenLine }[] = [
  { id: "compose", label: "Compose", icon: PenLine },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "queue", label: "Post Queue", icon: ListOrdered },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "published", label: "Published", icon: CheckCircle2 },
];

export function LinkedInPublishingView() {
  const [connection, setConnection] = useState<LinkedInConnection | null>(null);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [stats, setStats] = useState<LinkedInPublishStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<TabId>("compose");
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/publish/linkedin");
    if (res.ok) {
      const data = await res.json();
      setConnection(data.connection);
      setPosts(data.posts ?? []);
      setStats(data.stats ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function apiPost(body: Record<string, unknown>) {
    const res = await fetch("/api/publish/linkedin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { res, data: await res.json() };
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleConnect() {
    setConnecting(true);
    const { res, data } = await apiPost({ action: "connect" });
    if (res.ok) {
      setConnection(data.connection);
      showToast("LinkedIn account connected");
    }
    setConnecting(false);
  }

  async function handleDisconnect() {
    setConnecting(true);
    const { res, data } = await apiPost({ action: "disconnect" });
    if (res.ok) {
      setConnection(data.connection);
      showToast("LinkedIn disconnected");
    }
    setConnecting(false);
  }

  async function handlePublish(data: {
    title: string;
    content: string;
    mode: "immediate" | "scheduled";
    scheduledAt: string | null;
    saveAsDraft?: boolean;
  }) {
    setSubmitting(true);

    const action = data.mode === "immediate" ? "publish-now" : "create";
    const { res, data: result } = await apiPost({
      action,
      title: data.title,
      content: data.content,
      mode: data.mode,
      scheduledAt: data.scheduledAt,
      status: data.saveAsDraft ? "draft" : data.mode === "scheduled" ? "scheduled" : "published",
    });

    setSubmitting(false);

    if (res.ok && result.post) {
      setPosts((prev) => [result.post, ...prev.filter((p) => p.id !== result.post.id)]);
      if (result.stats) setStats(result.stats);
      else await load();

      if (data.saveAsDraft) {
        showToast("Draft saved");
        setTab("drafts");
      } else if (data.mode === "immediate") {
        showToast("Published to LinkedIn");
        setTab("published");
      } else {
        showToast("Post scheduled");
        setTab("calendar");
      }
    } else {
      showToast(result.error ?? "Failed to publish");
    }
  }

  async function handleDelete(id: string) {
    await apiPost({ action: "delete", id });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    if (stats) {
      const updated = posts.filter((p) => p.id !== id);
      setStats({
        ...stats,
        drafts: updated.filter((p) => p.status === "draft").length,
        scheduled: updated.filter((p) => p.status === "scheduled").length,
        queued: updated.filter((p) => p.status === "queued").length,
        published: updated.filter((p) => p.status === "published").length,
      });
    }
    showToast("Post deleted");
  }

  async function handlePublishNow(id: string) {
    const { res, data } = await apiPost({ action: "update", id, status: "published" });
    if (res.ok && data.post) {
      setPosts((prev) => prev.map((p) => (p.id === id ? data.post : p)));
      showToast("Published to LinkedIn");
      setTab("published");
      await load();
    }
  }

  if (loading || !connection) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A66C2]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Linkedin className="h-7 w-7 text-[#0A66C2]" />
            LinkedIn Publishing Center
          </span>
        }
        description="Connect your account, compose posts, schedule content, and track performance."
      />

      {toast && (
        <div className="rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/10 px-4 py-2.5 text-sm text-[#7eb8f0]">
          {toast}
        </div>
      )}

      <LinkedInConnectCard
        connection={connection}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        loading={connecting}
      />

      {stats && (
        <LinkedInStatsBar
          stats={stats}
          onTabClick={(key) => {
            const map: Record<string, TabId> = {
              drafts: "drafts",
              scheduled: "queue",
              queued: "queue",
              published: "published",
            };
            const next = map[key];
            if (next) setTab(next);
          }}
        />
      )}

      <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06] pb-px">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition",
              tab === t.id
                ? "border-[#0A66C2] text-[#7eb8f0]"
                : "border-transparent text-content-subtle hover:text-white"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "compose" && (
        <LinkedInComposer
          connection={connection}
          onPublish={handlePublish}
          loading={submitting}
        />
      )}

      {tab === "calendar" && <LinkedInCalendarView posts={posts} />}

      {tab === "queue" && (
        <LinkedInQueueView posts={posts} onDelete={handleDelete} onPublish={handlePublishNow} />
      )}

      {tab === "drafts" && (
        <LinkedInDraftsView posts={posts} onDelete={handleDelete} onPublish={handlePublishNow} />
      )}

      {tab === "published" && <LinkedInPublishedView posts={posts} />}
    </div>
  );
}
