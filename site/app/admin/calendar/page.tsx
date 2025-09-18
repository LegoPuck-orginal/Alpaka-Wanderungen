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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-4 text-[var(--accent-dark)]">Kalender</h1>
      <nav className="mb-4 flex items-center gap-3 text-sm">
        <a className="underline" href={`/admin/calendar?month=${prev.toISOString().slice(0,7)}`}>← {prev.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</a>
        <span className="opacity-70">{base.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</span>
        <a className="underline" href={`/admin/calendar?month=${next.toISOString().slice(0,7)}`}>{next.toLocaleString(undefined, { month: 'long', year: 'numeric' })} →</a>
      </nav>
      <div className="grid grid-cols-7 gap-2">
        {['Mo','Di','Mi','Do','Fr','Sa','So'].map(w => (
          <div key={w} className="text-xs font-medium opacity-70 p-2">{w}</div>
        ))}
        {(() => {
          const firstWeekday = (from.getDay() + 6) % 7; // Montag=0
          const pads = Array.from({ length: firstWeekday }, (_, i) => <div key={`pad-${i}`} />);
          return pads;
        })()}
        {days.map(d => (
          <div key={d.key} className="rounded-md border border-[var(--border)] p-2 min-h-16">
            <div className="text-xs opacity-70">{d.date.getDate()}.</div>
            <div className="text-sm mt-1">{d.count} gebucht</div>
          </div>
        ))}
      </div>
    </div>
  );
}
