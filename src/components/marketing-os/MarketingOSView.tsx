"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Cpu,
  FileDown,
  Save,
  Check,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { GoalInputPanel } from "@/components/marketing-os/GoalInputPanel";
import { ExpandableSections } from "@/components/marketing-os/ExpandableSections";
import { exportToPDF } from "@/lib/export";
import {
  formatMarketingOSForExport,
  type MarketingOSOutput,
} from "@/lib/marketing-os";

interface SavedPlan {
  id: string;
  goal: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export function MarketingOSView() {
  const [goal, setGoal] = useState("");
  const [system, setSystem] = useState<MarketingOSOutput | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedList, setSavedList] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadSaved = useCallback(async () => {
    const res = await fetch("/api/marketing-os");
    if (res.ok) {
      const data = await res.json();
      setSavedList(data.saved ?? []);
    }
  }, []);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  async function apiPost(body: Record<string, unknown>) {
    const res = await fetch("/api/marketing-os", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleGenerate() {
    if (!goal.trim() || loading) return;
    setLoading(true);
    setSystem(null);
    setSavedId(null);
    try {
      const result = await apiPost({ action: "generate", goal: goal.trim() });
      if (result.system) {
        setSystem(result.system);
        showToast(result.system.live ? "AI-generated Marketing OS ready" : "Marketing OS generated");
      } else {
        showToast(result.error ?? "Generation failed. Please try again.");
      }
    } catch {
      showToast("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate(sectionId: string, content: string) {
    if (!system) return;
    setRegeneratingId(sectionId);
    try {
      const result = await apiPost({
        action: "regenerate-section",
        goal: system.goal,
        sectionId,
        content,
      });
      if (result.section) {
        setSystem((prev) =>
          prev
            ? {
                ...prev,
                sections: prev.sections.map((s) =>
                  s.id === sectionId ? { ...s, content: result.section.content } : s
                ),
              }
            : prev
        );
        showToast(`${result.section.title} regenerated`);
      } else {
        showToast(result.error ?? "Regeneration failed.");
      }
    } catch {
      showToast("Network error. Please try again.");
    } finally {
      setRegeneratingId(null);
    }
  }

  async function handleSave() {
    if (!system) return;
    setSaving(true);
    try {
      const result = await apiPost({
        action: "save",
        id: savedId,
        system,
      });
      if (result.saved) {
        setSavedId(result.id);
        loadSaved();
        showToast("Strategy saved");
      } else {
        showToast(result.error ?? "Save failed.");
      }
    } catch {
      showToast("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLoad(id: string) {
    try {
      const result = await apiPost({ action: "load", id });
      if (result.system) {
        setSystem(result.system);
        setGoal(result.system.goal);
        setSavedId(result.system.id ?? id);
        showToast("Strategy loaded");
      } else {
        showToast(result.error ?? "Could not load strategy.");
      }
    } catch {
      showToast("Network error. Please try again.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiPost({ action: "delete", id });
      if (savedId === id) setSavedId(null);
      await loadSaved();
      showToast("Strategy deleted");
    } catch {
      showToast("Could not delete strategy.");
    }
  }

  function handleExport() {
    if (!system) return;
    void exportToPDF(system.title, formatMarketingOSForExport(system));
    showToast("PDF exported");
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Cpu className="h-7 w-7 text-brand-400" />
            Marketing OS
          </span>
        }
        description="Enter a business goal — get a complete AI marketing system in one click."
      >
        {system?.live && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
            AI-enhanced
          </span>
        )}
      </PageHeader>

      {toast && (
        <div className="mb-4 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-2.5 text-sm text-brand-200">
          {toast}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <GoalInputPanel
            goal={goal}
            onGoalChange={setGoal}
            onGenerate={handleGenerate}
            loading={loading}
          />

          {savedList.length > 0 && (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0e] p-4">
              <div className="mb-3 flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-content-subtle" />
                <h3 className="text-sm font-semibold text-content">Saved strategies</h3>
              </div>
              <div className="space-y-2">
                {savedList.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] p-2"
                  >
                    <button
                      type="button"
                      onClick={() => handleLoad(s.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-xs font-medium text-content">{s.title}</p>
                      <p className="truncate text-[10px] text-content-subtle">{s.goal}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="shrink-0 rounded p-1 text-content-subtle hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0a0a0c]"
              >
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-400" />
                  <Cpu className="absolute inset-0 m-auto h-7 w-7 text-brand-400" />
                </div>
                <p className="mt-5 text-sm font-medium text-content-muted">
                  Architecting your marketing system…
                </p>
                <p className="mt-1 text-xs text-content-subtle">
                  Strategy · Content · Funnel · SEO · Calendar
                </p>
              </motion.div>
            )}

            {!loading && !system && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-center"
              >
                <Cpu className="h-14 w-14 text-content-subtle" />
                <p className="mt-4 text-lg font-medium text-content">Your Marketing OS awaits</p>
                <p className="mt-1 max-w-md text-sm text-content-subtle">
                  Enter a business goal to generate strategy, personas, funnel, SEO, LinkedIn, blog
                  plan, 30-day calendar, and weekly actions.
                </p>
              </motion.div>
            )}

            {!loading && system && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#14141c] to-[#0a0a0c]">
                  <div className="border-b border-white/[0.06] p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-400">
                          Marketing OS Blueprint
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-content">{system.title}</h2>
                        <p className="mt-2 text-sm italic text-content-muted">
                          &ldquo;{system.goal}&rdquo;
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleExport}
                          className="btn-secondary text-xs"
                        >
                          <FileDown className="h-3.5 w-3.5" />
                          Export PDF
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving}
                          className="btn-primary text-xs"
                        >
                          {saving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : savedId ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                          {savedId ? "Saved" : "Save strategy"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-white/[0.06] bg-white/[0.02] px-6 py-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
                      Executive summary
                    </p>
                    <p className="mt-2 text-[15px] leading-relaxed text-content-muted">
                      {system.executiveSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-px bg-white/[0.04] sm:grid-cols-5">
                    {system.sections.slice(0, 5).map((s) => (
                      <div key={s.id} className="bg-[#0a0a0c] px-3 py-3 text-center">
                        <p className="text-lg font-bold text-brand-300">{s.title.split(" ")[0]}</p>
                        <p className="text-[9px] text-content-subtle">{s.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <ExpandableSections
                  sections={system.sections}
                  goal={system.goal}
                  regeneratingId={regeneratingId}
                  onRegenerate={handleRegenerate}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
