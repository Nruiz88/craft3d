"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/products/types";
import { formatPrice } from "@/lib/utils/format";
import {
  mysteryBoxPoolLabel,
  type MysteryPoolPreview,
} from "@/lib/mystery-box";
import ProductVisual from "@/components/product/product-visual";
import AddToCart from "@/components/cart/add-to-cart";
import RarityBadge from "@/components/ui/rarity-badge";

export default function MysteryBoxCard({
  product,
  preview,
}: {
  product: Product;
  preview?: MysteryPoolPreview;
}) {
  const poolLabel = mysteryBoxPoolLabel(product.tags);
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;
  const lastUnits = !outOfStock && product.stock <= 2;
  const [revealed, setRevealed] = useState(false);

  const savings =
    preview && preview.totalValue > 0
      ? preview.totalValue - product.price
      : null;
  const savingsPct =
    savings != null && preview && preview.totalValue > 0
      ? Math.round((savings / preview.totalValue) * 100)
      : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/50 hover:shadow-[0_0_60px_rgba(168,85,247,0.15)]">
      {/* Glow effect on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* Visual */}
      <Link
        href={`/productos/${product.slug}`}
        className="relative z-10 block focus:outline-none"
        aria-label={product.name}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <ProductVisual
            product={product}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Mystery overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-purple-950/30 to-transparent" />

          {/* Floating mystery elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <span className="absolute left-[15%] top-[20%] text-4xl opacity-20 transition-all duration-700 group-hover:translate-y-[-10px] group-hover:opacity-40">❓</span>
            <span className="absolute right-[20%] top-[30%] text-3xl opacity-15 transition-all duration-700 group-hover:translate-y-[-8px] group-hover:opacity-30">🎲</span>
            <span className="absolute bottom-[25%] left-[60%] text-2xl opacity-10 transition-all duration-700 group-hover:translate-y-[-6px] group-hover:opacity-25">🎁</span>
          </div>

          {/* Badges */}
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
            <span className="pixel rounded-sm border border-purple-400/50 bg-purple-500/15 px-2.5 py-1 text-[9px] tracking-widest text-purple-300 backdrop-blur-sm">
              🎁 SORPRESA
            </span>
            {lowStock && (
              <span
                className={`pixel rounded-sm border px-2.5 py-1 text-[9px] tracking-widest backdrop-blur-sm ${
                  lastUnits
                    ? "animate-pulse border-orange-400/50 bg-orange-500/15 text-orange-300"
                    : "border-amber-400/50 bg-amber-500/15 text-amber-300"
                }`}
              >
                {lastUnits ? `🔥 ¡ÚLTIMAS ${product.stock}!` : `⏳ QUEDAN ${product.stock}`}
              </span>
            )}
          </div>

          {/* Savings badge */}
          {savings != null && savings > 0 ? (
            <span className="pixel absolute right-3 top-3 z-10 rotate-2 rounded-sm border border-green-400/50 bg-green-500/15 px-2.5 py-1 text-[9px] tracking-widest text-green-300 backdrop-blur-sm">
              AHORRÁ ${formatPrice(savings)}
            </span>
          ) : null}
        </div>
      </Link>

      {/* Info */}
      <div className="relative z-10 flex flex-1 flex-col gap-3 p-5">
        <Link href={`/productos/${product.slug}`}>
          <h2 className="font-semibold text-zinc-100 transition-colors group-hover:text-purple-300">
            {product.name}
          </h2>
        </Link>

        {/* Pool label */}
        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs">
          <span className="text-zinc-500">Contiene</span>
          <span className="font-medium text-purple-300">{poolLabel}</span>
        </div>

        {/* Preview content */}
        {preview && (
          <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2">
            <p className="text-[10px] tracking-widest text-zinc-500">
              CONTENIDO DE LA CAJA · {preview.total}
            </p>
            {preview.pieces.length > 0 ? (
              <ul className="space-y-1">
                {preview.pieces.map((piece) => (
                  <li
                    key={piece.slug}
                    className="flex items-center gap-2 text-xs text-zinc-300"
                  >
                    <span aria-hidden="true">{piece.emoji}</span>
                    <span className="truncate">{piece.name}</span>
                    {piece.qty > 1 ? (
                      <span className="shrink-0 font-medium text-purple-300">
                        ×{piece.qty}
                      </span>
                    ) : null}
                    <RarityBadge rarity={piece.rarity} className="ml-auto shrink-0" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-zinc-500">Contenido en preparación…</p>
            )}
            {preview.total > preview.pieces.length && (
              <p className="text-xs text-purple-300/80">
                … y {preview.total - preview.pieces.length} más
              </p>
            )}
          </div>
        )}

        {/* Value proposition */}
        {preview && preview.totalValue > 0 ? (
          <div className="rounded-lg border border-dashed border-purple-400/30 bg-purple-400/5 px-3 py-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Valor de la caja</span>
              <span className="text-zinc-300 line-through">{formatPrice(preview.totalValue)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Tu precio</span>
              <span className="font-bold text-purple-300">{formatPrice(product.price)}</span>
            </div>
            {savingsPct != null && savingsPct > 0 ? (
              <div className="mt-1.5 flex items-center justify-center gap-1.5 rounded-sm bg-purple-400/10 py-1">
                <span className="pixel text-[9px] tracking-widest text-purple-300">
                  🎰 TE PODÉS AHORRAR {savingsPct}%
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <span className="text-lg font-bold tabular-nums text-purple-400">
            {formatPrice(product.price)}
          </span>
          {outOfStock ? (
            <span className="pixel rounded-sm border border-red-500/40 bg-red-950/30 px-3 py-2 text-[9px] tracking-widest text-red-300">
              AGOTADA
            </span>
          ) : (
            <AddToCart product={product} />
          )}
        </div>
      </div>
    </div>
  );
}
