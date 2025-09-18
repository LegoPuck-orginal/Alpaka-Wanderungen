"use client";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";
import SignOutButton from "./SignOutButton";
import { useEffect, useState } from "react";

type SessionUser = { role?: string } | null;

export default function ClientNav() {
  const [user, setUser] = useState<SessionUser>(null);

  useEffect(() => {
    let cancelled = false;
    // Lightweight call to check session without forcing dynamic headers on server render
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          const u = (data?.user as { role?: string } | undefined) ?? null;
          setUser(u ?? null);
        }
      })
      .catch(() => setUser(null));
    return () => { cancelled = true; };
  }, []);

  return (
    <nav className="flex gap-4 text-sm items-center">
      <Link className="text-[var(--foreground)] hover:underline underline-offset-4" href="/tours">Touren</Link>
      {user?.role === 'admin' && (
        <Link className="text-[var(--foreground)] hover:underline underline-offset-4" href="/admin">Admin</Link>
      )}
      <ThemeSwitcher />
      {user ? <SignOutButton /> : null}
    </nav>
  );
}
