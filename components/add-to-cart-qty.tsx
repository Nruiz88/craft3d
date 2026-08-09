"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

export default function AddToCartQty({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    if (outOfStock) return;
    addItem(product.slug, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-zinc-700">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={outOfStock}
            className="flex h-12 w-11 items-center justify-center text-lg text-zinc-400 transition-colors hover:text-amber-300 disabled:opacity-40"
            aria-label="Disminuir cantidad"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold tabular-nums text-zinc-100">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(Math.max(product.stock, 1), q + 1))}
            disabled={outOfStock}
            className="flex h-12 w-11 items-center justify-center text-lg text-zinc-400 transition-colors hover:text-amber-300 disabled:opacity-40"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className={`inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
            added
              ? "bg-emerald-500 text-zinc-950"
              : "bg-amber-400 text-zinc-950 hover:bg-amber-300"
          }`}
        >
          {added ? (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Agregado
            </>
          ) : outOfStock ? (
            "Sin stock"
          ) : (
            "Agregar al carrito"
          )}
        </button>
      </div>

      {added ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-2.5 text-sm text-emerald-400">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span>
            {quantity} {quantity === 1 ? "pieza agregada" : "piezas agregadas"} al carrito.{" "}
            <Link href="/carrito" className="font-semibold underline underline-offset-2 hover:text-emerald-300">
              Ver carrito
            </Link>
          </span>
        </div>
      ) : null}
    </div>
  );
}
