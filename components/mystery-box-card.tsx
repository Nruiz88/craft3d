import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import {
  mysteryBoxPoolLabel,
  type MysteryPoolPreview,
} from "@/lib/mystery-box";
import ProductVisual from "./product-visual";
import AddToCart from "./add-to-cart";
import RarityBadge from "./rarity-badge";

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

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-[0_0_40px_rgba(251,191,36,0.12)]">
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
          {lowStock && (
            <span
              className={`pixel absolute right-3 top-3 rounded-sm border bg-zinc-950/90 px-2 py-1 text-[9px] tracking-widest ${
                lastUnits
                  ? "border-orange-400/40 text-orange-300"
                  : "border-amber-400/40 text-amber-300"
              }`}
            >
              {lastUnits ? `🔥 ¡ÚLTIMAS ${product.stock}!` : `⏳ QUEDAN ${product.stock}`}
            </span>
          )}
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
          <span className="text-zinc-500">Selección de piezas</span>
          <span className="font-medium text-amber-300">{poolLabel}</span>
        </div>

        {preview && (
          <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2">
            <p className="text-[10px] tracking-widest text-zinc-500">
              POSIBLES SORPRESAS · {preview.total}
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
                    <RarityBadge rarity={piece.rarity} className="ml-auto shrink-0" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-zinc-500">Pool en preparación…</p>
            )}
            {preview.total > preview.pieces.length && (
              <p className="text-xs text-amber-300/80">
                … y {preview.total - preview.pieces.length} más
              </p>
            )}
            {preview.rarities.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {preview.rarities.map((odds) => (
                  <span
                    key={odds.rarity}
                    className="flex items-center gap-1 text-[9px] text-zinc-500"
                  >
                    <RarityBadge rarity={odds.rarity} />
                    <span className="tabular-nums">{odds.pct}%</span>
                  </span>
                ))}
              </div>
            )}
            {preview.minPrice != null && preview.maxPrice != null && (
              <p className="text-[10px] tracking-wide text-zinc-500">
                💰 Piezas de{" "}
                <span className="text-zinc-300">
                  {formatPrice(preview.minPrice)}
                </span>{" "}
                a{" "}
                <span className="text-zinc-300">
                  {formatPrice(preview.maxPrice)}
                </span>
              </p>
            )}
            {preview.totalValue > 0 && (
              <p className="text-[10px] tracking-wide text-zinc-500">
                🎁 Valor total de la caja:{" "}
                <span className="text-amber-300">
                  {formatPrice(preview.totalValue)}
                </span>
              </p>
            )}
          </div>
        )}

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
