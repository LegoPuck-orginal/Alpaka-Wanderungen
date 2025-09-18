import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-[var(--accent-dark)]">Alpaka Wanderungen</h1>
        <p className="text-lg sm:text-xl mb-6 text-[var(--accent)]">Erlebe unvergessliche Touren mit unseren Alpakas in der Natur. Jetzt Termin reservieren und entspannen!</p>
        <div className="flex items-center justify-center">
          <Image src="/file.svg" alt="Alpaka Logo" width={120} height={120} priority />
        </div>
  <a href="#buchung" className="inline-block mt-8 px-6 py-3 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow hover:bg-[var(--accent-dark)] transition-colors">Jetzt Termin buchen</a>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 grid sm:grid-cols-3 gap-6">
  <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
          <h3 className="text-xl font-semibold mb-2 text-[var(--accent-dark)]">Sanfte Begleiter</h3>
          <p>Unsere Alpakas sind freundlich und ruhig – perfekt für Familien und entspannte Ausflüge.</p>
        </div>
  <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
          <h3 className="text-xl font-semibold mb-2 text-[var(--accent-dark)]">Naturnahe Routen</h3>
          <p>Wähle aus idyllischen Strecken im Grünen – Dauer, Tempo und Schwierigkeitsgrad nach Wunsch.</p>
        </div>
  <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
          <h3 className="text-xl font-semibold mb-2 text-[var(--accent-dark)]">Einfach online buchen</h3>
          <p>Termine auswählen, Teilnehmer angeben, bestätigen – fertig. Sicher und schnell.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--accent-dark)]">So läuft’s ab</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Wähle eine Tour aus der <a className="underline" href="/tours">Tour-Übersicht</a>.</li>
          <li>Reserviere deinen Wunschtermin und gib die Teilnehmerzahl an.</li>
          <li>Erhalte eine Bestätigung per E-Mail – wir bereiten alles vor.</li>
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--accent-dark)]">Beliebte Touren (Vorschau)</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <div key={i} className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm p-4">
              <div className="h-28 rounded-md mb-3 bg-[var(--accent)]/30"></div>
              <h3 className="font-semibold mb-1">Alpaka-Tour #{i}</h3>
              <p className="text-sm opacity-80 mb-3">60–90 Minuten | Gemütliches Tempo</p>
              <a href="/tours" className="text-sm underline">Details ansehen</a>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--accent-dark)]">Was Gäste sagen</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <blockquote className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
            „Wunderschöne Erfahrung – die Alpakas sind super lieb!“
            <footer className="mt-2 text-sm opacity-80">– Mia, 2025</footer>
          </blockquote>
          <blockquote className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
            „Perfekt für einen entspannten Sonntag im Grünen.“
            <footer className="mt-2 text-sm opacity-80">– Jonas, 2025</footer>
          </blockquote>
        </div>
      </section>

      <section id="buchung" className="mx-auto max-w-5xl px-6 py-12">
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
          <h2 className="text-2xl font-semibold mb-2 text-[var(--accent-dark)]">Schnellbuchung</h2>
          <p className="mb-4">Besuche die <a className="underline" href="/tours">Tour-Übersicht</a>, wähle einen Termin und buche deine Alpaka-Wanderung.</p>
          <div className="flex gap-3">
            <a href="/tours" className="px-5 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-dark)] transition-colors font-medium">Touren ansehen</a>
            <a href="/admin" className="px-5 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--accent)]/15 transition-colors font-medium">Zum Admin</a>
          </div>
        </div>
      </section>
    </div>
  );
}
