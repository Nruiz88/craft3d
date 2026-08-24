"use client";

import Image from "next/image";
import type { Product } from "@/lib/products/types";

const thumbByCategory: Record<string, string> = {
  anime: "from-fuchsia-500/30 to-fuchsia-900/50",
  gaming: "from-cyan-500/30 to-cyan-900/50",
  "cine-series": "from-violet-500/30 to-violet-900/50",
  accesorios: "from-amber-500/30 to-amber-900/50",
  drops: "from-rose-500/30 to-rose-900/50",
  "mundial-2026": "from-sky-500/30 to-sky-900/50",
  "mystery-box": "from-amber-500/30 to-amber-900/50",
};

export default function Thumb({ product }: { product: Product }) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br text-xl shadow-inner ${
        thumbByCategory[product.category] ?? "from-zinc-700 to-zinc-900"
      }`}
      aria-hidden="true"
    >
      {product.image ? (
        product.image.startsWith("data:") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <Image
            src={product.image}
            alt=""
            width={44}
            height={44}
            className="h-full w-full object-cover"
            quality={60}
          />
        )
      ) : (
        <span className="drop-shadow">{product.emoji}</span>
      )}
    </span>
  );
}
