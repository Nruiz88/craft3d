"use client";

import Link from "next/link";
import { useState } from "react";
import { categories } from "@/lib/products";
import CartBadge from "./cart-badge";

interface HeaderUser {
  name: string;
}

const sectionLinks = [
  { href: "/#catalogo", label: "Catálogo" },
  { href: "/drops", label: "Drops" },
  { href: "/#proceso", label: "Proceso" },
  { href: "/#contacto", label: "Contacto" },
];

export default function HeaderNav({ user }: { user: HeaderUser | null }) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const accountLink = user ? (
    <Link
      href="/cuenta"
      className="inline-flex max-w-[10rem] items-center gap-2 truncate rounded-full border border-zinc-700 px-3.5 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-400/60 hover:text-amber-300"
    >
      <svg className="h-4 w-4 shrink-0 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
      </svg>
      <span className="truncate">{user.name}</span>
    </Link>
  ) : (
    <Link
      href="/ingresar"
      className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-400/60 hover:text-amber-300"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <path d="m10 17 5-5-5-5" />
        <path d="M15 12H3" />
      </svg>
      Ingresar
    </Link>
  );

  return (
    <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
      <Link href="/" className="group flex items-center gap-2.5">
        <svg
          className="h-7 w-7 text-amber-400"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2 2.5 7v10L12 22l9.5-5V7L12 2Zm-1 2.4L4.5 8.2v6.9l6.5 3.4V4.4Zm2 0v14.1l6.5-3.4V8.2L13 4.4Z" />
          <path d="m12 11.8-6.5-3.6 1-1.8 6.5 3.6-1 1.8Z" fill="#fbbf24" opacity="0.6" />
        </svg>
        <span className="pixel text-base tracking-widest text-zinc-50 transition-colors group-hover:text-amber-300">
          Craft<span className="neon-amber">3d</span>
        </span>
      </Link>

      {/* Nav desktop */}
      <nav className="hidden items-center gap-1 text-sm text-zinc-400 lg:flex">
        {sectionLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="rounded-lg px-3 py-2 transition-colors hover:text-cyan-300"
          >
            {link.label}
          </Link>
        ))}

        {/* Dropdown Categorías */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setCategoriesOpen((open) => !open)}
            aria-expanded={categoriesOpen}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors hover:text-cyan-300"
          >
            Categorías
            <svg
              className={`h-3.5 w-3.5 transition-transform ${categoriesOpen ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {categoriesOpen ? (
            <>
              <button
                type="button"
                aria-label="Cerrar menú de categorías"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setCategoriesOpen(false)}
              />
              <div className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-md">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/?categoria=${category.id}`}
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-amber-300"
                  >
                    <span aria-hidden="true">{category.emoji}</span>
                    <span className="min-w-0 flex-1 truncate">{category.name}</span>
                    <span className="text-zinc-600" aria-hidden="true">
                      ▸
                    </span>
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </nav>

      {/* Acciones */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:block">{accountLink}</div>
        <CartBadge />

        {/* Hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition-colors hover:border-zinc-600 lg:hidden"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {mobileOpen ? (
              <>
                <path d="M18 6 6 18M6 6l12 12" />
              </>
            ) : (
              <>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Menú móvil */}
      {mobileOpen ? (
        <div className="absolute inset-x-0 top-full z-30 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md lg:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-4 sm:px-6">
            <div className="sm:hidden">{accountLink}</div>

            <nav className="space-y-1 pt-1">
              {sectionLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={closeMobile}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-900 hover:text-amber-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-2">
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
                Categorías
              </p>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/?categoria=${category.id}`}
                    onClick={closeMobile}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-amber-300"
                  >
                    <span aria-hidden="true">{category.emoji}</span>
                    <span className="min-w-0 flex-1 truncate">{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
