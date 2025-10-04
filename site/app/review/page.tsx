"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ReviewFormContent() {
  const searchParams = useSearchParams();
  const bookingCode = searchParams.get("code");
  
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !text) {
      setError("Bitte fülle alle Felder aus");
      return;
    }

    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text, rating, bookingCode }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Fehler beim Absenden");
      }
    } catch {
      setError("Netzwerkfehler");
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-4">Vielen Dank!</h1>
          <p className="text-lg opacity-80 mb-6">
            Deine Bewertung wurde erfolgreich übermittelt und wird nach Prüfung veröffentlicht.
          </p>
          <Link href="/" className="inline-block px-6 py-3 bg-[var(--accent)] text-[var(--accent-contrast)] rounded-lg hover:bg-[var(--accent-dark)]">
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🦙 Wie war deine Alpaka-Wanderung?</h1>
          <p className="text-lg opacity-80">Teile deine Erfahrung mit anderen!</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 shadow-lg">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block mb-2 font-medium">Dein Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-transparent"
              placeholder="Max Mustermann"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Bewertung</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-4xl transition-colors"
                  style={{ color: star <= rating ? "#fbbf24" : "#d1d5db" }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Deine Bewertung</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-transparent"
              rows={6}
              placeholder="Erzähle uns von deinem Erlebnis..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-[var(--accent)] text-[var(--accent-contrast)] rounded-lg font-semibold hover:bg-[var(--accent-dark)] transition-colors"
          >
            Bewertung absenden
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Lädt...</div>}>
      <ReviewFormContent />
    </Suspense>
  );
}
