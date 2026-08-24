"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { categories } from "@/lib/products";
import SearchForm from "@/components/catalog/search-form";
import CartBadge from "@/components/cart/cart-badge";
import WishlistBadge from "@/components/wishlist/wishlist-badge";
import NotificationBell from "@/components/layout/notification-bell";
import CategoriesDropdown from "./categories-dropdown";
import MobileMenu from "./mobile-menu";

const sectionLinks = [
  { label: "Drops", href: "/drops" },
  { label: "Mystery Box", href: "/mysterybox" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Ayuda", href: "/faq" },
];

interface HeaderUser {
  name: string | null;
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
      {/* Logo */}
      <Link href="/" className="group flex items-center gap-2.5">
        <svg className="h-7 w-7 text-amber-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
            className={`rounded-lg px-3 py-2 transition-colors hover:text-cyan-300 ${isActive(link.href) ? "text-cyan-300" : ""}`}
          >
            {link.label}
          </Link>
        ))}
        <CategoriesDropdown
          open={categoriesOpen}
          onToggle={() => setCategoriesOpen((o) => !o)}
          onClose={() => setCategoriesOpen(false)}
        />
      </nav>

      {/* Buscar (desktop) */}
      <div className="hidden min-w-0 flex-1 justify-center px-4 xl:flex">
        <div className="w-full max-w-64">
          <SearchForm />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:block">{accountLink}</div>
        {user && <NotificationBell />}
        <WishlistBadge />
        <CartBadge />
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition-colors hover:border-zinc-600 lg:hidden"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {mobileOpen ? (
              <><path d="M18 6 6 18M6 6l12 12" /></>
            ) : (
              <><path d="M4 6h16M4 12h16M4 18h16" /></>
            )}
          </svg>
        </button>
      </div>

      {/* Menú móvil */}
      {mobileOpen ? (
        <MobileMenu user={user} sectionLinks={sectionLinks} isActive={isActive} onClose={closeMobile} />
      ) : null}
    </div>
  );
}
