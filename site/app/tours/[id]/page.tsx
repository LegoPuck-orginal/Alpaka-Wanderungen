import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendMail } from "../../../lib/mailer";
import { BookingSchema } from "@/lib/schemas";
import bcrypt from "bcryptjs";
import SubmitButton from "@/components/SubmitButton";
import Image from "next/image";

function formatEuro(cents: number) {
  return (cents / 100).toFixed(2) + " €";
}

type SlotLite = { id: string; start: Date; end: Date; capacity: number };

export const revalidate = 30;

export default async function TourDetail({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ error?: string; success?: string }> }) {
  const [p, sp] = await Promise.all([params, searchParams]);
  const tour = await prisma.tour.findUnique({
    where: { id: p.id },
    include: {
      slots: { orderBy: { start: "asc" } },
      images: { orderBy: { position: 'asc' } },
    },
  });
  if (!tour) return notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-2 text-[var(--accent-dark)]">{tour.title}</h1>
      {tour.imageUrl && (
        <div className="relative h-56 w-full mb-4 overflow-hidden rounded-xl border border-[var(--border)]">
          <Image src={tour.imageUrl} alt={tour.imageAlt || tour.title} fill sizes="800px" className="object-cover" />
        </div>
      )}
      {sp?.error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2">{sp.error}</div>
      )}
      {sp?.success && (
        <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 px-3 py-2">{sp.success}</div>
      )}
      <p className="opacity-80 mb-6">{tour.description}</p>
      {tour.images && tour.images.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          {tour.images.map(img => (
            <div key={img.id} className="relative h-32 w-full overflow-hidden rounded-md border border-[var(--border)]">
              <Image src={img.url} alt={img.alt || tour.title} fill sizes="400px" className="object-cover" />
            </div>
          ))}
        </div>
      )}
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
          <form key={s.id} action={async (formData: FormData) => {
            'use server';
            const slotId = String(formData.get('slotId'));
            const email = String(formData.get('email') ?? '');
            const persons = Number(formData.get('persons') ?? 1);
            const parsed = BookingSchema.safeParse({ slotId, email, persons });
            if (!parsed.success) {
              redirect(`/tours/${p.id}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? 'Eingaben prüfen')}`);
            }
            let userId: string | null = null;
            try {
              const session = await getServerSession(authOptions);
              userId = (session?.user as unknown as { id?: string })?.id ?? null;
            } catch {}
            if (!userId) {
              userId = (await ensureGuestUser()).id;
            }
                const result = await prisma.$transaction(async (tx) => {
                  const slot = await tx.eventSlot.findUnique({ where: { id: slotId }, include: { tour: true } });
                  if (!slot) return { err: 'Termin nicht gefunden' } as const;
                  const booked = await tx.booking.aggregate({ _sum: { persons: true }, where: { slotId, status: { in: ['pending','confirmed'] } } });
                  const used = booked._sum.persons ?? 0;
                  if (used + persons > slot.capacity) return { err: 'Leider nicht genug freie Plätze' } as const;
                  const booking = await tx.booking.create({ data: { userId: userId!, slotId, persons, contactEmail: email, status: 'pending' } });
                  const amountCents = (slot.tour?.priceCents ?? 0) * persons;
                  await tx.payment.create({ data: { bookingId: booking.id, amountCents, currency: 'EUR', status: 'init' } });
                  return { ok: booking } as const;
                });
                if ('err' in result) {
                  const msg = result.err ?? 'Fehler bei der Reservierung';
                  redirect(`/tours/${p.id}?error=${encodeURIComponent(msg)}`);
                }
                const booking = result.ok;
            await sendMail({ to: 'admin@example.com', subject: 'Neue Buchung', text: `Buchung ${booking.id} für ${persons} Person(en) · Kontakt: ${email}` });
            revalidatePath(`/tours/${p.id}`);
            redirect(`/tours/${p.id}?success=${encodeURIComponent('Reservierung eingegangen')}`);
          }} className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4 flex items-center justify-between gap-3">
            <input type="hidden" name="slotId" value={s.id} />
            <div>
              <div className="font-medium">{new Date(s.start).toLocaleString()}</div>
                  <div className="text-sm opacity-80">bis {new Date(s.end).toLocaleTimeString()}</div>
                  {/* Freie Plätze Anzeige */}
                  <SlotFreeSeats slotId={s.id} capacity={s.capacity} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm" htmlFor={`email-${s.id}`}>E-Mail</label>
              <input id={`email-${s.id}`} name="email" type="email" required className="w-56 px-2 py-1 rounded border border-[var(--border)] bg-transparent" placeholder="dein@email.de" />
              <label className="text-sm" htmlFor={`persons-${s.id}`}>Personen</label>
              <input id={`persons-${s.id}`} name="persons" type="number" min={1} defaultValue={1} className="w-16 px-2 py-1 rounded border border-[var(--border)] bg-transparent" />
              <SubmitButton className="px-4 py-2 rounded bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-dark)] transition-colors">Reservieren</SubmitButton>
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
  const hash = await bcrypt.hash('guest', 10);
  return prisma.user.create({ data: { email, name: 'Gast', role: 'user', passwordHash: hash } });
}

async function SlotFreeSeats({ slotId, capacity }: { slotId: string; capacity: number }) {
  const agg = await prisma.booking.aggregate({ _sum: { persons: true }, where: { slotId, status: { in: ['pending','confirmed'] } } });
  const used = agg._sum.persons ?? 0;
  const free = Math.max(capacity - used, 0);
  return <div className="text-xs opacity-70">Freie Plätze: {free}/{capacity}</div>;
}
