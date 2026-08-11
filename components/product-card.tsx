import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { categoryById } from "@/lib/products";
import ProductVisual from "./product-visual";
import AddToCart from "./add-to-cart";
import WishlistButton from "./wishlist-button";

export default function ProductCard({
  product,
  size = "normal",
}: {
  product: Product;
  size?: "normal" | "large";
}) {
  const category = categoryById[product.category];
  const large = size === "large";

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-zinc-900/60 transition-colors ${
        product.featured
          ? "border-amber-400/40 hover:border-amber-400/70"
          : "border-zinc-800 hover:border-cyan-400/50"
      }`}
    >
      {product.featured && (
        <span className="pixel absolute right-3 top-3 z-10 rounded-sm bg-amber-400 px-2 py-1 text-[9px] tracking-widest text-zinc-950 shadow-[0_0_16px_rgba(251,191,36,0.6)]">
          ★ DESTACADO
        </span>
      )}
      <WishlistButton
        slug={product.slug}
        name={product.name}
        className="absolute left-3 top-3 z-10"
      />
      <Link
        href={`/productos/${product.slug}`}
        className="block focus:outline-none"
        aria-label={product.name}
      >
        <ProductVisual
          product={product}
          className={`w-full transition-transform duration-300 group-hover:scale-[1.02] ${
            large ? "aspect-[4/3]" : "aspect-square"
          }`}
        />
      </Link>
      <div className={`flex flex-1 flex-col gap-3 ${large ? "p-6" : "p-5"}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="pixel inline-flex items-center gap-1.5 rounded-sm border border-zinc-800 bg-zinc-950 px-2 py-1 text-[9px] tracking-widest text-zinc-400">
            <span aria-hidden="true">{category.emoji}</span>
            {category.name}
          </span>
          <span className="pixel text-[9px] tracking-widest text-zinc-500">
            {product.stock} EN STOCK
          </span>
        </div>
        <Link href={`/productos/${product.slug}`}>
          <h2
            className={`font-semibold text-zinc-100 transition-colors group-hover:text-amber-300 ${
              large ? "text-xl sm:text-2xl" : "text-lg"
            }`}
          >
            {product.name}
          </h2>
        </Link>
        <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400">
          {product.description}
        </p>
        <div
          className={`mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-2 ${
            large ? "pt-4" : ""
          }`}
        >
          <span
            className={`whitespace-nowrap font-bold tabular-nums ${
              large
                ? "text-xl text-amber-400 neon-amber sm:text-2xl"
                : "text-lg text-amber-400 neon-amber sm:text-xl"
            }`}
          >
            {formatPrice(product.price)}
          </span>
          <AddToCart
            product={product}
            className={large ? "px-5 py-2.5 sm:px-6 sm:py-3 sm:text-base" : ""}
          />
        </div>
      </div>
    </article>
  );
}
