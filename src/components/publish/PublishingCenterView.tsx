"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Send,
  Calendar,
  ListOrdered,
  FileText,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ConnectAccounts } from "@/components/publish/ConnectAccounts";
import { ScheduleComposer } from "@/components/publish/ScheduleComposer";
import { PublishCalendarView } from "@/components/publish/PublishCalendarView";
import {
  PostQueueView,
  DraftsPanel,
  PublishedPanel,
} from "@/components/publish/PostList";
import { AnalyticsPreview } from "@/components/publish/AnalyticsPreview";
import { cn } from "@/lib/utils";
import type {
  PublishConnection,
  PublishPlatformId,
  PostStatus,
  ScheduledPost,
} from "@/lib/publishing";

type TabId = "schedule" | "calendar" | "queue" | "drafts" | "published" | "analytics";

const TABS: { id: TabId; label: string; icon: typeof Send }[] = [
  { id: "schedule", label: "Schedule", icon: Send },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "queue", label: "Queue", icon: ListOrdered },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "published", label: "Published", icon: CheckCircle2 },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export function PublishingCenterView() {
  const [connections, setConnections] = useState<PublishConnection[]>([]);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<TabId>("schedule");
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/publish");
    if (res.ok) {
      const data = await res.json();
      setConnections(data.connections ?? []);
      setPosts(data.posts ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function apiPost(body: Record<string, unknown>) {
    const res = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleConnect(platform: PublishPlatformId, connected: boolean) {
    setConnecting(platform);
    const result = await apiPost({ action: "connect", platform, connected });
    if (result.connections) setConnections(result.connections);
    setConnecting(null);
    showToast(connected ? `${platform} connected` : `${platform} disconnected`);
  }

  async function handleSchedule(data: {
    platform: PublishPlatformId;
    title: string;
    content: string;
    status: PostStatus;
    scheduledAt: string | null;
  }) {
    setSubmitting(true);
    const result = await apiPost({ action: "create", ...data });
    setSubmitting(false);
    if (result.post) {
      setPosts((prev) => [result.post, ...prev]);
      const labels: Record<PostStatus, string> = {
        draft: "Draft saved",
        scheduled: "Post scheduled",
        queued: "Added to queue",
        published: "Published",
      };
      showToast(labels[data.status]);
      if (data.status !== "draft") setTab(data.status === "queued" ? "queue" : "calendar");
    }
  }

  async function handleDelete(id: string) {
    await apiPost({ action: "delete", id });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    showToast("Post deleted");
  }

  async function handlePublish(id: string) {
    const result = await apiPost({ action: "update", id, status: "published" });
    if (result.post) {
      setPosts((prev) => prev.map((p) => (p.id === id ? result.post : p)));
      showToast("Post published");
      setTab("published");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const connectedCount = connections.filter((c) => c.connected).length;

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Send className="h-7 w-7 text-brand-400" />
            Publishing Center
          </span>
        }
        description="Connect accounts, schedule posts, and track performance across platforms."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          {connectedCount} / 4 connected
        </span>
      </PageHeader>

      {toast && (
        <div className="mb-4 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-2.5 text-sm text-brand-200">
          {toast}
        </div>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
          Connect accounts
        </h2>
        <ConnectAccounts
          connections={connections}
          onToggle={handleConnect}
          loading={connecting}
        />
      </section>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-white/[0.06] pb-px">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition",
              tab === t.id
                ? "border-brand-500 text-brand-300"
                : "border-transparent text-content-subtle hover:text-content"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "schedule" && (
        <div className="grid gap-8 xl:grid-cols-[1fr_1.2fr]">
          <ScheduleComposer
            connections={connections}
            onSubmit={handleSchedule}
            loading={submitting}
          />
          <PublishCalendarView posts={posts} />
        </div>
      )}

      {tab === "calendar" && <PublishCalendarView posts={posts} />}

      {tab === "queue" && (
        <PostQueueView posts={posts} onDelete={handleDelete} onPublish={handlePublish} />
      )}

      {tab === "drafts" && (
        <DraftsPanel posts={posts} onDelete={handleDelete} onPublish={handlePublish} />
      )}

      {tab === "published" && (
        <div className="space-y-6">
          <AnalyticsPreview posts={posts} />
          <PublishedPanel posts={posts} />
        </div>
      )}

      {tab === "analytics" && <AnalyticsPreview posts={posts} />}
    </div>
  );
}
