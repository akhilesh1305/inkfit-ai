"use client";

import {
  FileText,
  Search,
  Linkedin,
  Layers,
  Image,
  Calendar,
  GripVertical,
} from "lucide-react";
import { WORKFLOW_NODE_LIST, type WorkflowNodeType } from "@/lib/workflows";
import { cn } from "@/lib/utils";

const ICONS = {
  FileText,
  Search,
  Linkedin,
  Layers,
  Image,
  Calendar,
};

interface WorkflowNodePaletteProps {
  onAddNode: (type: WorkflowNodeType) => void;
}

export function WorkflowNodePalette({ onAddNode }: WorkflowNodePaletteProps) {
  function handleDragStart(e: React.DragEvent, type: WorkflowNodeType) {
    e.dataTransfer.setData("application/workflow-node", type);
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Nodes</h3>
        <p className="mt-0.5 text-[11px] text-content-muted">Drag onto canvas</p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {WORKFLOW_NODE_LIST.map((meta) => {
          const Icon = ICONS[meta.icon as keyof typeof ICONS] ?? FileText;
          return (
            <button
              key={meta.type}
              type="button"
              draggable
              onDragStart={(e) => handleDragStart(e, meta.type)}
              onClick={() => onAddNode(meta.type)}
              className={cn(
                "group flex w-full items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-left transition",
                "hover:border-brand-500/30 hover:bg-white/[0.06] active:scale-[0.98]"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-lg",
                  meta.gradient
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <GripVertical className="h-3 w-3 text-content-subtle opacity-0 transition group-hover:opacity-100" />
                  <p className="text-sm font-medium text-white">{meta.label}</p>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-content-muted">
                  {meta.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
