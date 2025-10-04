import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { allContentEntries, contentSections } from "@/lib/contentRegistry";

async function upsertContent(formData: FormData) {
  'use server';
  const key = String(formData.get('key'));
  const value = String(formData.get('value') ?? '');
  await prisma.content.upsert({ where: { key }, update: { value }, create: { key, value } });
  revalidatePath('/');
  revalidatePath('/tours');
  revalidatePath('/tours/[id]', 'page');
  revalidatePath('/calendar');
  revalidatePath('/admin/content');
}

async function deleteContent(formData: FormData) {
  'use server';
  const key = String(formData.get('key'));
  await prisma.content.delete({ where: { key } });
  revalidatePath('/');
  revalidatePath('/tours');
  revalidatePath('/tours/[id]', 'page');
  revalidatePath('/calendar');
  revalidatePath('/admin/content');
}

export default async function ContentAdminPage() {
  const items = await prisma.content.findMany({ orderBy: { key: 'asc' } });
  const valueMap = new Map(items.map((i) => [i.key, i.value]));
  const knownKeys = new Set(allContentEntries.map((entry) => entry.key));
  const unknownEntries = items.filter((item) => !knownKeys.has(item.key));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold text-[var(--accent-dark)]">Texte & Inhalte</h1>
        <p className="text-sm text-[color:var(--foreground)]/65">Bearbeite sämtliche Texte der Website zentral. Hinweise zu Platzhaltern und HTML findest du direkt bei den Feldern.</p>
      </div>
      <nav className="mb-6 text-sm">
        <a className="underline" href="/admin">← Zurück zum Admin</a>
      </nav>

      <div className="space-y-12">
        {contentSections.map((section) => (
          <section key={section.id} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">{section.title}</h2>
              {section.description ? (
                <p className="text-sm text-[color:var(--foreground)]/65">{section.description}</p>
              ) : null}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {section.entries.map((entry) => {
                const current = valueMap.get(entry.key) ?? "";
                const isCustomized = current.length > 0 && current !== entry.fallback;
                const rows = entry.rows ?? 3;
                return (
                  <form
                    key={entry.key}
                    action={upsertContent}
                    className={`glass-panel flex flex-col gap-4 px-5 py-5${
                      isCustomized ? " outline outline-1 outline-[color:var(--accent)]/40" : ""
                    }`}
                  >
                    <input type="hidden" name="key" value={entry.key} />
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-[color:var(--foreground)]">{entry.label}</div>
                      <div className="text-[10px] uppercase tracking-wide text-[color:var(--foreground)]/45">Key: {entry.key}</div>
                      {entry.hint ? (
                        <p className="text-xs text-[color:var(--foreground)]/55">{entry.hint}</p>
                      ) : null}
                    </div>
                    <textarea
                      name="value"
                      defaultValue={current.length > 0 ? current : entry.fallback}
                      rows={rows}
                      className="w-full rounded-2xl border border-[color:var(--border)]/75 bg-[color:var(--surface)]/60 px-4 py-3 text-sm text-[color:var(--foreground)] shadow-sm"
                    />
                    <div className="rounded-2xl bg-[color:var(--surface-muted)]/80 px-4 py-3 text-xs text-[color:var(--foreground)]/65">
                      <div className="font-semibold">Standardwert</div>
                      <div className="mt-1 whitespace-pre-wrap break-words">{entry.fallback}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button className="btn-primary">Speichern</button>
                      {current.length > 0 ? (
                        <button className="btn-secondary" formAction={deleteContent}>Auf Standard zurücksetzen</button>
                      ) : null}
                    </div>
                  </form>
                );
              })}
            </div>
          </section>
        ))}

        {unknownEntries.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Weitere Schlüssel</h2>
            <p className="text-sm text-[color:var(--foreground)]/65">Diese Schlüssel sind vorhanden, aber nicht im Standard-Set registriert.</p>
            <div className="grid gap-4">
              {unknownEntries.map((entry) => (
                <form key={entry.key} action={upsertContent} className="glass-panel flex flex-col gap-3 px-5 py-5">
                  <input type="hidden" name="key" value={entry.key} />
                  <div className="flex items-center justify-between text-sm font-semibold text-[color:var(--foreground)]">
                    <span>{entry.key}</span>
                    <button className="btn-secondary" formAction={deleteContent}>Löschen</button>
                  </div>
                  <textarea
                    name="value"
                    defaultValue={entry.value}
                    rows={3}
                    className="w-full rounded-2xl border border-[color:var(--border)]/75 bg-[color:var(--surface)]/60 px-4 py-3 text-sm text-[color:var(--foreground)]"
                  />
                  <button className="btn-primary self-start">Speichern</button>
                </form>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Neuen Textschlüssel anlegen</h2>
          <form action={upsertContent} className="glass-panel flex flex-col gap-3 px-5 py-5">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[color:var(--foreground)]" htmlFor="new-key">Schlüssel</label>
              <input
                id="new-key"
                name="key"
                required
                placeholder="z.B. custom.hinweis"
                className="rounded-2xl border border-[color:var(--border)]/80 bg-[color:var(--surface)]/60 px-4 py-3 text-sm text-[color:var(--foreground)]"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[color:var(--foreground)]" htmlFor="new-value">Text</label>
              <textarea
                id="new-value"
                name="value"
                rows={3}
                placeholder="Neuer Textinhalt"
                className="rounded-2xl border border-[color:var(--border)]/80 bg-[color:var(--surface)]/60 px-4 py-3 text-sm text-[color:var(--foreground)]"
              />
            </div>
            <button className="btn-primary self-start">Speichern</button>
          </form>
        </section>
      </div>
    </div>
  );
}
