"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import {
  WORKSPACE_TYPES,
  type WorkspaceType,
} from "@/lib/workspaces";
import { cn } from "@/lib/utils";

interface CreateWorkspaceModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    type: WorkspaceType;
    description: string;
  }) => Promise<void>;
  saving?: boolean;
}

export function CreateWorkspaceModal({
  open,
  onClose,
  onCreate,
  saving,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<WorkspaceType>("team");
  const [description, setDescription] = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onCreate({ name, type, description });
    setName("");
    setDescription("");
    setType("team");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#121214] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Create workspace</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-content-muted hover:bg-white/[0.06]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="label">Workspace type</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {WORKSPACE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition",
                    type === t.id
                      ? "border-brand-500/50 bg-brand-500/10"
                      : "border-white/[0.08] hover:border-white/15"
                  )}
                >
                  <span className="text-xl">{t.icon}</span>
                  <p className="mt-1 text-sm font-semibold text-white">{t.label}</p>
                  <p className="mt-0.5 text-[10px] text-content-muted leading-snug">
                    {t.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Name</label>
            <input
              className="input-field mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                type === "personal"
                  ? "My Workspace"
                  : type === "team"
                    ? "Marketing Team"
                    : "Client Name"
              }
              required
            />
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <textarea
              className="input-field mt-1.5 min-h-[80px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this workspace for?"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="btn-primary"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
