import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import ThemeSwitcher from "../components/ThemeSwitcher";
import Tracker from "../components/Tracker";
import { Suspense } from "react";
import ClientNav from "../components/ClientNav";
import { getManyContent } from "@/lib/content";
import { getContentDefaultsForSections } from "@/lib/contentRegistry";

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
  const content = await getManyContent(
    getContentDefaultsForSections(["layout.navigation", "layout.footer"])
  );
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 px-4 pt-6">
            <div className="mx-auto max-w-6xl">
              <div className="glass-panel flex items-center justify-between gap-4 px-5 py-3">
                <Link href="/" className="flex items-center gap-3" aria-label="Startseite">
                  <Image src="/logo.svg" alt="Alpaka Wanderungen" width={140} height={38} className="h-8 w-auto drop-shadow" />
                  <span className="hidden text-sm font-semibold tracking-tight text-[color:var(--foreground)]/70 sm:inline">{content["layout.nav.tagline"]}</span>
                </Link>
                <div className="flex items-center gap-3">
                  <Suspense
                    fallback={
                      <nav className="flex items-center gap-2 text-sm">
                        <Link className="rounded-full px-3 py-1.5 font-medium text-[color:var(--foreground)]/85 transition hover:text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]/80" href="/tours">
                          {content["layout.nav.tours"]}
                        </Link>
                        <ThemeSwitcher />
                      </nav>
                    }
                  >
                    <ClientNav
                      labels={{
                        tours: content["layout.nav.tours"],
                        calendar: content["layout.nav.calendar"],
                        admin: content["layout.nav.admin"],
                        logout: content["layout.nav.logout"],
                      }}
                    />
                  </Suspense>
                  <Link href="/tours" className="hidden text-sm font-semibold uppercase tracking-wide text-[color:var(--foreground)]/65 transition hover:text-[color:var(--foreground)]/90 lg:block">
                    {content["layout.nav.cta"]}
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>
          <Tracker />

          <footer className="px-4 pb-10 pt-12">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 rounded-3xl border border-[color:var(--border)]/60 bg-[color:var(--surface-muted)]/60 px-6 py-8 text-sm text-[color:var(--foreground)]/80 backdrop-blur md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <span className="text-base font-semibold text-[color:var(--foreground)]">{content["layout.footer.ctaTitle"]}</span>
                <p className="max-w-sm">{content["layout.footer.ctaText"]}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/tours" className="btn-primary">{content["layout.footer.primaryCta"]}</Link>
                <Link href="/calendar" className="btn-secondary">{content["layout.footer.secondaryCta"]}</Link>
              </div>
            </div>
            <div className="mx-auto mt-8 flex max-w-6xl flex-col items-start justify-between gap-4 text-xs text-[color:var(--foreground)]/60 sm:flex-row sm:items-center">
              <p>© {new Date().getFullYear()} Alpaka Wanderungen</p>
              <div className="flex flex-wrap items-center gap-4">
                <a className="hover:text-[color:var(--foreground)]/90" href="/datenschutz">{content["layout.footer.privacy"]}</a>
                <Link className="hover:text-[color:var(--foreground)]/90" href="/admin">{content["layout.footer.admin"]}</Link>
                <span>{content["layout.footer.signature"]}</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
