"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { site } from "@/lib/utils/site";
import type { Product } from "@/lib/products/types";
import ProductVisual from "@/components/product/product-visual";

const ROTATING = ["ANIME", "GAMING", "LLAVEROS", "CUADROS", "REGALOS", "DECO GAMER"];

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export default function HeroSection({
  productCount,
  categoryCount,
  featuredProducts,
}: {
  productCount: number;
  categoryCount: number;
  featuredProducts: Product[];
}) {
  const reduced = usePrefersReducedMotion();
  const featured = featuredProducts.slice(0, 5);
  const [wordIdx, setWordIdx] = useState(0);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setWordIdx((i) => (i + 1) % ROTATING.length), 2200);
    return () => clearInterval(id);
  }, [reduced]);

  useEffect(() => {
    if (reduced || featured.length <= 1) return;
    const id = setInterval(() => setSlide((i) => (i + 1) % featured.length), 5000);
    return () => clearInterval(id);
  }, [reduced, featured.length]);

  const current = featured[slide];

  return (
    <>
      <section
        id="inicio"
        className="arcade-grid relative overflow-hidden border-b-4 border-zinc-800 bg-black"
      >
        {/* Auroras animadas */}
        <div className="hero-aurora-a pointer-events-none absolute -top-40 left-1/3 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="hero-aurora-b pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="hero-aurora-c pointer-events-none absolute -right-24 top-4 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="crt-overlay" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="flex flex-col items-center gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
            {/* ===== Texto ===== */}
            <div className="text-center lg:text-left">
              <p
                className="animate-hero-rise pixel inline-flex items-center justify-center gap-2 text-[11px] tracking-widest text-cyan-300 neon-cyan sm:text-xs lg:justify-start"
                style={{ animationDelay: "0.05s" }}
              >
                <span className="animate-blink" aria-hidden="true">▶</span> COLECCIÓN CRAFT3D · ARCADE
              </p>

              <h1
                className="animate-hero-rise mt-5 text-5xl leading-[0.95] sm:text-6xl lg:mt-7 lg:text-7xl"
                style={{ animationDelay: "0.12s" }}
              >
                <span className="pixel block text-zinc-100 [text-shadow:0_0_18px_rgba(255,255,255,0.15)]">
                  CRAFT
                </span>
                <span className="pixel animate-neon-flicker block neon-amber">3D</span>
              </h1>

              {/* Línea con palabra rotativa */}
              <div
                className="animate-hero-rise mt-5 flex items-center justify-center gap-2 lg:justify-start"
                style={{ animationDelay: "0.2s" }}
              >
                <span className="pixel text-[11px] tracking-widest text-zinc-500 sm:text-xs">
                  LO MEJOR EN
                </span>
                <span className="relative inline-flex h-6 min-w-[112px] items-center overflow-hidden sm:min-w-[136px]">
                  <span
                    key={wordIdx}
                    className="animate-word-in pixel text-[11px] tracking-widest text-amber-300 neon-amber sm:text-xs"
                  >
                    {ROTATING[wordIdx]}
                  </span>
                </span>
              </div>

              <p
                className="animate-hero-rise mx-auto mt-4 max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg lg:mx-0"
                style={{ animationDelay: "0.28s" }}
              >
                {site.tagline}. Figuras de anime, cuadros decorativos, llaveros y
                deco gamer, impresos en 3D y hechos a mano.
              </p>

              <div
                className="animate-hero-rise mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-9 lg:justify-start"
                style={{ animationDelay: "0.36s" }}
              >
                <Link
                  href="#destacados"
                  className="pixel animate-blink rounded-md bg-amber-400 px-6 py-3 text-xs tracking-widest text-zinc-950 shadow-[0_0_24px_rgba(251,191,36,0.5)] transition-colors hover:bg-amber-300 sm:px-7 sm:py-3.5"
                >
                  ▶ INSERT COIN
                </Link>
                <Link
                  href="/catalogo"
                  className="pixel rounded-md border-2 border-cyan-400/60 px-6 py-3 text-xs tracking-widest text-cyan-300 transition-colors hover:border-cyan-300 hover:bg-cyan-400/10 sm:px-7 sm:py-3.5"
                >
                  VER CATÁLOGO
                </Link>
              </div>

              {/* Stats */}
              <dl
                className="animate-hero-rise mt-8 flex items-center justify-center gap-6 sm:mt-10 sm:gap-8 lg:justify-start"
                style={{ animationDelay: "0.44s" }}
              >
                <div>
                  <dt className="sr-only">Productos</dt>
                  <dd className="pixel text-lg text-amber-300 neon-amber sm:text-2xl">{productCount}+</dd>
                  <p className="pixel mt-1 text-[9px] tracking-widest text-zinc-500 sm:text-[10px]">PRODUCTOS</p>
                </div>
                <div className="h-10 w-px bg-zinc-800" aria-hidden="true" />
                <div>
                  <dt className="sr-only">Categorías</dt>
                  <dd className="pixel text-lg text-cyan-300 neon-cyan sm:text-2xl">{categoryCount}</dd>
                  <p className="pixel mt-1 text-[9px] tracking-widest text-zinc-500 sm:text-[10px]">CATEGORÍAS</p>
                </div>
                <div className="h-10 w-px bg-zinc-800" aria-hidden="true" />
                <div>
                  <dt className="sr-only">Proceso</dt>
                  <dd className="pixel text-lg text-zinc-100 sm:text-2xl">100%</dd>
                  <p className="pixel mt-1 text-[9px] tracking-widest text-zinc-500 sm:text-[10px]">A MANO</p>
                </div>
              </dl>
            </div>

            {/* ===== Impresora 3D imprimiendo en vivo ===== */}
            <div className="flex justify-center lg:justify-end">
              <div className="animate-hero-rise relative w-full max-w-[380px]" style={{ animationDelay: "0.3s" }}>
                {/* Glow + aro */}
                <div className="hero-aurora-c pointer-events-none absolute -inset-10 rounded-full bg-gradient-to-br from-amber-500/10 via-fuchsia-500/5 to-cyan-500/10 blur-2xl" />
                <div className="animate-hero-spin pointer-events-none absolute -inset-6 rounded-[2rem] border border-dashed border-amber-400/15" />

                {/* Cuerpo de la impresora */}
                <div className="relative rounded-2xl border-2 border-zinc-700 bg-gradient-to-b from-zinc-900 to-zinc-950 p-3 shadow-[0_0_60px_rgba(251,191,36,0.1)]">
                  {/* Riel/gantry superior */}
                  <div className="relative mb-2 h-2.5 rounded-full bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-700" aria-hidden="true">
                    <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-zinc-900/60" />
                  </div>

                  {/* Cámara de impresión */}
                  <div className="arcade-grid relative aspect-[4/5] overflow-hidden rounded-lg border border-zinc-800 bg-black">
                    {/* Pieza imprimiéndose (se revela de abajo hacia arriba) */}
                    <div key={`piece-${slide}`} className="animate-printer-reveal absolute inset-0">
                      {current ? (
                        <Link href={`/productos/${current.slug}`} aria-label={current.name} className="block h-full w-full">
                          <ProductVisual product={current} priority className="h-full w-full" />
                        </Link>
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-amber-500/30 via-orange-600/20 to-zinc-900" />
                      )}
                      {/* Textura de capas */}
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 6px)",
                        }}
                        aria-hidden="true"
                      />
                    </div>

                    {/* Línea de extrusión + cabezal */}
                    <div key={`head-${slide}`} className="animate-printer-line absolute left-2 right-2" aria-hidden="true">
                      <div className="h-[2px] w-full rounded-full bg-amber-300 shadow-[0_0_14px_3px_rgba(251,191,36,0.8)]" />
                      <div className="absolute left-1/2 -top-7 -translate-x-1/2">
                        <div className="animate-printer-nozzle-x flex flex-col items-center">
                          <div className="h-5 w-9 rounded-sm border border-zinc-500 bg-gradient-to-b from-zinc-300 to-zinc-500 shadow-[0_0_10px_rgba(251,191,36,0.4)]" />
                          <div
                            className="h-2.5 w-2 bg-zinc-400"
                            style={{ clipPath: "polygon(0 0, 100% 0, 60% 100%, 40% 100%)" }}
                          />
                          <div className="h-1 w-1 rounded-full bg-amber-300 shadow-[0_0_8px_2px_rgba(251,191,36,0.9)]" />
                        </div>
                      </div>
                    </div>

                    {/* Scanlines */}
                    <div className="crt-overlay" aria-hidden="true" />
                  </div>

                  {/* Plataforma de impresión */}
                  <div className="mt-2 h-2.5 rounded-sm bg-gradient-to-b from-zinc-600 to-zinc-800" aria-hidden="true" />

                  {/* Estado */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="pixel inline-flex items-center gap-1.5 text-[9px] tracking-widest text-amber-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                      IMPRIMIENDO
                    </span>
                    <span className="truncate text-[11px] font-medium text-zinc-300">
                      {current ? current.name : "Craft3d"}
                    </span>
                  </div>

                  {/* Indicadores */}
                  {featured.length > 1 ? (
                    <div className="mt-2 flex items-center justify-center gap-1.5">
                      {featured.map((p, i) => (
                        <button
                          key={p.slug}
                          type="button"
                          onClick={() => setSlide(i)}
                          aria-label={`Imprimir ${p.name}`}
                          className={`h-1.5 rounded-full transition-all ${
                            i === slide ? "w-5 bg-amber-400" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                          }`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Sprites flotantes */}
                <span className="animate-float pointer-events-none absolute -right-5 top-6 text-amber-300/70">✦</span>
                <span className="animate-float-delay pointer-events-none absolute -left-4 bottom-16 text-cyan-300/60">✦</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="border-b-4 border-zinc-800 bg-amber-400" aria-hidden="true">
        <div className="relative overflow-hidden py-2.5 sm:py-3">
          <div className="animate-marquee flex w-max items-center gap-6 whitespace-nowrap sm:gap-8">
            {[0, 1].map((copy) => (
              <span key={copy} className="flex items-center gap-6 sm:gap-8">
                {["DROPS ESPECIALES", "PIEZAS ÚNICAS", "EDICIÓN LIMITADA", "CUANDO SE AGOTA, NO VUELVE"].map(
                  (text) => (
                    <span key={text} className="pixel text-[10px] tracking-widest text-zinc-950 sm:text-[11px]">
                      ★ {text}
                    </span>
                  ),
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
