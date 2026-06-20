"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

interface ManageSubscriptionButtonProps {
  stripeCustomerId?: string;
  stripeEnabled?: boolean;
}

export function ManageSubscriptionButton({
  stripeCustomerId,
  stripeEnabled,
}: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "portal" }),
      });
      const data = await res.json();
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
        return;
      }
      setError(data.error ?? "Could not open billing portal. Try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!stripeEnabled || !stripeCustomerId) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        className="btn-secondary flex items-center gap-2"
        disabled={loading}
        onClick={() => void openPortal()}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ExternalLink className="h-4 w-4" />
        )}
        Manage subscription
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
