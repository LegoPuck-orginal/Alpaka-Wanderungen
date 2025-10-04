"use client";

import { useState, useEffect } from "react";
import { formatContent } from "@/lib/contentUtils";

type SlotData = {
  id: string;
  start: string;
  end: string;
  capacity: number;
  booked: number;
  available: number;
  timeOfDay: "morning" | "afternoon";
  dateKey: string;
  tour: {
    id: string;
    title: string;
  };
};

type CalendarCopy = {
  prev: string;
  next: string;
  legendAvailable: string;
  legendPartial: string;
  legendFull: string;
  legendToday: string;
  loading: string;
  halfMorning: string;
  halfAfternoon: string;
  statusFull: string;
  statusFree: string;
  statusPartial: string;
};

export default function CalendarView({ tourId, copy }: { tourId?: string; copy: CalendarCopy }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSlots() {
      setLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);

      const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
        ...(tourId && { tourId }),
      });

      const res = await fetch(`/api/slots/calendar?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
      setLoading(false);
    }
    fetchSlots();
  }, [currentMonth, tourId]);

  function prevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay(); // 0 = Sonntag

  // Gruppiere Slots nach Datum
  const slotsByDate: Record<string, { morning: SlotData[]; afternoon: SlotData[] }> = {};
  slots.forEach((slot) => {
    const bucket = slotsByDate[slot.dateKey] ?? { morning: [], afternoon: [] };
    bucket[slot.timeOfDay].push(slot);
    slotsByDate[slot.dateKey] = bucket;
  });

  function evaluateStatus(collection?: SlotData[]) {
    if (!collection || collection.length === 0) return "free" as const;
    const hasFull = collection.some((s) => s.available <= 0);
    if (hasFull) return "full" as const;
    const hasPartial = collection.some((s) => s.booked > 0 && s.available > 0);
    if (hasPartial) return "partial" as const;
    return "free" as const;
  }

  function totalAvailable(collection?: SlotData[]) {
    if (!collection) return 0;
    return collection.reduce((sum, slot) => sum + Math.max(slot.available, 0), 0);
  }

  const days = [];
  const statusStyles: Record<"free" | "partial" | "full", string> = {
    free: "bg-white text-slate-900",
    partial: "bg-amber-300 text-slate-900",
    full: "bg-red-500 text-white",
  };
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = date.toLocaleDateString("sv-SE");
    const daySlots = slotsByDate[dateKey] || { morning: [], afternoon: [] };
    const morningStatus = evaluateStatus(daySlots.morning);
    const afternoonStatus = evaluateStatus(daySlots.afternoon);
    const isToday = date.toDateString() === new Date().toDateString();

    days.push(
      <div
        key={day}
        className={`flex min-h-[140px] flex-col rounded-3xl border border-[color:var(--border)]/70 bg-[color:var(--surface)]/70 transition ${
          isToday ? "ring-2 ring-[color:var(--accent)]/50" : ""
        }`}
      >
        <div className="flex items-center justify-between px-3 pt-3 text-xs font-semibold text-[color:var(--foreground)]">
          <span>{day}</span>
          <span className="text-[color:var(--foreground)]/45">
            {date.toLocaleDateString("de-DE", { weekday: "short" })}
          </span>
        </div>
        <div className="mt-2 flex flex-1 flex-col overflow-hidden rounded-[22px] border border-[color:var(--border)]/70">
          <div className={`flex flex-1 flex-col justify-center gap-1 px-3 py-2 text-xs font-semibold ${statusStyles[morningStatus]}`}>
            <span>{copy.halfMorning}</span>
            <span className="text-[11px] font-medium">
              {morningStatus === "full"
                ? copy.statusFull
                : morningStatus === "partial"
                ? formatContent(copy.statusPartial, { count: totalAvailable(daySlots.morning) })
                : copy.statusFree}
            </span>
          </div>
          <div className={`flex flex-1 flex-col justify-center gap-1 px-3 py-2 text-xs font-semibold border-t border-[color:var(--border)]/40 ${statusStyles[afternoonStatus]}`}>
            <span>{copy.halfAfternoon}</span>
            <span className="text-[11px] font-medium">
              {afternoonStatus === "full"
                ? copy.statusFull
                : afternoonStatus === "partial"
                ? formatContent(copy.statusPartial, { count: totalAvailable(daySlots.afternoon) })
                : copy.statusFree}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="glass-panel space-y-6 px-6 py-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="btn-secondary px-5 py-2 text-sm">{copy.prev}</button>
            <button onClick={nextMonth} className="btn-secondary px-5 py-2 text-sm">{copy.next}</button>
          </div>
          <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">
            {currentMonth.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
          </h2>
        </div>

        <div className="flex flex-wrap gap-6 text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]/55">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border border-[color:var(--border)] bg-white" />
            <span>{copy.legendAvailable}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-amber-300" />
            <span>{copy.legendPartial}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-red-500" />
            <span>{copy.legendFull}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border border-[color:var(--accent)]" />
            <span>{copy.legendToday}</span>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[color:var(--border)]/70 bg-[color:var(--surface-muted)]/70 py-12 text-center text-sm text-[color:var(--foreground)]/60">
            {copy.loading}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2 text-sm font-medium text-[color:var(--foreground)]/70">
            {["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"].map((d) => (
              <div key={d} className="text-center text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]/45">
                {d}
              </div>
            ))}
            {days}
          </div>
        )}
      </div>
    </div>
  );
}
