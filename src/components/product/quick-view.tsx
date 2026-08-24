"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Product } from "@/lib/products/types";
import { formatPrice } from "@/lib/utils/format";
import { categoryById } from "@/lib/products";
import ProductVisual from "@/components/product/product-visual";
import AddToCart from "@/components/cart/add-to-cart";
import WishlistButton from "@/components/wishlist/wishlist-button";

interface QuickViewProps {
  product: Product;
  onClose: () => void;
}

export default function QuickView({ product, onClose }: QuickViewProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const category = categoryById[product.category];
  const lowStock = product.stock > 0 && product.stock <= 5;

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Vista rápida: ${product.name}`}
    >
      <div className="relative mx-4 w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-zinc-700 bg-zinc-900 shadow-[0_0_80px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/80 text-zinc-400 backdrop-blur-sm transition-colors hover:border-zinc-500 hover:text-zinc-200"
          aria-label="Cerrar"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-zinc-950">
            <ProductVisual
              product={product}
              className="h-full w-full object-cover"
            />
            {/* Wishlist */}
            <div className="absolute left-3 top-3 z-10">
              <WishlistButton slug={product.slug} name={product.name} />
            </div>
            {/* Stock badge */}
            <div className="absolute bottom-3 left-3 z-10">
              {lowStock ? (
                <span className="pixel rounded-sm border border-amber-400/40 bg-amber-400/15 px-2 py-1 text-[8px] tracking-widest text-amber-300 backdrop-blur-sm">
                  🔥 ÚLTIMAS {product.stock}
                </span>
              ) : product.stock > 0 ? (
                <span className="pixel rounded-sm border border-zinc-700/80 bg-zinc-950/80 px-2 py-1 text-[8px] tracking-widest text-zinc-400 backdrop-blur-sm">
                  {product.stock} UNIDADES
                </span>
              ) : (
                <span className="pixel rounded-sm border border-red-400/40 bg-red-400/15 px-2 py-1 text-[8px] tracking-widest text-red-300 backdrop-blur-sm">
                  AGOTADO
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 p-6">
            {/* Category */}
            <span className="pixel inline-flex w-fit items-center gap-1.5 rounded-sm border border-zinc-800 bg-zinc-950 px-2 py-1 text-[9px] tracking-widest text-zinc-400">
              <span aria-hidden="true">{category.emoji}</span>
              {category.name}
            </span>

            {/* Name */}
            <h2 className="text-xl font-bold leading-snug text-zinc-100">
              {product.name}
            </h2>

            {/* Description */}
            {product.description ? (
              <p className="line-clamp-3 text-sm leading-relaxed text-zinc-400">
                {product.description}
              </p>
            ) : null}

            {/* Details */}
            {product.details.length > 0 ? (
              <ul className="space-y-1">
                {product.details.slice(0, 4).map((detail) => (
                  <li key={detail} className="flex items-start gap-2 text-xs text-zinc-400">
                    <span className="text-amber-400" aria-hidden="true">▸</span>
                    {detail}
                  </li>
                ))}
              </ul>
            ) : null}

            {/* Tags */}
            {product.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.slice(0, 5).map((tag) => (
                  <span key={tag} className="rounded-sm border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[9px] text-zinc-500">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Price + CTA */}
            <div className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-800 pt-4">
              <span className="text-2xl font-bold tabular-nums text-amber-400 neon-amber">
                {formatPrice(product.price)}
              </span>
              <AddToCart product={product} className="px-5 py-2.5" />
            </div>

            {/* Ver producto completo */}
            <Link
              href={`/productos/${product.slug}`}
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-md border border-zinc-700 py-2.5 text-xs font-medium text-zinc-300 transition-colors hover:border-cyan-400/50 hover:text-cyan-300"
            >
              Ver producto completo
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
