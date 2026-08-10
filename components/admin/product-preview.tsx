"use client";

import { categoryById } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import type { CategoryId } from "@/lib/types";
import ProductVisual from "@/components/product-visual";

const badgeByCategory: Record<string, string> = {
  anime: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300",
  gaming: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  "cine-series": "border-rose-500/40 bg-rose-500/10 text-rose-300",
  accesorios: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  "ediciones-limitadas": "border-violet-500/40 bg-violet-500/10 text-violet-300",
  "mundial-2026": "border-sky-500/40 bg-sky-500/10 text-sky-300",
};

export default function ProductPreview({
  name,
  category,
  price,
  stock,
  emoji,
  image,
  description,
  featured,
}: {
  name: string;
  category: string;
  price: string;
  stock: string;
  emoji: string;
  image: string;
  description: string;
  featured: boolean;
}) {
  const cat = categoryById[category as CategoryId];
  const numericPrice = Number(price);
  const numericStock = Number(stock);
  const validPrice = Number.isFinite(numericPrice) && numericPrice >= 0;
  const validStock = Number.isInteger(numericStock) && numericStock >= 0;
  const outOfStock = validStock && numericStock <= 0;

  const fakeProduct = {
    id: 0,
    slug: "",
    name: name || "Nombre del producto",
    category: category as CategoryId,
    price: validPrice ? numericPrice : 0,
    emoji: emoji || "📦",
    image: image || null,
    description,
    details: [],
    stock: validStock ? numericStock : 0,
    featured,
    tags: [],
    dropStartsAt: null,
    dropEndsAt: null,
    dropUnits: null,
    createdAt: "",
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
      <p className="border-b border-zinc-800 bg-zinc-950/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Vista previa
      </p>
      <div className="p-4">
        <article className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80">
          <div className="relative">
            <ProductVisual
              product={fakeProduct}
              className="aspect-square w-full"
            />
            {featured ? (
              <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-zinc-950 shadow-lg">
                ★ Destacado
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${
                  badgeByCategory[category] ?? "border-zinc-700 bg-zinc-800/60 text-zinc-300"
                }`}
              >
                <span aria-hidden="true">{cat?.emoji}</span>
                {cat?.name ?? category}
              </span>
              <span className="text-xs text-zinc-500">
                {validStock ? `${numericStock} en stock` : "Stock"}
              </span>
            </div>
            <p className="font-semibold leading-snug text-zinc-100">
              {name || "Nombre del producto"}
            </p>
            <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
              {description || "La descripción del producto aparecerá acá."}
            </p>
            <div className="mt-1 flex items-center justify-between gap-2 pt-1">
              <span className="font-bold tabular-nums text-zinc-50">
                {validPrice ? formatPrice(numericPrice) : "$ 0"}
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                  outOfStock
                    ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                    : "bg-amber-400 text-zinc-950"
                }`}
              >
                {outOfStock ? "Sin stock" : "Agregar al carrito"}
              </span>
            </div>
          </div>
        </article>

        <p className="mt-2 text-center text-xs text-zinc-600">
          Así se verá la tarjeta en la tienda.
        </p>
      </div>
    </div>
  );
}
