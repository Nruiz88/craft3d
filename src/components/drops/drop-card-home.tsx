"use client";

import Link from "next/link";
import type { Product } from "@/lib/products/types";
import { formatPrice } from "@/lib/utils/format";
import ProductVisual from "@/components/product/product-visual";
import { site } from "@/lib/utils/site";

function padEdition(n: number): string {
  return String(n).padStart(3, "0");
}

interface DropCardHomeProps {
  product: Product;
  edition: number;
  isActive?: boolean;
}

export default function DropCardHome({
  product,
  edition,
  isActive = false,
}: DropCardHomeProps) {
  const totalUnits = product.dropUnits;
  const remaining = product.stock;
  const sold = totalUnits != null ? Math.max(0, totalUnits - remaining) : null;
  const soldPct =
    totalUnits != null && totalUnits > 0
      ? Math.max(0, Math.min(100, Math.round((sold! / totalUnits) * 100)))
      : null;
  const outOfStock = remaining <= 0;
  const lowStock = remaining > 0 && remaining <= 3;

  const whatsappText = encodeURIComponent(
    `Hola! Quiero consultar por el drop "${product.name}" (N.º ${padEdition(edition)}). 🎮`,
  );

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 transition-all duration-300 hover:border-amber-400/50 hover:shadow-[0_0_60px_rgba(251,191,36,0.12)]"
    >
      {/* Visual */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <ProductVisual
          product={product}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            outOfStock ? "grayscale" : ""
          }`}
        />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

        {/* Edition badge */}
        <span className="pixel absolute left-3 top-3 rounded-sm border border-amber-400/50 bg-zinc-950/90 px-2.5 py-1 text-[9px] tracking-widest text-amber-300">
          N.º {padEdition(edition)}
        </span>

        {/* Status badge */}
        {outOfStock ? (
          <span className="pixel pointer-events-none absolute right-3 top-3 rotate-3 border-2 border-rose-400/70 bg-rose-950/80 px-3 py-1 text-[9px] tracking-widest text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            AGOTADO
          </span>
        ) : lowStock ? (
          <span className="pixel animate-pulse absolute right-3 top-3 rounded-sm border border-amber-400/50 bg-amber-400/15 px-2.5 py-1 text-[9px] tracking-widest text-amber-300">
            🔥 ÚLTIMAS {remaining}
          </span>
        ) : isActive ? (
          <span className="pixel absolute right-3 top-3 rounded-sm border border-emerald-400/50 bg-emerald-400/15 px-2.5 py-1 text-[9px] tracking-widest text-emerald-300">
            ● ABIERTO
          </span>
        ) : null}

        {/* Scarcity bar overlay at bottom of image */}
        {totalUnits != null && totalUnits > 0 && !outOfStock ? (
          <div className="absolute inset-x-0 bottom-0">
            <div className="h-1 w-full bg-zinc-800">
              <div
                className={`h-full transition-all ${
                  soldPct != null && soldPct >= 85
                    ? "bg-gradient-to-r from-rose-600 to-rose-400"
                    : "bg-gradient-to-r from-amber-600 to-amber-300"
                }`}
                style={{ width: `${soldPct ?? 0}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Title */}
        <h3 className="pixel text-base leading-tight text-zinc-100 transition-colors group-hover:text-amber-300">
          {product.name}
        </h3>

        {/* Stats row */}
        {totalUnits != null && totalUnits > 0 ? (
          <div className="flex items-center gap-4 text-[10px]">
            <span className="pixel tracking-widest text-zinc-500">
              {sold ?? 0} VENDIDAS
            </span>
            <span className="text-zinc-700">·</span>
            <span className="pixel tracking-widest text-zinc-500">
              {totalUnits} TIRAJE
            </span>
            <span className="text-zinc-700">·</span>
            <span
              className={`pixel tracking-widest ${
                outOfStock
                  ? "text-red-400"
                  : lowStock
                    ? "text-amber-400"
                    : "text-emerald-400"
              }`}
            >
              {remaining} QUEDAN
            </span>
          </div>
        ) : null}

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between border-t border-zinc-800/60 pt-3">
          <span className="text-xl font-bold tabular-nums text-amber-400">
            {formatPrice(product.price)}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
              outOfStock
                ? "border border-zinc-700 text-zinc-500"
                : "border border-amber-400/50 bg-amber-400/10 text-amber-300 group-hover:bg-amber-400/20"
            }`}
          >
            {outOfStock ? "AGOTADO" : "VER DROP"}
            {!outOfStock && (
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            )}
          </span>
        </div>
      </div>

      {/* WhatsApp overlay on hover (desktop) */}
      {!outOfStock ? (
        <a
          href={`${site.whatsapp}?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-20 right-3 hidden h-9 w-9 items-center justify-center rounded-full border border-green-500/40 bg-green-500/15 text-green-400 opacity-0 backdrop-blur-sm transition-all group-hover:flex group-hover:opacity-100"
          title="Consultar por WhatsApp"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      ) : null}
    </Link>
  );
}
