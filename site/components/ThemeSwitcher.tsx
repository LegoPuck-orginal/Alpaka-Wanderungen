"use client";
import { useEffect, useState } from "react";

const THEMES = [
  { id: "default", label: "Grün" },
  { id: "mint", label: "Mint" },
  { id: "sand", label: "Sand" },
  { id: "lavender", label: "Lavendel" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<string>("default");
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "default";
    setTheme(saved);
    const root = document.documentElement;
    if (saved === "default") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", saved);
  }, []);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const t = e.target.value;
    setTheme(t);
    localStorage.setItem("theme", t);
    const root = document.documentElement;
    if (t === "default") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", t);
  }

  return (
    <select
      value={theme}
      onChange={onChange}
      className="min-w-[120px] bg-transparent text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]/65 hover:text-[color:var(--foreground)]"
    >
      {THEMES.map((t) => (
        <option key={t.id} value={t.id}>{t.label}</option>
      ))}
    </select>
  );
}
