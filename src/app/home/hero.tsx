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
    const id = setInterval(() => setSlide((i) => (i + 1) % featured.length), 3800);
    return () => clearInterval(id);
  }, [reduced, featured.length]);

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

            {/* ===== Pantalla arcade (showcase) ===== */}
            <div className="flex justify-center lg:justify-end">
              <div className="animate-hero-rise relative w-full max-w-[360px]" style={{ animationDelay: "0.3s" }}>
                {/* Aro giratorio y glow */}
                <div className="hero-aurora-c pointer-events-none absolute -inset-10 rounded-full bg-gradient-to-br from-amber-500/10 via-fuchsia-500/5 to-cyan-500/10 blur-2xl" />
                <div className="animate-hero-spin pointer-events-none absolute -inset-6 rounded-[2rem] border border-dashed border-amber-400/15" />

                {/* Marco de la pantalla */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/40 bg-zinc-950 shadow-[0_0_60px_rgba(251,191,36,0.12)]">
                  {/* Barra superior tipo consola */}
                  <div className="flex items-center justify-between border-b border-zinc-800 bg-black/60 px-3 py-2">
                    <span className="pixel text-[8px] tracking-widest text-amber-300">★ CRAFT3D ARCADE</span>
                    <span className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-rose-500/70" />
                      <span className="h-2 w-2 rounded-full bg-amber-400/70" />
                      <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
                    </span>
                  </div>

                  {/* Pantalla */}
                  <div className="relative aspect-square">
                    {featured.length > 0 ? (
                      featured.map((product, i) => (
                        <Link
                          key={product.slug}
                          href={`/productos/${product.slug}`}
                          aria-label={product.name}
                          className={`absolute inset-0 transition-opacity duration-700 ${
                            i === slide ? "opacity-100" : "pointer-events-none opacity-0"
                          }`}
                        >
                          <ProductVisual
                            product={product}
                            priority={i === 0}
                            className={`h-full w-full ${i === slide && !reduced ? "animate-float" : ""}`}
                          />
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3">
                            <p className="pixel truncate text-[10px] tracking-wider text-amber-300">
                              {product.name}
                            </p>
                            <p className="pixel mt-1 text-[8px] tracking-widest text-zinc-500">VER PIEZA ▸</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                        <span className="animate-float text-6xl">🕹️</span>
                        <span className="pixel text-[10px] tracking-widest text-zinc-500">
                          CARGANDO PIEZAS…
                        </span>
                      </div>
                    )}

                    {/* Barrido de luz + scanlines */}
                    <div className="crt-overlay" aria-hidden="true" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 animate-hero-scan bg-gradient-to-b from-white/10 to-transparent" aria-hidden="true" />
                  </div>

                  {/* Indicadores */}
                  {featured.length > 1 ? (
                    <div className="flex items-center justify-center gap-1.5 border-t border-zinc-800 bg-black/60 py-2.5">
                      {featured.map((p, i) => (
                        <button
                          key={p.slug}
                          type="button"
                          onClick={() => setSlide(i)}
                          aria-label={`Ver ${p.name}`}
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
                <span className="animate-float-delay pointer-events-none absolute -left-4 bottom-10 text-cyan-300/60">✦</span>
                <span className="animate-float pointer-events-none absolute -left-6 top-1/3 h-2 w-2 rounded-full bg-fuchsia-400/50" />
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
