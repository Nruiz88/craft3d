import Link from "next/link";
import { site } from "@/lib/utils/site";
import { arcadeCharacters } from "@/components/ui/pixel-sprites";

export default function HeroSection({
  productCount,
  categoryCount,
}: {
  productCount: number;
  categoryCount: number;
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
          {/* Mobile: stacked layout */}
          <div className="flex flex-col items-center gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
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

              {/* Stats - responsive */}
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

            {/* Arcade cabinet */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative rounded-2xl border-4 border-zinc-700 bg-zinc-950 p-4 pb-0 shadow-[0_0_60px_rgba(34,211,238,0.12)] sm:p-5">
                <div className="relative overflow-hidden rounded-lg border-2 border-zinc-800 bg-black px-4 py-6 sm:px-6 sm:py-7">
                  <div className="crt-overlay" aria-hidden="true" />
                  <p className="pixel mb-5 text-center text-[10px] tracking-widest text-zinc-500">
                    SELECT YOUR PLAYER
                  </p>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-5 sm:gap-x-6 sm:gap-y-7">
                    {arcadeCharacters.map(({ name, sprite: Sprite }, index) => (
                      <div
                        key={name}
                        className={`flex flex-col items-center gap-2 ${
                          index % 2 === 0 ? "animate-float" : "animate-float-delay"
                        }`}
                      >
                        <Sprite className="h-12 w-12 drop-shadow-[0_0_14px_rgba(247,208,44,0.25)] sm:h-16 sm:w-16" />
                        <span className="pixel text-[8px] tracking-widest text-zinc-500">
                          {name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="pixel animate-blink mt-6 text-center text-[11px] tracking-widest text-amber-300 neon-amber">
                    PRESS START
                  </p>
                </div>
                <div className="mx-auto h-6 w-24 rounded-b-xl border-x-4 border-b-4 border-zinc-700 bg-zinc-900 sm:h-8 sm:w-28" aria-hidden="true" />
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
