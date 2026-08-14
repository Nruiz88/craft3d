import type { Metadata } from "next";
import { getAllProducts } from "@/lib/store";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import {
  getMysteryPoolPreview,
} from "@/lib/mystery-box";
import { getLatestMysteryReveals } from "@/lib/mystery-reveals";
import MysteryBoxCard from "@/components/mystery-box-card";
import RarityBadge from "@/components/rarity-badge";

export const dynamic = "force-dynamic";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.vercel.app";

export const metadata: Metadata = {
  title: "Cajas Sorpresa",
  description:
    "Cajas sorpresa de Craft3d: elegí la caja, pagás un precio único y te llegan las piezas 3D seleccionadas de la caja.",
  alternates: {
    canonical: `${siteUrl}/mysterybox`,
  },
};

const marqueeItems = [
  "¿QUÉ TE TOCARÁ?",
  "PIEZAS SELECCIONADAS",
  "100% CRAFT3D",
  "REVELAMOS CON TU ENVÍO",
  "SORPRESA ASEGURADA",
];

function SectionHeading({  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <p className="pixel text-[10px] uppercase tracking-widest text-amber-300 neon-amber">
        ★ {eyebrow} ★
      </p>
      <h2 className="pixel mt-3 text-2xl leading-snug text-zinc-100 sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function timeAgo(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "recién";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "hace 1 día" : `hace ${days} días`;
}

export default async function MysteryBoxPage() {
  const allProducts = await getAllProducts();
  const boxes = allProducts.filter((p) => p.category === "mystery-box");
  const boxPreviews = new Map(
    boxes.map((box) => [box.slug, getMysteryPoolPreview(allProducts, box)]),
  );
  const inStockBoxes = boxes.filter((b) => b.stock > 0);
  const fromPrice =
    inStockBoxes.length > 0
      ? Math.min(...inStockBoxes.map((b) => b.price))
      : null;
  const recentReveals = await getLatestMysteryReveals(6);

  return (
    <div className="bg-zinc-950 pb-20">
      {/* ===== MARQUEE · MYSTERY BOX ===== */}
      <div className="border-b-4 border-zinc-800 bg-amber-400" aria-hidden="true">
        <div className="relative overflow-hidden py-2.5">
          <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
            {[0, 1].map((copy) => (
              <span key={copy} className="flex items-center gap-8">
                {marqueeItems.map((text) => (
                  <span
                    key={text}
                    className="pixel text-[11px] tracking-widest text-zinc-950"
                  >
                    ★ {text}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <section className="arcade-grid relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="crt-overlay" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-14 pb-12 text-center sm:px-6">
          <p className="pixel inline-flex items-center gap-2 rounded-sm border-2 border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[10px] tracking-widest text-amber-300">
            ★ CRAFT3D · MYSTERY BOX ★
          </p>
          <h1 className="pixel mt-6 text-4xl leading-snug text-zinc-100 sm:text-5xl">
            CAJAS <span className="text-amber-400 neon-amber">SORPRESA</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
            Pagás un precio único por una caja con piezas seleccionadas. La
            revelamos al preparar tu envío y te llega todo su contenido:
            la sorpresa a tu puerta.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[10px]">
            <span className="pixel rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 tracking-widest text-emerald-300">
              ● {boxes.length} {boxes.length === 1 ? "CAJA" : "CAJAS"}
            </span>
          </div>
        </div>
      </section>

      {/* ===== CAJAS ===== */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {recentReveals.length > 0 && (
          <section className="pt-12">
            <SectionHeading
              eyebrow="Prueba social"
              title="Últimas reveladas"
              description="Mirá lo que ya salió de las cajas sorpresa. ¿Cuál será la tuya? 🎲"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentReveals.map((reveal, index) => (
                <div
                  key={`${reveal.createdAt}-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 transition-colors hover:border-amber-400/40"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-2xl"
                    aria-hidden="true"
                  >
                    {reveal.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-100">
                      {reveal.pieceName}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      <span className="text-zinc-300">{reveal.customerName}</span>
                      {reveal.poolLabel ? ` · ${reveal.poolLabel}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <RarityBadge rarity={reveal.rarity} />
                    <span className="text-[10px] text-zinc-600">
                      {timeAgo(reveal.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {boxes.length > 0 ? (
          <section id="cajas">
            <SectionHeading
              eyebrow="Elegí tu caja"
              title="Cajas disponibles"
              description="Cada caja tiene su precio y sus piezas seleccionadas. Al comprar, nosotros revelamos la pieza cuando preparamos el envío."
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {boxes.map((product) => (
                <MysteryBoxCard
                  key={product.slug}
                  product={product}
                  preview={boxPreviews.get(product.slug)}
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-14 text-center">
            <p className="text-4xl" aria-hidden="true">
              🎁
            </p>
            <p className="mt-4 text-lg font-semibold text-zinc-200">
              Todavía no hay cajas sorpresa disponibles
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Las cajas se cargan desde el panel de administración, en la
              sección Mystery box.
            </p>
          </div>
        )}

        {/* ===== CÓMO FUNCIONA ===== */}
        <section className="my-16">
          <SectionHeading
            eyebrow="Así funciona"
            title="¿Cómo funciona?"
            description="Simple: elegís una caja, la pagás y nosotros elegimos la pieza."
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: "🛒",
                title: "1 · Elegí y comprá",
                text: "Elegís la caja con la selección de piezas que más te guste y la sumás al carrito como cualquier producto.",
              },
              {
                icon: "🎲",
                title: "2 · Nosotros revelamos",
                text: "Al preparar tu envío, revelamos el contenido de la caja: todas las piezas que la componen, con su cantidad.",
              },
              {
                icon: "📦",
                title: "3 · ¡La revelamos!",
                text: "Todo el contenido se descuenta del stock y lo ves en tu pedido dentro de Mi cuenta. Después viaja a tu puerta.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6"
              >
                <span className="text-3xl" aria-hidden="true">
                  {step.icon}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-zinc-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="mb-16">
          <SectionHeading
            eyebrow="Preguntas frecuentes"
            title="¿Dudas?"
          />
          <div className="space-y-3">
            {[
              {
                q: "¿Qué contiene la caja?",
                a: "Las piezas que seleccionamos para esa caja, con su cantidad. En la página ves cuáles son y el valor total del contenido.",
              },
              {
                q: "¿Cuándo me entero qué contiene?",
                a: "Cuando la revelamos al preparar tu envío. Al instante aparece el contenido completo en el detalle de tu pedido dentro de Mi cuenta.",
              },
              {
                q: "¿Es un regalo?",
                a: "¡Sí! Es ideal para regalar: la caja trae las piezas seleccionadas con su tarjeta si la pedís en el checkout.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
              >
                <summary className="cursor-pointer select-none text-sm font-semibold text-zinc-100 transition-colors group-open:text-amber-300">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>

      {/* ===== CTA FINAL ===== */}
      <section className="border-t border-zinc-800">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <p className="pixel text-[10px] uppercase tracking-widest text-amber-300 neon-amber">
            {"// la suerte está echada"}
          </p>
          <h2 className="pixel mt-3 text-2xl leading-snug text-zinc-100 sm:text-3xl">
            ¿TE ANIMÁS A LA SORPRESA?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-500">
            Elegí tu caja arriba y sumala al carrito. Nosotros nos encargamos de
            la parte divertida.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#cajas"
              className="pixel inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 px-8 py-4 text-sm tracking-widest text-zinc-950 shadow-lg shadow-amber-400/30 transition-transform hover:scale-105"
            >
              🎁 ELEGÍ TU CAJA
              {fromPrice ? ` · DESDE ${formatPrice(fromPrice)}` : ""} ▸▸
            </a>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-6 py-2.5 text-sm font-semibold text-fuchsia-300 transition-colors hover:bg-fuchsia-500/20"
            >
              📷 Seguir en Instagram
            </a>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-6 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
            >
              💬 Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}