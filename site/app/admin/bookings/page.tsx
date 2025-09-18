import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function updateBookingStatus(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  const status = String(formData.get('status')) as 'pending' | 'confirmed' | 'canceled';
  await prisma.booking.update({ where: { id }, data: { status } });
  revalidatePath('/admin/bookings');
}

export default async function BookingsAdminPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: { eventSlot: { include: { tour: true } }, user: true }
  });
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-4 text-[var(--accent-dark)]">Buchungen verwalten</h1>
      <p className="opacity-80 mb-6">Status anpassen und Überblick behalten</p>
      <nav className="mb-6 text-sm">
        <a className="underline" href="/admin">← Zurück zum Admin</a>
      </nav>

      <div className="grid gap-3">
        {bookings.map(b => (
          <div key={b.id} className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{b.eventSlot.tour.title}</div>
                <div className="text-sm opacity-80">{new Date(b.eventSlot.start).toLocaleString()} – Plätze: {b.seats}</div>
                <div className="text-sm opacity-80">Bucher: {b.user?.email ?? 'Gast'}</div>
              </div>
              <form action={updateBookingStatus} className="flex items-center gap-2">
                <input type="hidden" name="id" value={b.id} />
                <select name="status" defaultValue={b.status} className="px-3 py-2 rounded border border-[var(--border)] bg-transparent">
                  <option value="pending">ausstehend</option>
                  <option value="confirmed">bestätigt</option>
                  <option value="canceled">storniert</option>
                </select>
                <button className="px-3 py-2 rounded bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-dark)]">Speichern</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
