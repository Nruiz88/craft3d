import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import ProductVisual from "./product-visual";
import DropCountdown from "./drop-countdown";

export type DropStatus = "active" | "upcoming" | "past";

function formatDateTime(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusConfig: Record<
  DropStatus,
  { label: string; className: string }
> = {
  active: {
    label: "● ABIERTO",
    className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  },
  upcoming: {
    label: "▶ PRÓXIMO",
    className: "border-amber-400/50 bg-amber-400/10 text-amber-300",
  },
  past: {
    label: "■ FINALIZADO",
    className: "border-zinc-700 bg-zinc-900/60 text-zinc-500",
  },
};

export default function DropCard({
  product,
  status,
}: {
  product: Product;
  status: DropStatus;
}) {
  const badge = statusConfig[status];
  const starts = formatDateTime(product.dropStartsAt);
  const ends = formatDateTime(product.dropEndsAt);

  const countdownTarget =
    status === "upcoming"
      ? product.dropStartsAt
      : status === "active"
        ? product.dropEndsAt
        : null;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-[0_0_40px_rgba(251,191,36,0.12)] ${
        status === "past" ? "opacity-70 grayscale-[0.3]" : ""
      }`}
    >
      <div className="relative">
        <ProductVisual product={product} className="aspect-[4/3]" />
        <span
          className={`pixel absolute left-3 top-3 rounded-sm border px-2 py-1 text-[9px] tracking-widest ${badge.className}`}
        >
          {badge.label}
        </span>
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
            ⚠ CUANDO SE AGOTA, NO VUELVE
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
