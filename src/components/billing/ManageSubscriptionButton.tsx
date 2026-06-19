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

  async function openPortal() {
    setLoading(true);
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
    setLoading(false);
  }

  if (!stripeEnabled || !stripeCustomerId) return null;

  return (
    <button
      type="button"
      className="btn-secondary flex items-center gap-2"
      disabled={loading}
      onClick={openPortal}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ExternalLink className="h-4 w-4" />
      )}
      Manage subscription
    </button>
  );
}
