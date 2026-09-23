"use client";

import Link from "next/link";
import { categories } from "@/lib/products";
import CategoryMenuItem from "./category-menu-item";
import SearchForm from "@/components/catalog/search-form";

interface HeaderUser {
  name: string | null;
}

export default function MobileMenu({
  user,
  sectionLinks,
  isActive,
  onClose,
}: {
  user: HeaderUser | null;
  sectionLinks: { label: string; href: string }[];
  isActive: (href: string) => boolean;
  onClose: () => void;
}) {
  const accountLink = user ? (
    <Link href="/cuenta" onClick={onClose} className="inline-flex max-w-[10rem] items-center gap-2 truncate rounded-full border border-zinc-700 px-3.5 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-400/60 hover:text-amber-300">
      <svg className="h-4 w-4 shrink-0 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
      </svg>
      <span className="truncate">{user.name}</span>
    </Link>
  ) : (
    <Link href="/ingresar" onClick={onClose} className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-400/60 hover:text-amber-300">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <path d="m10 17 5-5-5-5" />
        <path d="M15 12H3" />
      </svg>
      Ingresar
    </Link>
  );

  return (
    <div className="absolute inset-x-0 top-full z-[60] max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-zinc-800 bg-zinc-950 lg:hidden">
      <div className="mx-auto max-w-6xl space-y-1 px-4 py-4 sm:px-6">
        <div className="sm:hidden">{accountLink}</div>

        <div className="pb-2 pt-1">
          <SearchForm onNavigate={onClose} />
        </div>

        <nav className="space-y-1 pt-1">
          {sectionLinks.map((link) => {
            const icons: Record<string, string> = {
              Drops: "💧",
              "Mystery Box": "🎁",
              Catálogo: "📦",
              Ayuda: "❓",
            };
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-900 hover:text-amber-300 ${
                  isActive(link.href) ? "text-cyan-300" : "text-zinc-200"
                }`}
              >
                <span className="text-base" aria-hidden="true">{icons[link.label] ?? "▸"}</span>
                <span className="flex-1">{link.label}</span>
                <span className="text-zinc-600" aria-hidden="true">▸</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-2">
          <p className="pixel px-3 pb-1.5 text-[9px] tracking-widest text-zinc-500">
            ✦ EXPLORÁ POR CATEGORÍA ✦
          </p>
          <Link
            href="/catalogo"
            onClick={onClose}
            className="mb-1.5 flex items-center justify-between rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2.5"
          >
            <span className="text-sm font-semibold text-amber-300">✦ Ver todo el catálogo</span>
            <span className="text-amber-300" aria-hidden="true">▸</span>
          </Link>
          <div className="space-y-1.5">
            {categories.filter((c) => c.id !== "drops" && c.id !== "mystery-box").map((category) => (
              <CategoryMenuItem key={category.id} category={category} onNavigate={onClose} />
            ))}
          </div>
          <div className="mt-1.5 space-y-1.5 border-t border-zinc-800/80 pt-1.5">
            <CategoryMenuItem category={categories.find((c) => c.id === "drops")!} onNavigate={onClose} />
            <CategoryMenuItem category={categories.find((c) => c.id === "mystery-box")!} onNavigate={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}
