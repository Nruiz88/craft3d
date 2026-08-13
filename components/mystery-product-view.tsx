"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { MysteryPoolPreview } from "@/lib/mystery-box";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import RarityBadge from "./rarity-badge";

export default function MysteryProductView({
  product,
  preview,
}: {
  product: Product;
  preview: MysteryPoolPreview;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inStock = product.stock > 0;

  const handleAdd = () => {
    addItem(product.slug, quantity);
    setAdded(true);
    setError(null);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inStock}
          className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-7 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-400/25 transition-all hover:from-amber-300 hover:to-orange-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {inStock ? (added ? "✓ Agregada" : "Agregar al carrito") : "Agotado"}
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
        <p className="pixel text-[10px] uppercase tracking-widest text-amber-300">
          🎲 Así funciona
        </p>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-400">
          <li className="flex gap-2">
            <span className="font-bold text-amber-300">1.</span>
            <span>
              Elegís esta caja y la pagás como cualquier producto.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-amber-300">2.</span>
            <span>
              Al preparar tu envío, sorteamos la pieza dentro del pool con
              pesos por rareza.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-amber-300">3.</span>
            <span>
              La revelamos y la ves en Mis pedidos; después viaja a tu puerta.
            </span>
          </li>
        </ol>
      </div>

      {preview && (
        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="pixel text-[10px] uppercase tracking-widest text-zinc-400">
              Posibles sorpresas
            </p>
            <span className="text-xs text-zinc-500">{preview.total} piezas</span>
          </div>

          {preview.rarities.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
              {preview.rarities.map((odds) => (
                <span key={odds.rarity} className="flex items-center gap-1">
                  <RarityBadge rarity={odds.rarity} />
                  <span className="tabular-nums">{odds.pct}%</span>
                </span>
              ))}
            </div>
          ) : null}

          <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
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

          {preview.total > preview.pieces.length ? (
            <p className="mt-2 text-xs text-amber-300/80">
              … y {preview.total - preview.pieces.length} piezas más
            </p>
          ) : null}

          {preview.minPrice != null && preview.maxPrice != null ? (
            <p className="mt-2 text-xs text-zinc-500">
              💰 Las piezas del pool van de{" "}
              <span className="text-zinc-300">
                {formatPrice(preview.minPrice)}
              </span>{" "}
              a{" "}
              <span className="text-zinc-300">
                {formatPrice(preview.maxPrice)}
              </span>
              .
            </p>
          ) : null}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 text-xs text-zinc-500">
        <p>
          💡 ¿Es para regalar? En el checkout podés pedir que la envolvamos con
          una tarjetita.
        </p>
        <Link href="/mysterybox" className="text-amber-300 hover:text-amber-200">
          Conocé cómo funcionan las cajas sorpresa
        </Link>
      </div>
    </div>
  );
}

function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-950 p-1">
      <button
        type="button"
        aria-label="Restar"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-amber-300"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums text-zinc-100">
        {value}
      </span>
      <button
        type="button"
        aria-label="Sumar"
        onClick={() => onChange(value + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-amber-300"
      >
        +
      </button>
    </div>
  );
}
