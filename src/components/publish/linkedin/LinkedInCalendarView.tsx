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
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { POST_STATUS_META, type ScheduledPost } from "@/lib/publishing";

interface LinkedInCalendarViewProps {
  posts: ScheduledPost[];
  onSelectPost?: (post: ScheduledPost) => void;
}

export function LinkedInCalendarView({ posts, onSelectPost }: LinkedInCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

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

  const selectedPosts = selectedDay ? getPostsForDay(selectedDay) : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0A66C2] text-xs font-bold text-white">
              in
            </span>
            <h2 className="text-sm font-semibold text-white">Publishing calendar</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="rounded-lg border border-white/[0.06] p-1.5 text-content-muted hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[130px] text-center text-sm font-medium text-white">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="rounded-lg border border-white/[0.06] p-1.5 text-content-muted hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-content-subtle"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {paddedDays.map((day, i) => {
            if (!day) {
              return <div key={`pad-${i}`} className="min-h-[72px]" />;
            }

            const dayPosts = getPostsForDay(day);
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const selected = selectedDay && isSameDay(day, selectedDay);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "min-h-[72px] rounded-xl border p-1.5 text-left transition",
                  inMonth ? "border-white/[0.04] bg-white/[0.02]" : "border-transparent opacity-40",
                  today && "ring-1 ring-[#0A66C2]/40",
                  selected && "border-[#0A66C2]/50 bg-[#0A66C2]/10",
                  dayPosts.length > 0 && "hover:border-[#0A66C2]/30"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    today ? "bg-[#0A66C2] text-white" : "text-content-muted"
                  )}
                >
                  {format(day, "d")}
                </span>
                {dayPosts.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dayPosts.slice(0, 2).map((post) => {
                      const meta = POST_STATUS_META[post.status];
                      return (
                        <div
                          key={post.id}
                          className={cn(
                            "truncate rounded px-1 py-0.5 text-[9px] font-medium",
                            meta.bg,
                            meta.color
                          )}
                        >
                          {post.title}
                        </div>
                      );
                    })}
                    {dayPosts.length > 2 && (
                      <p className="px-1 text-[9px] text-content-subtle">+{dayPosts.length - 2}</p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-4">
        <h3 className="text-sm font-semibold text-white">
          {selectedDay ? format(selectedDay, "EEEE, MMM d") : "Select a day"}
        </h3>
        <p className="mt-0.5 text-xs text-content-muted">
          {selectedPosts.length} post{selectedPosts.length !== 1 ? "s" : ""} scheduled
        </p>
        <div className="mt-4 space-y-2">
          {selectedPosts.length === 0 ? (
            <p className="text-xs text-content-subtle">No posts scheduled for this day.</p>
          ) : (
            selectedPosts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => onSelectPost?.(post)}
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-left transition hover:border-[#0A66C2]/30"
              >
                <p className="truncate text-xs font-semibold text-white">{post.title}</p>
                <p className="mt-1 line-clamp-2 text-[10px] text-content-muted">{post.content}</p>
                {post.scheduledAt && (
                  <p className="mt-2 flex items-center gap-1 text-[10px] text-brand-300">
                    <Clock className="h-3 w-3" />
                    {format(parseISO(post.scheduledAt), "h:mm a")}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
