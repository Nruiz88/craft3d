"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { categories } from "@/lib/products";
import CartBadge from "./cart-badge";
import SearchForm from "./search-form";

interface HeaderUser {
  name: string;
}

const sectionLinks = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/drops", label: "Drops" },
  { href: "/#proceso", label: "Proceso" },
  { href: "/#contacto", label: "Contacto" },
];

const categoryMenuAccents: Record<
  string,
  { text: string; hover: string; glyph: string }
> = {
  anime: {
    text: "text-fuchsia-300",
    hover: "hover:border-fuchsia-400/50 hover:shadow-[0_0_20px_rgba(232,121,249,0.12)]",
    glyph: "アニメ",
  },
  gaming: {
    text: "text-cyan-300",
    hover: "hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.12)]",
    glyph: "ゲーム",
  },
  "cine-series": {
    text: "text-violet-300",
    hover: "hover:border-violet-400/50 hover:shadow-[0_0_20px_rgba(167,139,250,0.12)]",
    glyph: "映画",
  },
  accesorios: {
    text: "text-amber-300",
    hover: "hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.12)]",
    glyph: "雑貨",
  },
  drops: {
    text: "text-rose-300",
    hover: "hover:border-rose-400/50 hover:shadow-[0_0_20px_rgba(251,113,133,0.12)]",
    glyph: "限定",
  },
  "mundial-2026": {
    text: "text-sky-300",
    hover: "hover:border-sky-400/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.12)]",
    glyph: "２０２６",
  },
};

function CategoryMenuItem({
  category,
  onNavigate,
}: {
  category: (typeof categories)[number];
  onNavigate: () => void;
}) {
  const accent =
    categoryMenuAccents[category.id] ?? categoryMenuAccents.anime;

  return (
    <Link
      href={
        category.id === "drops" ? "/drops" : `/?categoria=${category.id}`
      }
      onClick={onNavigate}
      className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border border-transparent px-3 py-2.5 transition-all ${accent.hover}`}
    >
      <span
        className={`pixel pointer-events-none absolute -right-1 -bottom-2 text-4xl opacity-20 ${accent.text}`}
        aria-hidden="true"
      >
        {accent.glyph}
      </span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-lg">
        <span aria-hidden="true">{category.emoji}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-zinc-200 transition-colors group-hover:text-amber-300">
          {category.name}
        </span>
        <span className="block truncate text-xs text-zinc-500">
          {category.description}
        </span>
      </span>
      <span className="text-zinc-600 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-amber-300" aria-hidden="true">
        ▸
      </span>
    </Link>
  );
}

export default function HeaderNav({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    return pathname === href;
  };

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
            className={`rounded-lg px-3 py-2 transition-colors hover:text-cyan-300 ${
              isActive(link.href) ? "text-cyan-300" : ""
            }`}
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
              <div className="absolute left-1/2 top-full z-20 mt-2 w-[24rem] -translate-x-1/2 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-md">
                <div className="flex items-center justify-between px-3 pb-2 pt-1">
                  <p className="pixel text-[9px] tracking-widest text-zinc-500">
                    ✦ EXPLORÁ POR CATEGORÍA ✦
                  </p>
                  <button
                    type="button"
                    aria-label="Cerrar menú de categorías"
                    onClick={() => setCategoriesOpen(false)}
                    className="rounded-md px-1.5 text-zinc-500 transition-colors hover:text-amber-300"
                  >
                    ✕
                  </button>
                </div>

                <Link
                  href="/catalogo"
                  onClick={() => setCategoriesOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 transition-colors hover:border-amber-400/60 hover:bg-amber-400/15"
                >
                  <span className="text-sm font-semibold text-amber-300">
                    ✦ Ver todo el catálogo
                  </span>
                  <span className="text-amber-300" aria-hidden="true">
                    ▸
                  </span>
                </Link>

                <div className="mt-1.5 space-y-1.5">
                  {categories
                    .filter((c) => c.id !== "drops")
                    .map((category) => (
                      <CategoryMenuItem
                        key={category.id}
                        category={category}
                        onNavigate={() => setCategoriesOpen(false)}
                      />
                    ))}
                </div>

                <div className="mt-1.5 border-t border-zinc-800/80 pt-1.5">
                  <CategoryMenuItem
                    category={categories.find((c) => c.id === "drops")!}
                    onNavigate={() => setCategoriesOpen(false)}
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </nav>

      {/* Buscar (desktop) */}
      <div className="hidden flex-1 justify-center px-4 xl:flex">
        <div className="w-64">
          <SearchForm />
        </div>
      </div>

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
        <div className="absolute inset-x-0 top-full z-30 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md lg:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-4 sm:px-6">
            <div className="sm:hidden">{accountLink}</div>

            <div className="pb-2 pt-1">
              <SearchForm onNavigate={closeMobile} />
            </div>

            <nav className="space-y-1 pt-1">
              {sectionLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={closeMobile}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-900 hover:text-amber-300 ${
                    isActive(link.href) ? "text-cyan-300" : "text-zinc-200"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-2">
              <p className="pixel px-3 pb-1.5 text-[9px] tracking-widest text-zinc-500">
                ✦ EXPLORÁ POR CATEGORÍA ✦
              </p>
              <Link
                href="/catalogo"
                onClick={closeMobile}
                className="mb-1.5 flex items-center justify-between rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2.5"
              >
                <span className="text-sm font-semibold text-amber-300">
                  ✦ Ver todo el catálogo
                </span>
                <span className="text-amber-300" aria-hidden="true">
                  ▸
                </span>
              </Link>
              <div className="space-y-1.5">
                {categories
                  .filter((c) => c.id !== "drops")
                  .map((category) => (
                    <CategoryMenuItem
                      key={category.id}
                      category={category}
                      onNavigate={closeMobile}
                    />
                  ))}
              </div>
              <div className="mt-1.5 border-t border-zinc-800/80 pt-1.5">
                <CategoryMenuItem
                  category={categories.find((c) => c.id === "drops")!}
                  onNavigate={closeMobile}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
