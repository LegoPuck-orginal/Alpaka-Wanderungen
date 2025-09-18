import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const TourSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  durationMin: z.coerce.number().int().min(30),
  priceCents: z.coerce.number().int().min(0),
  capacity: z.coerce.number().int().min(1),
});

async function createTour(formData: FormData): Promise<void> {
  'use server';
  const data = Object.fromEntries(formData) as any;
  const parsed = TourSchema.safeParse(data);
  if (!parsed.success) return;
  await prisma.tour.create({ data: parsed.data });
  revalidatePath('/admin');
}

async function deleteTour(formData: FormData): Promise<void> {
  'use server';
  const id = String(formData.get('id'));
  await prisma.tour.delete({ where: { id } });
  revalidatePath('/admin');
}

export default async function AdminPage() {
  const tours = await prisma.tour.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-4 text-[var(--accent-dark)]">Admin-Dashboard</h1>
      <p className="opacity-80 mb-6">Touren verwalten</p>

      <form action={createTour} className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4 grid sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm mb-1">Titel</label>
          <input name="title" required className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent" />
        </div>
        <div>
          <label className="block text-sm mb-1">Dauer (Min)</label>
          <input name="durationMin" type="number" min={30} required className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Beschreibung</label>
          <textarea name="description" required className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent" rows={3} />
        </div>
        <div>
          <label className="block text-sm mb-1">Preis (Cent)</label>
          <input name="priceCents" type="number" min={0} required className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent" />
        </div>
        <div>
          <label className="block text-sm mb-1">Kapazität</label>
          <input name="capacity" type="number" min={1} required className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent" />
        </div>
        <div className="sm:col-span-2">
          <button className="px-4 py-2 rounded bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-dark)]">Tour anlegen</button>
        </div>
      </form>

      <div className="grid gap-4">
        {tours.map((t) => (
          <div key={t.id} className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4 flex items-start gap-4">
            <div className="flex-1">
              <div className="font-semibold">{t.title}</div>
              <div className="text-sm opacity-80 mb-2">{t.description}</div>
              <div className="text-sm opacity-80">Dauer: {t.durationMin} Min · Preis: {(t.priceCents/100).toFixed(2)} € · Kapazität: {t.capacity}</div>
            </div>
            <form action={deleteTour}>
              <input type="hidden" name="id" value={t.id} />
              <button className="px-3 py-1 rounded border border-[var(--border)] hover:bg-[var(--accent)]/10">Löschen</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
