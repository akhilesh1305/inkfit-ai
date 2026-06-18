"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getPlatformById,
  POST_STATUS_META,
  type ScheduledPost,
} from "@/lib/publishing";

interface PublishCalendarViewProps {
  posts: ScheduledPost[];
  onSelectPost?: (post: ScheduledPost) => void;
}

export function PublishCalendarView({ posts, onSelectPost }: PublishCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = monthStart.getDay();
  const paddedDays: (Date | null)[] = [...Array(startPad).fill(null), ...days];

  const scheduledPosts = posts.filter(
    (p) => (p.status === "scheduled" || p.status === "queued") && p.scheduledAt
  );

  function getPostsForDay(day: Date) {
    const key = format(day, "yyyy-MM-dd");
    return scheduledPosts.filter((p) => {
      if (!p.scheduledAt) return false;
      return format(parseISO(p.scheduledAt), "yyyy-MM-dd") === key;
    });
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0e] p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-content">Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-lg border border-white/[0.06] p-1.5 text-content-muted hover:text-content"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[120px] text-center text-sm font-medium text-content">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-lg border border-white/[0.06] p-1.5 text-content-muted hover:text-content"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-medium uppercase text-content-subtle">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {paddedDays.map((day, i) => {
          if (!day) {
            return <div key={`pad-${i}`} className="min-h-[80px]" />;
          }

          const dayPosts = getPostsForDay(day);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[80px] rounded-lg border p-1.5 transition",
                inMonth ? "border-white/[0.04] bg-white/[0.02]" : "border-transparent opacity-40",
                today && "border-brand-500/40 ring-1 ring-brand-500/20"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  today ? "bg-brand-500 text-white" : "text-content-muted"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayPosts.slice(0, 2).map((post) => {
                  const platform = getPlatformById(post.platform);
                  const meta = POST_STATUS_META[post.status];
                  return (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => onSelectPost?.(post)}
                      className={cn(
                        "block w-full truncate rounded px-1 py-0.5 text-left text-[9px] font-medium",
                        meta.bg,
                        meta.color
                      )}
                      title={post.title}
                    >
                      <span style={{ color: platform.color }}>●</span> {post.title}
                    </button>
                  );
                })}
                {dayPosts.length > 2 && (
                  <p className="px-1 text-[9px] text-content-subtle">+{dayPosts.length - 2} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
