"use client";

import { cn } from "@/lib/utils";
import { SERVICE_STATUS_STYLES, type SystemService } from "@/lib/admin";

interface SystemMonitoringProps {
  services: SystemService[];
}

export function SystemMonitoring({ services }: SystemMonitoringProps) {
  const operational = services.filter((s) => s.status === "operational").length;
  const degraded = services.filter((s) => s.status === "degraded").length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
          <p className="text-lg font-bold text-emerald-400">{operational}</p>
          <p className="text-[10px] text-content-subtle">Operational</p>
        </div>
        {degraded > 0 && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2">
            <p className="text-lg font-bold text-amber-400">{degraded}</p>
            <p className="text-[10px] text-content-subtle">Degraded</p>
          </div>
        )}
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2">
          <p className="text-lg font-bold text-content">99.96%</p>
          <p className="text-[10px] text-content-subtle">Platform uptime (30d)</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const meta = SERVICE_STATUS_STYLES[service.status];
          return (
            <div
              key={service.id}
              className="rounded-xl border border-white/[0.06] bg-[#0a0a0c] p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-content">{service.name}</p>
                  <p className={cn("mt-0.5 text-xs font-medium", meta.color)}>{meta.label}</p>
                </div>
                <span className={cn("h-2.5 w-2.5 rounded-full", meta.bg)} />
              </div>
              <div className="mt-3 flex justify-between text-[11px] text-content-subtle">
                <span>{service.latencyMs}ms latency</span>
                <span>{service.uptime} uptime</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
