"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
  label: string;
  href: string;
  section: string;
}

const allLinks: SearchResult[] = [
  { label: "Dashboard", href: "/admin", section: "General" },
  { label: "Productos", href: "/admin/productos", section: "Catálogo" },
  { label: "Nuevo producto", href: "/admin/nuevo", section: "Catálogo" },
  { label: "Reposición", href: "/admin/restock", section: "Catálogo" },
  { label: "Drops", href: "/admin/drops", section: "Drops" },
  { label: "Nuevo drop", href: "/admin/drops/nuevo", section: "Drops" },
  { label: "Lista de espera", href: "/admin/waitlist", section: "Drops" },
  { label: "Cajas sorpresa", href: "/admin/mysterybox", section: "Mystery Box" },
  { label: "Nueva caja", href: "/admin/mysterybox/nuevo", section: "Mystery Box" },
  { label: "Revelaciones", href: "/admin/mysterybox/revelaciones", section: "Mystery Box" },
  { label: "Ventas", href: "/admin/ventas", section: "Gestión" },
  { label: "Clientes", href: "/admin/clientes", section: "Gestión" },
  { label: "Actividad", href: "/admin/actividad", section: "Gestión" },
  { label: "Configuración", href: "/admin/configuracion", section: "Gestión" },
];

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? allLinks.filter(
        (l) =>
          l.label.toLowerCase().includes(query.toLowerCase()) ||
          l.section.toLowerCase().includes(query.toLowerCase()),
      )
    : allLinks;

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const runK = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    },
    [],
  );

  useEffect(() => {
    window.addEventListener("keydown", runK);
    return () => window.removeEventListener("keydown", runK);
  }, [runK]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && filtered[selected]) {
      navigate(filtered[selected].href);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 text-sm text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-3 border-b border-zinc-800 px-4">
              <svg className="h-5 w-5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar página..."
                className="h-12 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
              />
              <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">ESC</kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-zinc-500">
                  Sin resultados para &quot;{query}&quot;
                </li>
              ) : (
                filtered.map((link, i) => (
                  <li key={link.href}>
                    <button
                      onClick={() => navigate(link.href)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        i === selected
                          ? "bg-amber-400/10 text-amber-300"
                          : "text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      <span className="flex-1 font-medium">{link.label}</span>
                      <span className="text-xs text-zinc-600">{link.section}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
