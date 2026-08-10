import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { dropStatusConfig, formatDropDateTime, type DropStatus } from "@/lib/drops";
import ProductVisual from "./product-visual";
import DropCountdown from "./drop-countdown";

export type { DropStatus };

function padEdition(n: number): string {
  return String(n).padStart(3, "0");
}

export default function DropCard({
  product,
  status,
  edition,
}: {
  product: Product;
  status: DropStatus;
  edition?: number;
}) {
  const badge = dropStatusConfig[status];
  const starts = formatDropDateTime(product.dropStartsAt);
  const ends = formatDropDateTime(product.dropEndsAt);

  const countdownTarget =
    status === "upcoming"
      ? product.dropStartsAt
      : status === "active"
        ? product.dropEndsAt
        : null;

  const totalUnits = product.dropUnits;
  const remaining = product.stock;
  const soldPct =
    totalUnits != null && totalUnits > 0
      ? Math.max(0, Math.min(100, Math.round(((totalUnits - remaining) / totalUnits) * 100)))
      : null;
  const outOfStock = remaining <= 0;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-[0_0_40px_rgba(251,191,36,0.12)] ${
        status === "past" ? "opacity-75" : ""
      }`}
    >
      <div className="relative">
        <ProductVisual
          product={product}
          className={`aspect-[4/3] ${status === "past" ? "grayscale" : ""}`}
        />

        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span
            className={`pixel rounded-sm border px-2 py-1 text-[9px] tracking-widest ${
              status === "active" ? "animate-blink" : ""
            } ${badge.className}`}
          >
            {badge.label}
          </span>
          {edition ? (
            <span className="pixel rounded-sm border border-amber-400/40 bg-zinc-950/90 px-2 py-1 text-[9px] tracking-widest text-amber-300">
              N.º {padEdition(edition)}
            </span>
          ) : null}
        </div>

        {status === "past" ? (
          <span
            className="pixel pointer-events-none absolute right-4 top-6 rotate-12 border-2 border-rose-400/70 bg-rose-950/80 px-3 py-1 text-[10px] tracking-widest text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.25)]"
            aria-hidden="true"
          >
            NO VUELVE
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h2 className="font-semibold leading-snug text-zinc-100 transition-colors group-hover:text-amber-300">
            {product.name}
          </h2>
          <p className="mt-1.5 text-lg font-bold tabular-nums text-amber-400">
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="space-y-1 text-xs text-zinc-500">
          {starts ? (
            <p className="flex items-center justify-between gap-2">
              <span>Inicia</span>
              <span className="tabular-nums text-zinc-400">{starts}</span>
            </p>
          ) : null}
          {ends ? (
            <p className="flex items-center justify-between gap-2">
              <span>Finaliza</span>
              <span className="tabular-nums text-zinc-400">{ends}</span>
            </p>
          ) : null}
          {!starts && !ends ? (
            <p>Disponible hasta agotar stock</p>
          ) : null}
        </div>

        {totalUnits != null && totalUnits > 0 ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className={outOfStock ? "text-red-400" : "text-zinc-400"}>
                {outOfStock
                  ? "Tiraje agotado"
                  : `Quedan ${remaining} de ${totalUnits}`}
              </span>
              {soldPct != null ? (
                <span className="tabular-nums text-zinc-500">
                  {soldPct}% vendido
                </span>
              ) : null}
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-zinc-800 bg-zinc-950">
              <div
                className={`h-full transition-all ${
                  soldPct != null && soldPct >= 85
                    ? "bg-rose-500"
                    : "bg-amber-400"
                }`}
                style={{ width: `${soldPct ?? 0}%` }}
              />
            </div>
          </div>
        ) : null}

        {countdownTarget ? (
          <div className="pt-1">
            <p className="pixel mb-2 text-[9px] tracking-widest text-zinc-500">
              {status === "active" ? "CIERRA EN" : "ABRE EN"}
            </p>
            <DropCountdown target={countdownTarget} />
          </div>
        ) : null}

        {status === "past" ? (
          <p className="pixel rounded-sm border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-center text-[9px] tracking-widest text-rose-300">
            ⚠ AGOTADO · NO SE VUELVE A IMPRIMIR
          </p>
        ) : (
          <span className="pixel mt-auto inline-flex items-center justify-center gap-2 rounded-md border border-zinc-700 px-4 py-2.5 text-[10px] tracking-widest text-zinc-300 transition-colors group-hover:border-amber-400/60 group-hover:bg-amber-400/10 group-hover:text-amber-300">
            VER DROP ▸▸
          </span>
        )}
      </div>
    </Link>
  );
}
