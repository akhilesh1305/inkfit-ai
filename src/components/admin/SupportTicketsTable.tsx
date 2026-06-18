"use client";

import { cn } from "@/lib/utils";
import {
  TICKET_PRIORITY_STYLES,
  TICKET_STATUS_STYLES,
  type SupportTicket,
} from "@/lib/admin";

interface SupportTicketsTableProps {
  tickets: SupportTicket[];
  onResolve: (ticketId: string) => void;
}

export function SupportTicketsTable({ tickets, onResolve }: SupportTicketsTableProps) {
  return (
    <div className="space-y-2">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] text-content-subtle">{ticket.id}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                  TICKET_PRIORITY_STYLES[ticket.priority]
                )}
              >
                {ticket.priority}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                  TICKET_STATUS_STYLES[ticket.status]
                )}
              >
                {ticket.status.replace("_", " ")}
              </span>
              <span className="text-[10px] text-content-subtle">{ticket.category}</span>
            </div>
            <p className="mt-1 font-medium text-content">{ticket.subject}</p>
            <p className="text-xs text-content-subtle">
              {ticket.user} · {ticket.email}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-[10px] text-content-subtle">
              {new Date(ticket.createdAt).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            {ticket.status !== "resolved" && (
              <button
                type="button"
                onClick={() => onResolve(ticket.id)}
                className="btn-secondary py-1.5 text-xs"
              >
                Resolve
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
