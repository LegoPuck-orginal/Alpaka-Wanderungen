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
import PersonsInput from "@/components/PersonsInput";
import Image from "next/image";
import { getManyContent } from "@/lib/content";
import { getContentDefaultsForSections } from "@/lib/contentRegistry";
import { formatContent } from "@/lib/contentUtils";
import { ensureDefaultSlots, addDays } from "@/lib/defaultSlots";

function formatEuro(cents: number) {
  return (cents / 100).toFixed(2) + " €";
}

type SlotLite = { id: string; start: Date; end: Date; capacity: number };

export const revalidate = 30;

export default async function TourDetail({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ error?: string; success?: string }> }) {
  const [p, sp] = await Promise.all([params, searchParams]);

  const windowStart = new Date();
  windowStart.setHours(0, 0, 0, 0);
  const windowEnd = addDays(windowStart, 60);

  await ensureDefaultSlots({ tourId: p.id, start: windowStart, end: windowEnd });

  const tour = await prisma.tour.findUnique({
    where: { id: p.id },
    include: {
      slots: {
        where: { start: { gte: windowStart, lte: windowEnd } },
        orderBy: { start: "asc" },
        take: 20,
      },
      images: { orderBy: { position: 'asc' } },
    },
  });
  if (!tour) return notFound();
  const content = await getManyContent(
    getContentDefaultsForSections([
      "tour.detail",
      "tour.detail.dynamic",
      "forms.persons",
    ])
  );

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-16">
      <div className="space-y-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <span className="tag">{content['tour.detail.tag']}</span>
            <h1 className="text-4xl font-semibold text-[color:var(--foreground)]">{tour.title}</h1>
            <p className="max-w-2xl text-sm text-[color:var(--foreground)]/70">{tour.description}</p>
          </div>
          <div className="rounded-3xl border border-[color:var(--border)]/70 bg-[color:var(--surface)]/60 px-6 py-5 text-right shadow-sm">
            <span className="text-xs uppercase tracking-wide text-[color:var(--foreground)]/55">{content['tour.detail.priceLabel']}</span>
            <div className="text-3xl font-semibold text-[color:var(--accent-dark)]">{formatEuro(tour.priceCents)}</div>
            <p className="text-xs text-[color:var(--foreground)]/50">{content['tour.detail.priceNote']}</p>
          </div>
        </div>
        {tour.imageUrl && (
          <div className="relative aspect-[16/7] w-full overflow-hidden rounded-[34px] border border-[color:var(--border)]/70 bg-[color:var(--surface-muted)]/70 shadow-lg">
            <Image src={tour.imageUrl} alt={tour.imageAlt || tour.title} fill sizes="(max-width: 768px) 100vw, 960px" className="object-cover" priority />
          </div>
        )}
        {sp?.error && (
          <div className="rounded-3xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">{sp.error}</div>
        )}
        {sp?.success && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/85 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">{sp.success}</div>
        )}
        {tour.images && tour.images.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            {tour.images.map((img) => (
              <div key={img.id} className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-[color:var(--border)]/70 bg-[color:var(--surface-muted)]">
                <Image src={img.url} alt={img.alt || tour.title} fill sizes="(max-width: 768px) 100vw, 320px" className="object-cover" />
              </div>
            ))}
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="glass-panel px-5 py-6">
            <span className="text-xs uppercase tracking-wide text-[color:var(--foreground)]/55">{content['tour.detail.stats.durationLabel']}</span>
            <p className="mt-2 text-xl font-semibold text-[color:var(--foreground)]">{tour.durationMin} {content['tour.detail.stats.durationSuffix']}</p>
          </div>
          <div className="glass-panel px-5 py-6">
            <span className="text-xs uppercase tracking-wide text-[color:var(--foreground)]/55">{content['tour.detail.stats.capacityLabel']}</span>
            <p className="mt-2 text-xl font-semibold text-[color:var(--foreground)]">{tour.capacity} {content['tour.detail.stats.capacitySuffix']}</p>
          </div>
          <div className="glass-panel px-5 py-6">
            <span className="text-xs uppercase tracking-wide text-[color:var(--foreground)]/55">{content['tour.detail.stats.equipmentLabel']}</span>
            <p className="mt-2 text-sm text-[color:var(--foreground)]/65">{content['tour.detail.stats.equipmentText']}</p>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-3xl font-semibold text-[color:var(--foreground)]">{content['tour.detail.sectionTitle']}</h2>
            <p className="text-sm text-[color:var(--foreground)]/60">{content['tour.detail.sectionSubtitle']}</p>
          </div>
          <div className="grid gap-5">
            {tour.slots.length === 0 && (
              <div className="rounded-3xl border border-[color:var(--border)]/70 bg-[color:var(--surface-muted)]/70 px-6 py-8 text-center text-sm text-[color:var(--foreground)]/65">
                {content['tour.detail.noSlots']}
              </div>
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
                  const slot = await tx.eventSlot.findUnique({ where: { id: slotId }, include: { tour: { select: { priceCents: true, capacity: true } } } });
                  if (!slot) return { err: 'Termin nicht gefunden' } as const;
                  
                  // Prüfe verfügbare Kapazität
                  const booked = await tx.booking.aggregate({ _sum: { persons: true }, where: { slotId, status: { in: ['pending','confirmed'] } } });
                  const used = booked._sum.persons ?? 0;
                  const available = slot.capacity - used;
                  
                  if (persons < 1) return { err: 'Mindestens 1 Person erforderlich' } as const;
                  if (persons > available) return { err: `Nur noch ${available} Plätze verfügbar` } as const;
                  
                  // Warnung wenn mehr Personen als Alpakas gebucht werden
                  const tourCapacity = slot.tour?.capacity ?? slot.capacity;
                  if (persons > tourCapacity) {
                    return { err: `Achtung: Wir haben nur ${tourCapacity} Alpakas. Bei mehr Personen können nicht alle ein eigenes Alpaka führen.` } as const;
                  }
                  
                  // Buchung anlegen
                  const booking = await tx.booking.create({ data: { userId: userId!, slotId, persons, contactEmail: email, status: 'pending' } });
                  // einfachen, menschenlesbaren Code generieren (z.B. ALP-XXXXX) und setzen
                  const code = `ALP-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
                  await tx.booking.update({ where: { id: booking.id }, data: { code } });
                  const amountCents = (slot.tour.priceCents ?? 0) * persons;
                  await tx.payment.create({ data: { bookingId: booking.id, amountCents, currency: 'EUR', status: 'init' } });
                  return { ok: { ...booking, code } } as const;
                });
                if ('err' in result) {
                  const msg = result.err ?? 'Fehler bei der Reservierung';
                  redirect(`/tours/${p.id}?error=${encodeURIComponent(msg)}`);
                }
  const booking = result.ok as { id: string; code?: string };
      await sendMail({ to: 'admin@example.com', subject: 'Neue Buchung', text: `Buchung ${booking.code ?? booking.id} für ${persons} Person(en) · Kontakt: ${email}` });
            revalidatePath(`/tours/${p.id}`);
            redirect(`/tours/${p.id}?success=${encodeURIComponent('Reservierung eingegangen')}`);
          }} className="grid gap-6 rounded-[32px] border border-[color:var(--border)]/70 bg-[color:var(--surface)]/75 px-6 py-6 shadow-md transition duration-200 hover:border-[color:var(--accent)]/40 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <input type="hidden" name="slotId" value={s.id} />
              <div className="min-w-0">
                <div className="text-lg font-semibold tabular-nums text-[color:var(--foreground)]">{new Date(s.start).toLocaleDateString()} · {new Date(s.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Uhr</div>
                <div className="text-sm text-[color:var(--foreground)]/65 tabular-nums">bis {new Date(s.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Uhr</div>
                <div className="mt-3">
                  <SlotFreeSeats
                    slotId={s.id}
                    capacity={s.capacity}
                    templates={{
                      available: content['tour.detail.slot.badgeAvailable'],
                      full: content['tour.detail.slot.badgeFull'],
                      label: content['tour.detail.slot.availableBadgeLabel'],
                    }}
                  />
                </div>
            </div>
              <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]/50" htmlFor={`email-${s.id}`}>{content['tour.detail.slot.emailLabel']}</label>
                  <input id={`email-${s.id}`} name="email" type="email" required className="w-full min-w-[220px] bg-transparent" placeholder="dein@email.de" />
                </div>
                <PersonsInput
                  slotId={s.id}
                  tourCapacity={tour.capacity}
                  slotCapacity={s.capacity}
                  label={content['forms.persons.label']}
                  alpacaWarningTemplate={content['forms.persons.alpacaWarning']}
                  tooManyTemplate={content['forms.persons.tooMany']}
                />
                <SubmitButton className="btn-primary whitespace-nowrap">{content['tour.detail.slot.button']}</SubmitButton>
              </div>
          </form>
        ))}
          </div>
        </section>
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

async function SlotFreeSeats({ slotId, capacity, templates }: { slotId: string; capacity: number; templates: { available: string; full: string; label: string } }) {
  const agg = await prisma.booking.aggregate({ _sum: { persons: true }, where: { slotId, status: { in: ['pending','confirmed'] } } });
  const used = agg._sum.persons ?? 0;
  const free = Math.max(capacity - used, 0);
  const isAvailable = free > 0;
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isAvailable ? 'bg-[color:var(--accent)]/15 text-[color:var(--accent-dark)]' : 'bg-red-50 text-red-600'}`}>
      <span aria-hidden>{isAvailable ? '🦙' : '⛔️'}</span>
      {isAvailable
        ? formatContent(templates.available, { free, capacity })
        : templates.full}
      {isAvailable ? (
        <span className="sr-only">{templates.label}</span>
      ) : null}
    </div>
  );
}
