"use client";

import Link from "next/link";
import type { Product } from "@/lib/products/types";
import { formatPrice } from "@/lib/utils/format";
import { categoryById } from "@/lib/products";
import ProductVisual from "./product-visual";
import AddToCart from "@/components/cart/add-to-cart";
import WishlistButton from "@/components/wishlist/wishlist-button";

export default function ProductCard({
  product,
  size = "normal",
}: {
  product: Product;
  size?: "normal" | "large";
}) {
  const category = categoryById[product.category];
  const large = size === "large";
  const isDrops = product.category === "drops";
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-zinc-900/60 transition-[border-color,box-shadow] duration-300 ${
        product.featured
          ? "border-amber-400/40 hover:border-amber-400/70 hover:shadow-[0_0_40px_rgba(251,191,36,0.1)]"
          : isDrops
            ? "border-zinc-800 hover:border-rose-400/50 hover:shadow-[0_0_40px_rgba(251,113,133,0.1)]"
            : "border-zinc-800 hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(34,211,238,0.08)]"
      }`}
    >
      {/* Image area */}
      <Link
        href={`/productos/${product.slug}`}
        className="block focus:outline-none"
        aria-label={product.name}
      >
        <div className="relative overflow-hidden">
          <ProductVisual
            product={product}
            className={`w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
              large ? "aspect-[4/3]" : "aspect-[3/4]"
            }`}
          />
          {/* Gradient overlay at bottom of image */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-zinc-900/80 to-transparent" />

          {/* Featured badge */}
          {product.featured && (
            <span className="pixel absolute left-3 top-3 z-10 rounded-sm bg-amber-400 px-2 py-1 text-[9px] tracking-widest text-zinc-950 shadow-[0_0_16px_rgba(251,191,36,0.5)]">
              ★ DESTACADO
            </span>
          )}

          {/* Wishlist */}
          <WishlistButton
            slug={product.slug}
            name={product.name}
            className="absolute right-3 top-3 z-10"
          />

          {/* Stock indicator on image */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
            <span className="pixel rounded-sm border border-zinc-700/80 bg-zinc-950/80 px-2 py-1 text-[8px] tracking-widest text-zinc-400 backdrop-blur-sm">
              <span aria-hidden="true">{category.emoji}</span>{" "}
              {category.name}
            </span>
            {lowStock ? (
              <span className="pixel rounded-sm border border-amber-400/40 bg-amber-400/15 px-2 py-1 text-[8px] tracking-widest text-amber-300 backdrop-blur-sm">
                🔥 ÚLTIMAS {product.stock}
              </span>
            ) : (
              <span className="pixel rounded-sm border border-zinc-700/80 bg-zinc-950/80 px-2 py-1 text-[8px] tracking-widest text-zinc-500 backdrop-blur-sm">
                {product.stock} UNIDADES
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className={`flex flex-1 flex-col gap-2 ${large ? "p-6" : "p-4"}`}>
        <Link href={`/productos/${product.slug}`}>
          <h2
            className={`font-semibold leading-snug text-zinc-100 transition-colors group-hover:text-amber-300 ${
              large ? "text-xl sm:text-2xl" : "text-base"
            }`}
          >
            {product.name}
          </h2>
        </Link>

        {product.description ? (
          <p className="line-clamp-1 text-xs text-zinc-500">
            {product.description}
          </p>
        ) : null}

        {/* Price + CTA */}
        <div
          className={`mt-auto flex items-center justify-between gap-3 ${
            large ? "pt-4" : "pt-2"
          }`}
        >
          <span
            className={`whitespace-nowrap font-bold tabular-nums ${
              large
                ? "text-xl text-amber-400 neon-amber sm:text-2xl"
                : "text-lg text-amber-400 neon-amber"
            }`}
          >
            {formatPrice(product.price)}
          </span>
          <AddToCart
            product={product}
            className={large ? "px-5 py-2.5 sm:px-6 sm:py-3 sm:text-base" : "px-3 py-1.5 text-xs"}
          />
        </div>
      </div>
    </article>
  );
}
