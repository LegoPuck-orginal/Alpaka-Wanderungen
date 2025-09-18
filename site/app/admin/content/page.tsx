import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function upsertContent(formData: FormData) {
  'use server';
  const key = String(formData.get('key'));
  const value = String(formData.get('value') ?? '');
  await prisma.content.upsert({ where: { key }, update: { value }, create: { key, value } });
  revalidatePath('/admin/content');
}

async function deleteContent(formData: FormData) {
  'use server';
  const key = String(formData.get('key'));
  await prisma.content.delete({ where: { key } });
  revalidatePath('/admin/content');
}

export default async function ContentAdminPage() {
  const items: { key: string; value: string }[] = await prisma.content.findMany({ orderBy: { key: 'asc' } });
  const defaults: { key: string; label: string; hint?: string }[] = [
    { key: 'hero.title', label: 'Startseite: Hero Titel' },
    { key: 'hero.subtitle', label: 'Startseite: Hero Untertitel' },
    { key: 'hero.cta', label: 'Startseite: Hero Button' },
  ];
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-4 text-[var(--accent-dark)]">Texte & Inhalte</h1>
      <p className="opacity-80 mb-6">Einfache Schlüssel/Wert-Verwaltung für Seitentexte</p>
      <nav className="mb-6 text-sm">
        <a className="underline" href="/admin">← Zurück zum Admin</a>
      </nav>

      <div className="grid gap-6">
        {[...defaults, ...items.filter((i: { key: string }) => !defaults.find(d => d.key === i.key)).map((i: { key: string }) => ({ key: i.key, label: i.key }))].map((d) => {
          const existing = items.find((i: { key: string; value: string }) => i.key === d.key);
          return (
            <form key={d.key} action={upsertContent} className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4 grid gap-3">
              <div className="text-sm opacity-80">{d.label}</div>
              <input type="hidden" name="key" value={d.key} />
              <textarea name="value" defaultValue={existing?.value ?? ''} rows={3} className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent" />
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-dark)]">Speichern</button>
                {existing && (
                  <form action={deleteContent}>
                    <input type="hidden" name="key" value={d.key} />
                    <button className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--accent)]/10" formAction={deleteContent}>Löschen</button>
                  </form>
                )}
              </div>
            </form>
          );
        })}
      </div>
    </div>
  );
}
