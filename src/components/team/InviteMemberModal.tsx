"use client";

import { useEffect, useState } from "react";
import { X, UserPlus, Mail } from "lucide-react";
import { TEAM_ROLES, type TeamRole } from "@/lib/team";
import { cn } from "@/lib/utils";

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  onInvite: (data: { name: string; email: string; role: TeamRole }) => Promise<void>;
  defaultRole: TeamRole;
  loading?: boolean;
}

export function InviteMemberModal({
  open,
  onClose,
  onInvite,
  defaultRole,
  loading,
}: InviteMemberModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>(defaultRole);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setRole(defaultRole);
      setError("");
    }
  }, [open, defaultRole]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim()) return;

    try {
      await onInvite({ name: name.trim(), email: email.trim(), role });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="card w-full max-w-md animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600/30 to-accent-blue/30">
              <UserPlus className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-content">Invite Team Member</h3>
              <p className="text-xs text-content-subtle">Send an invitation to collaborate</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost !rounded-lg !p-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="invite-name">
              Name
            </label>
            <input
              id="invite-name"
              className="input-field"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="invite-email">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
              <input
                id="invite-email"
                type="email"
                className="input-field !pl-10"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Role</label>
            <div className="space-y-2">
              {TEAM_ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
                    role === r.id
                      ? "border-brand-500/50 bg-brand-500/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                      role === r.id ? "border-brand-500 bg-brand-500" : "border-white/20"
                    )}
                  >
                    {role === r.id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-content">{r.label}</p>
                    <p className="text-xs text-content-subtle">{r.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
