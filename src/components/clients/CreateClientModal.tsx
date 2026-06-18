"use client";

import { useState, useEffect } from "react";
import { X, Building2, Globe, Palette } from "lucide-react";
import { BRAND_COLOR_PRESETS, type CreateClientInput } from "@/lib/clients";
import { cn } from "@/lib/utils";

interface CreateClientModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateClientInput) => Promise<void>;
  loading?: boolean;
}

export function CreateClientModal({
  open,
  onClose,
  onCreate,
  loading,
}: CreateClientModalProps) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [brandColor, setBrandColor] = useState(BRAND_COLOR_PRESETS[0]);

  useEffect(() => {
    if (open) {
      setName("");
      setIndustry("");
      setWebsite("");
      setBrandColor(BRAND_COLOR_PRESETS[0]);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !industry.trim()) return;
    await onCreate({
      name: name.trim(),
      industry: industry.trim(),
      website: website.trim() || undefined,
      brandColor,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600/30 to-accent-blue/30">
              <Building2 className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-content">Create Client</h3>
              <p className="text-xs text-content-subtle">Add a new client to your agency workspace</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost !rounded-lg !p-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="client-name">
              Client Name
            </label>
            <input
              id="client-name"
              className="input-field"
              placeholder="e.g. Acme Marketing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="client-industry">
              Industry
            </label>
            <input
              id="client-industry"
              className="input-field"
              placeholder="e.g. SaaS, Healthcare, E-commerce"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="client-website">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
              <input
                id="client-website"
                className="input-field !pl-10"
                placeholder="https://clientwebsite.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label flex items-center gap-2">
              <Palette className="h-3.5 w-3.5" />
              Brand Color
            </label>
            <div className="flex flex-wrap gap-2">
              {BRAND_COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBrandColor(color)}
                  className={cn(
                    "h-9 w-9 rounded-xl border-2 transition",
                    brandColor === color
                      ? "scale-110 border-white shadow-glow"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <input
              type="color"
              className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Creating..." : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
