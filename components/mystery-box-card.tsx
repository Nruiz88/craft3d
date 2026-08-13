import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { mysteryPoolLabel, parseMysteryPool } from "@/lib/mystery-box";
import ProductVisual from "./product-visual";
import AddToCart from "./add-to-cart";

export default function MysteryBoxCard({ product }: { product: Product }) {
  const poolLabel = mysteryPoolLabel(parseMysteryPool(product.tags));
  const outOfStock = product.stock <= 0;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-[0_0_40px_rgba(251,191,36,0.12)]`}
    >
      <Link
        href={`/productos/${product.slug}`}
        className="block focus:outline-none"
        aria-label={product.name}
      >
        <div className="relative">
          <ProductVisual
            product={product}
            className="aspect-square w-full transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span className="pixel absolute left-3 top-3 rounded-sm border border-amber-400/40 bg-zinc-950/90 px-2 py-1 text-[9px] tracking-widest text-amber-300">
            🎁 SORPRESA
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link href={`/productos/${product.slug}`}>
          <h2 className="font-semibold text-zinc-100 transition-colors group-hover:text-amber-300">
            {product.name}
          </h2>
        </Link>
        <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400">
          {product.description}
        </p>

        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs">
          <span className="text-zinc-500">Incluye pieza de</span>
          <span className="font-medium text-amber-300">{poolLabel}</span>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-lg font-bold tabular-nums text-amber-400 neon-amber">
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
