"use client";

import { useState, useCallback } from "react";
import { useCart } from "@/lib/contexts/cart-context";
import type { Product } from "@/lib/products/types";
import CartSparkle from "@/components/ui/cart-sparkle";

export default function AddToCart({
  product,
  quantity = 1,
  className = "",
}: {
  product: Product;
  quantity?: number;
  className?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [pulsing, setPulsing] = useState(false);

  const handleAdd = useCallback(() => {
    if (added) return;
    addItem(product.slug, quantity);
    setAdded(true);
    setSparkleKey((k) => k + 1);
    setPulsing(true);
    window.setTimeout(() => setAdded(false), 1800);
    window.setTimeout(() => setPulsing(false), 300);
  }, [added, addItem, product.slug, quantity]);

  return (
    <div className="relative inline-flex">
      {/* Sparkle particles */}
      <CartSparkle trigger={sparkleKey > 0} key={sparkleKey} />

      <button
        type="button"
        onClick={handleAdd}
        className={`relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 ${
          pulsing ? "animate-cart-pulse" : ""
        } ${
          added
            ? "bg-emerald-400 text-zinc-950 shadow-[0_0_20px_rgba(52,211,153,0.4)]"
            : "bg-amber-400 text-zinc-950 hover:bg-amber-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]"
        } ${className}`}
        disabled={product.stock <= 0}
      >
        {added ? (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            ¡Listo!
          </>
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Agregar
          </>
        )}
      </button>
    </div>
  );
}
