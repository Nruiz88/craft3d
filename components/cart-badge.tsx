"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartBadge() {
  const { count } = useCart();

  return (
    <Link
      href="/carrito"
      className="group relative inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-400/60 hover:text-amber-300"
      aria-label={`Carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <span className="hidden sm:inline">Carrito</span>
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-xs font-bold text-zinc-950 transition-transform group-hover:scale-110">
          {count}
        </span>
      )}
    </Link>
  );
}
