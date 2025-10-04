import Image from "next/image";
import Link from "next/link";
import { getManyContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { getContentDefaultsForSections } from "@/lib/contentRegistry";

export const revalidate = 60;

export default async function Home() {
  const c = await getManyContent(
    getContentDefaultsForSections([
      "home.hero",
      "home.stats",
      "home.features",
      "home.steps",
      "home.tours",
      "home.reviews",
      "home.quickBooking",
    ])
  );
  return (
    <div className="text-[var(--foreground)]">
      <section className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-16 md:pt-24">
        <div className="grid gap-14 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-8">
            <span className="tag">{c['hero.badge']}</span>
            <div className="space-y-5">
              <h1 className="text-4xl font-semibold leading-[1.05] text-balance sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-br from-[color:var(--accent-dark)] via-[color:var(--foreground)] to-[color:var(--accent)] bg-clip-text text-transparent">
                  {c['hero.title']}
                </span>
              </h1>
              <p className="max-w-xl text-lg sm:text-xl text-[color:var(--foreground)]/75">
                {c['hero.subtitle']}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/tours" className="btn-primary text-sm sm:text-base">
                {c['hero.cta']}
              </Link>
              <Link href="/calendar" className="btn-secondary text-sm sm:text-base">
                {c['hero.secondaryCta']}
              </Link>
              <a href="#buchung" className="text-sm font-medium text-[color:var(--link)] underline underline-offset-4">
                {c['hero.directLink']}
              </a>
            </div>
            <div className="flex flex-wrap gap-6 text-sm uppercase tracking-wide text-[color:var(--foreground)]/60">
              <div>
                <span className="block text-3xl font-semibold text-[color:var(--accent-dark)]">{c['hero.stats.first.value']}</span>
                {c['hero.stats.first.label']}
              </div>
              <div>
                <span className="block text-3xl font-semibold text-[color:var(--accent-dark)]">{c['hero.stats.second.value']}</span>
                {c['hero.stats.second.label']}
              </div>
              <div>
                <span className="block text-3xl font-semibold text-[color:var(--accent-dark)]">{c['hero.stats.third.value']}</span>
                {c['hero.stats.third.label']}
              </div>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="glass-panel relative aspect-[4/5] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[color:var(--accent)]/30 via-transparent to-[color:var(--accent-dark)]/40" />
              <Image src="/window.svg" alt="Illustration eines entspannten Alpaka-Ausblicks" fill sizes="(max-width: 768px) 90vw, 420px" className="object-contain object-center opacity-90" priority />
            </div>
            <div className="glass-panel absolute -bottom-10 left-1/2 w-[85%] -translate-x-1/2 px-5 py-4 text-sm shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[color:var(--accent)]/20" />
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]/85">Nina &amp; Finn</p>
                  <p className="text-xs text-[color:var(--foreground)]/60">“So entspannt waren wir lange nicht – danke Alma dem Alpaka!”</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((index) => {
            const icon = c[`home.features.${index}.icon`];
            const title = c[`home.features.${index}.title`];
            const text = c[`home.features.${index}.text`];
            return (
              <div key={index} className="glass-panel p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--accent)]/15 text-2xl">
                  <span role="img" aria-hidden>{icon}</span>
              </div>
                <h3 className="text-xl font-semibold text-[color:var(--foreground)]">{title}</h3>
                <p className="mt-2 text-sm text-[color:var(--foreground)]/70">{text}</p>
            </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="glass-panel grid gap-8 px-8 py-10 md:grid-cols-[0.22fr_1fr]">
          <div className="space-y-3">
            <span className="tag">{c['home.steps.tag']}</span>
            <h2 className="text-3xl font-semibold">{c['home.steps.title']}</h2>
            <p className="text-sm text-[color:var(--foreground)]/65">{c['home.steps.description']}</p>
          </div>
          <ol className="grid gap-6 text-sm">
            <li className="relative rounded-2xl border border-[color:var(--border)]/60 bg-[color:var(--surface)]/70 px-6 py-5 shadow-sm">
              <span className="absolute -left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-bold text-[color:var(--accent-contrast)]">1</span>
              <h3 className="text-base font-semibold text-[color:var(--foreground)]">{c['home.steps.1.title']}</h3>
              <p
                className="mt-1 text-[color:var(--foreground)]/65"
                dangerouslySetInnerHTML={{ __html: c['home.steps.1.text'] }}
              />
            </li>
            <li className="relative rounded-2xl border border-[color:var(--border)]/60 bg-[color:var(--surface)]/70 px-6 py-5 shadow-sm">
              <span className="absolute -left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-bold text-[color:var(--accent-contrast)]">2</span>
              <h3 className="text-base font-semibold text-[color:var(--foreground)]">{c['home.steps.2.title']}</h3>
              <p className="mt-1 text-[color:var(--foreground)]/65">{c['home.steps.2.text']}</p>
            </li>
            <li className="relative rounded-2xl border border-[color:var(--border)]/60 bg-[color:var(--surface)]/70 px-6 py-5 shadow-sm">
              <span className="absolute -left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-bold text-[color:var(--accent-contrast)]">3</span>
              <h3 className="text-base font-semibold text-[color:var(--foreground)]">{c['home.steps.3.title']}</h3>
              <p className="mt-1 text-[color:var(--foreground)]/65">{c['home.steps.3.text']}</p>
            </li>
          </ol>
        </div>
      </section>

      <DynamicTours copy={c} />

      <ReviewsSection copy={c} />

      <section id="buchung" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="glass-panel flex flex-col gap-6 px-8 py-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-2">
            <span className="tag">{c['home.quick.tag']}</span>
            <h2 className="text-3xl font-semibold text-[color:var(--foreground)]">{c['home.quick.title']}</h2>
            <p
              className="text-sm text-[color:var(--foreground)]/70"
              dangerouslySetInnerHTML={{ __html: c['home.quick.description'] }}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/tours" className="btn-primary">{c['home.quick.primaryCta']}</Link>
            <Link href="/calendar" className="btn-secondary">{c['home.quick.secondaryCta']}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

async function DynamicTours({ copy }: { copy: Record<string, string> }) {
  const tours = await prisma.tour.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, title: true, description: true, durationMin: true, priceCents: true, imageUrl: true, imageAlt: true },
  });
  if (tours.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="tag">{copy['home.tours.tag']}</span>
          <h2 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">{copy['home.tours.title']}</h2>
          <p className="text-sm text-[color:var(--foreground)]/65">{copy['home.tours.subtitle']}</p>
        </div>
        <Link href="/tours" className="btn-secondary">{copy['home.tours.seeAll']}</Link>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {tours.map((t) => (
          <div key={t.id} className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[color:var(--border)]/70 bg-[color:var(--surface-elevated)]/80 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[color:var(--accent)]/15">
              {t.imageUrl ? (
                <Image src={t.imageUrl} alt={t.imageAlt || t.title} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[color:var(--foreground)]/50">{copy['home.tours.cardFallback']}</div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-4 px-6 py-6">
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{t.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-[color:var(--foreground)]/65">{t.description}</p>
              </div>
              <div className="mt-auto space-y-1 text-sm text-[color:var(--foreground)]/70">
                <div>Dauer: {t.durationMin} Min</div>
                <div className="text-base font-semibold text-[color:var(--accent-dark)]">{(t.priceCents / 100).toFixed(2)} {copy['home.tours.priceSuffix']}</div>
              </div>
              <Link href={`/tours/${t.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--link)] hover:text-[color:var(--link-hover)]">
                {copy['home.tours.detailsLink']}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

async function ReviewsSection({ copy }: { copy: Record<string, string> }) {
  const reviews = await prisma.review.findMany({
    where: { isVisible: true },
    orderBy: { position: 'asc' },
    take: 5,
    select: {
      id: true,
      name: true,
      text: true,
      rating: true,
    },
  });
  if (reviews.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="glass-panel px-8 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="tag">{copy['home.reviews.tag']}</span>
            <h2 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">{copy['home.reviews.title']}</h2>
          </div>
          <p className="max-w-md text-sm text-[color:var(--foreground)]/65">{copy['home.reviews.description']}</p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((r) => (
            <blockquote key={r.id} className="relative flex h-full flex-col justify-between rounded-3xl border border-[color:var(--border)]/60 bg-[color:var(--surface)]/70 px-6 py-6 shadow">
              <div className="flex items-center gap-2 text-lg text-amber-400">
                {Array.from({ length: r.rating }, (_, i) => (
                  <span key={i} aria-hidden>★</span>
                ))}
              </div>
              <p className="mt-4 text-[color:var(--foreground)]/80">“{r.text}”</p>
              <footer className="mt-6 text-sm font-semibold text-[color:var(--foreground)]/70">– {r.name}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
