"use client";

import {
  LayoutDashboard,
  FileText,
  Calendar,
  BarChart3,
  Bell,
  Search,
} from "lucide-react";
import type { WhiteLabelConfig } from "@/lib/white-label";

interface ClientPortalPreviewProps {
  config: WhiteLabelConfig;
}

const NAV = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: FileText, label: "Content" },
  { icon: Calendar, label: "Calendar" },
  { icon: BarChart3, label: "Reports" },
];

export function ClientPortalPreview({ config }: ClientPortalPreviewProps) {
  const { primaryColor, secondaryColor, accentColor, brandName, logoDataUrl } = config;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0c] shadow-2xl">
      <div className="flex h-[420px] flex-col text-[10px]">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
          <div className="flex items-center gap-2">
            {logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoDataUrl} alt="" className="h-6 max-w-[100px] object-contain" />
            ) : (
              <span
                className="rounded-md px-2 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {brandName}
              </span>
            )}
            <span className="hidden text-content-muted sm:inline">·</span>
            <span className="hidden font-medium text-white/80 sm:inline">
              {config.portalWelcome}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-content-muted sm:flex">
              <Search className="h-3 w-3" />
              Search…
            </div>
            <Bell className="h-3.5 w-3.5 text-content-muted" />
            <div
              className="h-6 w-6 rounded-full"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
            />
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* Sidebar */}
          <aside className="hidden w-36 shrink-0 border-r border-white/[0.06] bg-white/[0.02] p-3 sm:block">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-content-muted">
              Menu
            </p>
            <nav className="space-y-0.5">
              {NAV.map((item, i) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                  style={
                    i === 0
                      ? { backgroundColor: `${primaryColor}25`, color: accentColor }
                      : undefined
                  }
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  <span className={i === 0 ? "font-medium text-white" : "text-content-muted"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <main className="flex-1 overflow-hidden p-4">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-white">Good morning, Client</h3>
              <p className="text-content-muted">Your content workspace at a glance</p>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
              {[
                { label: "Drafts", value: "12" },
                { label: "Scheduled", value: "8" },
                { label: "Published", value: "47" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5"
                >
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-[9px] text-content-muted">{stat.label}</p>
                </div>
              ))}
            </div>

            <div
              className="rounded-lg p-3"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}30, ${secondaryColor}15)`,
                border: `1px solid ${primaryColor}40`,
              }}
            >
              <p className="font-semibold text-white">New campaign ready</p>
              <p className="mt-0.5 text-[9px] text-white/60">
                Review and approve Q2 content calendar
              </p>
              <button
                type="button"
                className="mt-2 rounded-md px-2.5 py-1 text-[9px] font-semibold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Open workspace
              </button>
            </div>
          </main>
        </div>

        {!config.hidePoweredBy && (
          <footer className="border-t border-white/[0.06] px-4 py-1.5 text-center text-[9px] text-content-muted">
            Powered by InkFit AI
          </footer>
        )}
      </div>
    </div>
  );
}
