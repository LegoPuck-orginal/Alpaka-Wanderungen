import { prisma } from "@/lib/prisma";

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999); }

export const revalidate = 60;

export default async function CalendarPage({ searchParams }: { searchParams?: Promise<{ month?: string }> }) {
  const sp = searchParams ? await searchParams : {};
  const base = sp?.month ? new Date(sp.month + '-01') : new Date();
  const from = startOfMonth(base);
  const to = endOfMonth(base);
  // Summe Personen pro Tag anhand Slot.start Datum
  const slots = await prisma.eventSlot.findMany({
    where: { start: { gte: from, lte: to } },
    select: { id: true, start: true },
  });
  const slotIds = slots.map(s => s.id);
  const bookings = slotIds.length ? await prisma.booking.groupBy({
    by: ['slotId'],
    _sum: { persons: true },
    where: { slotId: { in: slotIds }, status: { in: ['pending','confirmed'] } },
  }) : [];
  const map = new Map<string, number>();
  for (const s of slots) {
    const day = s.start.toISOString().slice(0,10);
    const b = bookings.find(x => x.slotId === s.id);
    const sum = b?._sum.persons ?? 0;
    map.set(day, (map.get(day) ?? 0) + sum);
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
          return (
            <div key={d.key} className={`rounded-lg border border-[var(--border)] p-2 min-h-20 ${bg} ${ring}`} title={`${d.count} gebucht`}>
              <div className="flex items-center justify-between">
                <div className="text-xs opacity-70">{d.date.getDate()}.</div>
                {d.count > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[color:var(--accent)]/15 text-[color:var(--accent-dark)]">
                    {d.count} Pers.
                  </span>
                )}
              </div>
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
