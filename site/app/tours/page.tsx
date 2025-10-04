import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { getManyContent } from "@/lib/content";
import { getContentDefaultsForSections } from "@/lib/contentRegistry";

type TourCard = {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  priceCents: number;
  imageUrl: string | null;
  imageAlt?: string | null;
};

export const revalidate = 60;

export default async function ToursPage() {
  const copy = await getManyContent(getContentDefaultsForSections(["tours.list"]));
  const tours: TourCard[] = await prisma.tour.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      durationMin: true,
      priceCents: true,
      imageUrl: true,
      imageAlt: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <span className="tag">{copy["tours.list.tag"]}</span>
          <h1 className="text-4xl font-semibold text-[color:var(--foreground)]">{copy["tours.list.subtitle"]}</h1>
          <p className="max-w-xl text-sm text-[color:var(--foreground)]/65">{copy["tours.list.description"]}</p>
        </div>
        <Link href="/calendar" className="btn-secondary">{copy["tours.list.cta"]}</Link>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {tours.map((t) => (
          <div key={t.id} className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-[color:var(--border)]/70 bg-[color:var(--surface-elevated)]/85 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--accent)]/10">
              {t.imageUrl ? (
                <Image src={t.imageUrl} alt={t.imageAlt || t.title} fill sizes="(max-width: 768px) 100vw, 380px" className="object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[color:var(--foreground)]/40">{copy["tours.list.cardFallback"]}</div>
              )}
              <div className="absolute left-4 top-4 rounded-full bg-[color:var(--accent)]/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--accent-contrast)]">
                {t.durationMin} Min
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-5 px-7 py-7">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{t.title}</h3>
                <p className="line-clamp-4 text-sm text-[color:var(--foreground)]/65">{t.description}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[color:var(--foreground)]/70">
                <span className="rounded-full bg-[color:var(--accent)]/10 px-3 py-1 font-semibold text-[color:var(--accent-dark)]">{(t.priceCents / 100).toFixed(2)} {copy["tours.list.cardPrice"]}</span>
                <Link href={`/tours/${t.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--link)] hover:text-[color:var(--link-hover)]">
                  {copy["tours.list.cardLink"]}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
