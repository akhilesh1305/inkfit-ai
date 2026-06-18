"use client";

import { useState } from "react";
import {
  ChevronDown,
  RefreshCw,
  Loader2,
  Target,
  Megaphone,
  Layers,
  Users,
  Filter,
  Search,
  Linkedin,
  FileText,
  Calendar,
  ClipboardList,
  Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MarketingOSSection } from "@/lib/marketing-os";
import { getSectionMeta } from "@/lib/marketing-os";

const SECTION_ICONS: Record<string, typeof Target> = {
  "marketing-strategy": Target,
  "content-strategy": Megaphone,
  "content-pillars": Layers,
  "audience-personas": Users,
  "funnel-strategy": Filter,
  "seo-plan": Search,
  "linkedin-strategy": Linkedin,
  "blog-strategy": FileText,
  "content-calendar": Calendar,
  "weekly-action-plan": ClipboardList,
};

interface ExpandableSectionsProps {
  sections: MarketingOSSection[];
  goal: string;
  regeneratingId: string | null;
  onRegenerate: (sectionId: string, content: string) => void;
}

export function ExpandableSections({
  sections,
  goal,
  regeneratingId,
  onRegenerate,
}: ExpandableSectionsProps) {
  return (
    <div className="space-y-3">
      {sections.map((section, index) => (
        <SectionAccordion
          key={section.id}
          section={section}
          index={index}
          goal={goal}
          defaultOpen={index === 0}
          regenerating={regeneratingId === section.id}
          onRegenerate={() => onRegenerate(section.id, section.content)}
        />
      ))}
    </div>
  );
}

function SectionAccordion({
  section,
  index,
  goal,
  defaultOpen,
  regenerating,
  onRegenerate,
}: {
  section: MarketingOSSection;
  index: number;
  goal: string;
  defaultOpen: boolean;
  regenerating: boolean;
  onRegenerate: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = getSectionMeta(section.id);
  const Icon = SECTION_ICONS[section.id] ?? Briefcase;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0c]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-white/[0.02]"
      >
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
            meta.gradient
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
            Section {index + 1}
          </p>
          <h3 className="text-base font-bold text-content">{section.title}</h3>
          <p className="text-xs text-content-subtle">{meta.subtitle}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-content-subtle transition",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="border-t border-white/[0.06] px-5 pb-5 pt-4">
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  disabled={regenerating || !goal}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegenerate();
                  }}
                  className="btn-secondary py-1.5 text-xs"
                >
                  {regenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Regenerate section
                </button>
              </div>
              <div className="prose-invert max-w-none space-y-1">
                {renderContent(section.content)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h4 key={i} className="mb-2 mt-4 text-sm font-bold text-content first:mt-0">
          {line.replace(/^##\s*/, "")}
        </h4>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h5 key={i} className="mb-1 mt-3 text-sm font-semibold text-content">
          {line.replace(/^###\s*/, "")}
        </h5>
      );
    }
    if (line.startsWith("|")) {
      return (
        <p key={i} className="overflow-x-auto font-mono text-[11px] text-content-muted">
          {line}
        </p>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={i} className="ml-4 list-disc text-sm leading-relaxed text-content-muted">
          {line.replace(/^- /, "").replace(/\*\*/g, "")}
        </li>
      );
    }
    if (/^\d+\./.test(line)) {
      return (
        <li key={i} className="ml-4 list-decimal text-sm leading-relaxed text-content-muted">
          {line.replace(/^\d+\.\s*/, "").replace(/\*\*/g, "")}
        </li>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return (
      <p key={i} className="text-sm leading-relaxed text-content-muted">
        {line.replace(/\*\*/g, "")}
      </p>
    );
  });
}