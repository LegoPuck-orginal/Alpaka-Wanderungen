import { prisma } from "@/lib/prisma";

function dkey(d: Date) { return d.toISOString().slice(0,10); }

export default async function AdminStatsPage() {
  // PageViews
  const totalViews = await prisma.pageView.count();
  const uniqueSessions = (await prisma.pageView.findMany({ distinct: ['sessionId'], select: { sessionId: true } })).length;
  const topRaw = await prisma.pageView.groupBy({ by: ['path'], _count: { _all: true } });
  const top = topRaw.sort((a, b) => b._count._all - a._count._all).slice(0, 8);

  // Buchungen & Umsatz
  const totalBookings = await prisma.booking.count();
  const confirmedBookings = await prisma.booking.count({ where: { status: 'confirmed' } });
  const payments = await prisma.payment.findMany({ where: { status: 'paid' }, select: { amountCents: true } });
  const revenueCents = payments.reduce((s, p) => s + (p.amountCents ?? 0), 0);

  // Buchungen pro Tag (30 Tage)
  const since = new Date(Date.now() - 29*24*60*60*1000);
  const raw = await prisma.booking.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } });
  const days: { date: string; count: number }[] = [];
  for (let i=29;i>=0;i--) {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-i);
    days.push({ date: dkey(d), count: 0 });
  }
  for (const r of raw) {
    const k = dkey(new Date(r.createdAt));
    const idx = days.findIndex(x => x.date === k);
    if (idx >= 0) days[idx].count += 1;
  }
  const maxCount = Math.max(1, ...days.map(d => d.count));
  const w = 320; const h = 60; const step = w / (days.length - 1);
  const points = days.map((d, i) => {
    const x = i * step;
    const y = h - (d.count / maxCount) * (h - 6) - 3; // Padding
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-2 text-[var(--accent-dark)]">Statistiken</h1>
      <nav className="mb-6 text-sm"><a className="underline" href="/admin">← Zurück zum Admin</a></nav>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4"><div className="text-sm opacity-80">Seitenaufrufe</div><div className="text-2xl font-semibold">{totalViews}</div></div>
        <div className="card p-4"><div className="text-sm opacity-80">Sessions</div><div className="text-2xl font-semibold">{uniqueSessions}</div></div>
        <div className="card p-4"><div className="text-sm opacity-80">Buchungen</div><div className="text-2xl font-semibold">{totalBookings}</div></div>
        <div className="card p-4"><div className="text-sm opacity-80">Umsatz</div><div className="text-2xl font-semibold">{(revenueCents/100).toFixed(2)} €</div></div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4 md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Buchungen (30 Tage)</h2>
            <div className="text-xs opacity-70">max: {maxCount}/Tag</div>
          </div>
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full h-20">
            <polyline fill="none" stroke="var(--accent)" strokeWidth="2" points={points} />
          </svg>
          <div className="text-xs opacity-70">Heute: {days[days.length-1].count}</div>
        </div>
        <div className="card p-4">
          <h2 className="text-xl font-semibold mb-2">Top Seiten</h2>
          <ul className="grid gap-1 text-sm">
            {top.map(t => (<li key={t.path} className="flex justify-between"><span className="truncate max-w-[12rem]">{t.path}</span><span className="font-semibold">{t._count._all}</span></li>))}
          </ul>
          <div className="mt-3 text-sm opacity-80">Bestätigte Buchungen: <span className="font-semibold">{confirmedBookings}</span></div>
        </div>
      </div>
    </div>
  );
}
