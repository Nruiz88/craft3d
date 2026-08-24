"use client";

import { badgeByCategory, defaultBadgeClass } from "@/lib/products/badges";

import Link from "next/link";
import { categoryById } from "@/lib/products";
import { formatPrice } from "@/lib/utils/format";
import type { Product } from "@/lib/products/types";
import ProductVisual from "@/components/product/product-visual";
import StockControl from "./stock-control";
import ToggleFeaturedButton from "./toggle-featured-button";
import DeleteProductButton from "./delete-product-button";


export default function ProductTableCard({ product }: { product: Product }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 transition-colors hover:border-zinc-700">
      <div className="absolute right-3 top-3 z-10">
        <ToggleFeaturedButton id={product.id} featured={Boolean(product.featured)} />
      </div>
      <Link href={`/productos/${product.slug}`} target="_blank" className="block focus:outline-none" aria-label={product.name}>
        <ProductVisual product={product} className="aspect-square w-full transition-transform duration-300 group-hover:scale-[1.02]" />
      </Link>
      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-center justify-between gap-2 pr-9">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${badgeByCategory[product.category] ?? defaultBadgeClass}`}>
            <span aria-hidden="true">{categoryById[product.category]?.emoji}</span>
            {categoryById[product.category]?.name ?? product.category}
          </span>
        </div>
        <p className="truncate font-semibold text-zinc-100" title={product.name}>{product.name}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold tabular-nums text-amber-400">{formatPrice(product.price)}</span>
          <StockControl id={product.id} stock={product.stock} />
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 border-t border-zinc-800 pt-2.5">
          <span className="truncate text-xs text-zinc-500">/productos/{product.slug}</span>
          <div className="flex items-center gap-2">
            <Link href={`/productos/${product.slug}`} target="_blank" aria-label={`Ver ${product.name}`} className="rounded-full border border-zinc-700 p-1.5 text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Link>
            <Link href={`/admin/productos/${product.id}/editar`} className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-amber-400/60 hover:text-amber-300">
              Editar
            </Link>
            <DeleteProductButton id={product.id} name={product.name} compact />
          </div>
        </div>
      </div>
    </article>
  );
}
