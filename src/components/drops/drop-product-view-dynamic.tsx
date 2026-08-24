"use client";

import dynamic from "next/dynamic";

const DropProductView = dynamic(() => import("./drop-product-view"), {
  loading: () => (
    <div className="space-y-6">
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-900" />
      <div className="h-12 w-48 animate-pulse rounded-lg bg-zinc-800" />
      <div className="h-32 animate-pulse rounded-2xl bg-zinc-900" />
    </div>
  ),
  ssr: false,
});

export default DropProductView;
