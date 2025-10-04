import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TourSchema } from "@/lib/schemas";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getStorage } from "@/lib/storage";

async function createTour(formData: FormData): Promise<void> {
  'use server';
  const data = Object.fromEntries(formData);
  // Preis in Euro annehmen und zu Cents konvertieren
  const euro = String(data.priceEuro ?? '').replace(',', '.');
  const priceCents = Math.round(Number(euro) * 100);
  const parsed = TourSchema.safeParse({
    title: data.title,
    description: data.description,
    durationMin: data.durationMin,
    priceCents,
    capacity: data.capacity,
  });
  if (!parsed.success) {
    redirect(`/admin?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? 'Ungültige Eingaben')}`);
  }
  await prisma.tour.create({ data: parsed.data });
  revalidatePath('/admin');
  redirect('/admin?success=Tour+angelegt');
}
async function updateTourAlt(formData: FormData): Promise<void> {
  'use server';
  const id = String(formData.get('id'));
  const imageAlt = String(formData.get('imageAlt') ?? '');
  try {
    await prisma.tour.update({ where: { id }, data: { imageAlt: imageAlt || null } });
    revalidatePath('/admin');
    revalidatePath('/');
    redirect('/admin?success=Alt-Text+gespeichert');
  } catch {
    redirect('/admin?error=Alt-Text+konnte+nicht+gespeichert+werden');
  }
}

async function deleteTour(formData: FormData): Promise<void> {
  'use server';
  const id = String(formData.get('id'));
  try {
    await prisma.tour.delete({ where: { id } });
    revalidatePath('/admin');
    redirect('/admin?success=Tour+gelöscht');
  } catch {
    redirect('/admin?error=Tour+konnte+nicht+gelöscht+werden');
  }
}

async function uploadTourImage(formData: FormData): Promise<void> {
  'use server';
  const tourId = String(formData.get('tourId'));
  const file = formData.get('image');
  if (!(file instanceof File)) {
    redirect(`/admin?error=${encodeURIComponent('Keine Datei übermittelt')}`);
  }
  // Typ & Größe validieren
  const allowed = new Map<string, string>([
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp'],
  ]);
  const type = file.type;
  const ext = allowed.get(type);
  if (!ext) {
    redirect(`/admin?error=${encodeURIComponent('Nur JPG, PNG oder WebP erlaubt')}`);
  }
  const maxBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxBytes) {
    redirect(`/admin?error=${encodeURIComponent('Datei ist größer als 5MB')}`);
  }

  const buf = Buffer.from(await file.arrayBuffer());

  // Bestehendes Bild löschen (falls vorhanden)
  const existing = await prisma.tour.findUnique({ where: { id: tourId }, select: { imageUrl: true } });
  if (!existing) {
    redirect(`/admin?error=${encodeURIComponent('Tour nicht gefunden')}`);
  }
  if (existing?.imageUrl) {
    try { await getStorage().deleteImage(existing.imageUrl); } catch {}
  }
  const saved = await getStorage().saveImage(buf, type, `tour-${tourId}`);
  await prisma.tour.update({ where: { id: tourId }, data: { imageUrl: saved.url } });

  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath(`/tours/${tourId}`);
  redirect('/admin?success=Bild+aktualisiert');
}

async function deleteTourImage(formData: FormData): Promise<void> {
  'use server';
  const tourId = String(formData.get('tourId'));
  const tour = await prisma.tour.findUnique({ where: { id: tourId }, select: { imageUrl: true } });
  if (!tour) {
    redirect(`/admin?error=${encodeURIComponent('Tour nicht gefunden')}`);
  }
  if (tour.imageUrl) {
    try { await getStorage().deleteImage(tour.imageUrl); } catch {}
  }
  await prisma.tour.update({ where: { id: tourId }, data: { imageUrl: null } });
  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath(`/tours/${tourId}`);
  redirect('/admin?success=Bild+entfernt');
}

