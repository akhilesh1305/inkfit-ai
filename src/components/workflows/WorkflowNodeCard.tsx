"use client";

import {
  FileText,
  Search,
  Linkedin,
  Layers,
  Image,
  Calendar,
  Trash2,
  CheckCircle2,
  Loader2,
  XCircle,
  Circle,
} from "lucide-react";
import {
  WORKFLOW_NODE_META,
  type WorkflowNode,
  type WorkflowNodeType,
  type WorkflowStepResult,
} from "@/lib/workflows";
import { cn } from "@/lib/utils";

const ICONS = {
  FileText,
  Search,
  Linkedin,
  Layers,
  Image,
  Calendar,
};

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 88;

interface WorkflowNodeCardProps {
  node: WorkflowNode;
  selected?: boolean;
  runStep?: WorkflowStepResult;
  connectSource?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDragStart: (e: React.PointerEvent) => void;
  onPortClick: (port: "input" | "output") => void;
}

export function WorkflowNodeCard({
  node,
  selected,
  runStep,
  connectSource,
  onSelect,
  onDelete,
  onDragStart,
  onPortClick,
}: WorkflowNodeCardProps) {
  const meta = WORKFLOW_NODE_META[node.type];
  const Icon = ICONS[meta.icon as keyof typeof ICONS] ?? FileText;

  const statusIcon = runStep ? (
    runStep.status === "completed" ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
    ) : runStep.status === "running" ? (
      <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-400" />
    ) : runStep.status === "failed" ? (
      <XCircle className="h-3.5 w-3.5 text-red-400" />
    ) : (
      <Circle className="h-3.5 w-3.5 text-content-subtle" />
    )
  ) : null;

  return (
    <div
      className="absolute"
      style={{ left: node.position.x, top: node.position.y, width: NODE_WIDTH }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Input port */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPortClick("input");
        }}
        className={cn(
          "absolute left-1/2 top-0 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0c0c0e] transition",
          connectSource ? "bg-brand-400 ring-2 ring-brand-400/50" : "bg-white/30 hover:bg-brand-400"
        )}
        title="Input"
      />

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border bg-[#121214]/95 shadow-xl backdrop-blur-sm transition",
          selected
            ? "border-brand-500/50 ring-2 ring-brand-500/20"
            : "border-white/[0.1] hover:border-white/20",
          runStep?.status === "running" && "ring-2 ring-brand-500/40",
          runStep?.status === "completed" && "border-emerald-500/30",
          runStep?.status === "failed" && "border-red-500/40"
        )}
      >
        <div
          className={cn("h-1 w-full bg-gradient-to-r", meta.gradient)}
        />
        <div
          className="flex cursor-grab items-center gap-2.5 p-3 active:cursor-grabbing"
          onPointerDown={onDragStart}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white",
              meta.gradient
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-xs font-semibold text-white">{meta.label}</p>
              {statusIcon}
            </div>
            {runStep?.preview ? (
              <p className="mt-0.5 truncate text-[10px] text-emerald-400/90">{runStep.preview}</p>
            ) : (
              <p className="mt-0.5 truncate text-[10px] text-content-muted">{meta.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded p-1 text-content-subtle hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Output port */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPortClick("output");
        }}
        className={cn(
          "absolute bottom-0 left-1/2 z-10 h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-[#0c0c0e] transition",
          "bg-white/30 hover:bg-brand-400"
        )}
        title="Output — click to connect"
      />
    </div>
  );
}

export function getNodePortPosition(
  node: WorkflowNode,
  port: "input" | "output"
): { x: number; y: number } {
  const cx = node.position.x + NODE_WIDTH / 2;
  if (port === "input") return { x: cx, y: node.position.y };
  return { x: cx, y: node.position.y + NODE_HEIGHT };
}

export function nodeTypeLabel(type: WorkflowNodeType): string {
  return WORKFLOW_NODE_META[type].label;
}
