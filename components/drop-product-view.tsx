import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { dropStatus, formatDropDateTime, dropStatusConfig, type DropStatus } from "@/lib/drops";
import { site } from "@/lib/site";
import type { PaymentSettings } from "@/lib/settings";
import type { Product } from "@/lib/types";
import ProductVisual from "./product-visual";
import AddToCartQty from "./add-to-cart-qty";
import DropCard from "./drop-card";
import SectionHeading from "./section-heading";
import ProductTabs from "./product-tabs";
import DropCountdown from "./drop-countdown";
import DropFaq from "./drop-faq";
import ReserveDrop from "./reserve-drop";

export interface ReservationQuery {
  status?: "exito" | "pendiente" | "error";
  orderId?: string;
}

function getNow(): number {
  return Date.now();
}

function padEdition(n: number): string {
  return String(n).padStart(3, "0");
}

const statusHeader: Record<DropStatus, string> = {
  active: "● DROP ACTIVO",
  upcoming: "▶ PRÓXIMO DROP",
  past: "■ DROP FINALIZADO",
};

const statusSide: Record<DropStatus, { label: string; className: string }> = {
  active: {
    label: "VENDIENDO AHORA",
    className: "text-emerald-300 animate-blink",
  },
  upcoming: {
    label: "ABRE PRONTO",
    className: "text-amber-300",
  },
  past: {
    label: "EN ARCHIVO",
    className: "text-zinc-500",
  },
};

