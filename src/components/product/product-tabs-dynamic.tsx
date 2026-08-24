"use client";

import dynamic from "next/dynamic";

const ProductTabs = dynamic(() => import("./product-tabs"), {
  loading: () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-28 animate-pulse rounded-lg bg-zinc-800" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-2xl bg-zinc-900" />
    </div>
  ),
  ssr: false,
});

export default ProductTabs;
