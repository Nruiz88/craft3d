"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

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

  function handleAdd() {
    addItem(product.slug, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-amber-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={product.stock <= 0}
    >
      {added ? (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Agregado
        </>
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {product.stock > 0 ? "Agregar al carrito" : "Sin stock"}
        </>
      )}
    </button>
  );
}