export default function DropProductView({
  product,
  related,
  freeShipping,
  edition,
  editionBySlug,
  reservation,
  reservationQuery,
  next,
}: {
  product: Product;
  related: Product[];
  freeShipping: boolean;
  edition?: number;
  editionBySlug?: Map<string, number>;
  reservation?: {
    enabled: boolean;
    mode: "pct" | "fixed";
    depositPct: number;
    depositFixed: number;
    note: string;
    mercadopagoConfigured: boolean;
    transfer: PaymentSettings["transfer"];
  } | null;
  reservationQuery?: ReservationQuery | null;
  next?: string;
}) {
  const now = getNow();
  const status = dropStatus(product, now);
  const badge = dropStatusConfig[status];
  const side = statusSide[status];

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
  const isBuyable = status === "active" && !outOfStock;

  const canReserve =
    reservation?.enabled === true &&
    status !== "past" &&
    !outOfStock;
  const deposit =
    reservation?.enabled === true
      ? reservation.mode === "fixed"
        ? Math.min(Math.round(reservation.depositFixed), Math.round(product.price))
        : Math.round((product.price * reservation.depositPct) / 100)
      : 0;

  const whatsappText = encodeURIComponent(
    `Hola Craft3d! Me interesa el drop "${product.name}" (N.º ${
      edition != null ? padEdition(edition) : "?"
    } · ${formatPrice(product.price)}). ¿Sigue disponible?`,
  );

  const countdownTarget =
    status === "upcoming"
      ? product.dropStartsAt
      : status === "active" && product.dropEndsAt
        ? product.dropEndsAt
        : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Migajas" className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
        <Link href="/" className="transition-colors hover:text-cyan-300">
          Inicio
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/drops" className="transition-colors hover:text-amber-300">
          Drops
        </Link>
        <span aria-hidden="true">/</span>
        <span className="line-clamp-1 text-zinc-300">{product.name}</span>
      </nav>

      {/* Banner de vuelta de Mercado Pago (reserva) */}
      {reservationQuery?.status ? (
        <div
          className={`mb-6 rounded-2xl border-2 p-5 ${
            reservationQuery.status === "exito"
              ? "border-emerald-500/40 bg-emerald-950/20"
              : reservationQuery.status === "pendiente"
                ? "border-amber-400/40 bg-amber-400/5"
                : "border-rose-500/40 bg-rose-950/20"
          }`}
        >
          {reservationQuery.status === "exito" ? (
            <>
              <p className="pixel text-[10px] tracking-widest text-emerald-300">
                ✓ SEÑA ACREDITADA · PEDIDO #{reservationQuery.orderId ?? "?"}
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                Tu reserva está confirmada. Te contactamos por WhatsApp para
                coordinar el resto y el envío.
              </p>
            </>
          ) : reservationQuery.status === "pendiente" ? (
            <>
              <p className="pixel text-[10px] tracking-widest text-amber-300">
                🕐 PAGO PENDIENTE · PEDIDO #{reservationQuery.orderId ?? "?"}
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                Tu reserva quedó registrada. Apenas se confirme la seña desde
                Mercado Pago te avisamos.
              </p>
            </>
          ) : (
            <>
              <p className="pixel text-[10px] tracking-widest text-rose-300">
                ⚠️ EL PAGO NO SE COMPLETÓ
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                Podés reintentarlo con Mercado Pago o elegir transferencia
                bancaria en el panel de reserva de abajo.
              </p>
            </>
          )}
        </div>
      ) : null}

      {/* ===== PANEL DROP ===== */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/40 shadow-[0_0_100px_rgba(251,191,36,0.12)]">
        <div className="crt-overlay" aria-hidden="true" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-400/30 bg-black/50 px-6 py-3">
          <span className="pixel text-[10px] tracking-widest text-amber-300 neon-amber">
            {statusHeader[status]} · EDICIÓN N.º{" "}
            {edition != null ? padEdition(edition) : "?"}
          </span>
          <span className={`pixel text-[10px] tracking-widest ${side.className}`}>
            {side.label}
          </span>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">
          {/* Visual */}
          <div className="relative min-h-[280px] border-b-2 border-amber-400/20 lg:border-b-0 lg:border-r-2">
            <ProductVisual
              product={product}
              className={`absolute inset-0 h-full w-full ${status === "past" ? "grayscale" : ""}`}
            />

            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span
                className={`pixel rounded-sm border px-2.5 py-1 text-[9px] tracking-widest ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>

            {status === "past" ? (
              <span
                className="pixel pointer-events-none absolute right-6 top-8 rotate-12 border-2 border-rose-400/70 bg-rose-950/80 px-4 py-1.5 text-[11px] tracking-widest text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                aria-hidden="true"
              >
                NO VUELVE
              </span>
            ) : null}

            {status === "upcoming" ? (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60 backdrop-blur-[2px]">
                <div className="rounded-2xl border-2 border-amber-400/40 bg-zinc-950/90 px-6 py-4 text-center">
                  <p className="pixel text-[10px] tracking-widest text-zinc-400">
                    🔒 BLOQUEADO
                  </p>
                  <p className="pixel mt-2 text-[10px] tracking-widest text-amber-300">
                    ABRE {starts ? `EL ${starts.toUpperCase()}` : "PRONTO"}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6 p-7 sm:p-10">
            <div>
              <h1 className="pixel text-3xl leading-snug text-zinc-50 sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
                {product.description ||
                  "Edición limitada y numerada de Craft3d. Cuando se agota, no se vuelve a imprimir."}
              </p>
            </div>

            {product.details.length > 0 ? (
              <ul className="space-y-1.5">
                {product.details.slice(0, 4).map((detail) => (
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

            {/* Precio + stats */}
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

            {/* Countdown */}
            {countdownTarget ? (
              <div>
                <p className="pixel mb-2 text-[10px] tracking-widest text-rose-300 neon-amber">
                  {status === "active" ? "CIERRA EN" : "ABRE EN"}
                </p>
                <DropCountdown target={countdownTarget} />
              </div>
            ) : null}

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
              {!starts && !ends ? (
                <p className="text-zinc-500">Disponible hasta agotar stock</p>
              ) : null}
            </div>

            {/* Compra / estado */}
            <div className="flex flex-col gap-3">
              {isBuyable ? (
                <div className="flex flex-col gap-3">
                  <AddToCartQty product={product} />
                  {freeShipping ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                      🚚 Este drop incluye{" "}
                      <span className="font-semibold text-emerald-400">
                        envío gratis
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                      🚚 Envío gratis superando los {formatPrice(site.freeShippingFrom)}
                    </span>
                  )}
                </div>
              ) : status === "active" && outOfStock ? (
                <div className="rounded-2xl border-2 border-rose-500/40 bg-rose-950/20 p-5 text-center">
                  <p className="pixel text-[10px] tracking-widest text-rose-300">
                    ■ TIRAJE AGOTADO
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Este drop ya se vendió entero y no se vuelve a imprimir.
                  </p>
                </div>
              ) : status === "upcoming" ? (
                <div className="rounded-2xl border-2 border-amber-400/40 bg-amber-400/5 p-5 text-center">
                  <p className="pixel text-[10px] tracking-widest text-amber-300">
                    🔒 AÚN NO ESTÁ A LA VENTA
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    {starts
                      ? `La venta abre el ${starts}. Podés pre-reservar tu unidad con la seña.`
                      : "El drop se habilita pronto."}
                  </p>
                  <a
                    href={`${site.whatsapp}?text=${encodeURIComponent(
                      `Hola! Quiero avisarme cuando abra el drop "${product.name}". 🎮`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-md bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
                  >
                    🔔 AVISAME POR WHATSAPP
                  </a>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-zinc-700 bg-zinc-900/40 p-5 text-center">
                  <p className="pixel text-[10px] tracking-widest text-zinc-500">
                    ■ ESTE DROP YA CERRÓ
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Quedó en el archivo. No se vuelve a imprimir, pero podés
                    consultarnos por una pieza a medida.
                  </p>
                </div>
              )}

              {canReserve ? (
                <ReserveDrop
                  product={{
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                  }}
                  depositPct={
                    reservation!.mode === "fixed"
                      ? null
                      : reservation!.depositPct
                  }
                  fixedMode={reservation!.mode === "fixed"}
                  deposit={deposit}
                  note={reservation!.note || undefined}
                  next={next ?? `/productos/${product.slug}`}
                  mercadopagoConfigured={reservation!.mercadopagoConfigured}
                  transfer={reservation!.transfer}
                  pre={status === "upcoming"}
                />
              ) : null}
            </div>

            <a
              href={`${site.whatsapp}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-emerald-700 bg-emerald-950/30 px-6 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:border-emerald-500 hover:bg-emerald-900/40"
            >
              💬 Consultar por este drop
            </a>

            {/* Chips */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: "🖨️", text: "Edición numerada, capa a capa" },
                { icon: "📦", text: "Envío a todo el país" },
                { icon: "💳", text: "Pago coordinado al confirmar" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 rounded-xl border-2 border-zinc-800 bg-zinc-900/40 px-4 py-3"
                >
                  <span className="text-xl" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="text-xs leading-snug text-zinc-400">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== DETALLES + TABS ===== */}
      {product.details.length > 0 || product.tags.length > 0 ? (
        <section className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          <div className="rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 p-6">
            {product.details.length > 0 ? (
              <>
                <h2 className="pixel mb-4 flex items-center gap-2 text-xs tracking-widest text-zinc-100">
                  <span className="text-amber-300 neon-amber" aria-hidden="true">
                    ▸
                  </span>
                  ¿QUÉ INCLUYE?
                </h2>
                <ul className="grid grid-cols-1 gap-2.5 text-sm text-zinc-400 sm:grid-cols-2">
                  {product.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2">
                      <span className="mt-0.5 text-amber-400" aria-hidden="true">
                        ✓
                      </span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {product.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-6">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="pixel rounded-sm border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-[9px] tracking-widest text-zinc-500"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <ProductTabs
            product={product}
            freeShipping={freeShipping}
            freeShippingFrom={site.freeShippingFrom}
          />
        </section>
      ) : null}

      {/* ===== FAQ DROPS ===== */}
      <DropFaq />

      {/* ===== OTROS DROPS ===== */}
      {related.length > 0 ? (
        <section className="mt-20">
          <SectionHeading
            eyebrow="Ediciones limitadas"
            title="Otros drops"
            href="/drops"
            linkLabel="Ver todos"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((relatedProduct) => (
              <DropCard
                key={relatedProduct.slug}
                product={relatedProduct}
                status={dropStatus(relatedProduct, now)}
                edition={editionBySlug?.get(relatedProduct.slug)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
