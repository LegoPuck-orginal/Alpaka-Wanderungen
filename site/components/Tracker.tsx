"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getOrCreateSessionId() {
  const key = 'sid';
  const existing = document.cookie.split('; ').find(c => c.startsWith(key+'='))?.split('=')[1];
  if (existing) return existing;
  const sid = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
  const oneYear = 365*24*60*60;
  document.cookie = `${key}=${sid}; Path=/; Max-Age=${oneYear}`;
  return sid;
}

export default function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    const sid = getOrCreateSessionId();
    const payload = JSON.stringify({ path: pathname, sessionId: sid });
    const blob = new Blob([payload], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', blob);
    } else {
      fetch('/api/track', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
    }
  }, [pathname]);
  return null;
}