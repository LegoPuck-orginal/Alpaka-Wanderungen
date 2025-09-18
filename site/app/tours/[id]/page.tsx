import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendMail } from "../../../lib/mailer";

function formatEuro(cents: number) {
  return (cents / 100).toFixed(2) + " €";
}

type SlotLite = { id: string; start: Date; end: Date; capacity: number };

export const revalidate = 30;

export default async function TourDetail({ params, searchParams }: { params: { id: string }, searchParams?: { error?: string; success?: string } }) {
  const tour = await prisma.tour.findUnique({
    where: { id: params.id },
    include: {
      slots: { orderBy: { start: "asc" } },
    },
  });
  if (!tour) return notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-2 text-[var(--accent-dark)]">{tour.title}</h1>
      {searchParams?.error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2">{searchParams.error}</div>
      )}
      {searchParams?.success && (
        <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 px-3 py-2">{searchParams.success}</div>
      )}
      <p className="opacity-80 mb-6">{tour.description}</p>
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4">
          <div className="text-sm opacity-80">Dauer</div>
          <div className="text-lg font-semibold">{tour.durationMin} Min</div>
        </div>
        <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4">
          <div className="text-sm opacity-80">Preis</div>
          <div className="text-lg font-semibold">{formatEuro(tour.priceCents)}</div>
        </div>
        <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4">
          <div className="text-sm opacity-80">Kapazität</div>
          <div className="text-lg font-semibold">{tour.capacity} Personen</div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-[var(--accent-dark)]">Termine</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {tour.slots.length === 0 && (
          <div className="opacity-70">Derzeit keine Termine verfügbar.</div>
        )}
  {tour.slots.map((s: SlotLite) => (
          <form key={s.id} className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4 flex items-center justify-between gap-3">
            <input type="hidden" name="slotId" value={s.id} />
            <div>
              <div className="font-medium">{new Date(s.start).toLocaleString()}</div>
              <div className="text-sm opacity-80">bis {new Date(s.end).toLocaleTimeString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm" htmlFor={`persons-${s.id}`}>Personen</label>
              <input id={`persons-${s.id}`} name="persons" type="number" min={1} defaultValue={1} className="w-16 px-2 py-1 rounded border border-[var(--border)] bg-transparent" />
              <button formAction={async (formData: FormData) => {
                'use server';
                const persons = Number(formData.get('persons')) || 1;
                const slotId = String(formData.get('slotId'));
                let userId: string | null = null;
                try {
                  const session = await getServerSession(authOptions as any);
                  userId = (session as any)?.user?.id ?? null;
                } catch {}
                if (!userId) {
                  userId = (await ensureGuestUser()).id;
                }
                // Kapazität prüfen
                const slot = await prisma.eventSlot.findUnique({ where: { id: slotId }, include: { tour: true } });
                if (!slot) {
                  redirect(`/tours/${params.id}?error=${encodeURIComponent('Termin nicht gefunden')}`);
                }
                const booked = await prisma.booking.aggregate({
                  _sum: { persons: true },
                  where: { slotId, status: { in: ['pending','confirmed'] } },
                });
                const used = booked._sum.persons ?? 0;
                if (used + persons > slot.capacity) {
                  redirect(`/tours/${params.id}?error=${encodeURIComponent('Leider nicht genug freie Plätze')}`);
                }
                const booking = await prisma.booking.create({ data: { userId, slotId, persons, status: 'pending' } });
                // Payment initialisieren
                const amountCents = (slot.tour?.priceCents ?? 0) * persons;
                await prisma.payment.create({ data: { bookingId: booking.id, amountCents, currency: 'EUR', status: 'init' } });
                // E-Mail Stubs
                await sendMail({ to: 'admin@example.com', subject: 'Neue Buchung', text: `Buchung ${booking.id} für ${persons} Person(en)` });
                // Erfolg
                revalidatePath(`/tours/${params.id}`);
                redirect(`/tours/${params.id}?success=${encodeURIComponent('Reservierung eingegangen')}`);
              }} className="px-4 py-2 rounded bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-dark)] transition-colors">Reservieren</button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}

async function ensureGuestUser() {
  const email = "guest@example.com";
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) return user;
  return prisma.user.create({ data: { email, name: 'Gast', role: 'user', passwordHash: 'guest' } });
}
