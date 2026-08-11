"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";

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
      sizes="(min-width: 1024px) 50vw, 100vw"
      className={className}
    />
  );
}

export default function DropGallery({
  product,
  grayscale = false,
}: {
  product: Product;
  grayscale?: boolean;
}) {
  const photos = [product.image, ...(product.images ?? [])].filter(
    (p): p is string => Boolean(p),
  );
  const [index, setIndex] = useState(0);

  const total = photos.length;
  const hasMultiple = total > 1;
  const current = photos[index] ?? null;
  const counter =
    total > 0
      ? `${String(index + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`
      : "—";

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  return (
    <div className="absolute inset-0 h-full w-full">
      {current ? (
        <GalleryImage
          src={current}
          alt={product.name}
          className={`h-full w-full object-cover ${grayscale ? "grayscale" : ""}`}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center ${grayscale ? "grayscale" : ""}`}
        >
          <span className="text-7xl drop-shadow-lg">{product.emoji}</span>
        </div>
      )}

      {/* Contador */}
      {hasMultiple ? (
        <span className="pixel absolute right-3 top-3 z-10 rounded-sm border border-zinc-700 bg-zinc-950/80 px-2 py-1 text-[9px] tracking-widest text-amber-300 neon-amber">
          {counter}
        </span>
      ) : null}

      {/* Flechas */}
      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-amber-400/40 bg-zinc-950/80 text-amber-200 backdrop-blur-sm transition-colors hover:border-amber-400 hover:text-amber-300"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Foto siguiente"
            className="absolute right-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-amber-400/40 bg-zinc-950/80 text-amber-200 backdrop-blur-sm transition-colors hover:border-amber-400 hover:text-amber-300"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      ) : null}

      {/* Tira de miniaturas */}
      {hasMultiple ? (
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8">
          {photos.map((photo, i) => (
            <button
              key={`${photo.slice(0, 40)}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-16 sm:w-16 ${
                i === index
                  ? "border-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.4)]"
                  : "border-zinc-700 opacity-60 hover:border-zinc-500 hover:opacity-100"
              }`}
            >
              <GalleryImage
                src={photo}
                alt=""
                className={`h-full w-full object-cover ${grayscale ? "grayscale" : ""}`}
              />
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
