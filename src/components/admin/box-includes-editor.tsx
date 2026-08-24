"use client";

import { useState } from "react";
import type { Category, Product } from "@/lib/products/types";
import { formatPrice } from "@/lib/utils/format";
import { parseMysteryRarity } from "@/lib/mystery-box";
import RarityBadge from "@/components/ui/rarity-badge";
import { inputClass } from "./form-helpers";

export default function BoxIncludesEditor({
  categories,
  allProducts,
  productId,
  initialIncludes,
}: {
  categories: Category[];
  allProducts: Product[];
  productId?: number;
  initialIncludes: Record<string, number>;
}) {
  const [boxIncludes, setBoxIncludes] = useState<Record<string, number>>(initialIncludes);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const candidates = allProducts.filter((p) => {
    if (p.id === productId) return false;
    if (p.category === "mystery-box" || p.category === "drops") return false;
    return true;
  });

  const filtered = candidates.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
  });

  const selected = Object.entries(boxIncludes).filter(([, qty]) => qty > 0);
  const totalUnits = selected.reduce((sum, [, qty]) => sum + qty, 0);
  const totalValue = selected.reduce((sum, [slug, qty]) => {
    const p = candidates.find((c) => c.slug === slug);
    return sum + (p ? p.price * qty : 0);
  }, 0);

  function setQuantity(slug: string, qty: number) {
    setBoxIncludes((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[slug];
      else next[slug] = qty;
      return next;
    });
  }

  const includesValue = selected.map(([slug, qty]) => `${slug}:${qty}`).join(",");

  return (
    <>
      <input type="hidden" name="boxIncludes" value={includesValue} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto..."
            className={`${inputClass} pl-10`}
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`${inputClass} max-w-xs`}
        >
          <option value="all">Todas las categorías</option>
          {categories
            .filter((c) => c.id !== "drops" && c.id !== "mystery-box")
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
        </select>
      </div>

      <div className="mt-4 max-h-80 space-y-1.5 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
        {filtered.map((p) => {
          const qty = boxIncludes[p.slug] ?? 0;
          return (
            <div key={p.id} className={qty > 0 ? "rounded-lg bg-amber-400/10" : ""}>
              <div className="flex items-center gap-3 px-2 py-1.5 text-sm">
                <span className="text-lg">{p.emoji}</span>
                <span className="min-w-0 flex-1 truncate text-zinc-300">{p.name}</span>
                <span className="hidden shrink-0 text-xs tabular-nums text-zinc-500 sm:inline">
                  {formatPrice(p.price)}
                </span>
                <RarityBadge rarity={parseMysteryRarity(p.tags)} className="hidden shrink-0 sm:inline-flex" />
                <div className="flex shrink-0 items-center gap-1 rounded-full border border-zinc-700 bg-zinc-950 p-1">
                  <button type="button" aria-label={`Quitar ${p.name}`} onClick={() => setQuantity(p.slug, qty - 1)} className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-amber-300">−</button>
                  <span className="w-7 text-center text-sm font-semibold tabular-nums text-zinc-100">{qty}</span>
                  <button type="button" aria-label={`Agregar ${p.name}`} onClick={() => setQuantity(p.slug, qty + 1)} className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-amber-300">+</button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-zinc-500">No hay productos que coincidan.</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3">
        <span className="text-sm text-zinc-300">
          {totalUnits} {totalUnits === 1 ? "pieza" : "piezas"} en la caja
        </span>
        <span className="text-sm font-semibold tabular-nums text-amber-300">
          Valor de la caja: {formatPrice(totalValue)}
        </span>
      </div>
    </>
  );
}