async function uploadGallery(formData: FormData): Promise<void> {
  'use server';
  const tourId = String(formData.get('tourId'));
  const files = formData.getAll('images').filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    redirect(`/admin?error=${encodeURIComponent('Keine Dateien ausgewählt')}`);
  }
  const allowed = new Set(["image/jpeg","image/png","image/webp"]);
  const existingCount = await prisma.tourImage.count({ where: { tourId } });
  let i = 0;
  for (const file of files) {
    if (!allowed.has(file.type)) continue;
    if (file.size > 8 * 1024 * 1024) continue;
    const buf = Buffer.from(await file.arrayBuffer());
    const saved = await getStorage().saveImage(buf, file.type, `tour-${tourId}`);
    await prisma.tourImage.create({ data: { tourId, url: saved.url, width: saved.width ?? null, height: saved.height ?? null, position: existingCount + i } });
    i++;
  }
  revalidatePath('/admin');
  revalidatePath(`/tours/${tourId}`);
  revalidatePath('/');
  redirect('/admin?success=Galerie+aktualisiert');
}

async function deleteGalleryImage(formData: FormData): Promise<void> {
  'use server';
  const id = String(formData.get('imageId'));
  const img = await prisma.tourImage.findUnique({ where: { id } });
  if (!img) redirect('/admin?error=Bild+nicht+gefunden');
  try { await getStorage().deleteImage(img!.url); } catch {}
  await prisma.tourImage.delete({ where: { id } });
  revalidatePath('/admin');
  if (img) revalidatePath(`/tours/${img.tourId}`);
  redirect('/admin?success=Bild+gelöscht');
}

