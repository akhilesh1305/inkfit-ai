"use client";

import Link from "next/link";
import {
  FileText,
  FolderKanban,
  Mic2,
  Calendar,
  ExternalLink,
  Check,
} from "lucide-react";
import type { AgencyClient } from "@/lib/clients";
import { cn } from "@/lib/utils";

interface ClientCardProps {
  client: AgencyClient;
  active: boolean;
  onSelect: () => void;
}

export function ClientCard({ client, active, onSelect }: ClientCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border text-left transition duration-300",
        active
          ? "border-brand-500/50 bg-brand-500/5 shadow-glow"
          : "border-white/10 bg-ink-surface/60 hover:border-white/20 hover:bg-white/[0.03]"
      )}
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: client.brandColor }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
              style={{ backgroundColor: client.brandColor }}
            >
              {client.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-content">{client.name}</h3>
              <p className="text-xs text-content-subtle">{client.industry}</p>
            </div>
          </div>
          {active && (
            <span className="flex items-center gap-1 rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-300">
              <Check className="h-3 w-3" />
              Active
            </span>
          )}
        </div>

        {client.website && (
          <p className="mt-3 flex items-center gap-1.5 truncate text-xs text-content-muted">
            <ExternalLink className="h-3 w-3 shrink-0" />
            {client.website.replace(/^https?:\/\//, "")}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            { label: "Content", value: client.contentCreated },
            { label: "Projects", value: client.projects },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2"
            >
              <p className="text-lg font-bold text-content">{stat.value}</p>
              <p className="text-[10px] text-content-subtle">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}

interface ClientDashboardProps {
  client: AgencyClient;
}

export function ClientDashboard({ client }: ClientDashboardProps) {
  const stats = [
    {
      label: "Content Created",
      value: client.contentCreated,
      icon: FileText,
      href: "/dashboard/repurpose",
      color: "from-brand-600/20 to-accent-blue/10",
    },
    {
      label: "Projects",
      value: client.projects,
      icon: FolderKanban,
      href: "/dashboard",
      color: "from-accent-blue/20 to-accent-cyan/10",
    },
    {
      label: "Brand Voice",
      value: client.brandVoiceReady ? "Configured" : "Not set",
      icon: Mic2,
      href: "/dashboard/brand-voice",
      color: "from-emerald-600/20 to-emerald-500/10",
      badge: client.brandVoiceReady,
    },
    {
      label: "Content Calendar",
      value: client.calendarItems,
      icon: Calendar,
      href: "/dashboard/calendar",
      color: "from-amber-600/20 to-amber-500/10",
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-surface/60 shadow-card">
      <div
        className="border-b border-white/10 px-6 py-5"
        style={{
          background: `linear-gradient(135deg, ${client.brandColor}18 0%, transparent 60%)`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-glow"
              style={{ backgroundColor: client.brandColor }}
            >
              {client.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-content">{client.name}</h2>
              <p className="text-sm text-content-subtle">
                {client.industry}
                {client.website && (
                  <>
                    {" · "}
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-400 hover:underline"
                    >
                      {client.website.replace(/^https?:\/\//, "")}
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2"
          >
            <span
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: client.brandColor }}
            />
            <span className="text-xs font-medium text-content-muted">Brand Color</span>
            <span className="font-mono text-xs text-content-subtle">{client.brandColor}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={cn(
                "group rounded-xl border border-white/10 bg-gradient-to-br p-4 transition hover:border-white/20 hover:shadow-glow",
                stat.color
              )}
            >
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-content-subtle transition group-hover:text-brand-400" />
                {"badge" in stat && stat.badge && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    Ready
                  </span>
                )}
              </div>
              <p className="mt-3 text-2xl font-bold text-content">{stat.value}</p>
              <p className="mt-0.5 text-xs text-content-subtle">{stat.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
