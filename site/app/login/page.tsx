"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (!res || res.error) {
      setError("Login fehlgeschlagen");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-2 text-[var(--accent-dark)]">Administrator-Login</h1>
        <p className="text-sm opacity-80 mb-4">Nur für Administratoren. Kund:innen benötigen keinen Account und geben bei der Reservierung ihre E-Mail an.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">E-Mail</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Passwort</label>
            <div className="flex items-stretch gap-2">
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPw ? 'text' : 'password'} className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent" required />
              <button type="button" onClick={() => setShowPw(v => !v)} className="px-3 rounded border border-[var(--border)] hover:bg-[var(--accent)]/10 text-sm">{showPw ? 'Verbergen' : 'Anzeigen'}</button>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{String(error).replace(/"/g, '&quot;')}</div>}
          <button type="submit" className="w-full px-4 py-2 rounded bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-dark)]">Einloggen</button>
        </form>
        <p className="text-xs opacity-60 mt-4">Tipp: Admin-Zugangsdaten verwaltest du unter Admin → Benutzer.</p>
      </div>
    </div>
  );
}
