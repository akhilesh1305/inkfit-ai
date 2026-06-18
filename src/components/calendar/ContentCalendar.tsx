"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getContentTypeLabel,
  getPlatformById,
  STATUS_CONFIG,
  type CalendarPlanItem,
} from "@/lib/calendar-plan";
import { CalendarEventChip } from "@/components/calendar/CalendarEventChip";
import { cn } from "@/lib/utils";

interface ContentCalendarProps {
  items: CalendarPlanItem[];
  onItemsChange: (items: CalendarPlanItem[]) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function ContentCalendar({
  items,
  onItemsChange,
  currentMonth,
  onMonthChange,
}: ContentCalendarProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = monthStart.getDay();
  const paddedDays: (Date | null)[] = [...Array(startPad).fill(null), ...days];

  function getItemsForDay(day: Date) {
    const key = format(day, "yyyy-MM-dd");
    return items.filter((item) => item.date === key);
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDropTarget(null);
  }

  function handleDragOver(e: React.DragEvent, dateKey: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(dateKey);
  }

  function handleDragLeave() {
    setDropTarget(null);
  }

  function handleDrop(e: React.DragEvent, dateKey: string) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;

    onItemsChange(
      items.map((item) => (item.id === id ? { ...item, date: dateKey } : item))
    );
    setDraggingId(null);
    setDropTarget(null);
  }

  const selectedItems = selectedDate ? getItemsForDay(selectedDate) : [];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-surface/60 shadow-card">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15">
              <Calendar className="h-4 w-4 text-brand-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-content">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <p className="text-xs text-content-subtle">
                {items.length} items · drag to reschedule
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => onMonthChange(subMonths(currentMonth, 1))}
              className="btn-ghost !rounded-lg !p-2"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onMonthChange(new Date())}
              className="btn-ghost !rounded-lg px-3 text-xs font-semibold text-brand-400"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onMonthChange(addMonths(currentMonth, 1))}
              className="btn-ghost !rounded-lg !p-2"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-white/10">
          {weekDays.map((d) => (
            <div
              key={d}
              className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-content-subtle"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7">
          {paddedDays.map((day, i) => {
            if (!day) {
              return (
                <div
                  key={`pad-${i}`}
                  className="min-h-[100px] border-b border-r border-white/[0.04] bg-white/[0.01] last:border-r-0"
                />
              );
            }

            const dateKey = format(day, "yyyy-MM-dd");
            const dayItems = getItemsForDay(day);
            const today = isToday(day);
            const selected = selectedDate && isSameDay(day, selectedDate);
            const isDrop = dropTarget === dateKey;

            return (
              <div
                key={dateKey}
                onDragOver={(e) => handleDragOver(e, dateKey)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, dateKey)}
                className={cn(
                  "min-h-[100px] border-b border-r border-white/[0.06] p-1.5 transition last:border-r-0 sm:min-h-[120px] sm:p-2",
                  isDrop && "bg-brand-500/10 ring-2 ring-inset ring-brand-500/40",
                  selected && !isDrop && "bg-brand-500/5",
                  !isSameMonth(day, currentMonth) && "opacity-50"
                )}
              >
                <button
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className="mb-1.5 flex w-full items-center justify-between"
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                      today
                        ? "bg-gradient-to-br from-brand-600 to-accent-blue text-white shadow-glow"
                        : "text-content-muted hover:bg-white/10"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {dayItems.length > 0 && (
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-content-subtle">
                      {dayItems.length}
                    </span>
                  )}
                </button>

                <div className="space-y-1">
                  {dayItems.slice(0, 2).map((item) => (
                    <CalendarEventChip
                      key={item.id}
                      item={item}
                      compact
                      dragging={draggingId === item.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                  {dayItems.length > 2 && (
                    <p className="px-1 text-[10px] text-content-subtle">
                      +{dayItems.length - 2} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card"
          >
            <h3 className="text-sm font-semibold text-content">
              {format(selectedDate, "EEEE, MMMM d")}
            </h3>
            {selectedItems.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {selectedItems.map((item) => {
                  const platform = getPlatformById(item.platformId);
                  const status = STATUS_CONFIG[item.status];
                  return (
                    <li key={item.id}>
                      <CalendarEventChip
                        item={item}
                        dragging={draggingId === item.id}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                      <div className="mt-2 flex flex-wrap items-center gap-2 px-1">
                        <span className="inline-flex items-center gap-1.5 text-xs text-content-subtle">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: platform.color }}
                          />
                          {platform.name}
                        </span>
                        <span className="text-content-subtle">·</span>
                        <span className="text-xs text-content-subtle">
                          {getContentTypeLabel(item.contentType)}
                        </span>
                        <span className="text-content-subtle">·</span>
                        <span
                          className={cn(
                            "rounded-md border px-1.5 py-0.5 text-xs font-medium",
                            status.className
                          )}
                        >
                          {status.label}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-content-subtle">
                No content scheduled. Drag an item from another day or generate a new plan.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {items.length === 0 && (
        <div className="card flex flex-col items-center justify-center border-dashed py-16 text-center">
          <Calendar className="h-10 w-10 text-content-subtle" />
          <p className="mt-3 font-medium text-content">No calendar plan yet</p>
          <p className="mt-1 max-w-sm text-sm text-content-subtle">
            Enter your industry, goals, and platforms — then generate a 30-day content plan.
          </p>
        </div>
      )}
    </div>
  );
}
