"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold mb-4 text-[var(--accent-dark)]">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--surface)]" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Passwort</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--surface)]" required />
        </div>
          {error && <div className="text-red-600 text-sm">{String(error).replace(/"/g, '&quot;')}</div>}
        <button type="submit" className="px-4 py-2 rounded bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-dark)]">Einloggen</button>
      </form>
  <p className="text-sm opacity-80 mt-4">Dev-Login: admin@example.com mit beliebigem Passwort (&quot;dev-placeholder&quot;).</p>
    </div>
  );
}
