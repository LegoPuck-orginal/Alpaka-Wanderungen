import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function updateBookingStatus(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  const status = String(formData.get('status')) as 'pending' | 'confirmed' | 'canceled';
  try {
    await prisma.booking.update({ where: { id }, data: { status } });
    revalidatePath('/admin/bookings');
    redirect('/admin/bookings?success=Status+aktualisiert');
  } catch (e) {
    redirect('/admin/bookings?error=Update+fehlgeschlagen');
  }
}

async function updatePaymentStatus(formData: FormData) {
  'use server';
  const bookingId = String(formData.get('bookingId'));
  const status = String(formData.get('paymentStatus')) as 'init' | 'paid' | 'failed';
  try {
    await prisma.payment.upsert({
      where: { bookingId },
      update: { status },
      create: { bookingId, status, amountCents: 0, currency: 'EUR' },
    });
    revalidatePath('/admin/bookings');
    redirect('/admin/bookings?success=Zahlungsstatus+aktualisiert');
  } catch (e) {
    redirect('/admin/bookings?error=Zahlungsstatus+Fehler');
  }
}

export default async function BookingsAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const sp = await searchParams;
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: { slot: { include: { tour: true } }, user: true, payment: true },
  });
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-4 text-[var(--accent-dark)]">Buchungen verwalten</h1>
      <p className="opacity-80 mb-6">Status anpassen und Überblick behalten</p>
      <nav className="mb-6 text-sm">
        <a className="underline" href="/admin">← Zurück zum Admin</a>
      </nav>
      {sp?.error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2">{sp.error}</div>
      )}
      {sp?.success && (
        <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 px-3 py-2">{sp.success}</div>
      )}

      <div className="grid gap-3">
        {bookings.map(b => (
          <div key={b.id} className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{b.slot.tour.title}</div>
                <div className="text-sm opacity-80">{new Date(b.slot.start).toLocaleString()} – Personen: {b.persons}</div>
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
              <form action={updatePaymentStatus} className="flex items-center gap-2">
                <input type="hidden" name="bookingId" value={b.id} />
                <select name="paymentStatus" defaultValue={b.payment?.status ?? 'init'} className="px-3 py-2 rounded border border-[var(--border)] bg-transparent">
                  <option value="init">offen</option>
                  <option value="paid">bezahlt</option>
                  <option value="failed">fehlgeschlagen</option>
                </select>
                <button className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--accent)]/10">Zahlung setzen</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
