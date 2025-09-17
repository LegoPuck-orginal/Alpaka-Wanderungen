import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-8 sm:p-20">
      <main className="flex flex-col gap-8 items-center w-full max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-[var(--accent-dark)]">Alpaka Wanderungen</h1>
        <p className="text-lg sm:text-xl mb-6 text-[var(--accent)] text-center">Erlebe unvergessliche Touren mit unseren Alpakas in der Natur. Jetzt Termin reservieren und entspannen!</p>
        <Image src="/file.svg" alt="Alpaka Logo" width={120} height={120} priority />
        <a href="#buchung" className="mt-8 px-6 py-3 rounded-lg bg-[var(--accent)] text-[var(--foreground)] font-semibold shadow hover:bg-[var(--accent-dark)] transition-colors">
          Jetzt Termin buchen
        </a>
      </main>
    </div>
  );
}
