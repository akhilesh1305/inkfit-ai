"use client";

import { Users, Building2 } from "lucide-react";
import type { TeamBillingInfo } from "@/lib/billing";

export function TeamBillingPanel({ team }: { team: TeamBillingInfo }) {
  if (team.billingType === "individual") {
    return (
      <div className="card">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-brand-400" />
          <h3 className="font-semibold text-white">Team Billing</h3>
        </div>
        <p className="mt-2 text-sm text-content-muted">
          Upgrade to <strong className="text-white">Pro</strong> for team seats and shared credit pools.
        </p>
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-xs text-content-subtle">Current seats</p>
          <p className="text-2xl font-bold text-white">
            {team.seatsUsed} <span className="text-sm font-normal text-content-muted">/ {team.seatLimit}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2">
        {team.billingType === "agency" ? (
          <Building2 className="h-4 w-4 text-brand-400" />
        ) : (
          <Users className="h-4 w-4 text-brand-400" />
        )}
        <h3 className="font-semibold text-white">
          {team.billingType === "agency" ? "Agency Billing" : "Team Billing"}
        </h3>
      </div>
      <p className="mt-1 text-xs capitalize text-content-subtle">{team.billingType} plan</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-xs text-content-subtle">Team seats</p>
          <p className="text-2xl font-bold text-white">
            {team.seatsUsed}
            <span className="text-sm font-normal text-content-muted"> / {team.seatLimit}</span>
          </p>
          <p className="mt-1 text-[11px] text-emerald-400">{team.seatsAvailable} available</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-xs text-content-subtle">Client workspaces</p>
          <p className="text-2xl font-bold text-white">
            {team.clientsUsed}
            <span className="text-sm font-normal text-content-muted">
              {" "}
              / {team.clientLimit === "unlimited" ? "∞" : team.clientLimit}
            </span>
          </p>
          {team.clientLimit !== "unlimited" && (
            <p className="mt-1 text-[11px] text-emerald-400">
              {team.clientsAvailable} available
            </p>
          )}
        </div>
      </div>

      {!team.isBillingOwner && (
        <p className="mt-3 text-xs text-amber-400">
          Billing is managed by your workspace owner.
        </p>
      )}
    </div>
  );
}
