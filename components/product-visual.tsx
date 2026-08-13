import Image from "next/image";
import type { CategoryId, Product } from "@/lib/types";

const gradients: Record<CategoryId, string> = {
  anime: "from-fuchsia-500/25 via-purple-600/15 to-indigo-900/50",
  gaming: "from-cyan-500/25 via-sky-600/15 to-blue-900/50",
  "cine-series": "from-rose-500/25 via-red-600/15 to-slate-900/50",
  accesorios: "from-amber-500/25 via-orange-600/15 to-yellow-900/50",
  drops: "from-violet-500/25 via-purple-600/15 to-fuchsia-900/50",
  "mundial-2026": "from-sky-400/25 via-cyan-600/15 to-blue-900/50",
  "mystery-box": "from-amber-500/25 via-orange-600/15 to-yellow-900/50",
};

export default function ProductVisual({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradients[product.category]} ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.12)_3px,rgba(0,0,0,0.12)_4px)]" />
      {product.image ? (
        product.image.startsWith("data:") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Image
            src={product.image}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover"
          />
        )
      ) : (
        <span className="relative text-6xl drop-shadow-lg sm:text-7xl">
          {product.emoji}
        </span>
      )}
    </div>
  );
}
