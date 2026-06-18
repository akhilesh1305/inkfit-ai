"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Plus,
  Trash2,
  Check,
  Loader2,
  FileText,
  Users,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CreateWorkspaceModal } from "@/components/workspaces/CreateWorkspaceModal";
import {
  getWorkspaceTypeMeta,
  setActiveWorkspaceId,
  WORKSPACE_TYPES,
  type WorkspaceSummary,
  type WorkspaceType,
} from "@/lib/workspaces";
import { cn } from "@/lib/utils";

export function WorkspacesManagementView() {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/workspaces");
    if (res.ok) {
      const data = await res.json();
      setWorkspaces(data.workspaces ?? []);
      setActiveId(data.active?.id ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleCreate(data: {
    name: string;
    type: WorkspaceType;
    description: string;
  }) {
    setSaving(true);
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...data }),
    });
    setSaving(false);
    if (res.ok) {
      const result = await res.json();
      setWorkspaces((prev) => [result.workspace, ...prev]);
      setModalOpen(false);
      showToast("Workspace created");
    }
  }

  async function handleSwitch(id: string) {
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "switch", workspaceId: id }),
    });
    if (res.ok) {
      const data = await res.json();
      setActiveId(id);
      setActiveWorkspaceId(id);
      showToast(`Switched to ${data.active.name}`);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? All content in this workspace will be removed.`)) return;
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", workspaceId: id }),
    });
    if (res.ok) {
      const data = await res.json();
      setWorkspaces(data.workspaces ?? []);
      setActiveId(data.active?.id ?? null);
      if (data.active) setActiveWorkspaceId(data.active.id);
      showToast("Workspace deleted");
    } else {
      const err = await res.json();
      showToast(err.error ?? "Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const grouped = {
    personal: workspaces.filter((w) => w.type === "personal"),
    team: workspaces.filter((w) => w.type === "team"),
    client: workspaces.filter((w) => w.type === "client"),
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <LayoutGrid className="h-7 w-7 text-brand-400" />
            Workspace Management
          </span>
        }
        description="Organize content across personal, team, and client workspaces."
      >
        <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Create workspace
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {WORKSPACE_TYPES.map((type) => (
          <div
            key={type.id}
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
          >
            <span className="text-2xl">{type.icon}</span>
            <p className="mt-2 text-2xl font-bold text-white">
              {grouped[type.id].length}
            </p>
            <p className="text-sm text-content-muted">{type.label} workspaces</p>
          </div>
        ))}
      </div>

      {/* Workspace sections */}
      {WORKSPACE_TYPES.map((typeMeta) => {
        const list = grouped[typeMeta.id];
        if (list.length === 0) return null;

        return (
          <section key={typeMeta.id}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <span>{typeMeta.icon}</span>
              {typeMeta.label}
              <span className="text-content-subtle font-normal">({list.length})</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((ws) => (
                <WorkspaceCard
                  key={ws.id}
                  workspace={ws}
                  isActive={ws.id === activeId}
                  onSwitch={() => handleSwitch(ws.id)}
                  onDelete={() => handleDelete(ws.id, ws.name)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-brand-500/5 to-transparent p-5">
        <p className="text-sm font-medium text-white">Workspace-specific data</p>
        <p className="mt-1 text-xs text-content-muted">
          Content, folders, and drafts are scoped to your active workspace. Switch workspaces
          from the navbar to work in a different context.
        </p>
        <Link
          href="/dashboard/workspace"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-400 hover:underline"
        >
          Open content workspace
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <CreateWorkspaceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
        saving={saving}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-white/10 bg-[#1a1a1c] px-4 py-2.5 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function WorkspaceCard({
  workspace,
  isActive,
  onSwitch,
  onDelete,
}: {
  workspace: WorkspaceSummary;
  isActive: boolean;
  onSwitch: () => void;
  onDelete: () => void;
}) {
  const meta = getWorkspaceTypeMeta(workspace.type);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 transition",
        isActive
          ? "border-brand-500/40 bg-brand-500/[0.06] ring-1 ring-brand-500/20"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: workspace.color }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: `${workspace.color}22` }}
          >
            {workspace.icon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{workspace.name}</h3>
              {isActive && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Active
                </span>
              )}
              {workspace.isDefault && (
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-content-subtle">
                  Default
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-content-muted">{meta.label}</p>
            {workspace.description && (
              <p className="mt-1 text-xs text-content-subtle line-clamp-2">
                {workspace.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-4 text-xs text-content-muted">
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          {workspace.contentCount} items
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {workspace.memberCount} members
        </span>
      </div>

      <div className="relative mt-4 flex gap-2">
        {!isActive ? (
          <button type="button" onClick={onSwitch} className="btn-secondary flex-1 !py-2 text-xs">
            <Check className="h-3.5 w-3.5" />
            Switch to
          </button>
        ) : (
          <Link href="/dashboard/workspace" className="btn-primary flex-1 !py-2 text-xs text-center">
            Open content
          </Link>
        )}
        {!workspace.isDefault && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-white/[0.06] px-3 py-2 text-content-subtle transition hover:border-red-500/30 hover:text-red-400"
            title="Delete workspace"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
