"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Target,
  Plus,
  ChevronLeft,
  Calendar,
  Flag,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CreateCampaignModal } from "@/components/projects/CreateCampaignModal";
import { CampaignKanban } from "@/components/projects/CampaignKanban";
import { cn } from "@/lib/utils";
import {
  computeProgress,
  CAMPAIGN_STATUS_META,
  CONTENT_TYPE_META,
  formatDueDate,
  isOverdue,
  type Campaign,
  type CampaignItem,
  type CampaignContentType,
  type KanbanColumn,
} from "@/lib/campaigns";

export function ProjectsView() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [items, setItems] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [mobileShowBoard, setMobileShowBoard] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setCampaigns(data.campaigns ?? []);
      setItems(data.items ?? []);
      setSelectedId((prev) => prev ?? data.campaigns?.[0]?.id ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = campaigns.find((c) => c.id === selectedId);
  const campaignItems = useMemo(
    () => items.filter((i) => i.campaignId === selectedId),
    [items, selectedId]
  );
  const progress = computeProgress(campaignItems);

  async function apiPost(body: Record<string, unknown>) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function handleCreateCampaign(data: {
    name: string;
    description: string;
    goal: string;
    dueDate?: string;
  }) {
    const result = await apiPost({ action: "create-campaign", ...data });
    if (result.campaign) {
      setCampaigns((prev) => [result.campaign, ...prev]);
      setSelectedId(result.campaign.id);
      setMobileShowBoard(true);
    }
  }

  async function handleMoveItem(id: string, column: KanbanColumn) {
    const result = await apiPost({ action: "update-item", id, column });
    if (result.item) {
      setItems((prev) => prev.map((i) => (i.id === id ? result.item : i)));
    }
  }

  async function handleAddItem(column: KanbanColumn, title: string, type: CampaignContentType) {
    if (!selectedId) return;
    const result = await apiPost({
      action: "create-item",
      campaignId: selectedId,
      title,
      type,
      column,
    });
    if (result.item) setItems((prev) => [...prev, result.item]);
  }

  async function handleDeleteItem(id: string) {
    await apiPost({ action: "delete-item", id });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col lg:h-[calc(100vh-5rem)]">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Target className="h-7 w-7 text-brand-400" />
            Campaigns
          </span>
        }
        description="Plan, track, and ship content campaigns with a Linear-style board."
      >
        <button type="button" onClick={() => setCreateOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          New campaign
        </button>
      </PageHeader>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        {/* Campaign list — Linear sidebar */}
        <aside
          className={cn(
            "flex w-full flex-col rounded-xl border border-white/[0.06] bg-[#0c0c0e] lg:w-72 lg:shrink-0",
            mobileShowBoard && "hidden lg:flex"
          )}
        >
          <div className="border-b border-white/[0.06] px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
              Projects
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {campaigns.length === 0 ? (
              <p className="px-2 py-8 text-center text-xs text-content-subtle">
                No campaigns yet
              </p>
            ) : (
              campaigns.map((c) => {
                const cItems = items.filter((i) => i.campaignId === c.id);
                const pct = computeProgress(cItems);
                const statusMeta = CAMPAIGN_STATUS_META[c.status];
                const active = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(c.id);
                      setMobileShowBoard(true);
                    }}
                    className={cn(
                      "mb-1 w-full rounded-lg px-3 py-3 text-left transition",
                      active
                        ? "bg-white/[0.08] ring-1 ring-white/10"
                        : "hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="truncate text-sm font-medium text-content">{c.name}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: c.color }}
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-content-subtle">{pct}%</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-content-subtle">
                      <span
                        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5"
                        style={{ backgroundColor: `${statusMeta.color}18`, color: statusMeta.color }}
                      >
                        {statusMeta.label}
                      </span>
                      <span>{cItems.length} items</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Campaign detail + Kanban */}
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col",
            !mobileShowBoard && "hidden lg:flex"
          )}
        >
          {!selected ? (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-content-subtle">
              Select or create a campaign
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMobileShowBoard(false)}
                className="mb-3 flex items-center gap-1 text-sm text-content-subtle lg:hidden"
              >
                <ChevronLeft className="h-4 w-4" />
                All campaigns
              </button>

              <div className="mb-4 rounded-xl border border-white/[0.06] bg-[#0c0c0e] p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: selected.color }}
                      />
                      <h2 className="truncate text-lg font-semibold text-content">
                        {selected.name}
                      </h2>
                    </div>
                    {selected.description && (
                      <p className="mt-1 text-sm text-content-muted">{selected.description}</p>
                    )}
                    {selected.goal && (
                      <p className="mt-2 flex items-start gap-1.5 text-xs text-content-subtle">
                        <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
                        {selected.goal}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 sm:gap-6">
                    <Metric label="Progress" value={`${progress}%`}>
                      <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${progress}%`, backgroundColor: selected.color }}
                        />
                      </div>
                    </Metric>
                    <Metric
                      label="Status"
                      value={CAMPAIGN_STATUS_META[selected.status].label}
                      valueColor={CAMPAIGN_STATUS_META[selected.status].color}
                    />
                    <Metric
                      label="Due date"
                      value={formatDueDate(selected.dueDate)}
                      valueColor={isOverdue(selected.dueDate) ? "#f87171" : undefined}
                      icon={Calendar}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
                  {(Object.keys(CONTENT_TYPE_META) as CampaignContentType[]).map((type) => {
                    const count = campaignItems.filter((i) => i.type === type).length;
                    const meta = CONTENT_TYPE_META[type];
                    const Icon = meta.icon;
                    return (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[10px] text-content-muted"
                      >
                        <Icon className="h-3 w-3" style={{ color: meta.color }} />
                        {count} {meta.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
                <CampaignKanban
                  items={campaignItems}
                  onMoveItem={handleMoveItem}
                  onAddItem={handleAddItem}
                  onDeleteItem={handleDeleteItem}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <CreateCampaignModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateCampaign}
      />
    </div>
  );
}

function Metric({
  label,
  value,
  valueColor,
  icon: Icon,
  children,
}: {
  label: string;
  value: string;
  valueColor?: string;
  icon?: typeof Calendar;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
        {label}
      </p>
      <div className="mt-0.5 flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-content-subtle" />}
        <span className="text-sm font-medium text-content" style={valueColor ? { color: valueColor } : undefined}>
          {value}
        </span>
      </div>
      {children}
    </div>
  );
}
