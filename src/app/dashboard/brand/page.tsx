"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Palette, Check } from "lucide-react";
import type { BrandKit } from "@/lib/brand";
import { DEFAULT_BRAND } from "@/lib/brand";
import { PageHeader } from "@/components/PageHeader";

export default function BrandPage() {
  const [brand, setBrand] = useState<BrandKit>(DEFAULT_BRAND);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/brand")
      .then((r) => r.json())
      .then((d) => { if (d.brand) setBrand(d.brand); })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brand),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Brand Kit"
        description="Define your brand identity. AI uses this to keep every piece of content consistent."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSave} className="card space-y-4">
          <div>
            <label className="label" htmlFor="companyName">Company / Personal Brand Name *</label>
            <input id="companyName" className="input-field" placeholder="e.g. Acme Marketing" value={brand.companyName} onChange={(e) => setBrand({ ...brand, companyName: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="industry">Industry</label>
            <input id="industry" className="input-field" placeholder="e.g. SaaS, Marketing Agency" value={brand.industry ?? ""} onChange={(e) => setBrand({ ...brand, industry: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="audience">Target Audience *</label>
            <textarea id="audience" className="input-field min-h-[80px]" placeholder="e.g. B2B founders and marketing directors" value={brand.targetAudience} onChange={(e) => setBrand({ ...brand, targetAudience: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="style">Writing Style *</label>
            <textarea id="style" className="input-field min-h-[80px]" placeholder="e.g. Direct, data-driven, short sentences" value={brand.writingStyle} onChange={(e) => setBrand({ ...brand, writingStyle: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="tone">Default Tone</label>
            <select id="tone" className="input-field" value={brand.tone} onChange={(e) => setBrand({ ...brand, tone: e.target.value })}>
              <option>Professional</option>
              <option>Casual</option>
              <option>Marketing</option>
              <option>Authoritative</option>
              <option>Conversational</option>
            </select>
          </div>
          <div>
            <label className="label">Brand Colors</label>
            <div className="grid grid-cols-3 gap-3">
              {(["primaryColor", "secondaryColor", "accentColor"] as const).map((key) => (
                <div key={key}>
                  <label className="mb-1 block text-xs capitalize text-content-subtle">{key.replace("Color", "")}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={brand[key]} onChange={(e) => setBrand({ ...brand, [key]: e.target.value })} className="h-10 w-10 cursor-pointer rounded border border-line" />
                    <input className="input-field flex-1 font-mono text-xs" value={brand[key]} onChange={(e) => setBrand({ ...brand, [key]: e.target.value })} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> :
              saved ? <><Check className="h-4 w-4" /> Saved!</> :
              <><Save className="h-4 w-4" /> Save Brand Kit</>}
          </button>
        </form>

        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-4 flex items-center gap-2 text-heading">
              <Palette className="h-5 w-5 text-brand-600" /> Brand Preview
            </h2>
            <div className="rounded-xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor})` }}>
              <p className="text-sm opacity-80">Brand Preview</p>
              <h3 className="mt-1 text-2xl font-bold">{brand.companyName || "Your Brand"}</h3>
              <p className="mt-2 text-sm opacity-90">{brand.targetAudience || "Your target audience"}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="h-8 flex-1 rounded" style={{ background: brand.primaryColor }} />
              <div className="h-8 flex-1 rounded" style={{ background: brand.secondaryColor }} />
              <div className="h-8 flex-1 rounded" style={{ background: brand.accentColor }} />
            </div>
          </div>
          <div className="card">
            <h3 className="text-heading">How Brand Kit Works</h3>
            <ul className="mt-3 space-y-2 text-sm text-content-muted">
              <li>• Blog posts match your voice and audience</li>
              <li>• LinkedIn content reflects your personal brand</li>
              <li>• SEO meta tags use your company name</li>
              <li>• Topic suggestions align with your industry</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
