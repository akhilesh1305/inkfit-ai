"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Globe, Plus, Trash2, Pause, Play } from "lucide-react";
import type { ConnectedWebsite } from "@/lib/extensions";
import { cn } from "@/lib/utils";

interface ConnectedWebsitesPanelProps {
  websites: ConnectedWebsite[];
  onAdd: (domain: string, label?: string) => void;
  onRemove: (id: string) => void;
  onToggleStatus: (id: string, status: "active" | "paused") => void;
}

export function ConnectedWebsitesPanel({
  websites,
  onAdd,
  onRemove,
  onToggleStatus,
}: ConnectedWebsitesPanelProps) {
  const [domain, setDomain] = useState("");
  const [label, setLabel] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;
    onAdd(domain.trim(), label.trim() || undefined);
    setDomain("");
    setLabel("");
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4">
        <Globe className="h-4 w-4 text-brand-400" />
        <h3 className="font-semibold text-white">Connected Websites</h3>
        <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-content-muted">
          {websites.length} sites
        </span>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-2 border-b border-white/[0.06] p-4 sm:flex-row">
        <input
          className="input-field flex-1 text-sm"
          placeholder="domain.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <input
          className="input-field sm:max-w-[140px] text-sm"
          placeholder="Label (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <button type="submit" className="btn-primary shrink-0 !px-4">
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>

      {websites.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-content-muted">
          No websites connected yet. Add domains where the extension should activate.
        </p>
      ) : (
        <ul className="divide-y divide-white/[0.06]">
          {websites.map((site) => (
            <li
              key={site.id}
              className="flex flex-wrap items-center gap-3 px-5 py-3 transition hover:bg-white/[0.02]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
                <Globe className="h-4 w-4 text-brand-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{site.label ?? site.domain}</p>
                <p className="text-xs text-content-muted">{site.domain}</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase",
                  site.status === "active"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-amber-500/15 text-amber-400"
                )}
              >
                {site.status}
              </span>
              {site.lastSyncAt && (
                <span className="text-[10px] text-content-subtle">
                  Synced {formatDistanceToNow(new Date(site.lastSyncAt), { addSuffix: true })}
                </span>
              )}
              <div className="flex gap-1">
                <button
                  type="button"
                  className="btn-ghost !p-2"
                  onClick={() =>
                    onToggleStatus(site.id, site.status === "active" ? "paused" : "active")
                  }
                  aria-label={site.status === "active" ? "Pause" : "Resume"}
                >
                  {site.status === "active" ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  className="btn-ghost !p-2 text-red-400"
                  onClick={() => onRemove(site.id)}
                  aria-label="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
