"use client";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";
import SignOutButton from "./SignOutButton";
import { useEffect, useState } from "react";

type SessionUser = { role?: string } | null;

type NavLabels = {
  tours: string;
  calendar: string;
  admin: string;
  logout: string;
};

export default function ClientNav({ labels }: { labels: NavLabels }) {
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
    <nav className="flex items-center gap-2 text-sm">
      <Link className="rounded-full px-3 py-1.5 font-medium text-[color:var(--foreground)]/85 transition hover:text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]/80" href="/tours">{labels.tours}</Link>
      <Link className="rounded-full px-3 py-1.5 font-medium text-[color:var(--foreground)]/85 transition hover:text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]/80" href="/calendar">{labels.calendar}</Link>
      {user?.role === 'admin' && (
        <Link className="rounded-full px-3 py-1.5 font-medium text-[color:var(--foreground)]/85 transition hover:text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]/80" href="/admin">{labels.admin}</Link>
      )}
      <ThemeSwitcher />
      {user ? <SignOutButton label={labels.logout} /> : null}
    </nav>
  );
}
