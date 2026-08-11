"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/wishlist-context";

export default function WishlistBadge() {
  const { saved } = useWishlist();
  const count = saved.size;

  return (
    <Link
      href="/favoritos"
      className="group relative inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3.5 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-rose-400/60 hover:text-rose-300"
      aria-label={`Favoritos, ${count} ${count === 1 ? "producto" : "productos"}`}
      title="Mis favoritos"
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
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white transition-transform group-hover:scale-110">
          {count}
        </span>
      )}
    </Link>
  );
}
