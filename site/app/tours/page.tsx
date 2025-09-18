import { prisma } from "@/lib/prisma";

type TourCard = {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  priceCents: number;
  imageUrl: string | null;
};

export const revalidate = 60;

export default async function ToursPage() {
  const tours: TourCard[] = await prisma.tour.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      durationMin: true,
      priceCents: true,
      imageUrl: true,
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-4 text-[var(--accent-dark)]">Tour-Übersicht</h1>
      <p className="opacity-80 mb-6">Wähle eine Tour und buche deinen Termin.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((t) => (
          <div key={t.id} className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4">
            <div className="h-28 rounded-md mb-3 bg-[var(--accent)]/25"></div>
            <h3 className="font-semibold mb-1">{t.title}</h3>
            <p className="text-sm opacity-80 mb-3 line-clamp-3">{t.description}</p>
            <div className="text-sm opacity-80 mb-3">Dauer: {t.durationMin} Min</div>
            <div className="text-sm font-medium mb-3">Preis: {(t.priceCents/100).toFixed(2)} €</div>
            <a href={`/tours/${t.id}`} className="text-sm underline">Details ansehen</a>
          </div>
        ))}
      </div>
    </div>
  );
}
