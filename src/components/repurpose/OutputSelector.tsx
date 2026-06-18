"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  REPURPOSE_OUTPUTS,
  type RepurposeOutputId,
} from "@/lib/repurpose-content";

interface OutputSelectorProps {
  selected: RepurposeOutputId[];
  onChange: (selected: RepurposeOutputId[]) => void;
}

export function OutputSelector({ selected, onChange }: OutputSelectorProps) {
  function toggle(id: RepurposeOutputId) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  function selectAll() {
    onChange(REPURPOSE_OUTPUTS.map((o) => o.id));
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 }}
      className="card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="section-title">Select Outputs</h2>
          <p className="mt-1 text-sm text-content-muted">
            Choose which formats to generate from your content.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={selectAll} className="btn-ghost text-xs">
            Select all
          </button>
          <button type="button" onClick={clearAll} className="btn-ghost text-xs">
            Clear
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {REPURPOSE_OUTPUTS.map((option, i) => {
          const isSelected = selected.includes(option.id);
          const Icon = option.icon;
          return (
            <motion.button
              key={option.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
              whileHover={{ y: -2 }}
              onClick={() => toggle(option.id)}
              className={cn(
                "card card-hover relative flex flex-col items-start p-4 text-left transition-all",
                isSelected && "border-brand-500/40 shadow-glow"
              )}
            >
              {isSelected && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600">
                  <Check className="h-3 w-3 text-white" />
                </span>
              )}
              <div className="icon-gradient h-9 w-9">
                <Icon className="h-4 w-4 text-white" />
              </div>
              <p className="mt-3 text-sm font-semibold text-content">{option.label}</p>
              <p className="mt-1 text-xs text-content-subtle">{option.description}</p>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
