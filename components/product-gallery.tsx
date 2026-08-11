"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { categoryById } from "@/lib/products";

function GalleryImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  if (src.startsWith("data:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes="(min-width: 1024px) 40vw, 100vw"
      className={className}
    />
  );
}

export default function ProductGallery({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const photos = [product.image, ...(product.images ?? [])].filter(
    (p): p is string => Boolean(p),
  );
  const [index, setIndex] = useState(0);

  const total = photos.length;
  const hasMultiple = total > 1;
  const current = photos[index] ?? null;
  const category = categoryById[product.category];
  const counter = total > 0 ? `${String(index + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}` : "—";

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  return (
    <div className={className}>
      <div className="relative rounded-2xl border-4 border-zinc-700 bg-zinc-950 p-3 pb-0 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
        <div className="relative overflow-hidden rounded-xl border-2 border-zinc-800 bg-black">
          <div className="relative aspect-square w-full">
            {current ? (
              <GalleryImage
                src={current}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-6xl drop-shadow-lg sm:text-7xl">
                  {product.emoji}
                </span>
              </div>
            )}
            <div className="crt-overlay" aria-hidden="true" />
          </div>

          {/* Contador de fotos */}
          {hasMultiple ? (
            <span className="pixel absolute right-3 top-3 rounded-sm border border-zinc-700 bg-zinc-950/80 px-2 py-1 text-[9px] tracking-widest text-cyan-300 neon-cyan">
              {counter}
            </span>
          ) : null}

          {product.featured ? (
            <span className="pixel absolute left-3 top-3 rounded-sm bg-amber-400 px-2 py-1 text-[9px] tracking-widest text-zinc-950 shadow-[0_0_16px_rgba(251,191,36,0.6)]">
              ★ DESTACADO
            </span>
          ) : null}

          {/* Flechas */}
          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Foto anterior"
                className="absolute left-2 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-600 bg-zinc-950/80 text-zinc-200 backdrop-blur-sm transition-colors hover:border-amber-400 hover:text-amber-300"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Foto siguiente"
                className="absolute right-2 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-600 bg-zinc-950/80 text-zinc-200 backdrop-blur-sm transition-colors hover:border-amber-400 hover:text-amber-300"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-zinc-800 bg-zinc-950/80 px-3 py-2">
            <span className="pixel text-[9px] tracking-widest text-cyan-300 neon-cyan">
              ▶ {category.name.toUpperCase()}
            </span>
            <span className="pixel text-[9px] tracking-widest text-zinc-500">
              CRAFT3D.COM
            </span>
          </div>
        </div>
        <div
          className="mx-auto h-6 w-24 rounded-b-xl border-x-4 border-b-4 border-zinc-700 bg-zinc-900"
          aria-hidden="true"
        />
      </div>

      {/* Tira de miniaturas */}
      {hasMultiple ? (
        <div className="mt-4 flex items-center justify-center gap-2.5">
          {photos.map((photo, i) => (
            <button
              key={`${photo.slice(0, 40)}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-20 sm:w-20 ${
                i === index
                  ? "border-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.4)]"
                  : "border-zinc-700 opacity-60 hover:border-zinc-500 hover:opacity-100"
              }`}
            >
              <GalleryImage src={photo} alt="" className="h-full w-full object-cover" />
              <span
                className={`pixel absolute bottom-0 left-0 bg-black/70 px-1 text-[8px] tracking-widest ${
                  i === index ? "text-amber-300" : "text-zinc-500"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
