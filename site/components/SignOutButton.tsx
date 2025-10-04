"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full bg-[color:var(--surface-muted)]/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]/75 transition hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--foreground)]"
    >
      {label}
    </button>
  );
}
