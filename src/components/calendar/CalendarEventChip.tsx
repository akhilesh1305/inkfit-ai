"use client";

import { GripVertical } from "lucide-react";
import {
  getContentTypeLabel,
  getPlatformById,
  STATUS_CONFIG,
  type CalendarPlanItem,
} from "@/lib/calendar-plan";
import { cn } from "@/lib/utils";

interface CalendarEventChipProps {
  item: CalendarPlanItem;
  dragging?: boolean;
  compact?: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}

export function CalendarEventChip({
  item,
  dragging,
  compact,
  onDragStart,
  onDragEnd,
}: CalendarEventChipProps) {
  const platform = getPlatformById(item.platformId);
  const status = STATUS_CONFIG[item.status];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "group cursor-grab rounded-lg border border-white/[0.08] bg-ink-surface/90 p-2 shadow-sm transition active:cursor-grabbing",
        dragging && "opacity-40 scale-95",
        !dragging && "hover:border-brand-500/30 hover:shadow-glow"
      )}
    >
      <div className="flex items-start gap-1">
        <GripVertical className="mt-0.5 h-3 w-3 shrink-0 text-content-subtle opacity-0 transition group-hover:opacity-100" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: platform.color }}
            />
            <p
              className={cn(
                "truncate font-medium text-content",
                compact ? "text-[10px] leading-tight" : "text-xs"
              )}
              title={item.topic}
            >
              {item.topic}
            </p>
          </div>
          {!compact && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-content-subtle">
                {getContentTypeLabel(item.contentType)}
              </span>
              <span
                className={cn(
                  "rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                  status.className
                )}
              >
                {status.label}
              </span>
            </div>
          )}
          {compact && (
            <p className="mt-0.5 truncate text-[9px] text-content-subtle">
              {getContentTypeLabel(item.contentType)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
