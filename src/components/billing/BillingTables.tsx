"use client";

import { Download, FileText } from "lucide-react";
import type { BillingInvoice, BillingHistoryItem } from "@/lib/billing";
import { formatPrice } from "@/lib/billing";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  open: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  void: "bg-white/10 text-content-subtle border-white/10",
  draft: "bg-white/10 text-content-subtle border-white/10",
};

interface BillingTablesProps {
  invoices: BillingInvoice[];
  billingHistory: BillingHistoryItem[];
}

export function BillingTables({ invoices, billingHistory }: BillingTablesProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-surface/60 shadow-card">
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <FileText className="h-4 w-4 text-brand-400" />
          <h3 className="font-semibold text-content">Invoices</h3>
        </div>
        {invoices.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-content-subtle">
            No invoices yet — upgrade to a paid plan
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
                  <th className="px-5 py-3">Period</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-content">{inv.periodLabel}</p>
                      <p className="text-xs text-content-subtle">{inv.description}</p>
                    </td>
                    <td className="px-5 py-3 text-content-muted">
                      {formatPrice(inv.amount)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-lg border px-2 py-0.5 text-xs font-medium capitalize",
                          STATUS_STYLES[inv.status]
                        )}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {inv.pdfUrl && (
                        <button
                          type="button"
                          className="btn-ghost !rounded-lg !p-2"
                          title="Download"
                          onClick={() => window.open(inv.pdfUrl, "_blank", "noopener,noreferrer")}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-surface/60 shadow-card">
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="font-semibold text-content">Billing History</h3>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {billingHistory.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-content">{item.event}</p>
                <p className="text-xs text-content-subtle">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {" · "}
                  {item.plan}
                </p>
              </div>
              {item.amount !== undefined && (
                <span className="text-sm font-semibold text-content-muted">
                  {formatPrice(item.amount)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
