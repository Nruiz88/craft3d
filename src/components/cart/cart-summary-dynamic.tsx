"use client";

import dynamic from "next/dynamic";

const CartSummary = dynamic(() => import("./cart-summary"), {
  loading: () => (
    <div className="space-y-4">
      <div className="h-8 w-40 animate-pulse rounded bg-zinc-800" />
      <div className="h-48 animate-pulse rounded-2xl bg-zinc-900" />
      <div className="h-12 w-full animate-pulse rounded-full bg-zinc-800" />
    </div>
  ),
  ssr: false,
});

export default CartSummary;
