import { prisma } from "@/lib/prisma";

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999); }

export const revalidate = 60;

export default async function CalendarPage({ searchParams }: { searchParams?: Promise<{ month?: string; day?: string }> }) {
  const sp: { month?: string; day?: string } = searchParams ? await searchParams : {};
  const base = sp?.month ? new Date(sp.month + '-01') : new Date();
  const from = startOfMonth(base);
  const to = endOfMonth(base);
  // Summe Personen pro Tag anhand Slot.start Datum
  const slots = await prisma.eventSlot.findMany({
    where: { start: { gte: from, lte: to } },
    select: { id: true, start: true, capacity: true },
    orderBy: { start: 'asc' },
  });
  const slotIds = slots.map(s => s.id);
  const bookings = slotIds.length ? await prisma.booking.groupBy({
    by: ['slotId','status'],
    _sum: { persons: true },
    where: { slotId: { in: slotIds }, status: { in: ['pending','confirmed'] } },
  }) : [];
  const map = new Map<string, number>();
  // Detail-Slots pro Tag sammeln
  const perDaySlots = new Map<string, { time: string; booked: number; confirmed: number; pending: number; capacity: number }[]>();
  for (const s of slots) {
    const day = s.start.toISOString().slice(0,10);
    const bConfirmed = bookings.find(x => x.slotId === s.id && x.status === 'confirmed');
    const bPending = bookings.find(x => x.slotId === s.id && x.status === 'pending');
    const confirmed = bConfirmed?._sum.persons ?? 0;
    const pending = bPending?._sum.persons ?? 0;
    const sum = confirmed + pending;
    map.set(day, (map.get(day) ?? 0) + sum);
    const arr = perDaySlots.get(day) ?? [];
    arr.push({ time: s.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), booked: sum, confirmed, pending, capacity: s.capacity });
    perDaySlots.set(day, arr);
  }

  const days: { date: Date; key: string; count: number }[] = [];
  for (let d = new Date(from); d <= to; d = new Date(d.getTime() + 24*60*60*1000)) {
    const key = d.toISOString().slice(0,10);
    days.push({ date: new Date(d), key, count: map.get(key) ?? 0 });
  }

  const prev = new Date(base.getFullYear(), base.getMonth()-1, 1);
  const next = new Date(base.getFullYear(), base.getMonth()+1, 1);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--accent-dark)]">Kalender</h1>
          <p className="opacity-80">Buchungen pro Tag im ausgewählten Monat</p>
        </div>
        <div className="flex items-center gap-2">
          <a aria-label="Voriger Monat" className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--border)] hover:bg-[var(--accent)]/10" href={`/admin/calendar?month=${prev.toISOString().slice(0,7)}`}>←</a>
          <div className="px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] text-sm">
            {base.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          <a aria-label="Nächster Monat" className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--border)] hover:bg-[var(--accent)]/10" href={`/admin/calendar?month=${next.toISOString().slice(0,7)}`}>→</a>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Mo','Di','Mi','Do','Fr','Sa','So'].map(w => (
          <div key={w} className="text-xs font-medium opacity-70 p-2">{w}</div>
        ))}
        {(() => {
          const firstWeekday = (from.getDay() + 6) % 7; // Montag=0
          const pads = Array.from({ length: firstWeekday }, (_, i) => <div key={`pad-${i}`} />);
          return pads;
        })()}
        {days.map(d => {
          // einfache Heatmap-Färbung
          const c = d.count;
          const level = c >= 12 ? 4 : c >= 8 ? 3 : c >= 4 ? 2 : c >= 1 ? 1 : 0;
          const bg = [
            'bg-transparent',
            'bg-[color:var(--accent)]/10',
            'bg-[color:var(--accent)]/20',
            'bg-[color:var(--accent)]/30',
            'bg-[color:var(--accent)]/40',
          ][level];
          const ring = level > 0 ? 'ring-1 ring-[color:var(--accent)]/30' : '';
          const items = perDaySlots.get(d.key) ?? [];
          return (
            <div key={d.key} className={`rounded-lg border border-[var(--border)] p-2 min-h-20 ${bg} ${ring}`} title={`${d.count} gebucht`}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs opacity-70">{d.date.getDate()}.</div>
                {d.count > 0 && (
                  <a href={`/admin/calendar?month=${base.toISOString().slice(0,7)}&day=${d.key}`} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[color:var(--accent)]/15 text-[color:var(--accent-dark)] hover:underline">
                    Σ {d.count} Pers.
                  </a>
                )}
              </div>
              {items.length > 0 && (
                <div className="space-y-1">
                  {items.slice(0, sp?.day === d.key ? items.length : 3).map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="opacity-70 tabular-nums">{it.time} Uhr</span>
                      <span className="px-1.5 py-0.5 rounded bg-[color:var(--accent)]/10 text-[color:var(--accent-dark)] tabular-nums">{it.booked}/{it.capacity}</span>
                      <span className="px-1 py-0.5 rounded bg-emerald-100/60 text-emerald-700 tabular-nums">{it.confirmed} bestätigt</span>
                      {it.pending>0 && (<span className="px-1 py-0.5 rounded bg-amber-100/60 text-amber-700 tabular-nums">{it.pending} offen</span>)}
                    </div>
                  ))}
                  {items.length > 3 && sp?.day !== d.key && (
                    <div className="text-[10px] opacity-60">+{items.length - 3} weitere</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3 text-xs opacity-80">
        <span>Legende:</span>
        <span className="inline-block h-3 w-6 rounded bg-transparent border border-[var(--border)]" />
        <span>0</span>
        <span className="inline-block h-3 w-6 rounded bg-[color:var(--accent)]/10" />
        <span>1–3</span>
        <span className="inline-block h-3 w-6 rounded bg-[color:var(--accent)]/20" />
        <span>4–7</span>
        <span className="inline-block h-3 w-6 rounded bg-[color:var(--accent)]/30" />
        <span>8–11</span>
        <span className="inline-block h-3 w-6 rounded bg-[color:var(--accent)]/40" />
        <span>12+</span>
      </div>
    </div>
  );
}
