import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/format";
import { site } from "@/lib/utils/site";

const benefits = [
  "Herramientas sin filo, 100% seguras para manos chiquitas",
  "Transforman cualquier caja en castillos, cohetes y máscaras",
  "Unen, atornillan y crean solos, sin frustraciones",
  "Horas de juego real y creativo, lejos de las pantallas",
];

const WHATSAPP_TEXT =
  "Hola Craft3d! Quiero info del kit KRAFTY de herramientas para cartón 🎄";

export default function KraftyPromo({ price }: { price?: number }) {
  const whatsappHref = `${site.whatsapp}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

  return (
    <section
      id="krafty"
      className="arcade-grid relative overflow-hidden border-b-4 border-zinc-800 bg-zinc-950"
    >
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="crt-overlay" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {/* Header de sección (igual que DROPS / MYSTERY) */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px max-w-[80px] flex-1 bg-gradient-to-r from-transparent to-rose-400/40" />
            <p className="pixel text-[10px] tracking-widest text-rose-300">
              🎄 CRAFT3D · EDICIÓN NAVIDAD 🎄
            </p>
            <span className="h-px max-w-[80px] flex-1 bg-gradient-to-l from-transparent to-rose-400/40" />
          </div>
          <h2 className="pixel mt-3 text-3xl leading-snug text-zinc-100 sm:text-4xl">
            KRAFTY, EL REGALO QUE SE <span className="text-amber-300 neon-amber">CREA MIL VECES</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
            Herramientas seguras y sin filo para que los chicos transformen
            cualquier caja de cartón en su próxima aventura. El regalo perfecto
            de esta Navidad.
          </p>
        </div>

        {/* Spotlight del producto */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/40 shadow-[0_0_80px_rgba(251,191,36,0.12)]">
          <div className="crt-overlay" aria-hidden="true" />

          {/* Barra superior */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-400/30 bg-black/50 px-6 py-3">
            <span className="pixel text-[10px] tracking-widest text-amber-300 neon-amber">
              🔑 KIT DE HERRAMIENTAS · PARA CHICOS
            </span>
            <span className="pixel animate-blink text-[10px] tracking-widest text-emerald-300">
              ▶ ENVÍO A TODO EL PAÍS
            </span>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">
            {/* Visual */}
            <div className="relative min-h-[300px] border-b-2 border-amber-400/20 lg:border-b-0 lg:border-r-2">
              <Image
                src="/krafty/producto.webp"
                alt="Chico armando una casita de cartón con las herramientas KRAFTY"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <span className="pixel absolute left-4 top-4 rounded-sm border border-rose-400/50 bg-zinc-950/80 px-2.5 py-1 text-[9px] tracking-widest text-rose-300">
                🎄 NUEVO
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-6 p-7 sm:p-10">
              <div>
                <h3 className="pixel text-2xl leading-snug text-zinc-50 sm:text-3xl">
                  KRAFTY
                </h3>
                <p className="pixel mt-2 text-[10px] tracking-widest text-zinc-500">
                  KIT DE HERRAMIENTAS CREATIVAS PARA CARTÓN
                </p>
              </div>

              <ul className="space-y-2">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="text-amber-400" aria-hidden="true">▸</span>
                    {b}
                  </li>
                ))}
              </ul>

              {typeof price === "number" ? (
                <div>
                  <p className="text-xs text-zinc-500">Desde</p>
                  <p className="mt-0.5 text-4xl font-bold tabular-nums text-amber-400">
                    {formatPrice(price)}
                  </p>
                </div>
              ) : null}

              <div className="mt-auto flex flex-wrap gap-3 pt-2">
                <Link
                  href="/krafty"
                  className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-6 py-3 text-sm font-bold tracking-wide text-zinc-950 shadow-lg shadow-amber-400/25 transition-colors hover:bg-amber-300"
                >
                  DESCUBRIR KRAFTY ▸▸
                </Link>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-emerald-500/50 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
                >
                  💬 Consultar
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
