import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const SlotSchema = z.object({
  tourId: z.string().min(1),
  start: z.string().datetime().or(z.string().min(1)),
  end: z.string().datetime().or(z.string().min(1)),
  capacity: z.coerce.number().int().min(1),
});

async function createSlot(formData: FormData) {
  'use server';
  const data = Object.fromEntries(formData) as any;
  const parsed = SlotSchema.safeParse(data);
  if (!parsed.success) return;
  const start = new Date(String(data.start));
  const end = new Date(String(data.end));
  await prisma.eventSlot.create({ data: { tourId: String(data.tourId), start, end, capacity: Number(data.capacity) } });
  revalidatePath('/admin/slots');
}

async function deleteSlot(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  await prisma.eventSlot.delete({ where: { id } });
  revalidatePath('/admin/slots');
}

export default async function SlotsAdminPage() {
  const tours = await prisma.tour.findMany({ orderBy: { title: 'asc' } });
  const slots = await prisma.eventSlot.findMany({ orderBy: { start: 'asc' }, include: { tour: true } });
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-4 text-[var(--accent-dark)]">Slots verwalten</h1>
      <p className="opacity-80 mb-6">Termine anlegen und löschen</p>
      <nav className="mb-6 text-sm">
        <a className="underline" href="/admin">← Zurück zum Admin</a>
      </nav>

      <form action={createSlot} className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4 grid sm:grid-cols-4 gap-4 mb-8">
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Tour</label>
          <select name="tourId" className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent">
            {tours.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Start</label>
          <input name="start" type="datetime-local" required className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent" />
        </div>
        <div>
          <label className="block text-sm mb-1">Ende</label>
          <input name="end" type="datetime-local" required className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent" />
        </div>
        <div>
          <label className="block text-sm mb-1">Kapazität</label>
          <input name="capacity" type="number" min={1} defaultValue={5} required className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent" />
        </div>
        <div className="sm:col-span-3"></div>
        <div>
          <button className="px-4 py-2 rounded bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-dark)]">Slot anlegen</button>
        </div>
      </form>

      <div className="grid gap-3">
        {slots.map(s => (
          <div key={s.id} className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{s.tour.title}</div>
              <div className="text-sm opacity-80">{new Date(s.start).toLocaleString()} – {new Date(s.end).toLocaleTimeString()} · Kapazität: {s.capacity}</div>
            </div>
            <form action={deleteSlot}>
              <input type="hidden" name="id" value={s.id} />
              <button className="px-3 py-1 rounded border border-[var(--border)] hover:bg-[var(--accent)]/10">Löschen</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
