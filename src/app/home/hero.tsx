import Link from "next/link";
import { site } from "@/lib/utils/site";
import type { Product } from "@/lib/products/types";
import ProductVisual from "@/components/product/product-visual";

export default function HeroSection({
  productCount,
  categoryCount,
  featuredProducts,
}: {
  productCount: number;
  categoryCount: number;
  featuredProducts: Product[];
}) {
  return (
    <>
      <section
        id="inicio"
        className="arcade-grid relative overflow-hidden border-b-4 border-zinc-800 bg-black"
      >
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="crt-overlay" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="flex flex-col items-center gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
            {/* Text side */}
            <div className="text-center lg:text-left">
              <p className="pixel inline-flex items-center justify-center gap-2 text-[11px] tracking-widest text-cyan-300 neon-cyan sm:text-xs lg:justify-start">
                <span aria-hidden="true">▶</span> COLECCIÓN CRAFT3D · ARCADE
              </p>
              <h1 className="mt-5 text-4xl leading-tight sm:text-5xl lg:mt-7 lg:text-6xl">
                <span className="pixel block text-zinc-100">CRAFT</span>
                <span className="pixel block neon-amber">3D</span>
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg lg:mt-5">
                {site.tagline}. Cuadros Hueforge, figuras, dummys y objetos
                únicos que salen de la impresora para tu espacio.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-9 lg:justify-start">
                <Link
                  href="#destacados"
                  className="pixel animate-blink rounded-md bg-amber-400 px-6 py-3 text-xs tracking-widest text-zinc-950 shadow-[0_0_24px_rgba(251,191,36,0.5)] transition-colors hover:bg-amber-300 sm:px-7 sm:py-3.5"
                >
                  ▶ INSERT COIN
                </Link>
                <Link
                  href="#categorias"
                  className="pixel rounded-md border-2 border-cyan-400/60 px-6 py-3 text-xs tracking-widest text-cyan-300 transition-colors hover:border-cyan-300 hover:bg-cyan-400/10 sm:px-7 sm:py-3.5"
                >
                  VER CATÁLOGO
                </Link>
              </div>

              {/* Stats */}
              <dl className="mt-8 flex items-center justify-center gap-6 sm:mt-10 sm:gap-8 lg:justify-start">
                <div>
                  <dt className="sr-only">Productos</dt>
                  <dd className="pixel text-lg text-amber-300 neon-amber sm:text-2xl">
                    {productCount}+
                  </dd>
                  <p className="pixel mt-1 text-[9px] tracking-widest text-zinc-500 sm:text-[10px]">
                    PRODUCTOS
                  </p>
                </div>
                <div className="h-10 w-px bg-zinc-800" aria-hidden="true" />
                <div>
                  <dt className="sr-only">Categorías</dt>
                  <dd className="pixel text-lg text-cyan-300 neon-cyan sm:text-2xl">
                    {categoryCount}
                  </dd>
                  <p className="pixel mt-1 text-[9px] tracking-widest text-zinc-500 sm:text-[10px]">
                    CATEGORÍAS
                  </p>
                </div>
                <div className="h-10 w-px bg-zinc-800" aria-hidden="true" />
                <div>
                  <dt className="sr-only">Proceso</dt>
                  <dd className="pixel text-lg text-zinc-100 sm:text-2xl">
                    100%
                  </dd>
                  <p className="pixel mt-1 text-[9px] tracking-widest text-zinc-500 sm:text-[10px]">
                    A MANO
                  </p>
                </div>
              </dl>
            </div>

            {/* Product showcase */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glow behind showcase */}
                <div className="pointer-events-none absolute -inset-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-transparent to-cyan-500/10 blur-2xl" />

                {/* Showcase grid */}
                <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
                  {featuredProducts.slice(0, 4).map((product, i) => (
                    <Link
                      key={product.slug}
                      href={`/productos/${product.slug}`}
                      className={`group relative overflow-hidden rounded-xl border-2 border-zinc-800 bg-zinc-900 transition-all duration-300 hover:border-amber-400/50 hover:shadow-[0_0_40px_rgba(251,191,36,0.15)] ${
                        i === 0 ? "col-span-2 aspect-[16/9] sm:aspect-[2/1]" : "aspect-square"
                      }`}
                    >
                      <ProductVisual
                        product={product}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Overlay gradient */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      {/* Product name on hover */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="pixel text-[10px] tracking-wider text-amber-300">
                          {product.name}
                        </p>
                      </div>
                      {/* Corner glow */}
                      <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-amber-400/10 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>

                {/* Floating accent dots */}
                <div className="pointer-events-none absolute -right-6 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-amber-400/40 animate-pulse" />
                <div className="pointer-events-none absolute -left-4 top-1/3 h-1.5 w-1.5 rounded-full bg-cyan-400/40 animate-pulse" />
                <div className="pointer-events-none absolute bottom-8 -right-4 h-1 w-1 rounded-full bg-fuchsia-400/40 animate-pulse" />
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
                {[
                  "DROP ESPECIALES",
                  "PIEZAS ÚNICAS",
                  "EDICIÓN LIMITADA",
                  "CUANDO SE AGOTA, NO VUELVE",
                ].map((text) => (
                  <span
                    key={text}
                    className="pixel text-[10px] tracking-widest text-zinc-950 sm:text-[11px]"
                  >
                    ★ {text}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
