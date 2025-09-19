import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import ThemeSwitcher from "../components/ThemeSwitcher";
import Tracker from "../components/Tracker";
import { Suspense } from "react";
import ClientNav from "../components/ClientNav";

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
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="w-full sticky top-0 backdrop-blur bg-[color:var(--background)]/80 border-b border-[color:var(--accent-dark)]/10 z-10">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" aria-label="Startseite">
              <Image src="/logo.svg" alt="Alpaka Wanderungen" width={128} height={32} className="h-7 w-auto" />
            </Link>
            <Suspense fallback={<nav className="flex gap-4 text-sm items-center"><Link className="text-[var(--foreground)] hover:underline underline-offset-4" href="/tours">Touren</Link><ThemeSwitcher /></nav>}>
              <ClientNav />
            </Suspense>
          </div>
        </header>

  <main className="min-h-[calc(100vh-120px)]">{children}</main>
  <Tracker />

        <footer className="w-full border-t border-[color:var(--accent-dark)]/10">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-[color:var(--foreground)]/80 flex items-center justify-between">
            <span>© {new Date().getFullYear()} Alpaka Wanderungen</span>
            <div className="flex items-center gap-4">
              <a className="opacity-80 hover:underline" href="/datenschutz">Datenschutz</a>
              <span className="opacity-80">Entspannt unterwegs im Grünen</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
