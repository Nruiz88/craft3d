"use client";

import { badgeByCategory, defaultBadgeClass } from "@/lib/products/badges";
import { formatDate } from "@/lib/utils/date";

import Link from "next/link";
import { categoryById } from "@/lib/products";
import { formatPrice } from "@/lib/utils/format";
import type { Product } from "@/lib/products/types";
import Thumb from "./thumb";
import StockControl from "./stock-control";
import ToggleFeaturedButton from "./toggle-featured-button";
import DeleteProductButton from "./delete-product-button";



export default function ProductTableRow({ product }: { product: Product }) {
  return (
    <li className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-zinc-950/40 px-4 py-3 transition-colors hover:bg-zinc-900/60">
      <div className="flex min-w-[200px] flex-1 items-center gap-3">
        <Thumb product={product} />
        <div className="min-w-0">
          <Link href={`/productos/${product.slug}`} target="_blank" className="block truncate font-medium text-zinc-100 hover:text-amber-300">
            {product.name}
          </Link>
          <span className="block truncate text-xs text-zinc-600">/productos/{product.slug}</span>
        </div>
      </div>
      <div className="w-40">
        <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeByCategory[product.category] ?? defaultBadgeClass}`}>
          {categoryById[product.category]?.emoji} {categoryById[product.category]?.name ?? product.category}
        </span>
      </div>
      <div className="w-24 font-medium tabular-nums text-zinc-100">{formatPrice(product.price)}</div>
      <div className="w-28">
        <StockControl id={product.id} stock={product.stock} />
      </div>
      <div className="hidden w-24 text-xs tabular-nums text-zinc-500 lg:block">{formatDate(product.createdAt)}</div>
      <div className="w-8">
        <ToggleFeaturedButton id={product.id} featured={Boolean(product.featured)} />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Link href={`/productos/${product.slug}`} target="_blank" aria-label={`Ver ${product.name}`} title="Ver en la tienda" className="rounded-full border border-zinc-700 p-2 text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Link>
        <Link href={`/admin/productos/${product.id}/editar`} className="rounded-full border border-zinc-700 px-4 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-amber-400/60 hover:text-amber-300">
          Editar
        </Link>
        <DeleteProductButton id={product.id} name={product.name} />
      </div>
    </li>
  );
}
