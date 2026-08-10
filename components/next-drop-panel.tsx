import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatDropDateTime } from "@/lib/drops";
import { site } from "@/lib/site";
import ProductVisual from "./product-visual";
import DropCountdown from "./drop-countdown";

function padEdition(n: number): string {
  return String(n).padStart(3, "0");
}

export default function NextDropPanel({
  product,
  edition,
}: {
  product: Product;
  edition?: number;
}) {
  const starts = formatDropDateTime(product.dropStartsAt);

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/40 shadow-[0_0_80px_rgba(251,191,36,0.08)]">
      <span className="pixel absolute right-5 top-5 z-10 rotate-6 border-2 border-amber-400/50 bg-zinc-950/90 px-3 py-1 text-[9px] tracking-widest text-amber-300">
        ▶ PRÓXIMO DROP
      </span>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative min-h-[240px]">
          <ProductVisual
            product={product}
            className="absolute inset-0 h-full w-full"
          />
        </div>

        <div className="flex flex-col gap-5 p-7 sm:p-10">
          <p className="pixel text-[10px] tracking-widest text-zinc-500">
            DROP {edition != null ? padEdition(edition) : "???"} · EDICIÓN
            NUMERADA
          </p>
          <h2 className="pixel text-2xl leading-snug text-zinc-100 sm:text-3xl">
            {product.name}
          </h2>
          <p className="text-sm text-zinc-500">
            Abre el {starts}
            {product.dropUnits
              ? ` · ${product.dropUnits} unidades numeradas`
              : ""}
          </p>

          <div>
            <p className="pixel mb-2 text-[10px] tracking-widest text-amber-300 neon-amber">
              ABRE EN
            </p>
            <DropCountdown target={product.dropStartsAt ?? ""} />
          </div>

          <div className="mt-auto flex flex-wrap gap-3 pt-2">
            <a
              href={`${site.whatsapp}?text=${encodeURIComponent(
                `Hola! Quiero avisarme cuando abra el drop "${product.name}". 🎮`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
            >
              🔔 AVISAME POR WHATSAPP
            </a>
            <Link
              href={`/productos/${product.slug}`}
              className="pixel inline-flex items-center justify-center gap-2 rounded-md border border-zinc-700 px-5 py-2.5 text-[10px] tracking-widest text-zinc-300 transition-colors hover:border-amber-400/60 hover:bg-amber-400/10 hover:text-amber-300"
            >
              VER DROP ▸▸
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
