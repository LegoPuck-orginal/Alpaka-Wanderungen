import { prisma } from "@/lib/prisma";

function formatDate(d: Date) {
  return d.toISOString().slice(0,10);
}

export default async function AdminStatsPage() {
  // Gesamtaufrufe
  const total = await prisma.pageView.count();
  // Einzigartige Sessions
  const uniqueSessions = (await prisma.pageView.findMany({ distinct: ['sessionId'], select: { sessionId: true } })).length;
  // Top-Pfade
  const top = await prisma.pageView.groupBy({ by: ['path'], _count: { _all: true }, orderBy: { _count: { _all: 'desc' } }, take: 10 });
  // Letzte 7 Tage
  const since = new Date(Date.now() - 7*24*60*60*1000);
  const last = await prisma.pageView.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } });
  const perDay = new Map<string, number>();
  for (let i=6;i>=0;i--) {
    const day = new Date(); day.setDate(day.getDate()-i);
    perDay.set(formatDate(day), 0);
  }
  for (const r of last) {
    const k = formatDate(r.createdAt);
    perDay.set(k, (perDay.get(k) || 0) + 1);
  }
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-4 text-[var(--accent-dark)]">Statistiken</h1>
      <nav className="mb-6 text-sm"><a className="underline" href="/admin">← Zurück zum Admin</a></nav>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4"><div className="text-sm opacity-80">Seitenaufrufe gesamt</div><div className="text-2xl font-semibold">{total}</div></div>
        <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4"><div className="text-sm opacity-80">Einzigartige Sessions</div><div className="text-2xl font-semibold">{uniqueSessions}</div></div>
        <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4"><div className="text-sm opacity-80">Zeitraum</div><div className="text-2xl font-semibold">letzte 7 Tage</div></div>
      </div>
      <h2 className="text-xl font-semibold mb-2">Aufrufe pro Tag</h2>
      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4 mb-6">
        <ul className="grid sm:grid-cols-2 gap-1">
          {Array.from(perDay.entries()).map(([d,c]) => (<li key={d} className="flex justify-between"><span>{d}</span><span className="font-semibold">{c}</span></li>))}
        </ul>
      </div>
      <h2 className="text-xl font-semibold mb-2">Top Seiten</h2>
      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4">
        <ul className="grid gap-1">
          {top.map(t => (<li key={t.path} className="flex justify-between"><span>{t.path}</span><span className="font-semibold">{t._count._all}</span></li>))}
        </ul>
      </div>
    </div>
  );
}
