"use client";

import Link from "next/link";
import { categoryById } from "@/lib/products";
import { formatPrice } from "@/lib/utils/format";
import type { Product } from "@/lib/products/types";
import ProductVisual from "@/components/product/product-visual";

interface CartItemEntry {
  slug: string;
  quantity: number;
}

export default function CartItems({
  entries,
  onUpdateQuantity,
  onRemoveItem,
  hasBox,
}: {
  entries: { item: CartItemEntry; product: Product }[];
  onUpdateQuantity: (slug: string, qty: number) => void;
  onRemoveItem: (slug: string) => void;
  hasBox: boolean;
}) {
  return (
    <div className="space-y-4 lg:col-span-2">
      {hasBox ? (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">
          <span className="text-xl" aria-hidden="true">🎁</span>
          <p>
            Tu caja sorpresa viaja <strong>sin revelar</strong>. La pieza se define al preparar tu envío y la ves en Mis pedidos.
          </p>
        </div>
      ) : null}
      {entries.map(({ item, product }) => (
        <div key={item.slug} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <Link href={`/productos/${product.slug}`} className="shrink-0" aria-label={product.name}>
            <ProductVisual product={product} className="h-24 w-24 rounded-xl" />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-zinc-500">{categoryById[product.category].name}</p>
                <Link href={`/productos/${product.slug}`} className="line-clamp-1 font-semibold text-zinc-100 hover:text-amber-300">
                  {product.name}
                </Link>
              </div>
              <span className="shrink-0 font-semibold tabular-nums text-zinc-100">
                {formatPrice(product.price * item.quantity)}
              </span>
            </div>
            <div className="mt-auto flex items-center justify-between gap-3">
              <div className="flex items-center rounded-full border border-zinc-700">
                <button type="button" onClick={() => onUpdateQuantity(item.slug, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center text-zinc-400 transition-colors hover:text-amber-300" aria-label="Quitar uno">
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium text-zinc-100">{item.quantity}</span>
                <button type="button" onClick={() => onUpdateQuantity(item.slug, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center text-zinc-400 transition-colors hover:text-amber-300" aria-label="Agregar uno">
                  +
                </button>
              </div>
              <button type="button" onClick={() => onRemoveItem(item.slug)} className="text-sm text-zinc-500 transition-colors hover:text-red-400">
                Quitar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
