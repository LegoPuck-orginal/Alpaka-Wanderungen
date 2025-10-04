import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function createSlot(formData: FormData) {
  'use server';
  const tourId = String(formData.get('tourId'));
  const dateStr = String(formData.get('date'));
  const timeStr = String(formData.get('time'));
  const capacity = Number(formData.get('capacity') ?? 1);
  if (!tourId || !dateStr || !timeStr) {
    redirect(`/admin/slots?error=${encodeURIComponent('Bitte Tour, Datum und Uhrzeit angeben')}`);
  }
  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) redirect(`/admin/slots?error=${encodeURIComponent('Tour nicht gefunden')}`);
  // Start aus Datum+Zeit zusammenbauen (lokale Zeit)
  const start = new Date(`${dateStr}T${timeStr}:00`);
  const end = new Date(start.getTime() + tour!.durationMin * 60_000);
  await prisma.eventSlot.create({ data: { tourId, start, end, capacity } });
  revalidatePath('/admin/slots');
  redirect('/admin/slots?success=Slot+angelegt');
}

async function deleteSlot(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  try {
    await prisma.eventSlot.delete({ where: { id } });
    revalidatePath('/admin/slots');
    redirect('/admin/slots?success=Slot+gelöscht');
  } catch {
    redirect('/admin/slots?error=Slot+konnte+nicht+gelöscht+werden');
  }
}

export default async function SlotsAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const sp = await searchParams;
  const tours = await prisma.tour.findMany({ orderBy: { title: 'asc' } });
  const slots = await prisma.eventSlot.findMany({ orderBy: { start: 'asc' }, include: { tour: true } });
  return (
  <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-4 text-[var(--accent-dark)]">Slots verwalten</h1>
      <p className="opacity-80 mb-6">Termine anlegen und löschen</p>
      {sp?.error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2">{sp.error}</div>
      )}
      {sp?.success && (
        <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 px-3 py-2">{sp.success}</div>
      )}
      <nav className="mb-6 text-sm">
        <a className="underline" href="/admin">← Zurück zum Admin</a>
      </nav>

  <form action={createSlot} className="card p-4 grid sm:grid-cols-4 gap-4 mb-8">
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Tour</label>
          <select name="tourId" className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent focus-outline">
            {tours.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Datum</label>
          <input name="date" type="date" required className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent focus-outline" />
        </div>
        <div>
          <label className="block text-sm mb-1">Uhrzeit</label>
          <select name="time" className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent focus-outline">
            {['09:00','11:00','13:00','15:00','17:00'].map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Kapazität</label>
          <input name="capacity" type="number" min={1} defaultValue={5} required className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent focus-outline" />
        </div>
        <div className="sm:col-span-3"></div>
        <div>
          <button className="btn-primary">Slot anlegen</button>
        </div>
      </form>

      <div className="grid gap-3">
        {slots.map(s => (
          <div key={s.id} className="card p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{s.tour.title}</div>
              <div className="text-sm opacity-80">{new Date(s.start).toLocaleString()} – {new Date(s.end).toLocaleTimeString()} · Kapazität: {s.capacity}</div>
            </div>
            <form action={deleteSlot}>
              <input type="hidden" name="id" value={s.id} />
              <button className="btn-secondary">Löschen</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
