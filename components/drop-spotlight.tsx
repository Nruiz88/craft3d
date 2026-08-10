import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { formatDropDateTime } from "@/lib/drops";
import { site } from "@/lib/site";
import ProductVisual from "./product-visual";
import DropCountdown from "./drop-countdown";

function padEdition(n: number): string {
  return String(n).padStart(3, "0");
}

export default function DropSpotlight({
  product,
  edition,
}: {
  product: Product;
  edition?: number;
}) {
  const starts = formatDropDateTime(product.dropStartsAt);
  const ends = formatDropDateTime(product.dropEndsAt);
  const totalUnits = product.dropUnits;
  const remaining = product.stock;
  const sold = totalUnits != null ? Math.max(0, totalUnits - remaining) : null;
  const soldPct =
    totalUnits != null && totalUnits > 0
      ? Math.max(0, Math.min(100, Math.round((sold! / totalUnits) * 100)))
      : null;
  const outOfStock = remaining <= 0;

  const details = product.details.slice(0, 4);
  const whatsappText = encodeURIComponent(
    `Hola! Quiero consultar por el drop "${product.name}" (N.º ${
      edition != null ? padEdition(edition) : "?"
    }). 🎮`,
  );

  return (
    <section className="mb-16">
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/40 shadow-[0_0_100px_rgba(251,191,36,0.15)]">
        <div className="crt-overlay" aria-hidden="true" />

        {/* Barra superior */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-400/30 bg-black/50 px-6 py-3">
          <span className="pixel text-[10px] tracking-widest text-amber-300 neon-amber">
            ● DROP ACTIVO · EDICIÓN NUMERADA
          </span>
          <span className="pixel animate-blink text-[10px] tracking-widest text-emerald-300">
            {outOfStock ? "■ AGOTADO" : "▶ VENDIENDO AHORA"}
          </span>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">
          {/* Visual */}
          <div className="relative min-h-[280px] border-b-2 border-amber-400/20 lg:border-b-0 lg:border-r-2">
            <ProductVisual
              product={product}
              className={`absolute inset-0 h-full w-full ${outOfStock ? "grayscale" : ""}`}
            />
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="pixel animate-blink rounded-sm border border-emerald-500/60 bg-emerald-500/15 px-2.5 py-1 text-[9px] tracking-widest text-emerald-300">
                ● ABIERTO
              </span>
              {edition ? (
                <span className="pixel rounded-sm border border-amber-400/50 bg-zinc-950/90 px-2.5 py-1 text-[9px] tracking-widest text-amber-300">
                  N.º {padEdition(edition)}
                </span>
              ) : null}
            </div>
            {outOfStock ? (
              <span
                className="pixel pointer-events-none absolute right-6 top-8 rotate-12 border-2 border-rose-400/70 bg-rose-950/80 px-4 py-1.5 text-[11px] tracking-widest text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                aria-hidden="true"
              >
                NO VUELVE
              </span>
            ) : null}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6 p-7 sm:p-10">
            <div>
              <h2 className="pixel text-3xl leading-snug text-zinc-50 sm:text-4xl">
                {product.name}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
                {product.description ||
                  "Edición limitada y numerada de Craft3d. Cuando se agota, no se vuelve a imprimir."}
              </p>
            </div>

            {details.length > 0 ? (
              <ul className="space-y-1.5">
                {details.map((detail) => (
                  <li
                    key={detail}
                    className="flex items-start gap-2 text-sm text-zinc-400"
                  >
                    <span className="text-amber-400" aria-hidden="true">
                      ▸
                    </span>
                    {detail}
                  </li>
                ))}
              </ul>
            ) : null}

            {/* Precio */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs text-zinc-500">Precio del drop</p>
                <p className="mt-0.5 text-4xl font-bold tabular-nums text-amber-400">
                  {formatPrice(product.price)}
                </p>
              </div>
              {totalUnits != null && totalUnits > 0 ? (
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-xl font-bold tabular-nums text-zinc-100">
                      {sold ?? 0}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Vendidas
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-bold tabular-nums text-zinc-100">
                      {totalUnits}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Tiraje
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xl font-bold tabular-nums ${
                        outOfStock ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {remaining}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Quedan
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Barra de escasez */}
            {totalUnits != null && totalUnits > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={outOfStock ? "text-red-400" : "text-zinc-400"}>
                    {outOfStock
                      ? "Tiraje agotado"
                      : `Se agotaron ${sold} de ${totalUnits} unidades`}
                  </span>
                  {soldPct != null ? (
                    <span className="tabular-nums text-zinc-500">
                      {soldPct}% vendido
                    </span>
                  ) : null}
                </div>
                <div className="h-3 overflow-hidden rounded-full border-2 border-zinc-800 bg-zinc-950">
                  <div
                    className={`h-full transition-all ${
                      soldPct != null && soldPct >= 85
                        ? "bg-gradient-to-r from-rose-600 to-rose-400"
                        : "bg-gradient-to-r from-amber-600 to-amber-300"
                    }`}
                    style={{ width: `${soldPct ?? 0}%` }}
                  />
                </div>
              </div>
            ) : null}

            {/* Countdown de cierre */}
            {product.dropEndsAt ? (
              <div>
                <p className="pixel mb-2 text-[10px] tracking-widest text-rose-300 neon-amber">
                  CIERRA EN
                </p>
                <DropCountdown target={product.dropEndsAt} />
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                Sin fecha de cierre: el drop se agota cuando se venden las{" "}
                {totalUnits ?? "unidades"}.
              </p>
            )}

            {/* Fechas */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500">
              {starts ? (
                <p>
                  <span className="text-zinc-600">Abre:</span>{" "}
                  <span className="tabular-nums text-zinc-300">{starts}</span>
                </p>
              ) : null}
              {ends ? (
                <p>
                  <span className="text-zinc-600">Cierra:</span>{" "}
                  <span className="tabular-nums text-zinc-300">{ends}</span>
                </p>
              ) : null}
            </div>

            {/* CTAs */}
            <div className="mt-auto flex flex-wrap gap-3 pt-2">
              <Link
                href={`/productos/${product.slug}`}
                className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-6 py-3 text-sm font-bold tracking-wide text-zinc-950 shadow-lg shadow-amber-400/25 transition-colors hover:bg-amber-300"
              >
                {outOfStock ? "VER DROP ▸▸" : "COMPRAR DROP ▸▸"}
              </Link>
              <a
                href={`${site.whatsapp}?text=${whatsappText}`}
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
    </section>
  );
}
