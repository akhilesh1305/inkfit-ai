"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronDown, Check, LayoutGrid } from "lucide-react";
import type { WorkspaceSummary } from "@/lib/workspaces";
import {
  setActiveWorkspaceId,
  WORKSPACE_CHANGE_EVENT,
  getWorkspaceTypeMeta,
} from "@/lib/workspaces";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher() {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [active, setActive] = useState<WorkspaceSummary | null>(null);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/workspaces");
    if (!res.ok) return;
    const data = await res.json();
    setWorkspaces(data.workspaces ?? []);
    const activeWs = data.active as WorkspaceSummary | null;
    if (activeWs) {
      setActive(activeWs);
      setActiveWorkspaceId(activeWs.id);
    }
  }, []);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener(WORKSPACE_CHANGE_EVENT, handler);
    return () => window.removeEventListener(WORKSPACE_CHANGE_EVENT, handler);
  }, [load]);

  async function selectWorkspace(id: string) {
    if (id === active?.id) {
      setOpen(false);
      return;
    }
    setSwitching(true);
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "switch", workspaceId: id }),
    });
    if (res.ok) {
      const data = await res.json();
      setActive(data.active);
      setActiveWorkspaceId(id);
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...data.active } : w))
      );
    }
    setSwitching(false);
    setOpen(false);
  }

  if (workspaces.length === 0) return null;

  const display = active ?? workspaces[0];
  const typeMeta = display ? getWorkspaceTypeMeta(display.type) : null;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={switching}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm transition hover:border-brand-500/30 hover:bg-white/[0.06]"
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg text-sm"
          style={{ backgroundColor: `${display?.color ?? "#7C3AED"}22` }}
        >
          {display?.icon ?? "🏠"}
        </span>
        <div className="hidden text-left sm:block">
          <p className="max-w-[130px] truncate text-xs font-semibold text-white">
            {display?.name ?? "Workspace"}
          </p>
          <p className="text-[10px] text-content-subtle">{typeMeta?.label}</p>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-content-subtle transition", open && "rotate-180")}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-[#121214] shadow-2xl">
            <p className="border-b border-white/10 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
              Switch workspace
            </p>
            <div className="max-h-72 overflow-y-auto py-1">
              {workspaces.map((ws) => {
                const meta = getWorkspaceTypeMeta(ws.type);
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => selectWorkspace(ws.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/[0.04]",
                      ws.id === active?.id && "bg-brand-500/10"
                    )}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base"
                      style={{ backgroundColor: `${ws.color}22` }}
                    >
                      {ws.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{ws.name}</p>
                      <p className="text-[10px] text-content-subtle">
                        {meta.label} · {ws.contentCount} items
                      </p>
                    </div>
                    {ws.id === active?.id && (
                      <Check className="h-4 w-4 shrink-0 text-brand-400" />
                    )}
                  </button>
                );
              })}
            </div>
            <Link
              href="/dashboard/workspaces"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 border-t border-white/10 px-3 py-2.5 text-xs font-medium text-brand-400 hover:bg-white/[0.04]"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Manage workspaces
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
