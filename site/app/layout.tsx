import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SignOutButton from "../components/SignOutButton";
import ThemeSwitcher from "../components/ThemeSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alpaka Wanderungen",
  description: "Erlebe entspannte Alpaka-Touren und reserviere deinen Wunschtermin online.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session: unknown = null;
  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    console.error("NextAuth getServerSession error:", e);
    session = null;
  }
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="w-full sticky top-0 backdrop-blur bg-[color:var(--background)]/80 border-b border-[color:var(--accent-dark)]/10 z-10">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold text-[var(--accent-dark)]">Alpaka Wanderungen</Link>
            <nav className="flex gap-4 text-sm items-center">
              <Link className="text-[var(--foreground)] hover:underline underline-offset-4" href="/tours">Touren</Link>
              {(session as any)?.user?.role === 'admin' && (
                <Link className="text-[var(--foreground)] hover:underline underline-offset-4" href="/admin">Admin</Link>
              )}
              <ThemeSwitcher />
              {(session as any)?.user ? (
                <SignOutButton />
              ) : (
                <Link className="px-3 py-1 rounded border border-[var(--border)] hover:bg-[var(--accent)]/10" href="/login">Login</Link>
              )}
            </nav>
          </div>
        </header>

        <main className="min-h-[calc(100vh-120px)]">{children}</main>

        <footer className="w-full border-t border-[color:var(--accent-dark)]/10">
          <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-[color:var(--foreground)]/80 flex items-center justify-between">
            <span>© {new Date().getFullYear()} Alpaka Wanderungen</span>
            <span className="opacity-80">Entspannt unterwegs im Grünen</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
