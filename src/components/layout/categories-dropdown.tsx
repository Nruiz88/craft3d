"use client";

import Link from "next/link";
import { categories } from "@/lib/products";
import CategoryMenuItem from "./category-menu-item";

export default function CategoriesDropdown({
  open,
  onToggle,
  onClose,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors hover:text-cyan-300"
      >
        Categorías
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
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

      {open ? (
        <>
          <button
            type="button"
            aria-label="Cerrar menú de categorías"
            className="fixed inset-0 z-10 cursor-default"
            onClick={onClose}
          />
          <div className="absolute left-1/2 top-full z-20 mt-2 w-[24rem] -translate-x-1/2 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-md">
            <div className="flex items-center justify-between px-3 pb-2 pt-1">
              <p className="pixel text-[9px] tracking-widest text-zinc-500">✦ EXPLORÁ POR CATEGORÍA ✦</p>
              <button type="button" aria-label="Cerrar menú de categorías" onClick={onClose} className="rounded-md px-1.5 text-zinc-500 transition-colors hover:text-amber-300">
                ✕
              </button>
            </div>

            <Link
              href="/catalogo"
              onClick={onClose}
              className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 transition-colors hover:border-amber-400/60 hover:bg-amber-400/15"
            >
              <span className="text-sm font-semibold text-amber-300">✦ Ver todo el catálogo</span>
              <span className="text-amber-300" aria-hidden="true">▸</span>
            </Link>

            <div className="mt-1.5 space-y-1.5">
              {categories.filter((c) => c.id !== "drops" && c.id !== "mystery-box").map((category) => (
                <CategoryMenuItem key={category.id} category={category} onNavigate={onClose} />
              ))}
            </div>

            <div className="mt-1.5 space-y-1.5 border-t border-zinc-800/80 pt-1.5">
              <CategoryMenuItem category={categories.find((c) => c.id === "drops")!} onNavigate={onClose} />
              <CategoryMenuItem category={categories.find((c) => c.id === "mystery-box")!} onNavigate={onClose} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
