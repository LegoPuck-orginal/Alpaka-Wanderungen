import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TourSchema } from "@/lib/schemas";
import { redirect } from "next/navigation";

async function createTour(formData: FormData): Promise<void> {
  'use server';
  const data = Object.fromEntries(formData);
  const parsed = TourSchema.safeParse(data);
  if (!parsed.success) {
    redirect(`/admin?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? 'Ungültige Eingaben')}`);
  }
  await prisma.tour.create({ data: parsed.data });
  revalidatePath('/admin');
  redirect('/admin?success=Tour+angelegt');
}

async function deleteTour(formData: FormData): Promise<void> {
  'use server';
  const id = String(formData.get('id'));
  try {
    await prisma.tour.delete({ where: { id } });
    revalidatePath('/admin');
    redirect('/admin?success=Tour+gelöscht');
  } catch (e) {
    redirect('/admin?error=Tour+konnte+nicht+gelöscht+werden');
  }
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const sp = await searchParams;
  const tours = await prisma.tour.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-4 text-[var(--accent-dark)]">Admin-Dashboard</h1>
      <p className="opacity-80 mb-6">Touren verwalten</p>
      {sp?.error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2">{sp.error}</div>
      )}
      {sp?.success && (
        <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 px-3 py-2">{sp.success}</div>
      )}

      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        <a href="/admin/slots" className="block rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4 hover:bg-[var(--accent)]/10">
          <div className="font-semibold">Slots</div>
          <div className="text-sm opacity-80">Termine anlegen & löschen</div>
        </a>
        <a href="/admin/bookings" className="block rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4 hover:bg-[var(--accent)]/10">
          <div className="font-semibold">Buchungen</div>
          <div className="text-sm opacity-80">Status verwalten</div>
        </a>
        <a href="/admin/content" className="block rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4 hover:bg-[var(--accent)]/10">
          <div className="font-semibold">Texte</div>
          <div className="text-sm opacity-80">Inhalte bearbeiten</div>
        </a>
        <a href="/admin/users" className="block rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4 hover:bg-[var(--accent)]/10">
          <div className="font-semibold">Benutzer</div>
          <div className="text-sm opacity-80">Admins & Rollen verwalten</div>
        </a>
      </div>

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
