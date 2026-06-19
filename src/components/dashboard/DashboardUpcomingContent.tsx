"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  status: string;
  platform?: string;
  date: string;
}

export function DashboardUpcomingContent() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((data) => {
        const list = (data.events ?? []) as CalendarEvent[];
        setEvents(list.slice(0, 4));
      })
      .catch(() => setEvents([]));
  }, []);

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">Upcoming Content</h2>
        <Link href="/dashboard/calendar" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          View calendar →
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="py-6 text-center text-sm text-content-muted">
          No scheduled content yet.{" "}
          <Link href="/dashboard/employee" className="text-brand-400 hover:underline">
            Run AI Employee
          </Link>{" "}
          to build your calendar.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-medium text-content">{event.title}</p>
                <p className="text-sm text-content-subtle">
                  {event.type} · {event.status}
                  {event.platform ? ` · ${event.platform}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-sm text-content-subtle">{event.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
