import Link from "next/link";
import type { Product } from "@/lib/types";
import { dropStatusConfig, formatDropDateTime, type DropStatus } from "@/lib/drops";

const markerColor: Record<DropStatus, string> = {
  active: "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]",
  upcoming: "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]",
  past: "bg-zinc-600",
};

const tagColor: Record<DropStatus, string> = {
  active: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  upcoming: "text-amber-300 border-amber-400/40 bg-amber-400/10",
  past: "text-zinc-500 border-zinc-700 bg-zinc-900/60",
};

function effectiveDate(
  product: Product,
): number {
  const start = product.dropStartsAt
    ? new Date(product.dropStartsAt).getTime()
    : Number.NaN;
  if (!Number.isNaN(start)) return start;
  const created = new Date(product.createdAt).getTime();
  return Number.isNaN(created) ? 0 : created;
}

export default function DropTimeline({
  items,
}: {
  items: { product: Product; status: DropStatus }[];
}) {
  const sorted = [...items].sort(
    (a, b) => effectiveDate(a.product) - effectiveDate(b.product),
  );

  return (
    <section className="arcade-grid relative overflow-hidden border-y-4 border-zinc-800 bg-zinc-950">
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <p className="pixel text-[10px] uppercase tracking-widest text-rose-300 neon-amber">
            {"// historial"}
          </p>
          <h2 className="pixel mt-3 text-2xl leading-snug text-zinc-100 sm:text-3xl">
            CRONOLOGÍA DE DROPS
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
            Cada punto es un tiraje. Una vez vivido, queda en el archivo para
            siempre.
          </p>
        </div>

        <ol className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
          {sorted.map(({ product, status }) => {
            const starts = formatDropDateTime(product.dropStartsAt);
            const ends = formatDropDateTime(product.dropEndsAt);
            const statusTag: Record<DropStatus, string> = {
              active: "AHORA",
              upcoming: "NEXT",
              past: "VIVIDO",
            };
            return (
              <li key={product.id} className="relative flex gap-4 pl-8">
                <span
                  className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border-2 border-zinc-900 ${markerColor[status]}`}
                  aria-hidden="true"
                />
                <Link
                  href={`/productos/${product.slug}`}
                  className="group flex-1 rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 px-5 py-4 transition-colors hover:border-amber-400/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-zinc-100 transition-colors group-hover:text-amber-300">
                      {product.name}
                    </p>
                    <span
                      className={`pixel inline-flex rounded-sm border px-2 py-0.5 text-[9px] tracking-widest ${tagColor[status]}`}
                    >
                      {statusTag[status]}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs tabular-nums text-zinc-500">
                    {starts && ends ? (
                      <>
                        {starts} <span className="text-zinc-600">→</span> {ends}
                      </>
                    ) : starts ? (
                      <>Desde {starts} · sin fecha de cierre</>
                    ) : ends ? (
                      <>Hasta {ends}</>
                    ) : (
                      <>
                        {dropStatusConfig[status].label}{" "}
                        <span className="text-zinc-600">· disponible</span>
                      </>
                    )}
                  </p>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
