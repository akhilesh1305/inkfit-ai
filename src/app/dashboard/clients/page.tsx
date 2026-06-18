"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2, Plus, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ClientCard, ClientDashboard } from "@/components/clients/ClientCard";
import { CreateClientModal } from "@/components/clients/CreateClientModal";
import {
  type AgencyClient,
  type CreateClientInput,
  getActiveClientId,
  setActiveClientId,
} from "@/lib/clients";

export default function ClientsPage() {
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadClients = useCallback(async () => {
    const res = await fetch("/api/clients");
    const data = await res.json();
    const list: AgencyClient[] = data.clients ?? [];
    setClients(list);

    const stored = getActiveClientId();
    if (stored && list.some((c) => c.id === stored)) {
      setActiveId(stored);
    } else if (list.length > 0) {
      setActiveClientId(list[0].id);
      setActiveId(list[0].id);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadClients();
    const handler = () => setActiveId(getActiveClientId());
    window.addEventListener("inkfit-client-change", handler);
    return () => window.removeEventListener("inkfit-client-change", handler);
  }, [loadClients]);

  function selectClient(id: string) {
    setActiveClientId(id);
    setActiveId(id);
  }

  async function handleCreate(data: CreateClientInput) {
    setCreating(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...data }),
    });
    const result = await res.json();
    setCreating(false);
    if (result.client) {
      setClients((prev) => [...prev, result.client].sort((a, b) => a.name.localeCompare(b.name)));
      selectClient(result.client.id);
    }
  }

  const activeClient = clients.find((c) => c.id === activeId);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-brand-400" />
            Client Management
          </span>
        }
        description="Manage multiple client brands — switch contexts, track content, and oversee projects."
      >
        <button type="button" onClick={() => setCreateOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Create Client
        </button>
      </PageHeader>

      {activeClient && <ClientDashboard client={activeClient} />}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">All Clients</h2>
          <p className="text-xs text-content-subtle">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>

        {clients.length === 0 ? (
          <div className="card flex flex-col items-center justify-center border-dashed py-16 text-center">
            <Building2 className="h-10 w-10 text-content-subtle" />
            <p className="mt-3 font-medium text-content">No clients yet</p>
            <p className="mt-1 max-w-sm text-sm text-content-subtle">
              Create your first client to start managing brands and content at scale.
            </p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="btn-primary mt-4"
            >
              <Plus className="h-4 w-4" />
              Create Client
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                active={client.id === activeId}
                onSelect={() => selectClient(client.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateClientModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        loading={creating}
      />
    </div>
  );
}
