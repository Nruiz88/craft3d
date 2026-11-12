"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/contexts/cart-context";
import { trackMeta, META_CURRENCY } from "@/lib/analytics/meta";
import { trackGa, GA_CURRENCY } from "@/lib/analytics/ga";
import type { Product } from "@/lib/products/types";

// Evita disparar ViewContent dos veces cuando hay más de un AddToCartQty en
// la misma página (p. ej. la landing de Krafty tiene CTA arriba y abajo).
const viewedContent = new Set<string>();

export default function AddToCartQty({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  useEffect(() => {
    if (viewedContent.has(product.slug)) return;
    viewedContent.add(product.slug);
    trackMeta("ViewContent", {
      content_ids: [product.slug],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: META_CURRENCY,
    });
    trackGa("view_item", {
      currency: GA_CURRENCY,
      value: product.price,
      items: [
        { item_id: product.slug, item_name: product.name, price: product.price, quantity: 1 },
      ],
    });
  }, [product.slug, product.name, product.price]);

  // Suma el ítem al carrito y dispara los eventos de "agregar al carrito".
  // Devuelve true si se agregó (para encadenar con el checkout).
  function addToCart() {
    if (outOfStock) return false;
    addItem(product.slug, quantity);
    trackMeta("AddToCart", {
      content_ids: [product.slug],
      content_name: product.name,
      content_type: "product",
      value: product.price * quantity,
      currency: META_CURRENCY,
      contents: [{ id: product.slug, quantity }],
    });
    trackGa("add_to_cart", {
      currency: GA_CURRENCY,
      value: product.price * quantity,
      items: [
        { item_id: product.slug, item_name: product.name, price: product.price, quantity },
      ],
    });
    return true;
  }

  function handleAdd() {
    if (!addToCart()) return;
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  // Comprar ahora: agrega al carrito y va directo al checkout, sin pasos de más.
  function handleBuyNow() {
    if (!addToCart()) return;
    trackMeta("InitiateCheckout", {
      content_ids: [product.slug],
      content_type: "product",
      value: product.price * quantity,
      currency: META_CURRENCY,
      num_items: quantity,
    });
    trackGa("begin_checkout", {
      currency: GA_CURRENCY,
      value: product.price * quantity,
      items: [
        { item_id: product.slug, item_name: product.name, price: product.price, quantity },
      ],
    });
    router.push("/carrito");
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
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 text-sm font-bold text-zinc-950 shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all hover:bg-amber-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {outOfStock ? (
            "Sin stock"
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 7h14l-1.5 9.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 7Z" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" />
              </svg>
              Comprar ahora
            </>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 px-6 text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
          added
            ? "border-emerald-500 bg-emerald-950/30 text-emerald-300"
            : "border-zinc-700 bg-transparent text-zinc-200 hover:border-amber-400/60 hover:text-amber-300"
        }`}
      >
        {added ? (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Agregado al carrito
          </>
        ) : (
          "Agregar al carrito"
        )}
      </button>

      {added ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-2.5 text-sm text-emerald-400">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span>
            {quantity} {quantity === 1 ? "pieza agregada" : "piezas agregadas"}.{" "}
            <Link href="/carrito" className="font-semibold underline underline-offset-2 hover:text-emerald-300">
              Ir a pagar
            </Link>
          </span>
        </div>
      ) : null}
    </div>
  );
}
