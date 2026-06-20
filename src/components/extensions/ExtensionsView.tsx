"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Puzzle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ExtensionStatusCard } from "@/components/extensions/ExtensionStatusCard";
import { IntegrationsGrid } from "@/components/extensions/IntegrationsGrid";
import { ConnectedWebsitesPanel } from "@/components/extensions/ConnectedWebsitesPanel";
import { UsageStatisticsPanel } from "@/components/extensions/UsageStatisticsPanel";
import { InstallGuidePanel } from "@/components/extensions/InstallGuidePanel";
import type { ExtensionsDashboard, IntegrationPlatform } from "@/lib/extensions";

export function ExtensionsView() {
  const [dashboard, setDashboard] = useState<ExtensionsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/extensions");
    if (res.ok) {
      const data = await res.json();
      setDashboard(data.dashboard);
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

  async function apiPost(body: Record<string, unknown>) {
    await fetch("/api/extensions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await load();
  }

  async function handleToggleIntegration(platform: IntegrationPlatform, connected: boolean) {
    setConnecting(platform);
    try {
      await apiPost({ action: "toggle-integration", platform, connected });
      showToast(connected ? `${platform} connected` : `${platform} disconnected`);
    } catch {
      showToast("Action failed. Please try again.");
    } finally {
      setConnecting(null);
    }
  }

  async function handleMarkInstalled() {
    setMarking(true);
    try {
      await apiPost({ action: "mark-installed" });
      showToast("Extension marked as installed");
    } catch {
      showToast("Could not update status. Please try again.");
    } finally {
      setMarking(false);
    }
  }

  async function handleAddWebsite(domain: string, label?: string) {
    await apiPost({ action: "add-website", domain, label });
    showToast("Website added");
  }

  async function handleRemoveWebsite(id: string) {
    await apiPost({ action: "remove-website", id });
    showToast("Website removed");
  }

  async function handleToggleWebsite(id: string, status: "active" | "paused") {
    await apiPost({ action: "toggle-website", id, status });
    showToast(status === "active" ? "Website activated" : "Website paused");
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Puzzle className="h-7 w-7 text-brand-400" />
            Chrome Extension
          </span>
        }
        description="Manage your InkFit browser extension — integrations, connected sites, and usage analytics."
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-brand-500/30 bg-ink-bg px-4 py-2 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}

      <ExtensionStatusCard
        status={dashboard.status}
        onMarkInstalled={handleMarkInstalled}
        marking={marking}
      />

      <div>
        <h2 className="section-title mb-4">Integrations</h2>
        <IntegrationsGrid
          integrations={dashboard.integrations}
          connecting={connecting}
          onToggle={handleToggleIntegration}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ConnectedWebsitesPanel
          websites={dashboard.websites}
          onAdd={handleAddWebsite}
          onRemove={handleRemoveWebsite}
          onToggleStatus={handleToggleWebsite}
        />
        <InstallGuidePanel />
      </div>

      <div>
        <h2 className="section-title mb-4">Usage statistics</h2>
        <UsageStatisticsPanel usage={dashboard.usage} />
      </div>
    </div>
  );
}
