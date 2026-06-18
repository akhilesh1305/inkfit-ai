"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Linkedin,
  BookOpen,
  MessageSquareQuote,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PersonalBrandOutput } from "@/lib/personal-brand";
import { cn } from "@/lib/utils";

const TYPE_STYLES = {
  post: "bg-brand-500/15 text-brand-300 border-brand-500/25",
  story: "bg-accent-cyan/15 text-cyan-300 border-accent-cyan/25",
  engage: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  repurpose: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  commentary: "bg-violet-500/15 text-violet-300 border-violet-500/25",
};

type ContentTab = "plan" | "linkedin" | "stories" | "commentary";

interface BrandContentPanelProps {
  output: PersonalBrandOutput | null;
  loading: boolean;
}

export function BrandContentPanel({ output, loading }: BrandContentPanelProps) {
  const router = useRouter();
  const [tab, setTab] = useState<ContentTab>("plan");
  const [copied, setCopied] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="card flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
      </div>
    );
  }

  if (!output) return null;

  async function copyText(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function openInLinkedInStudio(hook: string, angle: string) {
    sessionStorage.setItem(
      "inkfit-template",
      JSON.stringify({ title: hook, body: `${hook}\n\n${angle}` })
    );
    router.push("/dashboard/linkedin");
  }

  const tabs: { id: ContentTab; label: string; icon: typeof Calendar }[] = [
    { id: "plan", label: "Weekly Plan", icon: Calendar },
    { id: "linkedin", label: "LinkedIn Ideas", icon: Linkedin },
    { id: "stories", label: "Story Ideas", icon: BookOpen },
    { id: "commentary", label: "Commentary", icon: MessageSquareQuote },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-ink-surface/60 shadow-card"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
              tab === t.id
                ? "bg-brand-600 text-white"
                : "text-content-muted hover:bg-white/[0.05] hover:text-white"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6">
        {tab === "plan" && (
          <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.06]">
            {output.weeklyContentPlan.map((item, i) => (
              <div
                key={i}
                className="flex flex-wrap items-start gap-3 px-4 py-4 transition hover:bg-white/[0.02] sm:items-center"
              >
                <span className="w-20 shrink-0 text-sm font-semibold text-white">{item.day}</span>
                <span
                  className={cn(
                    "shrink-0 rounded-lg border px-2 py-0.5 text-[9px] font-semibold uppercase",
                    TYPE_STYLES[item.type]
                  )}
                >
                  {item.type}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-0.5 text-xs text-content-muted">{item.action}</p>
                  <p className="mt-1 text-[10px] text-content-subtle">Format: {item.format}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "linkedin" && (
          <div className="space-y-3">
            {output.linkedInPostIdeas.map((idea, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <p className="font-semibold text-white">{idea.hook}</p>
                <div className="mt-2 grid gap-1 text-xs text-content-muted sm:grid-cols-3">
                  <span>
                    <strong className="text-content-subtle">Angle:</strong> {idea.angle}
                  </span>
                  <span>
                    <strong className="text-content-subtle">Format:</strong> {idea.format}
                  </span>
                  <span>
                    <strong className="text-content-subtle">CTA:</strong> {idea.cta}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="btn-primary !px-3 !py-1.5 text-xs"
                    onClick={() => openInLinkedInStudio(idea.hook, idea.angle)}
                  >
                    Use in LinkedIn Studio <ArrowRight className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    className="btn-ghost !px-2 !py-1.5 text-xs"
                    onClick={() => copyText(`${idea.hook}\n\n${idea.angle}\n\nCTA: ${idea.cta}`, `li-${i}`)}
                  >
                    {copied === `li-${i}` ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "stories" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {output.storyIdeas.map((story, i) => (
              <div
                key={i}
                className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4"
              >
                <p className="font-semibold text-white">{story.title}</p>
                <p className="mt-2 text-xs text-content-muted">
                  <span className="font-medium text-cyan-400">Arc:</span> {story.arc}
                </p>
                <p className="mt-1 text-xs text-content-muted">
                  <span className="font-medium text-cyan-400">Emotion:</span> {story.emotion}
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === "commentary" && (
          <div className="space-y-4">
            {output.industryCommentary.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4"
              >
                <p className="font-semibold text-white">{item.topic}</p>
                <p className="mt-1 text-sm italic text-violet-300">{item.stance}</p>
                <ul className="mt-3 space-y-1.5">
                  {item.talkingPoints.map((point, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-content-muted">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
