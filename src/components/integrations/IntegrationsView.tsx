"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Plug } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  IntegrationCard,
  IntegrationsOverviewBar,
} from "@/components/integrations/IntegrationCard";
import type {
  IntegrationConnectionView,
  IntegrationProviderId,
  IntegrationProviderMeta,
} from "@/lib/integrations/types";

interface IntegrationsPayload {
  providers: IntegrationProviderMeta[];
  connections: IntegrationConnectionView[];
  publishTargets: IntegrationProviderId[];
}

export function IntegrationsView() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<IntegrationsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyProvider, setBusyProvider] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/integrations");
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected) {
      showToast(`${connected.replace(/_/g, " ")} connected successfully`);
    } else if (error) {
      showToast(`Connection failed: ${error.replace(/_/g, " ")}`);
    }
  }, [searchParams]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  async function apiPost(body: Record<string, unknown>) {
    const res = await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.connections) {
      setData((prev) =>
        prev ? { ...prev, connections: json.connections } : prev
      );
    } else {
      await load();
    }
    return { res, json };
  }

  async function handleConnect(provider: IntegrationProviderId, oauthConfigured: boolean) {
    setBusyProvider(provider);
    if (oauthConfigured) {
      window.location.href = `/api/integrations/oauth/${provider}`;
      return;
    }
    const { res } = await apiPost({ action: "demo-connect", provider });
    setBusyProvider(null);
    showToast(res.ok ? "Demo connection established" : "Failed to connect");
  }

  async function handleDisconnect(provider: IntegrationProviderId) {
    setBusyProvider(provider);
    const { res } = await apiPost({ action: "disconnect", provider });
    setBusyProvider(null);
    showToast(res.ok ? "Disconnected" : "Failed to disconnect");
  }

  async function handleSync(provider: IntegrationProviderId) {
    setBusyProvider(provider);
    const { res, json } = await apiPost({ action: "sync", provider });
    setBusyProvider(null);
    showToast(
      res.ok && json.result?.success
        ? "Sync completed"
        : json.result?.error ?? "Sync failed"
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!data) return null;

  const connectionByProvider = new Map(
    data.connections.map((c) => [c.provider, c])
  );
  const connectedCount = data.connections.filter((c) => c.connected).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Plug className="h-7 w-7 text-brand-400" />
            Integrations
          </span>
        }
        description="Connect publishing destinations, manage OAuth credentials, and monitor sync status."
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-brand-500/30 bg-ink-bg px-4 py-2 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}

      <IntegrationsOverviewBar
        connectedCount={connectedCount}
        totalCount={data.providers.length}
      />

      <div className="grid gap-5 md:grid-cols-2">
        {data.providers.map((meta) => {
          const connection = connectionByProvider.get(meta.id)!;
          return (
            <IntegrationCard
              key={meta.id}
              meta={meta}
              connection={connection}
              busy={busyProvider === meta.id}
              onConnect={() => handleConnect(meta.id, connection.oauthConfigured)}
              onDisconnect={() => handleDisconnect(meta.id)}
              onSync={() => handleSync(meta.id)}
            />
          );
        })}
      </div>

      {data.publishTargets.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-2">Publishing targets</h2>
          <p className="mb-3 text-sm text-content-muted">
            Content from InkFit can be published to these connected platforms via{" "}
            <code className="text-brand-300">POST /api/integrations/publish</code>.
          </p>
          <div className="flex flex-wrap gap-2">
            {data.publishTargets.map((id) => (
              <span
                key={id}
                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300"
              >
                {id.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
