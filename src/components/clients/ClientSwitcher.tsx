"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronDown, Building2, Check } from "lucide-react";
import type { AgencyClient } from "@/lib/clients";
import { getActiveClientId, setActiveClientId } from "@/lib/clients";
import { cn } from "@/lib/utils";

export function ClientSwitcher() {
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const syncActive = useCallback(() => {
    setActiveId(getActiveClientId());
  }, []);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => {
        const list: AgencyClient[] = d.clients ?? [];
        setClients(list);
        const stored = getActiveClientId();
        if (stored && list.some((c) => c.id === stored)) {
          setActiveId(stored);
        } else if (list.length > 0) {
          setActiveClientId(list[0].id);
          setActiveId(list[0].id);
        }
      })
      .catch(() => {});

    syncActive();
    const handler = () => syncActive();
    window.addEventListener("inkfit-client-change", handler);
    return () => window.removeEventListener("inkfit-client-change", handler);
  }, [syncActive]);

  const active = clients.find((c) => c.id === activeId);

  if (clients.length === 0) return null;

  function selectClient(id: string) {
    setActiveClientId(id);
    setActiveId(id);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm transition hover:border-white/20"
      >
        {active ? (
          <>
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: active.brandColor }}
            />
            <span className="max-w-[120px] truncate font-medium text-content">
              {active.name}
            </span>
          </>
        ) : (
          <>
            <Building2 className="h-4 w-4 text-content-subtle" />
            <span className="text-content-muted">Select client</span>
          </>
        )}
        <ChevronDown
          className={cn("h-4 w-4 text-content-subtle transition", open && "rotate-180")}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-ink-surface shadow-card">
            <p className="border-b border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
              Switch Client
            </p>
            <div className="max-h-64 overflow-y-auto py-1">
              {clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => selectClient(client.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-white/[0.04]",
                    client.id === activeId && "bg-brand-500/10"
                  )}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: client.brandColor }}
                  >
                    {client.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-content">{client.name}</p>
                    <p className="truncate text-xs text-content-subtle">{client.industry}</p>
                  </div>
                  {client.id === activeId && (
                    <Check className="h-4 w-4 shrink-0 text-brand-400" />
                  )}
                </button>
              ))}
            </div>
            <Link
              href="/dashboard/clients"
              onClick={() => setOpen(false)}
              className="block border-t border-white/10 px-3 py-2.5 text-center text-xs font-medium text-brand-400 hover:bg-white/[0.04]"
            >
              Manage Clients
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