async function updateGalleryAlt(formData: FormData): Promise<void> {
  'use server';
  const id = String(formData.get('imageId'));
  const alt = String(formData.get('alt') ?? '');
  await prisma.tourImage.update({ where: { id }, data: { alt: alt || null } });
  revalidatePath('/admin');
  redirect('/admin?success=Alt-Text+aktualisiert');
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const sp = await searchParams;
  const tours = await prisma.tour.findMany({ orderBy: { createdAt: 'desc' }, include: { images: { orderBy: { position: 'asc' } } } });
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--accent-dark)]">Admin-Dashboard</h1>
        <p className="opacity-80">Touren verwalten</p>
      </div>
      {sp?.error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2">{sp.error}</div>
      )}
      {sp?.success && (
        <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 px-3 py-2">{sp.success}</div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <a href="/admin/slots" className="block card p-4 hover:bg-[var(--accent)]/10">
          <div className="font-semibold">Slots</div>
          <div className="text-sm opacity-80">Termine anlegen & löschen</div>
        </a>
        <a href="/admin/bookings" className="block card p-4 hover:bg-[var(--accent)]/10">
          <div className="font-semibold">Buchungen</div>
          <div className="text-sm opacity-80">Status verwalten</div>
        </a>
        <a href="/admin/content" className="block card p-4 hover:bg-[var(--accent)]/10">
          <div className="font-semibold">Texte</div>
          <div className="text-sm opacity-80">Inhalte bearbeiten</div>
        </a>
        <a href="/admin/users" className="block card p-4 hover:bg-[var(--accent)]/10">
          <div className="font-semibold">Benutzer</div>
          <div className="text-sm opacity-80">Admins & Rollen verwalten</div>
        </a>
        <a href="/admin/stats" className="block card p-4 hover:bg-[var(--accent)]/10">
          <div className="font-semibold">Statistiken</div>
          <div className="text-sm opacity-80">Seitenaufrufe & Trends</div>
        </a>
        <a href="/admin/calendar" className="block card p-4 hover:bg-[var(--accent)]/10">
          <div className="font-semibold">Kalender</div>
          <div className="text-sm opacity-80">Buchungen pro Tag</div>
        </a>
        <a href="/admin/reviews" className="block card p-4 hover:bg-[var(--accent)]/10">
          <div className="font-semibold">Bewertungen</div>
          <div className="text-sm opacity-80">Kundenfeedback verwalten</div>
        </a>
      </div>

  <form action={createTour} className="card p-4 grid sm:grid-cols-2 gap-4 mb-8">
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
          <label className="block text-sm mb-1">Preis (Euro pro Person)</label>
          <input name="priceEuro" type="number" step="0.01" min={0} required className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent" />
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
          <div key={t.id} className="card p-4 flex items-start gap-4">
            {t.imageUrl ? (
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md border border-[var(--border)]">
                <Image src={t.imageUrl} alt="Tour Bild" fill sizes="112px" className="object-cover" />
              </div>
            ) : (
              <div className="h-20 w-28 shrink-0 rounded-md border border-dashed border-[var(--border)] text-xs flex items-center justify-center opacity-70">Kein Bild</div>
            )}
            <div className="flex-1">
              <div className="font-semibold">{t.title}</div>
              <div className="text-sm opacity-80 mb-2">{t.description}</div>
              <div className="text-sm opacity-80">Dauer: {t.durationMin} Min · Preis: {(t.priceCents/100).toFixed(2)} € · Kapazität: {t.capacity}</div>
              <form action={updateTourAlt} className="mt-2 flex items-center gap-2">
                <input type="hidden" name="id" value={t.id} />
                <label className="text-sm" htmlFor={`alt-${t.id}`}>Alt-Text</label>
                <input id={`alt-${t.id}`} name="imageAlt" defaultValue={t.imageAlt ?? ''} className="w-72 px-2 py-1 rounded border border-[var(--border)] bg-transparent text-sm" placeholder="z.B. Zwei Alpakas auf Waldweg" />
                <button className="px-3 py-1 rounded border border-[var(--border)] hover:bg-[var(--accent)]/10 text-sm">Speichern</button>
              </form>
              <div className="mt-3 flex items-center gap-3">
                <form action={uploadTourImage} className="flex items-center gap-2">
                  <input type="hidden" name="tourId" value={t.id} />
                  <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" required />
                  <button className="btn-primary text-sm">Bild hochladen</button>
                </form>
                {t.imageUrl && (
                  <form action={deleteTourImage}>
                    <input type="hidden" name="tourId" value={t.id} />
                    <button className="btn-secondary text-sm">Bild entfernen</button>
                  </form>
                )}
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Galerie</div>
                <form action={uploadGallery} className="flex items-center gap-2 mb-3">
                  <input type="hidden" name="tourId" value={t.id} />
                  <input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple className="text-sm" />
                  <button className="btn-primary text-sm">Bilder hinzufügen</button>
                </form>
                {t.images.length === 0 ? (
                  <div className="text-sm opacity-70">Noch keine Galeriebilder.</div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {t.images.map(img => (
                      <div key={img.id} className="border border-[var(--border)] rounded-md p-2">
                        <div className="relative h-20 w-full overflow-hidden rounded">
                          <Image src={img.url} alt={img.alt || t.title} fill sizes="160px" className="object-cover" />
                        </div>
                        <form action={updateGalleryAlt} className="mt-2 flex items-center gap-2">
                          <input type="hidden" name="imageId" value={img.id} />
                          <input name="alt" defaultValue={img.alt ?? ''} placeholder="Alt-Text" className="w-full px-2 py-1 rounded border border-[var(--border)] bg-transparent text-xs" />
                          <button className="btn-secondary text-xs">Speichern</button>
                        </form>
                        <form action={deleteGalleryImage} className="mt-1">
                          <input type="hidden" name="imageId" value={img.id} />
                          <button className="w-full btn-secondary text-xs hover:bg-red-50">Löschen</button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <form action={deleteTour}>
              <input type="hidden" name="id" value={t.id} />
              <button className="btn-secondary">Löschen</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
